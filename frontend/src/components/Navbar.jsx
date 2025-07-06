import { LogIn, LogOut, UploadCloud, MessageCircleQuestion } from "lucide-react";
import { auth, provider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Navbar({ authInfo, onLogin, onLogout }) {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      const authData = {
        token,
        email: result.user.email,
        name: result.user.displayName,
      };
      localStorage.setItem("docuquery_auth", JSON.stringify(authData));
      onLogin(authData);
      navigate("/ask"); // Redirect after login
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("docuquery_auth");
      onLogout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex items-center justify-between border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      {/* Logo */}
      <h1
        className="text-xl font-bold text-blue-600 flex items-center gap-1 cursor-pointer"
        onClick={() => navigate("/")}
      >
        📄 QueriDoc
      </h1>

      {/* Auth Actions */}
      {authInfo ? (
        <div className="flex items-center gap-4">
          {/* Ask Questions Button */}
          <button
            onClick={() => navigate("/ask")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
          >
            <MessageCircleQuestion className="w-4 h-4" />
            Ask Questions
          </button>

          {/* Upload PDF Button */}
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
          >
            <UploadCloud className="w-4 h-4" />
            Upload PDF
          </button>

          {/* Name and Avatar */}
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">
            {authInfo.name}
          </span>
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(authInfo.name)}&background=random`}
            alt="avatar"
            className="w-8 h-8 rounded-full border border-gray-300 shadow-sm"
          />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 flex items-center gap-1 hover:underline"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="text-sm text-blue-600 flex items-center gap-1 hover:underline hover:cursor-pointer"
        >
          <LogIn className="w-4 h-4" /> Login
        </button>
      )}
    </nav>
  );
}
