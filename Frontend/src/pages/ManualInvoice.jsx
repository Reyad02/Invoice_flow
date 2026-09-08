import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createManualInvoice } from "../services/invoiceService";
import { 
  ArrowLeft, 
  FileText, 
  Building2, 
  Calendar, 
  Percent, 
  Package,
  Plus,
  Trash2,
  Receipt,
  Save,
  AlertCircle
} from "lucide-react";
import { toast } from 'sonner';


function ManualInvoice() {
  const location = useLocation()
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState({
    filename:"",
    invoice_number: "",
    supplier_name: "",
    invoice_date: "",
    due_date: "",
    currency: "JPY",
    tax_rate: "",
    line_items: [
      {
        description: "",
        quantity: "",
        unit_price: "",
        amount: 0
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validationError = location.state?.message || "";
  const [showValidationPopup, setShowValidationPopup] = useState(validationError);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInvoiceData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.line_items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    const quantity = Number(updatedItems[index].quantity) || 0;
    const unitPrice = Number(updatedItems[index].unit_price) || 0;
    updatedItems[index].amount = quantity * unitPrice;

    setInvoiceData((previousData) => ({
      ...previousData,
      line_items: updatedItems
    }));
  };

  const addLineItem = () => {
    setInvoiceData((previousData) => ({
      ...previousData,
      line_items: [
        ...previousData.line_items,
        {
          description: "",
          quantity: "",
          unit_price: "",
          amount: 0
        }
      ]
    }));
  };

  const removeLineItem = (index) => {
    const updatedItems = [...invoiceData.line_items];
    updatedItems.splice(index, 1);
    setInvoiceData((previousData) => ({
      ...previousData,
      line_items: updatedItems
    }));
  };

  const calculateSubtotal = () => {
    return invoiceData.line_items.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const taxRate = Number(invoiceData.tax_rate) || 0;
    return subtotal * taxRate / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + tax;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const total = calculateTotal();

      const payload = {
        filename: invoiceData.filename,
        input_type: "manual",
        invoice_number: invoiceData.invoice_number,
        supplier_name: invoiceData.supplier_name,
        invoice_date: invoiceData.invoice_date,
        due_date: invoiceData.due_date,
        currency: invoiceData.currency,
        line_items: invoiceData.line_items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          amount: Number(item.amount)
        })),
        subtotal: subtotal,
        tax_rate: Number(invoiceData.tax_rate) || 0,
        tax: tax,
        total: total,
        status: "VALID"
      };

      const data = await createManualInvoice(payload);

      if (!data.success) {
        setError(data.message || "Could not save invoice");
        console.log(data.message);
        return;
      }

      const invoiceId = data.data[0].invoice_id;
      navigate(`/invoices/${invoiceId}`);
    } catch (error) {
      console.log(error);
      setError("Something went wrong while saving the invoice");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();

  useEffect(() => {
    if (showValidationPopup) {
      toast.error(`Validation Error: ${showValidationPopup}`)
      // alert(`Validation Error: ${showValidationPopup}`);
    }
  }, [showValidationPopup]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* BACK BUTTON */}
        <button 
          onClick={() => navigate("/")} 
          className="group inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Upload</span>
        </button>

        {/* ERROR */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-5 rounded-2xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-800">Invoice Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FILE NAME */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">File Name</label>
              <input
                type="text"
                name="filename"
                value={invoiceData.filename}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Enter file name"
              />
            </div>
            
            {/* INVOICE NUMBER */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Number</label>
              <input
                type="text"
                name="invoice_number"
                value={invoiceData.invoice_number}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="INV-001"
              />
            </div>

            {/* SUPPLIER */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                Supplier Name
              </label>
              <input
                type="text"
                name="supplier_name"
                value={invoiceData.supplier_name}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Supplier company name"
              />
            </div>

            {/* INVOICE DATE */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Invoice Date
              </label>
              <input
                type="date"
                name="invoice_date"
                value={invoiceData.invoice_date}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* DUE DATE */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={invoiceData.due_date}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* TAX RATE */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <Percent className="w-4 h-4" />
                Tax Rate (%)
              </label>
              <input
                type="number"
                name="tax_rate"
                value={invoiceData.tax_rate}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="10"
              />
            </div>
          </div>

          {/* LINE ITEMS */}
          <div className="mt-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-slate-800">Line Items</h2>
                <span className="text-sm text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
                  {invoiceData.line_items.length} items
                </span>
              </div>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02] font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
                    <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
                    <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit Price</th>
                    <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="text-center p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.line_items.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(event) =>
                            handleLineItemChange(index, "description", event.target.value)
                          }
                          className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          placeholder="Item description"
                          required
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(event) =>
                            handleLineItemChange(index, "quantity", event.target.value)
                          }
                          min="0"
                          className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          placeholder="0"
                          required
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(event) =>
                            handleLineItemChange(index, "unit_price", event.target.value)
                          }
                          min="0"
                          step="0.01"
                          className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          placeholder="0.00"
                          required
                        />
                      </td>
                      <td className="p-3 font-semibold text-slate-700">
                        {Number(item.amount).toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          disabled={invoiceData.line_items.length === 1}
                          className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm">Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="mt-8 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-6 border border-slate-200/60">
            <div className="flex items-center gap-2 mb-5">
              <Receipt className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-800">Invoice Summary</h2>
            </div>
            
            <div className="space-y-3 max-w-md ml-auto">
              <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-700">{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                <span className="text-slate-500">Tax Rate</span>
                <span className="font-semibold text-slate-700">{invoiceData.tax_rate || 0}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                <span className="text-slate-500">Tax</span>
                <span className="font-semibold text-slate-700">{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 -mx-1">
                <span className="font-semibold text-slate-700">Total</span>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full inline-flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving Invoice...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Invoice
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ManualInvoice;