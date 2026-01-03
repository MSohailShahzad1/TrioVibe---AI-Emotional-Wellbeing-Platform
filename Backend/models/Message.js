// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  attachments: [{
    url: String,
    type: String,
    filename: String
  }],
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  isEdited: { type: Boolean, default: false },
  editedAt: Date,
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: String,
    reactedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);
export default Message;