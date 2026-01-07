import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "../../Context/UserContext";
import { FaUserShield } from "react-icons/fa";

const BecomeTherapist = () => {
    const { user, fetchUserData } = useUser();
    const [loading, setLoading] = useState(false);

    const handleRequest = async () => {
        if (!window.confirm("Do you want to submit a request to become a professional therapist? Our admin team will review your profile.")) return;

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/api/therapist/request", {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.data) {
                toast.success("✅ Request submitted successfully! Please wait for admin approval.");
                if (fetchUserData) await fetchUserData();
            }
        } catch (error) {
            console.error("Error requesting upgrade:", error);
            toast.error(error.response?.data?.message || "Failed to submit request");
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== "user") return null;
    if (user?.therapistRequest === "pending") {
        return (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold animate-pulse">
                <FaUserShield className="text-sm" />
                <p>APPROVAL PENDING</p>
            </div>
        );
    }

    return (
        <button
            onClick={handleRequest}
            disabled={loading}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all group w-full"
        >
            <FaUserShield className="text-lg group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider">Upgrade Account</span>
        </button>
    );
};

export default BecomeTherapist;
