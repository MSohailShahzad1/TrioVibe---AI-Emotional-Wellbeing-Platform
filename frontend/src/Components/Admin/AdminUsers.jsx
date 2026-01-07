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
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-black text-bright tracking-tighter uppercase">User Directory</h1>
          <p className="text-dim text-sm font-medium">Full access to the neural participant database.</p>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search Protocol..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-bright focus:ring-2 focus:ring-cyan-500/40 outline-none transition-all placeholder:text-dim font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-40">🔍</span>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Participant</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Access Role</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Upgrade Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim text-right">Operations</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-bright">{user.name}</span>
                      <span className="text-xs text-dim">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                      user.role === 'therapist' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                      }`}>
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    {user.therapistRequest === 'pending' ? (
                      <div className="flex items-center gap-2 text-yellow-500 font-bold text-xs uppercase tracking-wider animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        Awaiting Clearance
                      </div>
                    ) : (
                      <span className="text-dim text-xs font-bold uppercase tracking-widest opacity-30">Standard Access</span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-bright transition-all active:scale-95"
                    >
                      Modify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
