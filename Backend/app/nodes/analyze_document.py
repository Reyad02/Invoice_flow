from app.graphs.state import InvoiceState 
from app.services.document_service import process_pdf, image_file_to_base64, get_image_mime_type 
from app.services.llm_service import InvoiceLLMService 
from app.utils.file_utils import is_pdf, is_image 

def analyze_document_node(state: InvoiceState): 
    try: 
        file_path = state["file_path"] 
        filename = state["filename"] 
        llm_service = InvoiceLLMService() 
        
        # CASE 1: PDF
        if is_pdf(filename): 
            processed_document = process_pdf(file_path)
            
            if processed_document.document_type == "text":
                invoice_data = llm_service.extract_from_text(processed_document.text)
                return { 
                    "input_type": "pdf_text", 
                    "extracted_text": processed_document.text, 
                    "document_images": None, 
                    "invoice_data": invoice_data.model_dump(), 
                    "error": None 
                }
            
            if processed_document.document_type == "images":
                invoice_data = llm_service.extract_from_images(processed_document.images)
                return { 
                    "input_type": "pdf_images", 
                    "extracted_text": None, 
                    "document_images": None, 
                    "invoice_data": invoice_data.model_dump(),
                    "error": None 
                }
                
        # CASE 2: IMAGE
        if is_image(filename): 
            image_base64 = image_file_to_base64(file_path)
            image_mime_type = get_image_mime_type(filename)
            images = [{"base64": image_base64, "mime_type": image_mime_type}]
            invoice_data = llm_service.extract_from_images(images)
            return { 
                "input_type": "image", 
                "extracted_text": None, 
                "document_images": None, 
                "invoice_data": invoice_data.model_dump(), 
                "error": None 
                }
            
        # Unsupported file
        return { "error": "Unsupported document type"}
    
    except Exception as e: 
        return { "error": f"Document analysis failed: " f"{str(e)}" }