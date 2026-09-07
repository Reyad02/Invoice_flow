from typing import Optional, List
from pydantic import BaseModel, Field


class InvoiceItem(BaseModel):
    
    description: Optional[str] = Field( default=None ) 
    quantity: Optional[float] = Field( default=None ) 
    unit_price: Optional[float] = Field( default=None ) 
    amount: Optional[float] = Field( default=None )


class InvoiceExtraction(BaseModel): 
    """ Structured data extracted from an invoice. """ 
    invoice_number: Optional[str] = Field( default=None, description="Invoice number" ) 
    invoice_date: Optional[str] = Field( default=None, description="Invoice date in YYYY-MM-DD format when possible" ) 
    due_date: Optional[str] = Field( default=None, description="Due date in YYYY-MM-DD format when possible" ) 
    supplier_name: Optional[str] = Field( default=None ) 
    currency: Optional[str] = Field( default=None, description="Currency code such as USD, BDT, EUR" ) 
    subtotal: Optional[float] = Field( default=None ) 
    tax: Optional[float] = Field( default=None ) 
    tax_rate: Optional[float] = Field( default=None, description="Tax percentage, for example 10 means 10 percent" ) 
    total: Optional[float] = Field( default=None ) 
    line_items: list[InvoiceItem] = Field( default_factory=list )