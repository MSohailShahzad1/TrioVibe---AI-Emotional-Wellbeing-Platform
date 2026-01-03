

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../Context/UserContext";

const PastAnswers = () => {
  const { user } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState(null);

  useEffect(() => {
    if (!user?._id) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/therapy/history/${user._id}`
        );
        setSessions(res.data.sessions || []);
      } catch (err) {
        console.error("❌ Fetch history error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const toggleSession = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  if (loading) {
    return (
      <div className="min-h-full w-full flex flex-col items-center justify-center p-24">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Retrieving Analytics</p>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="min-h-full w-full flex flex-col items-center justify-center p-12">
        <div className="glass-panel p-16 text-center max-w-lg w-full">
          <span className="text-7xl mb-8 block opacity-10">📖</span>
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Journal Empty</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-0">Your neural history will be archived here once you initiate your first therapy synchronization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full flex flex-col animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text tracking-tight uppercase">
          Therapy Journal
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
          Reviewing your evolution across past recovery cycles.
        </p>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <div className="glass-panel p-0 mb-12 relative overflow-hidden flex flex-col">
          {/* Header Stats */}
          <div className="p-8 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">History Log</h2>
                <p className="text-xs text-gray-600 font-bold">Encrypted Archive</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black gradient-text">{sessions.length}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cycles Archived</div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-6">
              {sessions.map((session, index) => (
                <div
                  key={session._id}
                  className={`group border border-white/5 transition-all duration-500 ${expandedSession === session._id ? 'bg-white/[0.03] border-cyan-500/20' : 'hover:bg-white/[0.02]'
                    }`}
                >
                  {/* Session Header */}
                  <button
                    onClick={() => toggleSession(session._id)}
                    className="w-full p-8 text-left flex items-center justify-between transition-colors outline-none"
                  >
                    <div className="flex items-center space-x-6">
                      <div className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 ${expandedSession === session._id ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'bg-white/5 text-gray-400 group-hover:text-white'
                        }`}>
                        <span className="font-black text-xl">#{sessions.length - index}</span>
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold transition-colors ${expandedSession === session._id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                          Session {sessions.length - index}
                        </h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                          {new Date(session.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-8">
                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-600">Points</div>
                        <div className="font-black text-cyan-400">
                          {session.answers?.length || 0}
                        </div>
                      </div>
                      <div className={`p-2 rounded-lg bg-white/5 border border-white/5 transition-transform duration-500 ${expandedSession === session._id ? 'rotate-180 bg-cyan-500/10 border-cyan-500/20' : ''
                        }`}>
                        <svg className={`w-5 h-5 transition-colors ${expandedSession === session._id ? 'text-cyan-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Expandable Content */}
                  {expandedSession === session._id && (
                    <div className="px-8 pb-8 space-y-4 animate-fade-in">
                      {!session.answers?.length ? (
                        <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No records available for this cycle</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {session.answers.map((entry, entryIndex) => (
                            <div
                              key={entryIndex}
                              className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group/item"
                            >
                              <div className="flex items-start space-x-6">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-gray-500 group-hover/item:text-cyan-400 group-hover/item:border-cyan-500/20 transition-colors">
                                  {String(entryIndex + 1).padStart(2, '0')}
                                </div>
                                <div className="flex-1 min-w-0 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                                      Day {entry.day}
                                    </div>
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                      {new Date(entry.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <h4 className="text-lg font-bold text-white leading-tight">
                                    {entry.question}
                                  </h4>
                                  <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                                    <p className="text-gray-400 leading-relaxed text-base italic">
                                      "{entry.answer || "No response recorded"}"
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10   text-center">
            <p className="text-sm text-gray-400">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded in your therapy journey
            </p>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.4);
        }
      `}</style>
    </div>
  );
};

export default PastAnswers;
