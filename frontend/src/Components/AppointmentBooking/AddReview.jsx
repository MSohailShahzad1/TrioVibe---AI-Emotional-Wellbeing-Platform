import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function ReviewAppointment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [therapist, setTherapist] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch appointment details (therapist info)
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:5000/api/appointment/details/${appointmentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setTherapist(res.data.therapist);
      } catch (err) {
        console.error("Failed to load details:", err);
      }
    };

    fetchDetails();
  }, [appointmentId]);

  const submitReview = async () => {
    if (rating === 0) return setError("Please give a rating.");
    if (review.trim().length < 5)
      return setError("Review must be at least 5 characters.");

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/appointment/review/${appointmentId}`,
        { rating, review },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      navigate("/appointments");
    } catch (err) {
      console.error("Review failed:", err);
      setError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="bg-blue-900/30 border border-white/20 backdrop-blur-xl p-8 rounded-3xl max-w-lg w-full shadow-lg animate-fadeIn">

        {/* Back Button */}
        <button
          onClick={() => navigate("/appointments")}
          className="mb-4 text-white/70 hover:text-white transition"
        >
          ← Back to My Appointments
        </button>

        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Review Appointment
        </h1>

        {/* Therapist Info */}
        {therapist && (
          <div className="flex items-center gap-4 mb-6 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="text-5xl">
              {therapist.profile?.avatar || "👤"}
            </div>
            <div>
              <p className="text-xl font-semibold">
                {therapist.profile?.fullName || therapist.name}
              </p>
              <p className="text-gray-300 text-sm">
                {therapist.therapyPreferences?.supportType || "Therapist"}
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-400 mb-3 font-medium text-center">{error}</p>
        )}

        {/* Star Rating */}
        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              size={32}
              className="cursor-pointer transition-transform duration-200"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              color={star <= (hover || rating) ? "#facc15" : "#555"}
              style={{
                transform:
                  star <= (hover || rating) ? "scale(1.2)" : "scale(1.0)",
              }}
            />
          ))}
        </div>

        {/* Review Box */}
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your review..."
          className="w-full p-4 rounded-xl bg-blue-900/20 border border-white/20 text-white h-32 resize-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Submit Button */}
        <button
          onClick={submitReview}
          disabled={loading}
          className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-2xl font-semibold hover:opacity-90 transition-all flex justify-center"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Submit Review"
          )}
        </button>
      </div>
    </div>
  );
}
