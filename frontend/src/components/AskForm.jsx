import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Send, FileText } from "lucide-react";





export default function AskForm() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState(null);

  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("docuquery_auth")
    ? JSON.parse(localStorage.getItem("docuquery_auth")).token
    : "";

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:8000/my-files", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const filenames = res.data.map((f) => f.filename);
        setFiles(filenames);
        setSelectedFile(filenames[0] || "");
      })
      .catch((err) => console.error("Error fetching files:", err));
  }, [token]);


  const fetchHistory = (filename) => {
    if (!filename) return;
    axios
      .get("http://localhost:8000/qna-history", {
        headers: { Authorization: `Bearer ${token}` },
        params: { filename },
      })
      .then((res) => {
        const mapped = res.data.reverse().map((entry) => [
          { role: "user", text: entry.question },
          { role: "ai", text: entry.answer },
        ]);
        setMessages(mapped.flat());
      })
      .catch((err) => console.error("Failed to fetch history:", err));
  };

  useEffect(() => {
    if (selectedFile) {
      fetchHistory(selectedFile);
    }
  }, [selectedFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !selectedFile) return;

    const newMessages = [...messages, { role: "user", text: question }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/ask",
        new URLSearchParams({ filename: selectedFile, question }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      setMessages((prev) => [...prev, { role: "ai", text: res.data.answer }]);
      setQuestion("");
    } catch (err) {
      console.error("Error asking question:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    
    <div className="w-full min-h-screen bg-white p-6">
     
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-blue-700 mb-2 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Ask Questions
        </h2>
        

        <select
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          {files.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>
     

      <div className="border border-gray-200 rounded-lg h-[60vh] overflow-y-auto bg-gray-50 shadow-inner w-full p-4 mb-6">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No conversation yet.</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-[75%] ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask something about the document..."
          className="flex-1 border border-gray-300 rounded-md px-4 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-1 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {loading ? "Asking..." : "Send"}
        </button>
      </form>
    </div>
  );
}
