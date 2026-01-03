import React, { useEffect, useState } from "react";
import axios from "axios";
import EditUserModal from "./EditUserModal";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data.users);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-10 text-white bg-slate-900 h-screen overflow-auto">

      <h1 className="text-3xl font-bold mb-5">User Management</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name or email"
        className="p-2 rounded bg-slate-700 mb-4 w-1/3 outline-none"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Users Table */}
      <table className="w-full bg-slate-800 rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-slate-700 text-left">
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Therapist Request</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id} className="border-b border-slate-600">
              <td className="p-3">{user.name}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3 capitalize">{user.role}</td>

              <td className="p-3">
                {user.therapistRequest ? (
                  <span className="text-yellow-400">Pending</span>
                ) : (
                  <span className="text-gray-400">No Request</span>
                )}
              </td>

              <td className="p-3">
                <button
                  onClick={() => setSelectedUser(user)}
                  className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          closeModal={() => setSelectedUser(null)}
          refresh={fetchUsers}
        />
      )}
    </div>
  );
}
