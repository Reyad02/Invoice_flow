from typing import Optional, List
from pydantic import BaseModel, Field


class InvoiceItem(BaseModel):
    
    description: Optional[str] = Field( default=None ) 
    quantity: Optional[float] = Field( default=None, description="Quantity of the item. Use the quantity specified in the invoice if available; if not found, default to 1." ) 
    unit_price: Optional[float] = Field( default=None, description= "Unit price of the item. Use the unit price specified in the invoice if available; if not found, use the amount" ) 
    amount: Optional[float] = Field( default=None )

class InvoiceExtraction(BaseModel): 
    """ Structured data extracted from an invoice. """ 
    invoice_number: Optional[str] = Field( default=None, description="Invoice number" ) 
    invoice_date: Optional[str] = Field( default=None, description="Invoice date in YYYY-MM-DD format when possible" ) 
    due_date: Optional[str] = Field( default=None, description="Due date in YYYY-MM-DD format when possible" ) 
    supplier_name: Optional[str] = Field( default=None ) 
    currency: Optional[str] = Field( default="JPY", description="Currency code such as JPY" ) 
    subtotal: Optional[float] = Field( default=None ) 
    tax: Optional[float] = Field( default=None ) 
    tax_rate: Optional[float] = Field( default=None, description="Tax percentage, for example 10 means 10 percent" ) 
    total: Optional[float] = Field( default=None ) 
    line_items: list[InvoiceItem] = Field( default_factory=list )