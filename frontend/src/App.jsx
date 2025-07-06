import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AskForm from "./components/AskForm";
import UploadForm from "./components/UploadForm";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";



function App() {
  const [authInfo, setAuthInfo] = useState(null);
  const [loading, setLoading] = useState(true); // 🚀 hydration state

  useEffect(() => {
    const storedAuth = localStorage.getItem("docuquery_auth");
    if (storedAuth) {
      setAuthInfo(JSON.parse(storedAuth));
    }
    setLoading(false); // ✅ mark as loaded
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("docuquery_auth");
    setAuthInfo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Navbar authInfo={authInfo} onLogout={handleLogout} onLogin={setAuthInfo} />

      <div className="min-h-screen bg-gray-100 p-6 pt-20">
        <Routes>
          <Route path="/" element={<Landing authInfo={authInfo} onLogin={setAuthInfo} />} />


          <Route
            path="/ask"
            element={authInfo ? <AskForm /> : <Navigate to="/" replace />}
          />
          <Route
            path="/upload"
            element={authInfo ? <UploadForm /> : <Navigate to="/" replace />}
          />
          

          {!authInfo && <Route path="/login" element={<Login onLogin={setAuthInfo} />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
