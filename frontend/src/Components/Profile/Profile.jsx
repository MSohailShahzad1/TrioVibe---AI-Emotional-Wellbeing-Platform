
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaHome, FaChartLine, FaCalendar, FaSmile, FaCheckCircle, FaTimesCircle, FaEnvelope } from "react-icons/fa";
import LogoutButton from "../Login/Logout.jsx";
import { useUser } from "../../Context/UserContext.jsx";
import axios from "axios";

const Profile = () => {
  const { user, fetchUserData } = useUser();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    mostFrequentEmotion: "N/A",
    averageConfidence: 0,
    recentActivity: "N/A"
  });

  // Email verification states
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);

  // Fetch user emotion history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/emotion/getResult`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId: user._id })
        });

        const response = await res.json();

        if (response.success && response.data) {
          setHistory(response.data);
          calculateStats(response.data);
        } else {
          toast.info("No emotion history found yet.");
        }
      } catch (error) {
        console.error("Error loading history:", error);
        toast.error("Failed to load emotion history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // Calculate statistics from history
  const calculateStats = (data) => {
    if (!data || data.length === 0) return;

    const totalAnalyses = data.length;

    const emotionCounts = {};
    let totalConfidence = 0;

    data.forEach(record => {
      emotionCounts[record.emotion] = (emotionCounts[record.emotion] || 0) + 1;
      totalConfidence += record.probability || 0;
    });

    const mostFrequentEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    const averageConfidence = (totalConfidence / totalAnalyses) * 100;

    const recentActivity = data[0]?.timestamp
      ? new Date(data[0].timestamp).toLocaleDateString()
      : "N/A";

    setStats({
      totalAnalyses,
      mostFrequentEmotion,
      averageConfidence: averageConfidence.toFixed(1),
      recentActivity
    });
  };

  // Send OTP for email verification
  const handleSendOTP = async () => {
    setSendOtpLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/send-verification-otp", {
        email: user?.email
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.data.success) {
        setOtpSent(true);
        toast.success("✅ OTP sent to your email!");
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    setVerifyLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-email-otp", {
        email: user?.email,
        otp: otpCode
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.data.success) {
        toast.success("✅ Email verified successfully!");
        setShowVerifyModal(false);
        setOtp(["", "", "", "", "", ""]);
        setOtpSent(false);
        // Refresh user data
        if (fetchUserData) {
          await fetchUserData();
        }
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    } finally {
      setVerifyLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // Get emotion emoji
  const getEmotionEmoji = (emotion) => {
    const emojiMap = {
      happy: "😊",
      sad: "😢",
      angry: "😠",
      fear: "😨",
      surprise: "😲",
      disgust: "🤢",
      neutral: "😐"
    };
    return emojiMap[emotion?.toLowerCase()] || "😊";
  };

  // Get source type icon
  const getSourceIcon = (sourceType) => {
    const iconMap = {
      text: "📝",
      voice: "🎤",
      image: "📷",
      video: "🎥"
    };
    return iconMap[sourceType] || "📊";
  };

  return (
    <div className="min-h-screen w-full p-6 animate-fade-in-up">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Profile Header Card */}
        <div className="glass-panel p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user?.avatar || user?.profile?.avatar || "https://i.pravatar.cc/150"}
                alt="profile"
                className="w-32 h-32 rounded-full border-4 border-cyan-500 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full p-2">
                <FaSmile className="text-white text-xl" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="text-3xl font-bold text-bright">
                  {user?.name || user?.profile?.fullName || "Guest User"}
                </h1>
                {user?.isEmailVerified ? (
                  <FaCheckCircle className="text-emerald-400 text-xl" title="Email Verified" />
                ) : (
                  <FaTimesCircle className="text-red-400 text-xl" title="Email Not Verified" />
                )}
              </div>

              <p className="text-dim text-lg mb-2">{user?.email}</p>

              {/* Email Verification Status */}
              {!user?.isEmailVerified && (
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="mb-4 flex items-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-400 font-bold px-4 py-2 rounded-xl transition active:scale-95 mx-auto md:mx-0"
                >
                  <FaEnvelope /> Verify Email
                </button>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <button
                  onClick={() => navigate("/EditProfile")}
                  className="flex items-center gap-2 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-lg active:scale-95"
                >
                  <FaEdit /> Edit Profile
                </button>

                <Link to="/Home">
                  <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-bright font-bold px-5 py-2.5 rounded-xl transition active:scale-95">
                    <FaHome /> Home
                  </button>
                </Link>

                <LogoutButton />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-6 hover:scale-105 transition-all duration-300 border border-white/5 hover:border-cyan-500/20 hover:shadow-[0_0_20px_rgba(34,211,238,0.05)]">
            <div className="flex items-center justify-between mb-2">
              <FaChartLine className="text-cyan-400 text-2xl" />
              <span className="text-3xl font-bold text-bright">{stats.totalAnalyses}</span>
            </div>
            <p className="text-dim text-sm font-semibold uppercase tracking-wider">Total Analyses</p>
          </div>

          <div className="glass-card p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{getEmotionEmoji(stats.mostFrequentEmotion)}</span>
              <span className="text-lg font-bold text-bright capitalize">{stats.mostFrequentEmotion}</span>
            </div>
            <p className="text-dim text-sm font-medium">Most Frequent Emotion</p>
          </div>

          <div className="glass-card p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <FaSmile className="text-emerald-400 text-2xl" />
              <span className="text-3xl font-bold text-bright">{stats.averageConfidence}%</span>
            </div>
            <p className="text-dim text-sm font-medium">Average Confidence</p>
          </div>

          <div className="glass-card p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <FaCalendar className="text-purple-400 text-2xl" />
              <span className="text-sm font-bold text-bright">{stats.recentActivity}</span>
            </div>
            <p className="text-dim text-sm font-medium">Recent Activity</p>
          </div>
        </div>

        {/* Emotion History */}
        <div className="glass-panel p-8">
          <h2 className="text-2xl font-bold text-bright mb-6 flex items-center gap-3">
            <span className="text-3xl">📊</span>
            Emotion Analysis History
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
              <p className="text-dim">Loading your history...</p>
            </div>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="p-4 text-dim font-bold uppercase text-xs tracking-wider">Date & Time</th>
                    <th className="p-4 text-dim font-bold uppercase text-xs tracking-wider">Emotion</th>
                    <th className="p-4 text-dim font-bold uppercase text-xs tracking-wider">Source</th>
                    <th className="p-4 text-dim font-bold uppercase text-xs tracking-wider">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record, index) => (
                    <tr
                      key={index}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 text-auto">
                        {new Date(record.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getEmotionEmoji(record.emotion)}</span>
                          <span className="text-bright font-semibold capitalize">{record.emotion}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getSourceIcon(record.sourceType)}</span>
                          <span className="text-auto capitalize">{record.sourceType}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/10 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${(record.probability * 100).toFixed(0)}%` }}
                            ></div>
                          </div>
                          <span className="text-bright font-bold text-sm">
                            {(record.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-20">📊</div>
              <h3 className="text-xl font-bold text-bright mb-2">No History Yet</h3>
              <p className="text-dim mb-6">Start analyzing your emotions to see your history here!</p>
              <Link to="/MultiModal">
                <button className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg active:scale-95">
                  Start Analysis
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Email Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-md w-full p-8 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-bright mb-2">Verify Your Email</h3>
            <p className="text-dim mb-6">We'll send a 6-digit code to {user?.email}</p>

            {!otpSent ? (
              <button
                onClick={handleSendOTP}
                disabled={sendOtpLoading}
                className="w-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg active:scale-95 disabled:opacity-50"
              >
                {sendOtpLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Sending OTP...
                  </span>
                ) : (
                  "Send Verification Code"
                )}
              </button>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-white/5 border border-white/10 text-bright focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleVerifyOTP}
                    disabled={verifyLoading}
                    className="flex-1 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {verifyLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify"
                    )}
                  </button>

                  <button
                    onClick={handleSendOTP}
                    disabled={sendOtpLoading}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-bright font-bold rounded-xl transition active:scale-95"
                  >
                    Resend
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowVerifyModal(false);
                setOtp(["", "", "", "", "", ""]);
                setOtpSent(false);
              }}
              className="w-full mt-4 text-dim hover:text-bright transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
