// models/ChatRoom.js
import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
    lastRead: { type: Date, default: Date.now }
  }],
  isGroup: { type: Boolean, default: false },
  groupName: String,
  groupAvatar: String,
  lastMessage: {
    text: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
export default ChatRoom;