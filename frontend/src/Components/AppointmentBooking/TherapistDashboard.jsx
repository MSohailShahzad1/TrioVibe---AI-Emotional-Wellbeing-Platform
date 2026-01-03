import { useEffect, useState } from "react";
import axios from "axios";

export default function TherapistDashboard() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get("/api/therapist/appointments");
      setAppointments(res.data.appointments);
    };
    load();
  }, []);

  return (
    <div className="p-8 min-h-screen bg-slate-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Your Appointments</h1>

      {appointments.map((a) => (
        <div
          key={a._id}
          className="bg-white/10 p-6 border border-white/20 rounded-xl mb-4"
        >
          <h2 className="text-xl">
            With: <span className="text-blue-300">{a.user.name}</span>
          </h2>

          <p className="text-gray-300 mt-2">
            {new Date(a.date).toLocaleString()}
          </p>

          <button
            className="mt-3 bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
            onClick={() => axios.put(`/api/appointment/complete/${a._id}`)}
          >
            Mark Completed
          </button>
        </div>
      ))}
    </div>
  );
}
