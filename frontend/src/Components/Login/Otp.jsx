
// OtpVerifyPage.jsx
import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StarsBackground from "../ShootingStar/StarBackground.jsx";
import axios from "axios";
import "./login.css"


export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;
  //test

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup/verify-otp", { email, otp: otp.join("") });
      if (res.data.success) {
        navigate("/Login"); // redirect after success
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/signup/resend-otp", { email });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-600 flex items-center justify-center relative overflow-hidden">
      <StarsBackground />
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl border border-white/20 relative z-10 mx-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Verify OTP</h2>
        <p className="text-gray-300 mb-6">Enter the 6-digit code sent to <span className="text-purple-300">{email}</span></p>

        {/* OTP Inputs */}
        <div className="flex justify-between pad mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-12 h-14 text-center text-xl font-bold rounded-lg bg-white/10 text-white border border-white/20 focus:ring-2 focus:ring-purple-400 outline-none"
            />
          ))}
        </div>

        {error && <p className="text-red-300 mb-4">{error}</p>}

        <button
          onClick={handleVerify}
          disabled={loading}
          className=" h-12 w-100 pad m-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg mb-4"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          onClick={handleResend}
          disabled={resendLoading}
          className="text-purple-300 hover:text-purple-200 transition-colors"
        >
          {resendLoading ? "Resending..." : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}

