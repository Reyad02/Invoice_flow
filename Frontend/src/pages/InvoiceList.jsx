import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInvoices } from "../services/invoiceService";
import { Plus, Eye, ChevronRight, AlertCircle, FileText } from "lucide-react";

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
      } else {
        setError(response.message || "Could not retrieve invoices");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong while loading invoices",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">

        {/* LOADING */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200/60">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-500 mt-4 font-medium">
              Loading invoices...
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-5 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TABLE */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            {invoices.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">
                  No invoices found
                </h3>
                <p className="text-slate-400 text-sm">
                  Upload your first invoice to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
                      <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Invoice #
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice, index) => (
                      <tr
                        key={invoice.id}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="p-4 text-sm text-slate-400 font-mono">
                          #{invoice.id}
                        </td>
                        <td className="p-4 font-semibold text-slate-700">
                          {invoice.invoice_number || "-"}
                        </td>
                        <td className="p-4 font-semibold text-slate-700">
                          {invoice.filename || "-"}
                        </td>
                        <td className="p-4 text-slate-600">
                          {invoice.supplier_name || "-"}
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          {invoice.total?.toLocaleString()}
                        </td>
                        <td className="p-4 text-sm text-slate-400">
                          {invoice.created_at
                            ? new Date(invoice.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "-"}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => navigate(`/invoices/${invoice.id}`)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group-hover:shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
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

        {/* ADD INVOICE */}
        <div className="my-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
            <button
              onClick={() => navigate("/")}
              className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-medium">Upload Invoice</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceList;
