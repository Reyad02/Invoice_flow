from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.invoices import router as invoice_router 
from app.database.database import Base, engine
from app.models.invoice import Invoice

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="InvoiceFlow",
    description="AI Powered Invoice Review and Processing System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    invoice_router, 
    prefix="/api/invoices", 
    tags=["Invoices"] 
)

@app.get("/")
def root():

    return {
        "message": "InvoiceFlow AI Backend is running"
    }

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }