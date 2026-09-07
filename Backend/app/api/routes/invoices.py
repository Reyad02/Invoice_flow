import os
import json
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.database import get_db
from app.models.invoice import Invoice
from app.graphs.invoice_graph import invoice_graph
from app.utils.file_utils import is_allowed_file, generate_filename

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/process")
async def process_invoice(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail=(
                "File name is required"
            )
        )

    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Only PDF, PNG, JPG and JPEG files are allowed"
        )

    file_content = await file.read()
    max_size_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024

    if (len(file_content)>max_size_bytes):
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds {settings.MAX_FILE_SIZE_MB} MB"
        )

    unique_filename = generate_filename(file.filename)
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path,"wb") as buffer:
        buffer.write(file_content)

    try:

        initial_state = {
            "file_path": file_path,
            "filename": file.filename,
            "input_type": None,
            "extracted_text": None,
            "document_images": None,
            "invoice_data": None,
            "validation_results": None,
            "status": None,
            "error": None
        }

        result = invoice_graph.invoke(initial_state)
        invoice_data = result.get("invoice_data") or {}
        validation_results = result.get("validation_results") or []
        status = result.get("status")

        invoice = Invoice(
            filename=file.filename,
            input_type=result.get( "input_type"),
            invoice_number=invoice_data.get("invoice_number"),
            supplier_name=invoice_data.get("supplier_name"),
            invoice_date=invoice_data.get("invoice_date"),
            due_date=invoice_data.get("due_date"),
            currency=invoice_data.get("currency"),
            subtotal=invoice_data.get("subtotal"),
            tax=invoice_data.get("tax"),
            tax_rate=invoice_data.get("tax_rate"),
            total=invoice_data.get("total"),
            line_items=json.dumps(invoice_data.get("line_items", [])),
            validation_results=json.dumps(validation_results),
            status=status
        )

        db.add(invoice)
        db.commit()
        db.refresh(invoice)

        return {
            "invoice_id": invoice.id,
            "filename": file.filename,
            "input_type": result.get("input_type"),
            "status": status,
            "invoice_data": invoice_data,
            "validation_results": validation_results,
            "error": result.get("error")
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
            
@router.get( "/" ) 
def get_invoices(db: Session = Depends(get_db)): 
    invoices = db.query(Invoice).order_by(Invoice.created_at.desc()).all()  
    results = [] 
    
    for invoice in invoices: 
        results.append(
            { 
             "id": invoice.id, 
             "filename": invoice.filename, 
             "invoice_number": invoice.invoice_number, 
             "supplier_name": invoice.supplier_name, 
             "total": invoice.total, 
             "currency": invoice.currency,
             "status": invoice.status, 
             "input_type": invoice.input_type , 
             "created_at": invoice.created_at 
            } 
        ) 
        
    return results

@router.get("/{invoice_id}")

def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db)
):

    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    return {
        "id": invoice.id,
        "filename": invoice.filename,
        "input_type": invoice.input_type,
        "invoice_number": invoice.invoice_number,
        "supplier_name": invoice.supplier_name,
        "invoice_date": invoice.invoice_date,
        "due_date": invoice.due_date,
        "currency": invoice.currency,
        "subtotal": invoice.subtotal,
        "tax": invoice.tax,
        "tax_rate": invoice.tax_rate,
        "total": invoice.total,
        "line_items": json.loads(invoice.line_items) if invoice.line_items else [],
        "validation_results": json.loads(invoice.validation_results) if invoice.validation_results else [],
        "status": invoice.status,
        "created_at": invoice.created_at
    }