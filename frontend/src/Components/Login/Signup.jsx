
import { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ThemeToggle from "../common/ThemeToggle";
import { useUser } from "../../Context/UserContext.jsx";
import "./login.css"

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let newErrors = {};

    // Validate name
    if (!formData.name) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    } else if (formData.name.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      toast.error("Please fix the errors in the form", { theme: "colored" });
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...signupData } = formData;

      // Direct signup without OTP
      const response = await axios.post("http://localhost:5000/api/auth/signup", signupData);

      if (response.data.success) {
        const token = response.data.token;
        const userData = response.data.userData;

        // Auto-login after signup
        login(userData, token);

        toast.success("✅ Account created successfully! Welcome!", { theme: "colored" });
        toast.info("💡 Verify your email in your profile to unlock all features", {
          theme: "colored",
          autoClose: 5000
        });

        navigate("/Home");
      } else {
        toast.error(`❌ Signup Failed: ${response.data.message}`, { theme: "colored" });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Server error";
      toast.error(`❌ Signup Failed: ${errorMessage}`, { theme: "colored" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="auth-card glass-panel">
        <div className="text-center mb-10 auth-header">
          <h2 className="gradient-text">Create Account</h2>
          <p className="text-gray-400 font-medium">Join our community of emotional wellness</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="auth-input-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className={`auth-input ${errors.name ? 'border-red-500/50' : ''}`}
            />
            <FaUser className="auth-icon" />
            {errors.name && <p className="text-red-400 text-xs mt-1 absolute">{errors.name}</p>}
          </div>

          <div className="auth-input-group pt-1">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className={`auth-input ${errors.email ? 'border-red-500/50' : ''}`}
            />
            <FaEnvelope className="auth-icon" />
            {errors.email && <p className="text-red-400 text-xs mt-1 absolute">{errors.email}</p>}
          </div>

          <div className="auth-input-group pt-1">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={`auth-input ${errors.password ? 'border-red-500/50' : ''}`}
            />
            <FaLock className="auth-icon" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && <p className="text-red-400 text-xs mt-1 absolute">{errors.password}</p>}
          </div>

          <div className="auth-input-group pt-1">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className={`auth-input ${errors.confirmPassword ? 'border-red-500/50' : ''}`}
            />
            <FaLock className="auth-icon" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 absolute">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-btn mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Creating Account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="auth-divider">or continue with</div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="auth-footer-link">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
