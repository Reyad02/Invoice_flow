from typing import Optional, List
from pydantic import BaseModel, Field


class InvoiceItem(BaseModel):

    description: Optional[str] = None
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    amount: Optional[float] = None


class InvoiceData(BaseModel):

    invoice_number: Optional[str] = Field(default=None)
    invoice_date: Optional[str] = Field(
        default=None,
        description="Invoice date in YYYY-MM-DD format"
    )
    due_date: Optional[str] = Field(
        default=None,
        description="Due date in YYYY-MM-DD format"
    )
    supplier_name: Optional[str] = None
    currency: Optional[str] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    tax_rate: Optional[float] = None
    total: Optional[float] = None
    line_items: List[InvoiceItem] = Field(default_factory=list)