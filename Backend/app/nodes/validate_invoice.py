from datetime import datetime
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from app.graphs.state import InvoiceState

def money(value):
    if value is None or value == "":
        return None
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def to_number(value):
    if value is None:
        return None
    return float(value)

def validate_invoice_node(state: InvoiceState):
    invoice = state.get("invoice_data")
    if not invoice:
        return {
            "validation_results": [
                {
                    "rule": "INVOICE_DATA",
                    "status": "FAILED",
                    "message": "No invoice data was extracted"
                }
            ]
        }

    results = []
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
                "message": (
                    "Missing fields: "
                    + ", ".join(
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
                "message": "All required fields are present"
            }
        )

    subtotal = money(invoice.get("subtotal"))
    tax = money(invoice.get("tax"))
    total = money(invoice.get("total"))
    tax_rate = money(invoice.get("tax_rate"))
    line_items = (invoice.get("line_items") or [])

    if not line_items:
        results.append(
            {
                "rule": "LINE_ITEMS_CHECK",
                "status": "SKIPPED",
                "message": "No line items available"
            }
        )
    else:
        calculated_subtotal = Decimal("0.00")

        for index, item in enumerate(line_items, start=1):
            description = item.get("description")
            quantity = money(item.get("quantity"))
            unit_price = money(item.get("unit_price"))
            actual_amount = money(item.get("amount"))

            if (
                quantity is None
                or unit_price is None
                or actual_amount is None
            ):
                results.append(
                    {
                        "rule": "LINE_ITEM_CHECK",
                        "status": "SKIPPED",
                        "line_item": index,
                        "description": description,
                        "message": "Not enough information to validate line item"
                    }
                )
                continue

            expected_amount = (quantity * unit_price)

            if (expected_amount == actual_amount):
                results.append(
                    {
                        "rule": "LINE_ITEM_CHECK",
                        "status": "PASSED",
                        "line_item": index,
                        "description": description,
                        "message": "Line item calculation is correct",
                        "expected": to_number(expected_amount),
                        "actual": to_number(actual_amount)
                    }
                )
            else:
                results.append(
                    {
                        "rule": "LINE_ITEM_CHECK",
                        "status": "FAILED",
                        "line_item": index,
                        "description": description,
                        "message": f"Line item calculation does not match expected {expected_amount} and actual {actual_amount}",
                        "expected": to_number(expected_amount),
                        "actual": to_number(actual_amount)
                    }
                )

            calculated_subtotal += actual_amount

        if subtotal is not None:
            if (calculated_subtotal == subtotal):
                results.append(
                    {
                        "rule": "LINE_ITEMS_SUBTOTAL_CHECK",
                        "status": "PASSED",
                        "message": "Sum of line items matches invoice subtotal",
                        "expected": to_number(calculated_subtotal),
                        "actual": to_number(subtotal)
                    }
                )
            else:
                results.append(
                    {
                        "rule": "LINE_ITEMS_SUBTOTAL_CHECK",
                        "status": "FAILED",
                        "message": f"Sum of line items does not match invoice subtotal expected {calculated_subtotal} actual {subtotal}", 
                        "expected": to_number(calculated_subtotal),
                        "actual": to_number(subtotal)
                    }
                )
        else:
            results.append(
                {
                    "rule": "LINE_ITEMS_SUBTOTAL_CHECK",
                    "status": "SKIPPED",
                    "message": "Invoice subtotal is unavailable"
                }
            )

    if (
        subtotal is not None
        and tax is not None
        and tax_rate is not None
    ):
        expected_tax = (subtotal* tax_rate/ Decimal("100"))
        expected_tax = expected_tax.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        if expected_tax == tax:
            results.append(
                {
                    "rule": "TAX_CHECK",
                    "status": "PASSED",
                    "message": "Tax calculation is correct",
                    "expected": to_number(expected_tax),
                    "actual": to_number(tax)
                }
            )
        else:
            results.append(
                {
                    "rule": "TAX_CHECK",
                    "status": "FAILED",
                    "message": f"Tax calculation does not match expected {expected_tax} actual {tax}",
                    "expected": to_number(expected_tax),
                    "actual": to_number(tax)
                }
            )
    else:
        results.append(
            {
                "rule": "TAX_CHECK",
                "status": "SKIPPED",
                "message": "Tax information is incomplete"
            }
        )

    if (
        subtotal is not None
        and tax is not None
        and total is not None
    ):
        expected_total = subtotal + tax

        if expected_total == total:
            results.append(
                {
                    "rule": "TOTAL_CHECK",
                    "status": "PASSED",
                    "message": "Subtotal + tax equals total",
                    "expected": to_number(expected_total),
                    "actual": to_number(total)
                }
            )
        else:
            results.append(
                {
                    "rule": "TOTAL_CHECK",
                    "status": "FAILED",
                    "message": f"Subtotal + tax does not equal total expected {expected_total} actual {total}",
                    "expected": to_number(expected_total),
                    "actual": to_number(total)
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

    invoice_date = invoice.get("invoice_date")
    due_date = invoice.get("due_date")

    if (invoice_date and due_date):
        try:
            invoice_date_object = (
                datetime.strptime(
                    invoice_date,
                    "%Y-%m-%d"
                )
            )
            due_date_object = (
                datetime.strptime(
                    due_date,
                    "%Y-%m-%d"
                )
            )

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

    amounts = [subtotal, tax, total]

    negative_amounts = [
        amount for amount in amounts
        if (amount is not None and amount < 0)
    ]

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