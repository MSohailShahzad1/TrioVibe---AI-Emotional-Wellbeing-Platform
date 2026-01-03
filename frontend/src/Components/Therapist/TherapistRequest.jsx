
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function RequestTherapist() {
  const [status, setStatus] = useState("none");

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.therapistRequest) {
        setStatus(user.therapistRequest);
      }
    } catch (err) {
      console.error("Error parsing user:", err);
    }
  }, []);

  const sendRequest = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/therapist/request",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Request Submitted!");
      setStatus("pending");

      let user = JSON.parse(localStorage.getItem("user")) || {};
      user.therapistRequest = "pending";
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending request");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-lg mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Therapist Upgrade Request</h1>

      {status === "none" && (
        <>
          <p className="text-gray-300 mb-4">
            Upgrade to therapist and unlock special features.
          </p>
          <button
            onClick={sendRequest}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg"
          >
            Request Upgrade
          </button>
        </>
      )}

      {status === "pending" && (
        <p className="text-yellow-400 text-xl">⏳ Your request is under review...</p>
      )}

      {status === "approved" && (
        <p className="text-green-400 text-xl">🎉 You are now a therapist!</p>
      )}

      {status === "rejected" && (
        <p className="text-red-400 text-xl">❌ Your request was rejected.</p>
      )}
    </div>
  );
}
