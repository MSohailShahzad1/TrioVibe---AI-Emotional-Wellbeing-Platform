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
    <div className="flex h-screen bg-main text-bright overflow-hidden">

      {/* ---------------- Sidebar ---------------- */}
      <div className="w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 p-8 flex flex-col shadow-2xl relative z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl shadow-lg">
            ⚡
          </div>
          <h2 className="text-2xl font-black gradient-text tracking-tighter uppercase">Admin Core</h2>
        </div>

        <nav className="flex flex-col gap-2">
          {[
            { to: "/admin/dashboard", label: "Analytics Hub", icon: "📊" },
            { to: "/admin/users", label: "User Directory", icon: "👥" },
            { to: "/admin/requests", label: "Specialist Requests", icon: "📝" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-dim hover:text-bright font-bold text-sm"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={logout}
          className="mt-auto group flex items-center gap-4 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all font-bold text-sm"
        >
          <span className="text-xl group-hover:rotate-12 transition-transform">🚪</span>
          Terminate Session
        </button>
      </div>

      {/* ---------------- Main Content ---------------- */}
      <div className="flex-1 flex flex-col overflow-auto bg-main/50 relative z-10">

        {/* Header */}
        <header className="px-8 py-6 border-b border-white/5 backdrop-blur-md bg-white/2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-bright">Command Center</h1>
            <p className="text-[10px] text-dim font-black uppercase tracking-[0.2em] mt-0.5">Control Sector Alpha</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-bright">Master Administrator</p>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Nexus Verified</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl">
              ⚙️
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 animate-fade-in-up">{children}</main>
      </div>

    </div>
  );
}
