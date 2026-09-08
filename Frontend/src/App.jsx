import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadInvoice from "./pages/UploadInvoice";
import ManualInvoice from "./pages/ManualInvoice";
import InvoiceList from "./pages/InvoiceList";
import InvoiceDetail from "./pages/InvoiceDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadInvoice />} />

        <Route path="/manual-invoice" element={<ManualInvoice />} />

        <Route path="/invoices" element={<InvoiceList />} />

        <Route path="/invoices/:invoiceId" element={<InvoiceDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
