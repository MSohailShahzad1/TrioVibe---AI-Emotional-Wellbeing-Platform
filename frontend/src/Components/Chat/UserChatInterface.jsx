

// src/components/Chat/UserChatInterface.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../Context/UserContext';
import { useChat } from '../../Hooks/useChat';
import { FaVideo } from "react-icons/fa";
import BackgroundOrbs from '../ShootingStar/BackgroundOrbs';

const UserChatInterface = () => {
  const { chatRoomId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const {
    messages,
    chatRoom,
    loading,
    sendMessage,
    markMessagesAsRead
  } = useChat(chatRoomId);

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef();

  // Get the other user in the chat
  const otherUser = chatRoom?.participants?.find(p => p.user._id !== user._id)?.user;

  // Debug: Log the user object to see its structure
  useEffect(() => {
    console.log('Other User Object:', otherUser);
  }, [otherUser]);

  // Function to get display name that handles different user structures
  const getDisplayName = (userObj) => {
    if (!userObj) return 'User';

    console.log('User object for display name:', userObj); // Debug log

    // Check different possible name fields in order of priority
    if (userObj.profile?.fullName) return userObj.profile.fullName;
    if (userObj.name) return userObj.name;
    if (userObj.username) return userObj.username;
    if (userObj.profile?.name) return userObj.profile.name;

    // If no name fields found, use the user ID or a default
    return userObj._id ? `User ${userObj._id.slice(-4)}` : 'User';
  };

  // Function to get avatar
  const getAvatar = (userObj) => {
    return userObj.profile?.avatar || userObj.avatar || '👤';
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when opening chat
  useEffect(() => {
    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages, markMessagesAsRead]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(inputMessage);
      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };



  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-6" />
          <h2 className="text-2xl font-bold tracking-tight text-bright">Restoring Stream</h2>
          <p className="text-dim mt-2 font-medium">Synchronizing neural messages...</p>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main p-6 text-center">
        <div className="glass-panel p-10 max-w-md w-full">
          <div className="text-6xl mb-6 opacity-20">📡</div>
          <h2 className="text-2xl font-bold text-bright mb-2">Signal Lost</h2>
          <p className="text-dim mb-8">The requested conversation channel could not be established.</p>
          <button
            onClick={() => navigate('/chat')}
            className="w-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-4 rounded-2xl transition shadow-lg active:scale-95"
          >
            Return to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col animate-fade-in-up overflow-hidden">
      {/* Header - Fixed Glassmorphism */}
      <div className="glass-panel rounded-none border-t-0 border-x-0 bg-white/5 backdrop-blur-3xl p-5 flex items-center justify-between z-20 px-8 shrink-0">
        <div className="flex items-center gap-6">
          {/* Back button */}
          <button
            onClick={() => navigate('/chat')}
            className="p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-400 hover:text-white border border-white/5 active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl blur-lg group-hover:opacity-100 opacity-0 transition-opacity" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl text-white shadow-2xl border border-white/20 transform group-hover:scale-105 transition-transform">
                {getAvatar(otherUser)}
              </div>
              {otherUser.profile?.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-[#050810] shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              )}
            </div>

            <div>
              <h2 className="font-black text-xl text-bright leading-none tracking-tighter uppercase">
                {getDisplayName(otherUser)}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`w-2 h-2 rounded-full ${otherUser.profile?.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dim">
                  {otherUser.profile?.isOnline ? 'Active Connection' : 'Offline Mode'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Button */}
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-dim hover:text-bright transition-all active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <Link to="/roomManager" className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-500/30 hover:border-cyan-400 transition-all group shadow-lg shadow-cyan-900/10 active:scale-95">
            <FaVideo className="text-xl text-cyan-400" />
          </Link>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-2 custom-scrollbar bg-white/[0.01]">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center animate-pulse">
              <div className="text-6xl mb-4 opacity-10">💬</div>
              <h3 className="text-xl font-bold text-gray-500 tracking-tight">Begin Connection</h3>
              <p className="text-sm text-gray-600 mt-1">Start your encrypted neural dialogue...</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender._id === user._id;
            const prevMessage = messages[index - 1];
            const isFirstInGroup = !prevMessage || prevMessage.sender._id !== message.sender._id;

            return (
              <div
                key={message._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-6' : 'mt-1'}`}
              >
                <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  {isFirstInGroup && !isOwn && (
                    <span className="text-[10px] font-black text-cyan-500/60 mb-1.5 ml-4 uppercase tracking-[0.2em]">
                      {getDisplayName(message.sender)}
                    </span>
                  )}

                  <div
                    className={`group relative p-4 shadow-2xl transition-all duration-300 ${isOwn
                      ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white border border-white/10'
                      : 'glass-panel bg-white/5 text-bright border-white/5'
                      } ${isFirstInGroup
                        ? (isOwn ? 'rounded-2xl rounded-tr-none' : 'rounded-2xl rounded-tl-none')
                        : 'rounded-2xl'
                      }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words font-medium">
                      {message.text}
                    </p>

                    <div className={`text-[9px] mt-2 font-black uppercase tracking-widest opacity-0 group-hover:opacity-40 transition-opacity ${isOwn ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass-panel bg-white/5 border-b-0 border-x-0 rounded-none p-6 shrink-0 z-10 backdrop-blur-2xl">
        <div className="flex gap-4 max-w-6xl mx-auto items-center">
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl group-focus-within:opacity-100 opacity-0 transition-opacity" />
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message to transmit..."
              className="relative w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-bright 
                       placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/30 
                       resize-none transition-all outline-none text-[15px] font-medium leading-relaxed min-h-[58px] max-h-[150px]"
              rows="1"
              disabled={isSending}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
            className="shrink-0 h-[58px] w-[58px] md:w-auto md:px-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 
                     hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:scale-100
                     text-white font-black transition-all transform hover:scale-[1.05] active:scale-95
                     flex items-center justify-center gap-3 shadow-lg shadow-cyan-900/40 uppercase tracking-widest text-xs"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="hidden md:block">Transmit</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
        <p className="text-[10px] text-dim text-center mt-3 font-bold uppercase tracking-[0.3em] opacity-30">Encrypted Neural Stream v2.1</p>
      </div>
    </div>
  );


};

export default UserChatInterface;