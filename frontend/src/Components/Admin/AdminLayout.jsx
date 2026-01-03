import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white">

      {/* ---------------- Sidebar ---------------- */}
      <div className="w-64 bg-slate-800 p-6 flex flex-col border-r border-slate-700">
        <h2 className="text-2xl font-bold mb-10">Admin Panel</h2>

        <nav className="flex flex-col gap-4">
          <Link className="hover:text-purple-400" to="/admin/dashboard">
            📊 Dashboard
          </Link>

          <Link className="hover:text-purple-400" to="/admin/users">
            👥 Users
          </Link>

          <Link className="hover:text-purple-400" to="/admin/requests">
            📝 Therapist Requests
          </Link>

          <Link className="hover:text-purple-400" to="/admin/settings">
            ⚙️ Settings
          </Link>
        </nav>

        <button
          onClick={logout}
          className="mt-auto bg-red-600 hover:bg-red-700 p-2 rounded text-center"
        >
          Logout
        </button>
      </div>

      {/* ---------------- Main Content ---------------- */}
      <div className="flex-1 flex flex-col overflow-auto">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-800">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </div>

    </div>
  );
}
