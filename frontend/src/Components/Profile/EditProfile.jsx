
import React, { useState, useContext } from "react";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext.jsx";

const EditProfile = () => {
  const { user, setUser } = useUser();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    // email: user?.email || "",
    bio: user?.bio || "",
    password: "",
    avatar: user?.avatar || "https://i.pravatar.cc/100",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Prepare the data to send (exclude avatar if it's a data URL)
      const updateData = {
        name: formData.name,
        // email: formData.email,
        bio: formData.bio,
        ...(formData.password && { password: formData.password }) // Only include password if provided
      };

      const res = await fetch("http://localhost:5000/api/auth/updateProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData)
      });

      const data = await res.json();

      if (data.success) {
        // Update user context with new data
        setUser(prevUser => ({
          ...prevUser,
          name: formData.name,
          // email: formData.email
          bio: formData.bio
        }));
        toast.success("Profile updated successfully!");
        navigate("/Profile");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Error while updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full w-full flex justify-center items-center p-6 animate-fade-in-up">
      <div className="glass-panel w-full max-w-lg p-10">
        <h2 className="text-3xl font-extrabold text-center mb-8 gradient-text tracking-tight">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <img
                src={formData.avatar}
                alt="Avatar Preview"
                className="w-28 h-28 rounded-full border-4 border-cyan-500/50 shadow-xl object-cover transition-transform group-hover:scale-105"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <span className="text-xs font-bold text-white">CHANGE</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-dim uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={changeHandler}
                type="text"
                placeholder="Enter your full name"
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-bright 
                           focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-dim uppercase tracking-widest mb-2 ml-1">Bio</label>
              <input
                name="bio"
                autoComplete="bio"
                value={formData.bio}
                onChange={changeHandler}
                type="text"
                placeholder="Tell us about yourself"
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-bright 
                           focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-dim uppercase tracking-widest mb-2 ml-1">New Password (optional)</label>
              <input
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={changeHandler}
                type="password"
                placeholder="Leave blank to keep current"
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-bright 
                           focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={() => navigate("/Profile")}
              className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-bright font-bold 
                         hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 
                         text-white font-bold px-6 py-4 rounded-2xl transition shadow-lg active:scale-95 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;