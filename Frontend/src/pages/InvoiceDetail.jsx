import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInvoiceById } from "../services/invoiceService";

function InvoiceDetail() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // LOAD INVOICE
  // ==============================
  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getInvoiceById(invoiceId);

      if (response.success) {
        setInvoice(response.data[0]);
      } else {
        setError(response.message || "Could not retrieve invoice");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong while loading the invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  // ==============================
  // LOADING
  // ==============================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        Loading invoice...
      </div>
    );
  }

  // ==============================
  // ERROR
  // ==============================
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => navigate("/invoices")} className="bg-blue-600 text-white px-5 py-3 rounded-lg">
          Back to Invoices
        </button>
      </div>
    );
  }

  // ==============================
  // NO INVOICE
  // ==============================
  if (!invoice) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <button onClick={() => navigate("/invoices")} className="text-blue-600 hover:underline mb-3">
              ← Back to Invoices
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Invoice Details</h1>
            <p className="text-gray-500 mt-2">Invoice ID: {invoice.id}</p>
          </div>
          <div>
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium">
              {invoice.status || "Unknown"}
            </span>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* INVOICE INFORMATION */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-5">Invoice Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-sm text-gray-500">Invoice Number</p>
                  <p className="font-medium mt-1">{invoice.invoice_number || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="font-medium mt-1">{invoice.supplier_name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Invoice Date</p>
                  <p className="font-medium mt-1">{invoice.invoice_date || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium mt-1">{invoice.due_date || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Input Type</p>
                  <p className="font-medium mt-1">{invoice.input_type || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">File Name</p>
                  <p className="font-medium mt-1 break-all">{invoice.filename || "-"}</p>
                </div>
              </div>
            </div>

            {/* LINE ITEMS */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-5">Line Items</h2>
              {!invoice.line_items || invoice.line_items.length === 0 ? (
                <p className="text-gray-500">No line items found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3">Description</th>
                        <th className="text-left p-3">Quantity</th>
                        <th className="text-left p-3">Unit Price</th>
                        <th className="text-left p-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.line_items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">{item.description || item.name || "-"}</td>
                          <td className="p-3">{item.quantity || "-"}</td>
                          <td className="p-3">{item.unit_price || "-"}</td>
                          <td className="p-3">{item.amount || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div>
            {/* FINANCIAL SUMMARY */}
            <div className="bg-white rounded-xl shadow p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-5">Financial Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{invoice.currency} {invoice.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax Rate</span>
                  <span className="font-medium">{invoice.tax_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">{invoice.currency} {invoice.tax}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">{invoice.currency} {invoice.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetail;