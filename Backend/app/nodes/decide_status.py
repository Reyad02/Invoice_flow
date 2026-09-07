from app.graphs.state import InvoiceState 

def decide_status_node( state: InvoiceState ): 
    if state.get("error"): 
        return { "status": "PROCESSING_ERROR" } 
    
    validation_results = state.get("validation_results") or [] 
    failed_rules = [result for result in validation_results if (result.get("status") == "FAILED" )] 
    
    if failed_rules: 
        return { "status": "REVIEW_REQUIRED" } 
    
    return { "status": "VALID" }