

import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../Context/SocketProvider";
import { toast } from "react-toastify";

const LobbyScreen = () => {
  const [room, setRoom] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [loadingValidation, setLoadingValidation] = useState(false);

  const { socket, isConnected, emit, on, off } = useSocket();
  const navigate = useNavigate();

  // -----------------------------
  // ✅ Room Validation Function
  // -----------------------------
  const validateRoom = async () => {
    if (!room.trim()) return false;

    setLoadingValidation(true);

    try {
      const res = await fetch(`http://localhost:5000/api/room/${room}/validate`);
      const data = await res.json();

      setLoadingValidation(false);

      if (data?.valid) {
        toast.success("Meeting ID validated!");
        return true;
      } else {
        toast.error("Invalid Meeting ID. Please check and try again.");
        return false;
      }
    } catch (error) {
      console.error("Error validating room:", error);
      toast.error("Server error while validating room.");
      setLoadingValidation(false);
      return false;
    }
  };

  // -----------------------------
  // ✅ Submit: Validate → Join Room
  // -----------------------------
  const handleSubmitForm = useCallback(
    async (e) => {
      e.preventDefault();

      if (!room) {
        toast.error("Please enter a Meeting ID.");
        return;
      }

      // STEP 1: Validate Room
      const isValid = await validateRoom();
      if (!isValid) return; // ❌ Stop if invalid

      // STEP 2: Continue with socket join
      if (isConnected && socket) {
        setIsConnecting(true);
        toast("Joining room...", { icon: "🔗" });
        emit("room:join", { room });
      } else {
        toast.error("You are not connected to the server yet. Try again.");
      }
    },
    [room, isConnected, socket, emit]
  );

  // -----------------------------
  // 🎉 Successful Join Event
  // -----------------------------
  const handleJoinRoom = useCallback(
    (data) => {
      setIsConnecting(false);
      toast.success("Connected to the meeting! 🎉");
      navigate(`/room/${data.room}`);
    },
    [navigate]
  );

  // -----------------------------
  // ❌ Join Error Handler
  // -----------------------------
  const handleJoinError = useCallback((error) => {
    console.error("Room join error:", error);
    setIsConnecting(false);
    toast.error("Failed to join room.");
  }, []);

  // -----------------------------
  // 📡 Setup Socket Listeners
  // -----------------------------
  useEffect(() => {
    if (socket) {
      on("room:join", handleJoinRoom);
      on("error", handleJoinError);

      return () => {
        off("room:join", handleJoinRoom);
        off("error", handleJoinError);
      };
    }
  }, [socket, on, off, handleJoinRoom, handleJoinError]);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-full w-full flex items-center justify-center p-6 py-6 animate-fade-in-up">

      <div className="w-full max-w-md glass-panel p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-bright tracking-wide drop-shadow-md">
            NeuroVibe Connect
          </h1>
          <p className="text-dim mt-2 text-sm font-medium">
            Join your emotional therapy session using a Meeting ID
          </p>

          {/* Connection Status */}
          <div className="mt-5 bg-black/20 px-4 py-3 rounded-xl border border-white/10">
            <div className="flex items-center justify-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
                  }`}
              />
              <span className="text-auto text-sm font-bold">
                {isConnected ? "Connected to Server" : "Trying to Connect..."}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitForm} className="space-y-6">

          {/* Room Input */}
          <div>
            <label className="block text-sm font-bold text-dim mb-2 uppercase tracking-wider">
              Meeting Room ID
            </label>

            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g., BR27-NV01"
              className="w-full px-4 py-3 bg-white/5 text-bright placeholder-gray-500
                border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/40 
                focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Join Button */}
          <button
            type="submit"
            disabled={!isConnected || isConnecting || loadingValidation || !room}
            className="w-full py-3 text-lg font-bold rounded-xl transition 
              bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg
              hover:from-cyan-400 hover:to-blue-500 hover:scale-[1.02] active:scale-95 duration-300
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loadingValidation
              ? "Validating..."
              : isConnecting
                ? "Joining..."
                : "Join Session"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center border-t border-white/10 pt-6">
          <p className="text-dim text-xs font-semibold">
            Secure real-time therapy calls powered by TrioVibe.
          </p>
        </div>

      </div>
    </div>
  );
};

export default LobbyScreen;
