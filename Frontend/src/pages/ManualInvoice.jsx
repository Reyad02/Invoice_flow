import { useState } from "react";
import {
  useLocation,
  useNavigate
} from "react-router-dom";

function ManualInvoice() {
  const location = useLocation();
  const navigate = useNavigate();

  const locationData = location.state?.invoiceData || location.state?.data?.invoice_data || {};
  const validationResults = location.state?.validationResults || location.state?.data?.validation_results || [];

  const [invoiceData, setInvoiceData] = useState({
    invoice_number: locationData.invoice_number || "",
    supplier_name: locationData.supplier_name || "",
    invoice_date: locationData.invoice_date || "",
    due_date: locationData.due_date || "",
    currency: locationData.currency || "",
    subtotal: locationData.subtotal || "",
    tax_rate: locationData.tax_rate || "",
    tax: locationData.tax || "",
    total: locationData.total || "",
    line_items: locationData.line_items || []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInvoiceData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/invoices/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...invoiceData,
          subtotal: Number(invoiceData.subtotal),
          tax_rate: Number(invoiceData.tax_rate),
          tax: Number(invoiceData.tax),
          total: Number(invoiceData.total)
        })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Could not save invoice");
        return;
      }

      const invoiceId = data.data[0].invoice_id;
      navigate(`/invoices/${invoiceId}`);
    } catch (error) {
      setError("Something went wrong while saving the invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <button onClick={() => navigate("/")} className="text-blue-600 hover:underline mb-4">
            ← Back to Upload
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Manual Invoice Review</h1>
          <p className="text-gray-500 mt-2">Please review and correct the invoice information.</p>
        </div>

        {/* VALIDATION ERRORS */}
        {validationResults.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-5 mb-6">
            <h2 className="font-semibold text-yellow-800 mb-3">⚠ Validation Results</h2>
            {validationResults.map((validation, index) => (
              <div key={index} className="mb-2 text-sm">
                <span className="font-medium">{validation.rule}:</span> {validation.message}
                {validation.status === "FAILED" && (
                  <span className="ml-2 text-red-600">FAILED</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* INVOICE NUMBER */}
            <div>
              <label className="block text-sm font-medium mb-2">Invoice Number</label>
              <input
                type="text"
                name="invoice_number"
                value={invoiceData.invoice_number}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* SUPPLIER */}
            <div>
              <label className="block text-sm font-medium mb-2">Supplier Name</label>
              <input
                type="text"
                name="supplier_name"
                value={invoiceData.supplier_name}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* INVOICE DATE */}
            <div>
              <label className="block text-sm font-medium mb-2">Invoice Date</label>
              <input
                type="date"
                name="invoice_date"
                value={invoiceData.invoice_date}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* DUE DATE */}
            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <input
                type="date"
                name="due_date"
                value={invoiceData.due_date}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* CURRENCY */}
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <input
                type="text"
                name="currency"
                value={invoiceData.currency}
                onChange={handleChange}
                placeholder="USD"
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* SUBTOTAL */}
            <div>
              <label className="block text-sm font-medium mb-2">Subtotal</label>
              <input
                type="number"
                name="subtotal"
                value={invoiceData.subtotal}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* TAX RATE */}
            <div>
              <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
              <input
                type="number"
                name="tax_rate"
                value={invoiceData.tax_rate}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* TAX */}
            <div>
              <label className="block text-sm font-medium mb-2">Tax Amount</label>
              <input
                type="number"
                name="tax"
                value={invoiceData.tax}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* TOTAL */}
            <div>
              <label className="block text-sm font-medium mb-2">Total</label>
              <input
                type="number"
                name="total"
                value={invoiceData.total}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ManualInvoice;