from langgraph.graph import StateGraph, START, END
from app.graphs.state import InvoiceState
from app.nodes.analyze_document import analyze_document_node
from app.nodes.validate_invoice import validate_invoice_node
from app.nodes.decide_status import decide_status_node

def route_after_analysis(state: InvoiceState):

    if state.get("error"):
        return "decide_status"

    return "validate_invoice"


def create_invoice_graph():
    workflow = StateGraph(InvoiceState)
    workflow.add_node("analyze_document", analyze_document_node)
    workflow.add_node("validate_invoice", validate_invoice_node)
    workflow.add_node("decide_status", decide_status_node)

    workflow.add_edge(START, "analyze_document")
    workflow.add_conditional_edges(
        "analyze_document", 
        route_after_analysis,
        {
            "validate_invoice": "validate_invoice",
            "decide_status": "decide_status"
        }
    )
    workflow.add_edge("validate_invoice","decide_status")
    workflow.add_edge("decide_status", END)

    return workflow.compile()

invoice_graph = create_invoice_graph()
