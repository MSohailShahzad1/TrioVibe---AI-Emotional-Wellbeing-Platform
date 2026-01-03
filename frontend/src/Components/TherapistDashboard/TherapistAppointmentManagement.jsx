
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";

export default function TherapistAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // holds appointmentId for loading state

  // Fetch therapist appointments
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/appointment/therapist",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Fetch therapist appointments failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleApprove = async (appointmentId) => {
    try {
      setActionLoading(appointmentId);
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/appointment/approve/${appointmentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments();
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      setActionLoading(appointmentId);
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/appointment/complete/${appointmentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments();
    } catch (err) {
      console.error("Complete failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading)
    return (
      <p className="text-white text-center mt-10 text-xl">
        Loading appointments...
      </p>
    );

  return (
    <div className="p-6 min-h-screen bg-slate-900 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">My Appointments</h1>

      {appointments.length === 0 ? (
        <p className="text-gray-400 text-center">No appointments found.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((appt) => (
            <li
              key={appt._id}
              className="bg-blue-900/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg flex flex-col justify-between"
            >
              <div className="mb-4">
                <p className="text-lg font-semibold">
                  <span className="text-gray-300">User:</span>{" "}
                  {appt.user?.name || appt.user?.username}
                </p>
                <p className="text-gray-300 mt-1">
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date(appt.date).toLocaleString()}
                </p>
                <p className="text-gray-300 mt-1">
                  <span className="font-semibold">Status:</span> {appt.status}
                </p>

                {/* Display review & rating for completed appointments */}
                {appt.status === "completed" && appt.reviewed && (
                  <div className="mt-3 bg-white/10 p-3 rounded-xl border border-white/20">
                    <p className="text-gray-300 font-medium">Review:</p>
                    <p className="text-white mt-1">{appt.review}</p>
                    <div className="flex items-center mt-2">
                      {[...Array(5)].map((_, idx) => (
                        <FaStar
                          key={idx}
                          className={`${
                            idx < appt.rating ? "text-yellow-400" : "text-gray-500"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {appt.status === "pending" && (
                  <button
                    onClick={() => handleApprove(appt._id)}
                    disabled={actionLoading === appt._id}
                    className="bg-gradient-to-r from-green-400 to-green-600 hover:opacity-90 px-4 py-2 rounded-xl font-semibold transition-all flex-1 text-center"
                  >
                    {actionLoading === appt._id ? "..." : "Approve"}
                  </button>
                )}
                {appt.status === "approved" && (
                  <button
                    onClick={() => handleComplete(appt._id)}
                    disabled={actionLoading === appt._id}
                    className="bg-gradient-to-r from-purple-400 to-purple-600 hover:opacity-90 px-4 py-2 rounded-xl font-semibold transition-all flex-1 text-center"
                  >
                    {actionLoading === appt._id ? "..." : "Complete"}
                  </button>
                )}
                {appt.status === "completed" && !appt.reviewed && (
                  <span className="text-gray-400 font-semibold px-4 py-2 rounded-xl border border-gray-400 text-center flex-1">
                    Completed (No Review)
                  </span>
                )}
                {appt.status === "completed" && appt.reviewed && (
                  <span className="text-green-400 font-semibold px-4 py-2 rounded-xl border border-green-400 text-center flex-1">
                    Reviewed
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
