import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function AdminTherapistRequests() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/therapist/requests");
      setRequests(res.data.requests);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (userId, action) => {
    try {
      await axios.put(`http://localhost:5000/api/therapist/update/${userId}`, { action });

      toast.success(`User ${action}d successfully`);
      fetchRequests();
    } catch (error) {
      toast.error("Error updating request");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black text-bright tracking-tighter uppercase">Specialist Requests</h1>
          <p className="text-dim text-sm font-medium">Clearance required for professional role elevation.</p>
        </div>
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-dim">Total Pending</p>
          <p className="text-xl font-bold text-cyan-500">{requests.length}</p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Identity</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Communication</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim text-right">Clearance Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {requests.map((user) => (
                <tr key={user._id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-lg shadow-inner">
                        👤
                      </div>
                      <span className="font-bold text-bright">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-auto opacity-70">{user.email}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleAction(user._id, "approve")}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(user._id, "reject")}
                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {requests.length === 0 && (
          <div className="p-20 text-center">
            <div className="text-6xl mb-4 opacity-10">📂</div>
            <p className="text-dim font-bold tracking-widest uppercase text-sm">No pending clearance requests</p>
          </div>
        )}
      </div>
    </div>
  );
}
