import { LogIn, Upload, MessageCircleQuestion } from "lucide-react";
import { handleLogin } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";


export default function Landing({ authInfo, onLogin }) {
  const navigate = useNavigate();

  const loginAndRedirect = async () => {
    await handleLogin(onLogin);
    navigate("/ask");
  };

  return (
    <div className="min-h-screen text-center text-gray-700 pt-32 px-6">
      {/* If user is logged in */}
      {authInfo ? (
        <>
          <h1 className="text-4xl font-bold text-blue-700 mb-4">
            👋 Welcome, {authInfo.name.split(" ")[0]}!
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
            Start by uploading a PDF or asking a question.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button
              onClick={() => navigate("/ask")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md w-full sm:w-48"
            >
              <MessageCircleQuestion className="w-5 h-5" />
              Ask Questions
            </button>
            <button
              onClick={() => navigate("/upload")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md w-full sm:w-48"
            >
              <Upload className="w-5 h-5" />
              Upload PDF
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Hero */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 mb-4">📄 QueriDoc</h1>
          <p className="text-lg sm:text-xl max-w-xl mx-auto mb-6">
            Ask questions about your PDFs. Get instant, intelligent answers — powered by AI.
          </p>
          <button
            onClick={loginAndRedirect}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 justify-center mx-auto shadow-md hover:cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Login with Google
          </button>

          {/* Features */}
          <section className="mt-20 px-6 max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
            {[
              { icon: "🔍", title: "Ask Anything", desc: "Query your PDFs in plain English, no technical terms needed." },
              { icon: "⚡", title: "Instant Answers", desc: "Get fast, AI-powered responses to your questions." },
              { icon: "🔒", title: "Secure & Private", desc: "Your documents are never stored. Privacy is our priority." }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <Feature icon={feature.icon} title={feature.title} desc={feature.desc} />
              </motion.div>
            ))}
            </section>


          {/* How it works */}
          <section className="mt-24 px-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">How QueriDoc Works</h2>
            <ol className="space-y-4 text-left">
              <Step number="1" title="Upload your PDF" desc="Simply drag and drop a file or use our upload form." />
              <Step number="2" title="Ask a question" desc="Enter any question — no keywords or syntax needed." />
              <Step number="3" title="Get instant answers" desc="QueriDoc gives you AI-powered responses from your file." />
            </ol>
          </section>

          {/* CTA */}
          <div className="mt-24 mb-16 px-6">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4">
              Ready to turn your documents into conversations?
            </h3>
            <button
              onClick={loginAndRedirect}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 justify-center mx-auto shadow-md hover:cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Login with Google
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="text-sm text-gray-500 border-t pt-6 pb-10 mt-10 px-6">
        Built for the AI era. © {new Date().getFullYear()} QueriDoc
      </footer>
    </div>
  );
}

// Reusable subcomponents
function Feature({ icon, title, desc }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      <h3 className="font-semibold text-blue-700 text-lg mb-2">{icon} {title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}

function Step({ number, title, desc }) {
  return (
    <li className="flex gap-4">
      <span className="text-blue-600 font-bold text-xl">{number}</span>
      <div>
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </li>
  );
}
