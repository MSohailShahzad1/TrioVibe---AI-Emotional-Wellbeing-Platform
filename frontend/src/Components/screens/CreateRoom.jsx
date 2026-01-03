import { useState } from "react";
import { createRoom } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function CreateRoom() {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    setLoading(true);
    const data = await createRoom();
    setRoomData(data);
    setLoading(false);
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center py-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold mb-8 gradient-text tracking-tight">Create a Secure Video Room</h1>
      {!roomData ? (
        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl text-lg font-bold transition-all shadow-lg active:scale-95"
        >
          {loading ? "Creating..." : "Generate Room"}
        </button>
      ) : (
        <div className="mt-6 p-8 glass-panel w-96 text-center animate-fade-in-up">
          <p className="text-xl font-bold text-bright">✅ Room created!</p>
          <div className="my-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-cyan-400 font-mono text-lg font-bold tracking-wider">{roomData.roomId}</p>
          </div>
          <p className="text-dim text-sm mt-1 font-medium">
            Expires at: {new Date(roomData.expiresAt).toLocaleTimeString()}
          </p>

          <button
            onClick={() => navigate(`/room/${roomData.roomId}`)}
            className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all active:scale-95"
          >
            Join Room Now
          </button>
        </div>
      )}
    </div>
  );
}
