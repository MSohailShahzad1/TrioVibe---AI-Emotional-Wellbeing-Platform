// controllers/chatController.js
import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// Start or get chat room
export const startChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.id;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Check if chat room already exists
    let chatRoom = await ChatRoom.findOne({
      isGroup: false,
      participants: {
        $all: [
          { $elemMatch: { user: userId } },
          { $elemMatch: { user: participantId } }
        ]
      }
    })
    .populate('participants.user', 'username name profile fullName avatar isOnline lastSeen')
    .populate('lastMessage.sender', 'username name profile fullName avatar');

    if (!chatRoom) {
      // Verify participant exists
      const participant = await User.findById(participantId);
      if (!participant) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Create new chat room
      chatRoom = new ChatRoom({
        participants: [
          { user: userId },
          { user: participantId }
        ]
      });

      await chatRoom.save();
      await chatRoom.populate('participants.user', 'username name profile fullName avatar isOnline lastSeen');
    }

    res.json({
      success: true,
      chatRoom
    });

  } catch (error) {
    console.error('❌ Start chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's chat rooms
export const getChatRooms = async (req, res) => {
  try {
    const userId = req.user.id;

    const chatRooms = await ChatRoom.find({
      'participants.user': userId
    })
    .populate('participants.user', 'username name profile fullName avatar isOnline lastSeen')
    .populate('lastMessage.sender', 'username name profile fullName avatar')
    .sort({ updatedAt: -1 });

    // Get unread counts for each chat room
    const roomsWithUnread = await Promise.all(
      chatRooms.map(async (room) => {
        const unreadCount = await Message.countDocuments({
          chatRoom: room._id,
          sender: { $ne: userId },
          'readBy.user': { $ne: userId }
        });

        const roomObj = room.toObject();
        return {
          ...roomObj,
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      chatRooms: roomsWithUnread
    });

  } catch (error) {
    console.error('❌ Get chat rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get messages for a chat room
export const getMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is participant of the chat room
    const chatRoom = await ChatRoom.findOne({
      _id: chatRoomId,
      'participants.user': userId
    });

    if (!chatRoom) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat room'
      });
    }

    const messages = await Message.find({ chatRoom: chatRoomId })
      .populate('sender', 'username name profile fullName avatar isOnline')
      .populate('readBy.user', 'username name profile fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Reverse to get chronological order
    messages.reverse();

    res.json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit
      }
    });

  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { chatRoomId, text, messageType = 'text' } = req.body;
    const userId = req.user.id;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    // Verify user is participant of the chat room
    const chatRoom = await ChatRoom.findOne({
      _id: chatRoomId,
      'participants.user': userId
    });

    if (!chatRoom) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat room'
      });
    }

    // Create message
    const message = new Message({
      chatRoom: chatRoomId,
      sender: userId,
      text: text.trim(),
      messageType,
      readBy: [{ user: userId }]
    });

    await message.save();
    await message.populate('sender', 'username profile fullName avatar');
    await message.populate('readBy.user', 'username profile');

    // Update chat room last message
    await ChatRoom.findByIdAndUpdate(chatRoomId, {
      lastMessage: {
        text: message.text,
        sender: userId,
        timestamp: new Date()
      },
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark messages as read
export const markMessagesRead = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const userId = req.user.id;

    // Mark all unread messages as read
    await Message.updateMany(
      {
        chatRoom: chatRoomId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      {
        $push: { readBy: { user: userId } }
      }
    );

    // Update last read timestamp in chat room
    await ChatRoom.findOneAndUpdate(
      { _id: chatRoomId, 'participants.user': userId },
      { $set: { 'participants.$.lastRead': new Date() } }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('❌ Mark messages read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Search users for chatting
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        users: []
      });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: userId } },
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { 'profile.fullName': { $regex: query, $options: 'i' } }
          ]
        },
        { 'privacySettings.profileVisible': true }
      ]
    })
    .select('username name profile fullName avatar isOnline lastSeen')
    .limit(20);

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('❌ Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// controllers/chatController.js - Add this function
// Search users for chatting (moved from userController for better organization)
export const searchUsersForChat = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        users: [],
        message: 'Please enter at least 2 characters to search'
      });
    }

    const searchQuery = query.trim();

    // Search users by name, username, or email
    const users = await User.find({
      _id: { $ne: userId },
      'privacySettings.profileVisible': true,
      'privacySettings.allowMessages': true,
      $or: [
        { 'profile.fullName': { $regex: searchQuery, $options: 'i' } },
        { username: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    })
    .select('username name profile fullName avatar isOnline lastSeen')
    .limit(15)
    .sort({ 
      'profile.isOnline': -1,
      'profile.fullName': 1 
    });

    res.json({
      success: true,
      users,
      count: users.length,
      searchQuery
    });

  } catch (error) {
    console.error('❌ Search users for chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed. Please try again.'
    });
  }
};