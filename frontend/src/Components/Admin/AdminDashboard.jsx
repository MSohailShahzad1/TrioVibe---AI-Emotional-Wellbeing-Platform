
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

      {/* Total Users */}
      <div className="glass-panel p-8 relative overflow-hidden group hover:shadow-cyan-500/10 transition-all">
        <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl group-hover:scale-110 transition-transform">👥</div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dim mb-4">Network Population</p>
        <h2 className="text-xl font-bold text-bright mb-2">Total Participants</h2>
        <p className="text-5xl font-black text-cyan-500 tracking-tighter">{stats.totalUsers}</p>
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-xs text-dim italic">Synchronized across all sectors</p>
        </div>
      </div>

      {/* Therapists */}
      <div className="glass-panel p-8 relative overflow-hidden group hover:shadow-emerald-500/10 transition-all">
        <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl group-hover:scale-110 transition-transform">🎓</div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dim mb-4">Verified Specialists</p>
        <h2 className="text-xl font-bold text-bright mb-2">Active Clinicians</h2>
        <p className="text-5xl font-black text-emerald-500 tracking-tighter">{stats.therapists}</p>
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-xs text-dim italic">Certified neural moderators</p>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="glass-panel p-8 relative overflow-hidden group hover:shadow-yellow-500/10 transition-all border-yellow-500/20">
        <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl group-hover:scale-110 transition-transform">📝</div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500/60 mb-4">Action Required</p>
        <h2 className="text-xl font-bold text-bright mb-2">Pending Upgrades</h2>
        <p className="text-5xl font-black text-yellow-500 tracking-tighter">
          {stats.pendingRequests}
        </p>
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-xs text-dim italic">Awaiting clearance confirmation</p>
        </div>
      </div>

    </div>
  );
}
