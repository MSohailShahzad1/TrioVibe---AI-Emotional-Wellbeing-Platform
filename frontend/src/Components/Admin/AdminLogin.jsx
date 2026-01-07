import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", {
        email,
        password,
      });

      // Save token
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminData", JSON.stringify(res.data.admin));

      toast.success("Admin Login Successful!");

      navigate("/admin/dashboard"); // redirect
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#050810] z-[1000]">
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />

      <form
        onSubmit={handleLogin}
        className="glass-panel p-10 w-full max-w-[420px] animate-fade-in-up relative z-10 border-white/10 mx-4"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-cyan-500/20">
            ⚡
          </div>
          <h2 className="text-3xl font-black text-bright tracking-tighter uppercase">
            Nexus Admin
          </h2>
          <p className="text-dim text-[10px] font-black uppercase tracking-[0.3em] mt-2">Authorization Required</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-dim uppercase tracking-widest mb-2 block px-1">Access Identity</label>
            <input
              type="email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-bright focus:ring-2 focus:ring-cyan-500/40 outline-none transition-all placeholder:text-dim/30 font-bold"
              placeholder="admin@triovibe.sys"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-dim uppercase tracking-widest mb-2 block px-1">Security Cipher</label>
            <input
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-bright focus:ring-2 focus:ring-cyan-500/40 outline-none transition-all placeholder:text-dim/30 font-bold"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl mt-4 transition-all active:scale-95 shadow-xl shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? "Decrypting..." : "Initialize Session"}
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-dim font-bold uppercase tracking-widest">Master Control Panel v1.0.4</p>
        </div>
      </form>
    </div>
  );
}
