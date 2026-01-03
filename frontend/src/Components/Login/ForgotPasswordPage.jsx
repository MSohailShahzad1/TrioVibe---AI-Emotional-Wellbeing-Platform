import React, { useState } from "react";
import axios from "axios";
import { FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";  // ✅ import navigate
import StarsBackground from "../ShootingStar/StarBackground.jsx";
import "./login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // ✅ hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password-request", {
        email,
      });

      if (res.data.success) {
        setMessage("OTP sent to your email!");
        navigate("/verify-reset-otp", { state: { email } }); // ✅ pass email to next page
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      console.error("ForgotPassword Error:", err.response?.data || err.message);
      setMessage("Error requesting password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Stars Background */}
      <StarsBackground />

      {/* Glass Card */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl border border-white/20 relative z-10 mx-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Forgot Password</h2>
          <p className="text-gray-300">
            Enter your email and we’ll send you an OTP to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaEnvelope className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pad h-14 pl-10 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none border border-white/20 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-14 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg ${
              loading ? "opacity-80 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        {/* Status Message */}
        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.includes("OTP sent")
                ? "text-green-300"
                : "text-red-300"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
