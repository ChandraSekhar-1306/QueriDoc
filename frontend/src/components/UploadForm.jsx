import { useState } from "react";
import axios from "axios";
import { CloudUpload } from "lucide-react";
import { Link } from "react-router-dom";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("❌ Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const token = JSON.parse(localStorage.getItem("docuquery_auth"))?.token;
      const response = await axios.post("http://localhost:8000/upload", formData, {
        headers: { 
            "Content-Type": "multipart/form-data",
             "Authorization": `Bearer ${token}`
         },
      });
      setStatus(`✅ ${response.data.message}`);
    } catch (error) {
      console.error(error);
      setStatus("❌ Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-xl mx-auto border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        📄 Upload a PDF to DocuQuery
      </h2>

      {/* ✅ Wrapped in a <label> to fix click-anywhere issue */}
      <label
        htmlFor="fileInput"
        className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 mb-5 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
      >
        <CloudUpload className="h-8 w-8 text-blue-600 mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          Drag and drop a PDF here, or click to browse
        </p>
        <p className="text-sm font-medium text-blue-700 mt-1">
          {file ? file.name : "No file selected"}
        </p>

        <input
          id="fileInput"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </label>

      <button
        onClick={handleUpload}
        disabled={isUploading}
        className={`w-full py-3 px-6 rounded-xl text-white font-semibold transition ${
          isUploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isUploading ? "Uploading..." : "Upload PDF"}
      </button>

      {status && (
        <div
          className={`mt-4 text-center text-sm font-medium ${
            status.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {status}
        </div>
      )}

      <Link
        to="/ask"
        className="w-full mt-6 inline-block py-3 px-6 rounded-xl text-white font-semibold bg-green-600 hover:bg-green-700 transition text-center"
      >
        Go to QnA Page
      </Link>
    </div>
  );
}
