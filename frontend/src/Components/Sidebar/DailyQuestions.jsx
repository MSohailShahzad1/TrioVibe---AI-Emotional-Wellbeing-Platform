
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../Context/UserContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

// Constants
const API_BASE_URL = "http://localhost:5000/api/therapy";

const DailyQuestions = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Helper functions
  const getUserFromStorage = () => {
    try {
      const storedProfile = localStorage.getItem("userProfile");
      return storedProfile ? JSON.parse(storedProfile) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  };

  const fetchSession = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    try {
      const localUser = getUserFromStorage();

      if (!localUser?._id) {
        toast.error("❌ No valid user found");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/session/${localUser._id}`);
      setSession(response.data.session);
      console.log("Session data:", response.data.session); // Debug log
    } catch (error) {
      console.error("Fetch session error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateCountdown = () => {
    // Set unlock time to next midnight
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);

    const diff = nextMidnight - now;

    if (diff <= 0) {
      return "Unlocked! Refresh the page";
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  // Effects
  useEffect(() => {
    fetchSession();
  }, [user]);

  useEffect(() => {
    if (session?.locked) {
      console.log("Session is locked, starting countdown"); // Debug log
      const updateCountdown = () => {
        setCountdown(calculateCountdown());
      };

      updateCountdown();
      const timer = setInterval(updateCountdown, 1000);

      return () => clearInterval(timer);
    }
  }, [session?.locked]);

  // Event handlers
  const handleAnswerChange = (index, value) => {
    setAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = value;
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    if (!user?._id || !session?.questions || submitting) return;

    setSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/answer`, {
        userId: user._id,
        answers: session.questions.map((question, index) => ({
          question,
          answer: answers[index] || "",
        })),
      });

      toast.success("✅ Answers submitted successfully!");

      // Force refresh the session data to get updated locked status
      await fetchSession();
      setAnswers([]);

      // Wait a moment for state to update, then check if we should redirect
      setTimeout(() => {
        // Only redirect if session is still not locked (shouldn't happen, but safety check)
        if (!session?.locked) {
          navigate("/Home");
        }
      }, 2000);

    } catch (error) {
      console.error("Submit answers error:", error.message);
      toast.error("❌ Failed to submit answers. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Derived values
  const progress = session
    ? Math.round((session.currentDay / session.duration) * 100)
    : 0;

  const hasValidAnswers = answers.some(answer => answer?.trim());

  // Debug: Log session state
  useEffect(() => {
    console.log("Current session state:", {
      session,
      locked: session?.locked,
      hasSession: !!session
    });
  }, [session]);

  // Render states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading your daily questions...</p>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">No active therapy session found.</p>
          <button
            onClick={() => navigate("/Home")}
            className="px-6 py-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  // Show locked state (already submitted today) - THIS SHOULD SHOW AFTER SUBMISSION
  if (session.locked) {
    console.log("Rendering locked state"); // Debug log
    return (
      <div className="min-h-full w-full flex flex-col animate-fade-in-up">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text tracking-tight uppercase">
            Reflection Sync
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
            Daily emotional synchronization complete.
          </p>
        </div>

        <div className="glass-panel p-12 mb-12 relative overflow-hidden flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">
            Insights Archived
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-12">
            Your responses have been securely analyzed and integrated into your recovery journey.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-inner mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Neural Reset In</h3>
            <div className="text-3xl font-mono font-black text-cyan-400 tracking-tighter">
              {countdown}
            </div>
          </div>

          <button
            onClick={() => navigate("/Home")}
            className="auth-btn !w-64"
          >
            Return to Hub
          </button>
        </div>
      </div>
    );
  }

  // Show questions form (only if NOT locked)
  console.log("Rendering questions form"); // Debug log
  return (
    <div className="min-h-full w-full flex flex-col animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text tracking-tight uppercase">
          Daily Sync
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
          Quantifying your emotional state for advanced therapy tracking.
        </p>
      </div>

      <div className="glass-panel p-8 md:p-12 mb-12 relative overflow-hidden">
        {/* Progress Section */}
        <div className="mb-12 space-y-3">
          <div className="flex justify-between items-end">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              Cycle Progress: Day {session.currentDay} / {session.duration}
            </h2>
            <span className="text-cyan-400 font-black text-xl">{progress}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 p-0.5 border border-white/5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-12 mb-12">
          {session.questions?.length > 0 ? (
            session.questions.map((question, index) => (
              <div key={`question-${index}`} className="group space-y-4">
                <div className="flex gap-4 items-start">
                  <span className="p-3 rounded-xl bg-white/5 border border-white/5 text-cyan-400 font-black text-sm">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors pt-2">
                    {question}
                  </h3>
                </div>
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                  <textarea
                    rows={4}
                    className="relative w-full p-6 rounded-2xl bg-white/5 text-white border border-white/10 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] resize-none placeholder-gray-600 transition-all text-lg shadow-inner"
                    value={answers[index] || ""}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder="Capture your thoughts..."
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">⚠️ No neural queries available for today</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={handleSubmit}
            disabled={!hasValidAnswers || submitting}
            className="auth-btn !py-5 !text-lg"
          >
            {submitting ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Securing Data...</span>
              </div>
            ) : (
              "Commit Responses"
            )}
          </button>
          <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">End-to-End Encrypted Reflection</p>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default DailyQuestions;