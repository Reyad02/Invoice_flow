import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createManualInvoice } from "../services/invoiceService";
// import { toast } from 'sonner'

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

  const validationError = location.state?.validationError || "";
  const [showValidationPopup, setShowValidationPopup] = useState(validationError.details);

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
      alert(`Validation Error: ${showValidationPopup}`);
    }
  }, [showValidationPopup]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">

        <div className="mb-6">
          <button onClick={() => navigate("/")} className="text-blue-600 hover:underline mb-4">
            ← Back to Upload
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Create Manual Invoice</h1>
          <p className="text-gray-500 mt-2">Enter invoice information manually.</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-6">Invoice Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FILE NAME */}
            <div>
              <label className="block text-sm font-medium mb-2">File Name</label>
              <input
                type="text"
                name="filename"
                value={invoiceData.filename}
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>
            
            {/* INVOICE NUMBER */}
            <div>
              <label className="block text-sm font-medium mb-2">Invoice Number</label>
              <input
                type="text"
                name="invoice_number"
                value={invoiceData.invoice_number}
                onChange={handleChange}
                required
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
                required
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

            {/* TAX RATE */}
            <div>
              <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
              <input
                type="number"
                name="tax_rate"
                value={invoiceData.tax_rate}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border rounded-lg p-3"
              />
            </div>
          </div>

          <div className="mt-10">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold">Line Items</h2>
              <button
                type="button"
                onClick={addLineItem}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                + Add New Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-left">Quantity</th>
                    <th className="p-3 text-left">Unit Price</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.line_items.map((item, index) => (
                    <tr key={index} className="border-t">
                      {/* DESCRIPTION */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(event) =>
                            handleLineItemChange(index, "description", event.target.value)
                          }
                          className="w-full border rounded p-2"
                          required
                        />
                      </td>

                      {/* QUANTITY */}
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(event) =>
                            handleLineItemChange(index, "quantity", event.target.value)
                          }
                          min="0"
                          className="w-full border rounded p-2"
                          required
                        />
                      </td>

                      {/* UNIT PRICE */}
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(event) =>
                            handleLineItemChange(index, "unit_price", event.target.value)
                          }
                          min="0"
                          step="0.01"
                          className="w-full border rounded p-2"
                          required
                        />
                      </td>

                      {/* AMOUNT */}
                      <td className="p-3 font-medium">
                        {Number(item.amount).toFixed(2)}
                      </td>

                      {/* REMOVE */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          disabled={invoiceData.line_items.length === 1}
                          className="text-red-600 hover:text-red-800 disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 rounded-xl p-6 border">
            <h2 className="text-xl font-semibold mb-5">Invoice Summary</h2>
            <div className="space-y-3 max-w-md ml-auto">
              {/* SUBTOTAL */}
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">{subtotal.toFixed(2)}</span>
              </div>

              {/* TAX RATE */}
              <div className="flex justify-between">
                <span>Tax Rate</span>
                <span className="font-semibold">{invoiceData.tax_rate || 0}%</span>
              </div>

              {/* TAX */}
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-semibold">{tax.toFixed(2)}</span>
              </div>

              {/* TOTAL */}
              <div className="flex justify-between border-t pt-4 text-xl font-bold">
                <span>Total</span>
                <span>{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving Invoice..." : "Save Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ManualInvoice;