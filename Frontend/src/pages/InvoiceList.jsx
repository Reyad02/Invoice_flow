import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInvoices } from "../services/invoiceService";

function InvoiceList() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getInvoices();

      if (response.success) {
        setInvoices(response.data);
        console.log(response.data)
      } else {
        setError(response.message || "Could not retrieve invoices");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong while loading invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Invoices</h1>
            <p className="text-gray-500 mt-1">View and manage all processed invoices.</p>
          </div>
          <button onClick={() => navigate("/")} className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700">
            + Upload Invoice
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white rounded-lg p-10 text-center">Loading invoices...</div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
        )}

        {/* TABLE */}
        {!loading && !error && (
          <div className="bg-white shadow rounded-xl overflow-hidden">
            {invoices.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No invoices found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold">ID</th>
                      <th className="text-left p-4 text-sm font-semibold">Invoice Number</th>
                      <th className="text-left p-4 text-sm font-semibold">Supplier</th>
                      <th className="text-left p-4 text-sm font-semibold">Total</th>
                      <th className="text-left p-4 text-sm font-semibold">Status</th>
                      <th className="text-left p-4 text-sm font-semibold">Created</th>
                      <th className="text-right p-4 text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-gray-50">
                        {/* ID */}
                        <td className="p-4">{invoice.id}</td>
                        {/* INVOICE NUMBER */}
                        <td className="p-4 font-medium">{invoice.invoice_number || "-"}</td>
                        {/* SUPPLIER */}
                        <td className="p-4">{invoice.supplier_name || "-"}</td>
                        {/* TOTAL */}
                        <td className="p-4">{invoice.currency} {invoice.total}</td>
                        {/* STATUS */}
                        <td className="p-4">
                          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                            {invoice.status || "Unknown"}
                          </span>
                        </td>
                        {/* CREATED */}
                        <td className="p-4 text-sm text-gray-500">
                          {invoice.created_at ? new Date(invoice.created_at).toLocaleString() : "-"}
                        </td>
                        {/* ACTION */}
                        <td className="p-4 text-right">
                          <button onClick={() => navigate(`/invoices/${invoice.id}`)} className="text-blue-600 hover:underline font-medium">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceList;