
// import React from "react";
// import { useNavigate } from "react-router-dom";

// export default function AdminDashboard() {
//   const navigate = useNavigate();
//   const admin = JSON.parse(localStorage.getItem("adminData"));

//   const handleLogout = () => {
//     localStorage.removeItem("adminToken");
//     localStorage.removeItem("adminData");
//     navigate("/admin/login");
//   };

//   return (
//     <div className="h-screen bg-slate-800 text-white p-10 flex flex-col">
//       <div className="flex justify-between items-center mb-10">
//         <h1 className="text-4xl font-bold">Admin Dashboard</h1>

//         <button
//           onClick={handleLogout}
//           className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold transition-all"
//         >
//           Logout
//         </button>
//       </div>

//       <p className="text-xl">Welcome, {admin?.email}</p>
//       <p className="text-lg mt-2">Role: {admin?.role}</p>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    therapists: 0,
    pendingRequests: 0,
  });

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/dashboard-stats", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setStats(res.data);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* Total Users */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow">
        <h2 className="text-xl font-semibold mb-3">Total Users</h2>
        <p className="text-4xl font-bold text-purple-400">{stats.totalUsers}</p>
      </div>

      {/* Therapists */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow">
        <h2 className="text-xl font-semibold mb-3">Therapists</h2>
        <p className="text-4xl font-bold text-green-400">{stats.therapists}</p>
      </div>

      {/* Pending Requests */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow">
        <h2 className="text-xl font-semibold mb-3">Pending Requests</h2>
        <p className="text-4xl font-bold text-yellow-400">
          {stats.pendingRequests}
        </p>
      </div>

    </div>
  );
}
