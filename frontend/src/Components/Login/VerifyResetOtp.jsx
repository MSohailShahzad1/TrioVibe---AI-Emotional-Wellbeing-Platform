
import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import StarsBackground from "../ShootingStar/StarBackground.jsx";

const VerifyResetOtp = () => {
  const [otp, setOtp] = useState(Array(6).fill("")); // 6 small inputs
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {}; // ✅ get email from ForgotPassword

  // ✅ Handle OTP input
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, ""); // only numbers
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && e.target.nextSibling) {
      e.target.nextSibling.focus();
    }
  };

  // ✅ Submit OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const otpCode = otp.join(""); // merge into one string
      const res = await axios.post("http://localhost:5000/api/auth/verify-reset-otp", {
        email,
        otp: otpCode,
      });

      if (res.data.success) {
        setMessage("OTP verified! You can reset your password.");
        navigate("/reset-password", { state: { email } }); // ✅ redirect to reset page
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      console.error("Verify OTP Error:", err.response?.data || err.message);
      setMessage("Error verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <StarsBackground />

      <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl border border-white/20 relative z-10 mx-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Verify OTP</h2>
          <p className="text-gray-300">
            Enter the 6-digit OTP sent to <span className="font-semibold text-purple-300">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Inputs */}
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                className="w-12 h-12 text-center text-lg font-semibold rounded-lg bg-white/10 text-white focus:outline-none border border-white/20 focus:ring-2 focus:ring-purple-400 transition-all"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-14 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg ${
              loading ? "opacity-80 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Status Message */}
        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.includes("verified") ? "text-green-300" : "text-red-300"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyResetOtp;
