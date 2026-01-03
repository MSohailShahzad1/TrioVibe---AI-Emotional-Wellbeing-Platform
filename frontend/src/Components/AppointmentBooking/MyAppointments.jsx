

// import React, { useEffect, useState } from "react";
// import { appointmentAPI } from "../../services/api.js"; 
// import { FaStar } from "react-icons/fa";

// export default function MyAppointments() {
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchAppointments = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const res = await appointmentAPI.getMyAppointments();
//         setAppointments(res.appointments || []);
//       } catch (err) {
//         console.error("Failed to fetch appointments:", err);
//         setError("Failed to load appointments.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAppointments();
//   }, []);

//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center text-white text-xl">
//         Loading your appointments...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="h-screen flex items-center justify-center text-red-400 text-xl">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-900 p-6 text-white">
//       <h1 className="text-3xl font-bold mb-6 text-center">My Appointments</h1>

//       {appointments.length === 0 ? (
//         <p className="text-gray-400 text-center text-lg mt-12">
//           You have no appointments yet.
//         </p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {appointments.map((appt) => (
//             <div
//               key={appt._id}
//               className="bg-blue-900/30 border border-white/20 backdrop-blur-xl p-6 rounded-3xl shadow-lg flex flex-col gap-4 transition hover:scale-[1.02]"
//             >
//               {/* Therapist Info */}
//               <div className="flex items-center gap-4">
//                 <div className="text-5xl">{appt.therapist?.profile?.avatar || "👤"}</div>
//                 <div>
//                   <h2 className="text-xl font-semibold">
//                     {appt.therapist?.profile?.fullName || appt.therapist?.name}
//                   </h2>
//                   <p className="text-gray-300 text-sm">
//                     {appt.therapist?.therapyPreferences?.supportType || "Therapist"}
//                   </p>
//                 </div>
//               </div>

//               {/* Appointment Date */}
//               <p className="text-gray-200 font-medium">
//                 📅 {new Date(appt.date).toLocaleString()}
//               </p>

//               {/* Status */}
//               <p
//                 className={`font-semibold ${
//                   appt.status === "pending"
//                     ? "text-yellow-400"
//                     : appt.status === "approved"
//                     ? "text-blue-400"
//                     : "text-green-400"
//                 }`}
//               >
//                 Status: {appt.status}
//               </p>

//               {/* Review if exists */}
//               {appt.reviewed && (
//                 <div className="bg-white/5 p-3 rounded-xl border border-white/10">
//                   <div className="flex items-center text-yellow-400 mb-1">
//                     {Array.from({ length: appt.rating }).map((_, i) => (
//                       <FaStar key={i} />
//                     ))}
//                   </div>
//                   <p className="text-gray-300 text-sm">{appt.review}</p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { appointmentAPI } from "../../services/api.js";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await appointmentAPI.getMyAppointments();
        setAppointments(res.appointments || []);
        setFiltered(res.appointments || []);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        setError("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // 🔍 Handle search + filter
  useEffect(() => {
    let list = [...appointments];

    // Filter by search (therapist name)
    if (search.trim() !== "") {
      list = list.filter((appt) =>
        (appt.therapist?.profile?.fullName || appt.therapist?.name)
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      list = list.filter((appt) => appt.status === statusFilter);
    }

    setFiltered(list);
  }, [search, statusFilter, appointments]);

  if (loading)
    return (
      <div className="min-h-full flex items-center justify-center text-white text-xl py-6">
        Loading your appointments...
      </div>
    );

  if (error)
    return (
      <div className="min-h-full flex items-center justify-center text-red-400 text-xl py-6">
        {error}
      </div>
    );

  return (
    <div className="min-h-full bg-slate-900 p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">My Appointments</h1>

      {/* 🔍 Search + Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">

        {/* Search */}
        <input
          type="text"
          placeholder="Search therapist..."
          className="w-full md:w-1/2 p-3 rounded-2xl bg-blue-900/30 border border-white/20 text-white placeholder-gray-300 backdrop-blur-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Status filter */}
        <select
          className="p-3 rounded-2xl bg-blue-900/30 border border-white/20 text-white backdrop-blur-xl"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center text-lg mt-12">
          No appointments found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((appt) => (
            <div
              key={appt._id}
              className="bg-blue-900/30 border border-white/20 backdrop-blur-xl p-6 rounded-3xl shadow-lg flex flex-col gap-4 transition hover:scale-[1.02]"
            >
              {/* Therapist Info */}
              <div className="flex items-center gap-4">
                <div className="text-5xl">
                  {appt.therapist?.profile?.avatar || "👤"}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {appt.therapist?.profile?.fullName || appt.therapist?.name}
                  </h2>
                  <p className="text-gray-300 text-sm">
                    {appt.therapist?.therapyPreferences?.supportType || "Therapist"}
                  </p>
                </div>
              </div>

              {/* Appointment Date */}
              <p className="text-gray-200 font-medium">
                📅 {new Date(appt.date).toLocaleString()}
              </p>

              {/* Status */}
              <p
                className={`font-semibold ${
                  appt.status === "pending"
                    ? "text-yellow-400"
                    : appt.status === "approved"
                    ? "text-blue-400"
                    : "text-green-400"
                }`}
              >
                Status: {appt.status}
              </p>

              {/* Review Card */}
              {appt.reviewed && (
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="flex items-center text-yellow-400 mb-1">
                    {Array.from({ length: appt.rating }).map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm">{appt.review}</p>
                </div>
              )}

              {/* ⭐ Review Button (Only if completed & not reviewed) */}
              {appt.status === "completed" && !appt.reviewed && (
                <button
                  onClick={() => navigate(`/review/${appt._id}`)}
                  className="mt-2 bg-gradient-to-r from-blue-500 to-purple-600 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition"
                >
                  Leave a Review ⭐
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
