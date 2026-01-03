
import React, { useState } from "react";
import { Copy } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigation

export default function RoomManager() {
  const [roomInfo, setRoomInfo] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate(); // ✅ Initialize navigate hook

  // ✅ Create new room
  const createRoom = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setRoomInfo(data);
      setValidationResult(null);
    } catch (error) {
      console.error("Error creating room:", error);
    }
    setLoading(false);
  };

  // ✅ Validate room
  const validateRoom = async () => {
    if (!roomId.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/room/${roomId}/validate`);
      const data = await res.json();
      setValidationResult(data);
    } catch (error) {
      console.error("Error validating room:", error);
    }
    setLoading(false);
  };

  // ✅ Copy Room ID
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ✅ Go to Lobby
  const goToLobby = () => {
    // Pass room info if available
    navigate("/lobby", { state: { roomInfo, roomId } });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 animate-fade-in-up">
      <div className="w-full max-w-md glass-panel p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center gradient-text">
          🎥 TrioVibe Room Manager
        </h1>

        {/* Create Room Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-center text-bright">Create a Room</h2>
          <button
            onClick={createRoom}
            className="w-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-5 py-2 rounded-xl transition shadow-lg active:scale-95 disabled:opacity-50 h-10"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create New Room"}
          </button>

          {roomInfo && (
            <div className="mt-4 bg-white/5 p-4 rounded-xl text-sm space-y-3 border border-white/10">
              {/* Room ID row */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-dim">Room ID:</span>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-mono font-bold">{roomInfo.roomId}</span>
                  <button
                    onClick={() => copyToClipboard(roomInfo.roomId)}
                    className="p-1 hover:bg-white/10 rounded-md transition"
                    title="Copy Room ID"
                  >
                    <Copy size={16} />
                  </button>
                  {copied && <span className="text-xs text-green-400">Copied!</span>}
                </div>
              </div>

              {/* Secret row */}
              {/* <div className="flex justify-between border-t border-gray-600 pt-2">
                <span className="font-medium">Secret:</span>
                <span className="text-gray-300 break-all">{roomInfo.secret}</span>
              </div> */}

              {/* Expiry row */}
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="font-medium text-dim">Expires At:</span>
                <span className="text-auto">
                  {new Date(roomInfo.expiresAt).toLocaleString()}
                </span>
              </div>

              {/* ✅ Go to Lobby Button */}
              <button
                onClick={goToLobby}
                className="w-full mt-3 h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl transition shadow-lg active:scale-95"
              >
                Go to Lobby 🚀
              </button>
            </div>
          )}
        </section>

        <div className="border-t border-white/10"></div>

        {/* Validate Room Section */}
        <section className="space-y-3 text-center">
          <h2 className="text-lg font-semibold text-bright">Join Room</h2>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            className="w-full px-3 h-10 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 mb-2 text-bright placeholder-gray-500"
          />
          <button
            onClick={validateRoom}
            className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl transition shadow-lg active:scale-95 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Checking..." : "Validate Room"}
          </button>

          {validationResult && (
            <div
              className={`mt-4 p-3 rounded-xl text-sm ${validationResult.valid ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-red-500/20 border border-red-500/40"
                }`}
            >
              <p>{validationResult.message}</p>
              {validationResult.expiresAt && (
                <p className="mt-1 text-gray-200 text-xs">
                  Expires at: {new Date(validationResult.expiresAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* ✅ Go to Lobby Button after validation */}
          {validationResult?.valid && (
            <button
              onClick={goToLobby}
              className="w-full mt-3 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-5 py-2 rounded-xl transition shadow-lg active:scale-95"
            >
              Join Lobby 🚪
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
