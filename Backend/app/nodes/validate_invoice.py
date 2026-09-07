from datetime import datetime 
from decimal import Decimal, ROUND_HALF_UP 
from app.graphs.state import InvoiceState

def money(value):
    if value is None:
        return None

    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    


def validate_invoice_node(state: InvoiceState):
    invoice = state.get("invoice_data")

    if not invoice:
        return {
            "validation_results": [
                {
                    "rule":"INVOICE_DATA",
                    "status": "FAILED",
                    "message": "No invoice data was extracted"
                }
            ]
        }
        
    results = []


    # 1. REQUIRED FIELDS
    required_fields = [
        "invoice_number",
        "invoice_date",
        "subtotal",
        "total"
    ]

    missing_fields = []

    for field in required_fields:
        value = invoice.get(field)
        if (value is None or value == ""):
            missing_fields.append(field)

    if missing_fields:
        results.append(
            {
                "rule": "REQUIRED_FIELDS",
                "status": "FAILED",
                "message": ("Missing fields: "
                    +
                    ", ".join(
                        missing_fields
                    )
                )
            }
        )

    else:
        results.append(
            {
                "rule": "REQUIRED_FIELDS",
                "status": "PASSED",
                "message": (
                    "All required fields are present"
                )
            }
        )


    # 2. TOTAL CHECK
    # subtotal + tax = total
    subtotal = money(invoice.get("subtotal"))
    tax = money(invoice.get("tax"))
    total = money(invoice.get("total"))

    if (subtotal is not None and tax is not None and total is not None):
        expected_total = (subtotal + tax).quantize(Decimal("0.01"))
        if (expected_total==total):
            results.append(
                {
                    "rule": "TOTAL_CHECK",
                    "status": "PASSED",
                    "message": "Subtotal + tax equals total",
                    "expected": float(expected_total),
                    "actual": float(total)
                }
            )

        else:
            results.append(
                {
                    "rule": "TOTAL_CHECK",
                    "status": "FAILED",
                    "message": "Subtotal + tax does not equal total",
                    "expected": float(expected_total),
                    "actual": float(total)
                }
            )

    else:
        results.append(
            {
                "rule": "TOTAL_CHECK",
                "status": "SKIPPED",
                "message": "Not enough information to validate total"
            }
        )

    # 3. TAX CHECK
    tax_rate = invoice.get("tax_rate")
    if ( subtotal is not None and tax is not None and tax_rate is not None):
        tax_rate_decimal = Decimal(str(tax_rate))
        expected_tax = (subtotal*tax_rate_decimal/Decimal("100")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        if (expected_tax==tax):
            results.append(
                {
                    "rule": "TAX_CHECK",
                    "status": "PASSED",
                    "message": "Tax calculation is correct",
                    "expected": float(expected_tax),
                    "actual": float(tax)
                }
            )

        else:
            results.append(
                {
                    "rule": "TAX_CHECK",
                    "status": "FAILED",
                    "message": "Tax calculation does not match",
                    "expected": float(expected_tax),
                    "actual": float(tax)
                }
            )

    else:
        results.append(
            {
                "rule": "TAX_CHECK",
                "status": "SKIPPED",
                "message": "Tax rate information is unavailable"
            }
        )

    # 4. DATE CHECK
    invoice_date = invoice.get("invoice_date")
    due_date = invoice.get("due_date")
    if (invoice_date and due_date):
        try:
            invoice_date_object = datetime.strptime(invoice_date,"%Y-%m-%d")
            due_date_object = datetime.strptime(due_date,"%Y-%m-%d")
            
            if (due_date_object >= invoice_date_object):
                results.append(
                    {
                        "rule": "DATE_CHECK",
                        "status": "PASSED",
                        "message": "Invoice dates are valid"
                    }
                )

            else:
                results.append(
                    {
                        "rule": "DATE_CHECK",
                        "status": "FAILED",
                        "message": "Due date is before invoice date"
                    }
                )

        except ValueError:
            results.append(
                {
                    "rule": "DATE_CHECK",
                    "status": "FAILED",
                    "message": "Invalid date format"
                }
            )

    else:
        results.append(
            {
                "rule": "DATE_CHECK",
                "status": "SKIPPED",
                "message": "Date information is incomplete"
            }
        )

    # 5. NEGATIVE AMOUNT CHECK
    amounts = [subtotal,tax,total]
    negative_amounts = [ amount for amount in amounts if (amount is not None and amount < 0)]
    if negative_amounts:
        results.append(
            {
                "rule": "NEGATIVE_AMOUNT_CHECK",
                "status": "FAILED",
                "message": "Negative amount detected"
            }
        )

    else:
        results.append(
            {
                "rule": "NEGATIVE_AMOUNT_CHECK",
                "status": "PASSED",
                "message": "No negative amounts detected"
            }
        )

    return {
        "validation_results": results
    }