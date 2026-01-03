import React, { useState } from "react";
import axios from "axios";
import { FaLock } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import StarsBackground from "../ShootingStar/StarBackground.jsx";
import "./login.css";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // email should be passed from VerifyResetOtp page
  const email = location.state?.email || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", {
        email,
        newPassword: password,
      });

      if (res.data.success) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(res.data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("ResetPassword Error:", err);
      setMessage("Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <StarsBackground />

      <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl border border-white/20 relative z-10 mx-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-300">Enter your new password for {email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaLock className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
            </div>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pad h-14 pl-10 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none border border-white/20 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
            />
          </div>

          {/* Confirm Password */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaLock className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
            </div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pad h-14 pl-10 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none border border-white/20 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-14 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg ${
              loading ? "opacity-80 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.includes("successful")
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

export default ResetPassword;
