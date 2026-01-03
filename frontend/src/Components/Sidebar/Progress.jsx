import React, { useEffect, useState } from "react";
import axios from "axios";
import BackgroundOrbs from "../ShootingStar/BackgroundOrbs";

const Progress = ({ userId }) => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/therapy/progress/${userId}`);
        if (res.data.success) setSession(res.data.session);
      } catch (err) {
        console.error("Progress error:", err.message);
      }
    };

    fetchProgress();
  }, [userId]);

  if (!session) {
    return (
      <div className="min-h-full w-full flex flex-col items-center justify-center p-12">
        <div className="glass-panel p-12 text-center max-w-md w-full">
          <span className="text-6xl mb-6 block opacity-20 grayscale">📈</span>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">No Active Journey</h2>
          <p className="text-gray-500 text-sm">You haven't initiated a therapy cycle yet. Start your journey from the Therapy hub.</p>
        </div>
      </div>
    );
  }

  const progressPercentage = (session.currentDay / session.duration) * 100;

  return (
    <div className="min-h-full w-full flex flex-col animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text tracking-tight">
          Recovery Progress
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
          Tracking your emotional evolution and commitment to well-being.
        </p>
      </div>

      <div className="glass-panel p-8 md:p-12 mb-12 relative overflow-hidden">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Overall Completion</h2>
                <span className="text-3xl font-black gradient-text">{progressPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-1000"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-600 mb-1">Current Cycle</p>
                <p className="text-2xl font-black text-white">{session.duration} Days</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-600 mb-1">Active Day</p>
                <p className="text-2xl font-black text-cyan-400">{session.currentDay}</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
              <p className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Analytical Insight
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your engagement level is <span className="text-white font-bold">Stable</span>. Consistent daily check-ins accelerate emotional recovery by <span className="text-white font-bold">40%</span>.
              </p>
            </div>
          </div>

          <div className="relative aspect-square max-w-[300px] mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-white/5 animate-pulse" />
            <div className="absolute inset-4 rounded-full border-2 border-cyan-500/10" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl mb-2">💎</span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Journey Status</p>
              <p className="text-lg font-black text-white">{session.isCompleted ? "COMPLETED" : "IN PROGRESS"}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-12 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Engagement Log</h3>
            <p className="text-xs text-gray-600 font-bold">{session.answers.length} Data Points Collected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
