// routes/chatRoutes.js
import express from 'express';
import {
  startChat,
  getChatRooms,
  getMessages,
  sendMessage,
  markMessagesRead,
  searchUsers,
  searchUsersForChat
} from '../Controllers/chatController.js';
import { protectRoute } from '../middleware/auth.js';

const chatrouter = express.Router();

// All routes require authentication
chatrouter.use(protectRoute);

// Chat room management
chatrouter.post('/start', startChat);
chatrouter.get('/rooms', getChatRooms);

// Messages
chatrouter.get('/:chatRoomId/messages', getMessages);
chatrouter.post('/message', sendMessage);
chatrouter.patch('/:chatRoomId/read', markMessagesRead);

// User search
chatrouter.get('/users/search', searchUsersForChat);

export default chatrouter;