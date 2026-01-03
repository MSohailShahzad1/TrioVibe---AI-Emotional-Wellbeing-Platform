


import { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaGoogle, FaGithub } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import StarsBackground from "../ShootingStar/StarBackground.jsx";
import { toast } from "react-toastify";
import { useUser } from "../../Context/UserContext.jsx"; // ✅ import context
import ThemeToggle from "../common/ThemeToggle";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, fetchUserData } = useUser(); // ✅ use context

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);

      if (res.data.success) {
        const token = res.data.token;
        const userData = res.data.userData;

        // ✅ Save token + user
        login(userData, token);

        // ✅ Remember email
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        }

        // ✅ Fetch fresh profile from backend (in case user updated bio, name, etc.)
        // await fetchUserData();

        toast.success("Welcome Back!", { theme: "colored" });
        navigate("/Home");
      } else {
        toast.error(res.data.message || "Login failed", { theme: "colored" });
      }
    } catch (err) {
      toast.error("Login failed. Try again.", { theme: "colored" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="auth-card glass-panel">
        <div className="text-center mb-10 auth-header">
          <h2 className="gradient-text">Welcome Back</h2>
          <p className="text-gray-400 font-medium">Elevate your emotional wellbeing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="auth-input-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="auth-input"
            />
            <FaUser className="auth-icon" />
          </div>

          <div className="auth-input-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              minLength="6"
              className="auth-input"
            />
            <FaLock className="auth-icon" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded border-gray-700 bg-white/5 text-cyan-500 focus:ring-cyan-500/20"
              />
              <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
            </label>
            <Link to="/forgot-password" size="sm" className="auth-footer-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-btn"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Signing In...
              </span>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className="auth-divider">or explore more</div>

        <div className="space-y-4">
          <p className="text-center text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link to="/Signup" className="auth-footer-link">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
