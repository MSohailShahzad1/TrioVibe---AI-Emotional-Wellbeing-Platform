import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function EditUserModal({ user, closeModal, refresh }) {
  const [role, setRole] = useState(user.role);
  const token = localStorage.getItem("adminToken");

  const updateUser = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${user._id}`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("User updated successfully!");
      refresh();
      closeModal();
    } catch (err) {
      toast.error("Failed to update user.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-slate-800 p-6 rounded-xl w-[400px]">

        <h2 className="text-xl font-semibold mb-4">Edit User</h2>

        <p className="mb-2 text-gray-300">Name: {user.name}</p>
        <p className="mb-4 text-gray-300">Email: {user.email}</p>

        <label className="block text-gray-200 mb-1">Role</label>
        <select
          className="p-2 w-full bg-slate-700 rounded mb-4"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="basic">Basic</option>
          <option value="therapist">Therapist</option>
        </select>

        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
            onClick={closeModal}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            onClick={updateUser}
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
