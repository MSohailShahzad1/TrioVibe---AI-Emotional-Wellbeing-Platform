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
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Therapist Requests</h1>

      <div className="bg-gray-900 p-4 rounded-xl shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="py-3">Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((user) => (
              <tr key={user._id} className="border-b border-gray-700">
                <td className="py-3">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <button
                    onClick={() => handleAction(user._id, "approve")}
                    className="bg-green-600 px-4 py-2 rounded-lg mr-2"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleAction(user._id, "reject")}
                    className="bg-red-600 px-4 py-2 rounded-lg"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {requests.length === 0 && (
          <p className="text-gray-400 text-center py-5">No pending requests</p>
        )}
      </div>
    </div>
  );
}
