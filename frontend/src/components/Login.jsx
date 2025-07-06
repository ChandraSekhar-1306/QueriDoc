import { useState, useEffect } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { LogIn, LogOut } from "lucide-react";

export default function Login({ onLogin }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        const authData = {
          token,
          email: currentUser.email,
          name: currentUser.displayName,
        };
        localStorage.setItem("docuquery_auth", JSON.stringify(authData));
        setUser(currentUser);
        onLogin(authData);
      }
    });

    return () => unsubscribe();
  }, []);

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
      setUser(result.user);
      onLogin(authData);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setUser(null);
    localStorage.removeItem("docuquery_auth");
    onLogin(null);
  };

  return (
    <div className="w-full max-w-md mx-auto mb-10">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-5 flex items-center gap-3">
          <span className="text-2xl">📄</span>
          <div>
            <h2 className="text-lg font-bold">Welcome to DocuQuery</h2>
            <p className="text-sm text-blue-100 font-semibold">Your document Q&A companion</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 text-center">
          {user ? (
            <>
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-16 h-16 rounded-full mx-auto mb-3 border border-gray-300 shadow"
                />
              )}
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {user.displayName}
              </h3>
              <p className="text-sm text-gray-500 mb-5">{user.email}</p>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Log in with your Google account to upload PDFs and start asking questions.
              </p>

              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white px-4 py-2 rounded-md transition"
              >
                <LogIn className="w-4 h-4" />
                Login with Google
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
