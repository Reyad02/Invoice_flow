from typing import TypedDict, Optional, Dict, List, Any

class InvoiceState(TypedDict):
    file_path: str
    filename: str
    input_type: Optional[str]
    extracted_text: Optional[str]
    document_images: Optional[List[str]]
    invoice_data: Optional[Dict[str, Any]]
    validation_results: Optional[List[Dict[str, Any]]]
    status: Optional[str]
    error: Optional[str]