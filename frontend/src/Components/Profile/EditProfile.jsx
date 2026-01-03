
import React, { useState, useContext } from "react";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext.jsx";

const EditProfile = () => {
  const { user, setUser } = useUser();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    // email: user?.email || "",
    bio: user?.bio||"",
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
        bio:formData.bio,
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
          bio:formData.bio
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
    <div className="min-h-full w-full bg-gradient-to-tr from-[#0d1b2a] via-[#1b263b] to-[#415a77] flex justify-center items-center p-6 py-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg w-full max-w-lg p-8 text-white">
        <h2 className="text-2xl font-bold text-center mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <img
              src={formData.avatar}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full border-4 border-indigo-500 shadow-md mb-3 object-cover"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="text-sm text-gray-300"
            />
          </div>

          {/* Name */}
          <input
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={changeHandler}
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          {/* Email */}
          <input
            name="bio"
            autoComplete="bio"
            value={formData.bio}
            onChange={changeHandler}
            type="string"
            placeholder="Bio"
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          {/* Password */}
          <input
            name="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={changeHandler}
            type="password"
            placeholder="New Password (optional)"
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Buttons */}
          <div className="flex gap-4 justify-between">
            <button
              type="button"
              onClick={() => navigate("/Profile")}
              className="w-1/2 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;