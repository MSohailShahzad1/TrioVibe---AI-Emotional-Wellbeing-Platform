import express from "express";
import crypto from "crypto";

const roomRouter = express.Router();

// In-memory room storage (can replace with Redis or Mongo later)
const activeRooms = new Map();

// Helper to generate random ID
function generateRoomId() {
  return crypto.randomBytes(6).toString("hex"); // e.g., "a3f9d0b2a1c4"
}

// ✅ Create a new room
roomRouter.post("/create", (req, res) => {
  const roomId = generateRoomId();
  const secret = crypto.randomBytes(16).toString("hex");
  const expiry = Date.now() + 60 * 60 * 1000; // 1 hour

  activeRooms.set(roomId, { secret, expiry });
  console.log(`🆕 Room created: ${roomId}, expires in 1 hour`);

  // Auto-delete after expiry
  setTimeout(() => {
    activeRooms.delete(roomId);
    console.log(`🗑️ Room ${roomId} expired and deleted`);
  }, 60 * 60 * 1000);

  res.json({
    roomId,
    secret,
    expiresAt: new Date(expiry),
  });
});

// ✅ Validate room before joining
roomRouter.get("/:roomId/validate", (req, res) => {
  const { roomId } = req.params;
  const room = activeRooms.get(roomId);

  if (!room) {
    return res.status(404).json({ valid: false, message: "Room not found or expired" });
  }

  if (Date.now() > room.expiry) {
    activeRooms.delete(roomId);
    return res.status(410).json({ valid: false, message: "Room expired" });
  }

  res.json({ valid: true, message: "Room is valid", expiresAt: new Date(room.expiry) });
});

export default roomRouter;
