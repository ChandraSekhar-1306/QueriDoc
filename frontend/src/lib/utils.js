import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

export const handleLogin = async (onLogin) => {
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
  } catch (err) {
    console.error("Login error:", err);
  }
};
