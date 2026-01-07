import React, { useState } from 'react';
import { useUser } from '../../Context/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUserMd, FaShieldAlt, FaBriefcase, FaArrowRight } from 'react-icons/fa';

const UpgradeAccount = () => {
    const { user, fetchUserData } = useUser();
    const [loading, setLoading] = useState(false);

    const handleRequest = async () => {
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:5000/api/therapist/request", {
                userId: user._id
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            if (res.data.success) {
                toast.success("Specialist request submitted! Awaiting administrator clearance.");
                fetchUserData();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Request failed");
        } finally {
            setLoading(false);
        }
    };

    const isPending = user?.therapistRequest === 'pending';

    return (
        <div className="min-h-full flex flex-col items-center justify-center p-6 animate-fade-in-up">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-bright tracking-tighter uppercase mb-4">
                        Elite <span className="gradient-text">Specialist</span> Program
                    </h1>
                    <p className="text-dim text-lg max-w-2xl mx-auto">
                        Join our network of neural facilitators and professional therapists to help our community thrive.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-panel p-8 text-center flex flex-col items-center group hover:border-cyan-500/30 transition-all">
                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-3xl text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                            <FaUserMd />
                        </div>
                        <h3 className="text-xl font-bold text-bright mb-3">Clinical Impact</h3>
                        <p className="text-dim text-sm leading-relaxed">Provide data-driven emotional support using our proprietary AI tools.</p>
                    </div>

                    <div className="glass-panel p-8 text-center flex flex-col items-center group hover:border-purple-500/30 transition-all">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-3xl text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                            <FaShieldAlt />
                        </div>
                        <h3 className="text-xl font-bold text-bright mb-3">Verified Status</h3>
                        <p className="text-dim text-sm leading-relaxed">Gain the verified specialist badge and build credibility within the network.</p>
                    </div>

                    <div className="glass-panel p-8 text-center flex flex-col items-center group hover:border-emerald-500/30 transition-all">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-3xl text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                            <FaBriefcase />
                        </div>
                        <h3 className="text-xl font-bold text-bright mb-3">Flexible Practice</h3>
                        <p className="text-dim text-sm leading-relaxed">Manage appointments and interact with patients on your own schedule.</p>
                    </div>
                </div>

                <div className="glass-panel p-1 border-white/5 overflow-hidden">
                    <div className={`p-10 text-center ${isPending ? 'bg-yellow-500/5' : 'bg-white/2'}`}>
                        {isPending ? (
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-500 font-bold text-xs uppercase tracking-widest animate-pulse border border-yellow-500/20">
                                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                                    Application Pending Clearance
                                </div>
                                <h2 className="text-2xl font-bold text-bright">Restricted Access in Effect</h2>
                                <p className="text-dim max-w-md mx-auto">Our security protocols require administrator approval for role elevation. This usually takes 24-48 hours.</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold text-bright">Ready to level up?</h2>
                                    <p className="text-dim">By applying, you agree to our professional code of conduct.</p>
                                </div>

                                <button
                                    onClick={handleRequest}
                                    disabled={loading}
                                    className="inline-flex items-center gap-3 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black px-12 py-5 rounded-2xl transition-all shadow-xl shadow-cyan-500/20 active:scale-95 disabled:opacity-50 group uppercase tracking-widest text-sm"
                                >
                                    {loading ? "Processing..." : "Submit Clearance Request"}
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeAccount;
