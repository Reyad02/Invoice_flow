from langchain_core.messages import HumanMessage,SystemMessage
from langchain_openai import ChatOpenAI
from app.core.config import settings
from app.schemas.invoice import InvoiceExtraction

SYSTEM_PROMPT = """
You are an intelligent invoice data extraction system.

Your task is to analyze invoice information and extract
structured invoice data.

Important rules:

1. Never invent information.
2. If information is not available, return null.
3. Extract all available information carefully.
4. Dates should be returned in YYYY-MM-DD format when possible.
5. Monetary values must be numbers only.
6. Do not include currency symbols in numeric fields.
7. Tax rate must be returned as a percentage number.
   Example:
   10% should become 10.
8. If multiple pages are provided, analyze all pages.
9. Use information from the complete document.
10. Do not perform validation or correction.
11. Only extract what is actually present in the document.
"""

class InvoiceLLMService:

    def __init__(self):
        self.llm = ChatOpenAI(model=settings.OPENAI_MODEL, api_key=settings.OPENAI_API_KEY)
        self.structured_llm = self.llm.with_structured_output(
            InvoiceExtraction,
            method="json_schema"
        )
        
    def extract_from_text(self,text: str) -> InvoiceExtraction:
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(
                content=f"""
                    Analyze the following invoice text.
                    Invoice Text:
                    {text}
                    """
            )
        ]
        result = self.structured_llm.invoke(messages)
        return result


    def extract_from_images(self,images: list[str]) -> InvoiceExtraction:
        content = [
            {
                "type": "text",
                "text": """
                        Analyze all provided invoice pages carefully.

                        The images may represent multiple pages
                        of the same invoice.

                        Use information from all pages to create
                        one complete structured invoice result.
                        """
            }
        ]

        for image in images:
            content.append(
                {
                    "type": "image",
                    "base64": image["base64"],
                    "mime_type": image["mime_type"]
                }
            )

        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=content)
        ]
        result = self.structured_llm.invoke(messages)
        
        return result