import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadInvoice from "./pages/UploadInvoice";
import ManualInvoice from "./pages/ManualInvoice";
import InvoiceList from "./pages/InvoiceList";
import InvoiceDetail from "./pages/InvoiceDetail";
import Navbar from "./components/Navbar";
import { Toaster } from 'sonner';


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Toaster/>
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
