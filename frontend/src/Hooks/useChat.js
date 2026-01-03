// src/hooks/useChat.js
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { chatAPI } from '../services/api';

export const useChat = (chatRoomId) => {
  const { socket, isConnected, emit, on, off } = useSocket();
  const [messages, setMessages] = useState([]);
  const [chatRoom, setChatRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());

  // Load chat room and messages
  useEffect(() => {
    if (chatRoomId) {
      loadChatRoom();
      loadMessages();
    }
  }, [chatRoomId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !chatRoomId || !isConnected) return;

    // Join chat room
    emit('join_chat_room', chatRoomId);

    // Listen for new messages
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    // Listen for typing indicators
    const handleUserTyping = (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
      } else {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    };

    // Listen for message read receipts
    const handleMessagesRead = (data) => {
      // Update read status for messages
      setMessages(prev => prev.map(msg => 
        msg.sender._id !== data.userId ? { ...msg, read: true } : msg
      ));
    };

    on('new_message', handleNewMessage);
    on('user_typing', handleUserTyping);
    on('messages_read', handleMessagesRead);

    return () => {
      off('new_message', handleNewMessage);
      off('user_typing', handleUserTyping);
      off('messages_read', handleMessagesRead);
      
      // Only attempt to leave the room if still connected to avoid warnings
      if (chatRoomId && isConnected) {
        emit('leave_chat_room', chatRoomId);
      }
    };
  }, [socket, chatRoomId, isConnected, emit, on, off]);

  const loadChatRoom = async () => {
    try {
      // In a real app, you'd fetch the specific chat room
      // For now, we'll use the getChatRooms and find the right one
      const response = await chatAPI.getChatRooms();
      if (response.success) {
        const room = response.chatRooms.find(room => room._id === chatRoomId);
        setChatRoom(room);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getMessages(chatRoomId);
      if (response.success) {
        setMessages(response.messages);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = useCallback(async (text, messageType = 'text') => {
    if (!text.trim()) return;

    let tempMessage = null;
    try {
      // Optimistically add message to UI
      tempMessage = {
        _id: `temp-${Date.now()}`,
        text,
        sender: { _id: 'current-user' }, // Will be replaced by real data
        createdAt: new Date(),
        isSending: true
      };

      setMessages(prev => [...prev, tempMessage]);

      // Send via socket for real-time
      emit('send_message', {
        chatRoomId,
        text,
        messageType
      });

      // Also send via API for persistence
      // Use flexible API that supports both signatures
      await chatAPI.sendMessage(chatRoomId, text, messageType);

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      if (tempMessage) {
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      }
      setError('Failed to send message');
    }
  }, [chatRoomId, emit]);

  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      emit('typing_start', { chatRoomId });
    }
  }, [chatRoomId, emit, isTyping]);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      emit('typing_stop', { chatRoomId });
    }
  }, [chatRoomId, emit, isTyping]);

  const markMessagesAsRead = useCallback(async () => {
    try {
      await chatAPI.markMessagesRead(chatRoomId);
      emit('mark_messages_read', { chatRoomId });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [chatRoomId, emit]);

  return {
    messages,
    chatRoom,
    loading,
    error,
    isTyping,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    reloadMessages: loadMessages,
    isConnected,
  };
};