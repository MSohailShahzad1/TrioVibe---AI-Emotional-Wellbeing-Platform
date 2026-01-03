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
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <form
        onSubmit={handleLogin}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-[350px] border border-white/20"
      >
        <h2 className="text-3xl text-white font-semibold mb-6 text-center">
          Admin Login
        </h2>

        <label className="text-white mb-1 block">Email</label>
        <input
          type="email"
          className="mb-4 p-2 w-full rounded bg-white/20 text-white focus:outline-none"
          placeholder="admin@system.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="text-white mb-1 block">Password</label>
        <input
          type="password"
          className="mb-4 p-2 w-full rounded bg-white/20 text-white focus:outline-none"
          placeholder="admin123"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg mt-2 transition-all"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
