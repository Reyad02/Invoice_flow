import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export const processInvoice = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
        `${apiUrl}/api/invoices/process`,
        formData,
        {
            headers: {
                "Content-Type":
                    "multipart/form-data"
            }
        }
    );

    return response.data;
};

export const getInvoices = async () => {
    const response = await axios.get(`${apiUrl}/api/invoices/`);
    return response.data;
};

export const getInvoiceById = async (invoiceId) => {
    const response = await axios.get(`${apiUrl}/api/invoices/${invoiceId}`);
    return response.data;
};