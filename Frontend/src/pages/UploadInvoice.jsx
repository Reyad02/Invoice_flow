import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { processInvoice } from "../services/invoiceService";
import { 
  Upload, 
  File, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

function UploadInvoice() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (validTypes.includes(droppedFile.type)) {
        setFile(droppedFile);
        setError("");
      } else {
        setError("Please upload a valid file (PDF, PNG, JPG, JPEG)");
      }
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
        const invoiceId = response.data[0].invoice_id;
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
      }

      setError(response.message);
    } catch (error) {
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
      }

      setError(
        responseData?.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return null;
    const type = file.type;
    if (type === 'application/pdf') return <FileText className="w-8 h-8 text-rose-500" />;
    if (type.includes('image')) return <File className="w-8 h-8 text-blue-500" />;
    return <File className="w-8 h-8 text-slate-500" />;
  };

  const getFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 hover:shadow-md transition-shadow">
          <form onSubmit={handleSubmit}>
            {/* FILE UPLOAD AREA */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : file 
                    ? 'border-emerald-500 bg-emerald-50/30' 
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />

              <div className="flex flex-col items-center justify-center text-center">
                {!file ? (
                  <>
                    <div className={`p-4 rounded-full mb-4 transition-colors ${
                      dragActive ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      <Upload className={`w-8 h-8 transition-colors ${
                        dragActive ? 'text-blue-600' : 'text-slate-400'
                      }`} />
                    </div>
                    <p className="text-slate-600 font-medium">
                      {dragActive ? 'Drop your file here' : 'Click to select or drag & drop'}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      PDF, PNG, JPG, JPEG (Max 10MB)
                    </p>
                  </>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex-shrink-0">
                        {getFileIcon()}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-slate-700 truncate">
                          {file.name}
                        </p>
                        <p className="text-sm text-slate-400">
                          {getFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">File ready for processing</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading || !file}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Invoice...
                </>
              ) : (
                <>
                  Process Invoice
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* SUPPORTED FORMATS */}
        <div className="mt-6 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <File className="w-4 h-4" />
            <span>PNG</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <File className="w-4 h-4" />
            <span>JPG</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <File className="w-4 h-4" />
            <span>JPEG</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadInvoice;