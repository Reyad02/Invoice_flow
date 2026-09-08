import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInvoiceById } from "../services/invoiceService";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  File,
  Package,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

function InvoiceDetail() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setError(
        error.response?.data?.message ||
          "Something went wrong while loading the invoice",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0.00";
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-500 mt-4 font-medium">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex flex-col items-center justify-center p-6">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-5 rounded-2xl flex items-center gap-3 max-w-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
        <button
          onClick={() => navigate("/invoices")}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Invoices
        </button>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/invoices")}
          className="group inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Invoices</span>
        </button>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* INVOICE INFORMATION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-5">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-800">
                  Invoice Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Invoice Number
                  </p>
                  <p className="font-semibold text-slate-700">
                    {invoice.invoice_number || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Supplier
                  </p>
                  <p className="font-semibold text-slate-700">
                    {invoice.supplier_name || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Invoice Date
                  </p>
                  <p className="font-medium text-slate-700">
                    {formatDate(invoice.invoice_date)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due Date
                  </p>
                  <p className="font-medium text-slate-700">
                    {formatDate(invoice.due_date)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Input Type
                  </p>
                  <p className="font-medium text-slate-700">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      {invoice.input_type || "-"}
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <File className="w-3 h-3" />
                    File Name
                  </p>
                  <p className="font-medium text-slate-700 break-all text-sm">
                    {invoice.filename || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* LINE ITEMS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-5">
                <Package className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-800">
                  Line Items
                </h2>
                <span className="ml-auto text-sm text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
                  {invoice.line_items?.length || 0} items
                </span>
              </div>
              {!invoice.line_items || invoice.line_items.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-400">No line items found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
                        <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.line_items.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="p-3 font-medium text-slate-700">
                            {item.description || item.name || "-"}
                          </td>
                          <td className="p-3 text-slate-600">
                            {item.quantity || "-"}
                          </td>
                          <td className="p-3 text-slate-600">
                            {invoice.currency} {formatCurrency(item.unit_price)}
                          </td>
                          <td className="p-3 font-semibold text-slate-700">
                            {invoice.currency} {formatCurrency(item.amount)}
                          </td>
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 sticky top-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-800">
                  Financial Summary
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-700">
                    {invoice.currency} {formatCurrency(invoice.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Tax Rate</span>
                  <span className="font-medium text-slate-700">
                    {invoice.tax_rate || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Tax</span>
                  <span className="font-medium text-slate-700">
                    {invoice.currency} {formatCurrency(invoice.tax)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 -mx-1">
                  <span className="font-semibold text-slate-700">Total</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {invoice.currency} {formatCurrency(invoice.total)}
                  </span>
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
