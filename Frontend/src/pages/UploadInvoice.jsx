import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {processInvoice} from "../services/invoiceService";

function UploadInvoice() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState("");

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError("");
        }
    };

    const handleSubmit = async (event) => {

        event.preventDefault();
        if (!file) {
            setError("Please select an invoice file");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const response = await processInvoice(file);

            if (response.success) {
                const invoiceId =response.data[0].invoice_id;
                navigate(`/invoices/${invoiceId}`);
                return;
            }

            if (response.error?.details === "Validation_Error") {

                navigate(
                    "/manual-invoice",
                    {
                        state: {
                            message: response.message,
                            validationError: response.error,
                            originalFile: file
                        }
                    }
                );

                return;

                // console.log(response.message);
                // console.log(response.error);
            }

            setError(response.message);
        }

        catch (error) {
            const responseData = error.response?.data;
            if (responseData?.error?.details === "Validation_Error") {
                navigate("/manual-invoice",
                    {
                        state: {
                            message: responseData.message,
                            validationError: responseData.error
                        }
                    }
                );

                return;

                
                // console.log(responseData.message);
                // console.log(responseData.error);
            }

            setError(
                responseData?.message ||
                "Something went wrong"
            );
        }
        finally {
            setLoading(false);
        }
    };


    return (

        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-xl rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-gray-800">
                    Invoice Processor
                </h1>

                <p className="text-gray-500 mt-2">
                    Upload an invoice for processing and validation.
                </p>


                <form onSubmit={handleSubmit} className="mt-6">
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500">
                        
                        <input type="file"
                            accept=".pdf, .png, .jpg, .jpeg"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <p className="text-gray-600">
                            Click to select an invoice
                        </p>


                        <p className="text-sm text-gray-400 mt-2">
                            PDF, PNG, JPG, JPEG
                        </p>

                        {
                            file && (
                                <p className=" mt-4 text-blue-600 font-medium">
                                    {file.name}
                                </p>
                            )
                        }

                    </label>


                    {
                        error && (

                            <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg">
                                {error}
                            </div>

                        )
                    }


                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {
                            loading ? "Processing..." : "Process Invoice"
                        }

                    </button>
                </form>
            </div>
        </div>
    );
}

export default UploadInvoice;