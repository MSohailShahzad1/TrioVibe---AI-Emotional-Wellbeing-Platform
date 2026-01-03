
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // ✅ import toastify
import "react-toastify/dist/ReactToastify.css";

const StartTherapy = ({ userId }) => {
  const [duration, setDuration] = useState(7);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      const storedProfile = localStorage.getItem("userProfile");
      const user = storedProfile ? JSON.parse(storedProfile) : null;

      if (!user || !user._id) {
        toast.error("❌ No user found. Please log in again.");
        return;
      }

      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/therapy/start", {
        userId: user._id,
        duration,
      });

      if (res.data.success) {
        toast.success("🎉 Therapy session started!");
        navigate("/daily-question");
      } else {
        toast.warning(res.data.message || "⚠️ Session could not be started.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "❌ Failed to start session.";
      toast.error(errorMessage);
      console.error("❌ Start session error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full w-full flex flex-col animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text tracking-tight">
          Begin Journey
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
          Choose your commitment level for guided AI therapy.
        </p>
      </div>

      <div className="glass-panel p-8 md:p-12 mb-12 relative overflow-hidden flex flex-col items-center">
        <div className="max-w-md w-full space-y-12">
          {/* Duration Selection */}
          <div className="space-y-6">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 block text-center">
              Program Duration
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[7, 14].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`relative p-6 rounded-2xl border transition-all duration-500 group overflow-hidden ${duration === d
                    ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                >
                  <div className={`absolute top-0 right-0 w-16 h-16 blur-2xl -mr-8 -mt-8 transition-opacity duration-500 ${duration === d ? 'bg-cyan-500/20 opacity-100' : 'bg-transparent opacity-0'}`} />
                  <span className={`text-2xl font-black block mb-1 transition-colors ${duration === d ? "text-cyan-400" : "text-gray-400 group-hover:text-white"}`}>
                    {d} Days
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-gray-600">Standard Cycle</span>
                  {duration === d && (
                    <div className="absolute bottom-2 right-4 text-cyan-400 text-xs">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleStart}
              disabled={loading}
              className="auth-btn !py-5"
            >
              {loading ? <div className="flex items-center gap-3 justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />Starting...</div> : "Start New Cycle"}
            </button>
            <p className="text-gray-500 text-[10px] text-center uppercase tracking-widest font-bold">Secure AI Processing • HIPAA Compliant</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartTherapy;

