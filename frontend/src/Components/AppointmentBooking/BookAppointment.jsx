import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function BookAppointment() {
  const { id: therapistId } = useParams();
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleBook = async () => {
    if (!date) return setError("Please select a date & time");
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      await axios.post(
        "http://localhost:5000/api/appointment/book",
        { therapistId, date },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/appointments");
    } catch (err) {
      console.error("Booking failed:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-slate-900 text-white p-4 py-6">
      <div className="bg-blue-900/30 border border-white/20 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Book Appointment</h1>

        {error && <p className="text-red-400 mb-3 text-center">{error}</p>}

        <label className="block text-gray-300 mb-2">Select Date & Time</label>
        <input
          type="datetime-local"
          className="w-full p-3 rounded-xl bg-blue-900/20 text-white border border-white/20 focus:ring-2 focus:ring-blue-500"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          onClick={handleBook}
          disabled={loading}
          className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-2xl font-semibold hover:opacity-90 transition-all flex justify-center items-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Confirm Booking"
          )}
        </button>
      </div>
    </div>
  );
}
