

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <BackgroundOrbs />
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <BackgroundOrbs />
        <div className="text-center text-white">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Chat not found</h2>
          <p className="text-gray-400 mb-4">Unable to load conversation</p>
          <button
            onClick={() => navigate('/chat')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl transition-colors"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  // return (
  //   <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
  //     <BackgroundOrbs />

  //     {/* Header - Fixed with name after avatar */}
  //     <div className="backdrop-blur-md bg-white/5 border-b border-white/20 p-4 flex items-center justify-between z-10">
  //       <div className="flex items-center gap-4">
  //         {/* Back button */}
  //         <button
  //           onClick={() => navigate('/chat')}
  //           className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-white"
  //         >
  //           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  //           </svg>
  //         </button>

  //         {/* Avatar and Name side by side */}
  //         <div className="flex items-center gap-3">
  //           {/* Avatar with online indicator */}
  //           <div className="relative">
  //             <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-xl text-white shadow-lg">
  //               {getAvatar(otherUser)}
  //             </div>
  //             {otherUser.profile?.isOnline && (
  //               <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
  //             )}
  //           </div>

  //           {/* User's Name - Using the proper display name function */}
  //           <div>
  //             <h2 className="font-semibold text-lg text-white">
  //               {getDisplayName(otherUser)}
  //             </h2>
  //             <p className="text-sm text-gray-400">
  //               {otherUser.profile?.isOnline ? 'Online' : 'Offline'}
  //             </p>
  //           </div>
  //         </div>
  //       </div>


  //       <div className="new-chat">
  //         <Link to="/roomManager" className="flex items-center gap-2">
  //           <FaVideo className="text-xl text-green-500" />
  //           {/* {extended && <p>Meeting</p>} */}
  //         </Link>
  //       </div>
  //     </div>

  //     {/* Messages Container */}
  //     <div className="flex-1 overflow-y-auto p-6 space-y-4">
  //       {messages.length === 0 ? (
  //         <div className="h-full flex items-center justify-center">
  //           <div className="text-center text-gray-400">
  //             <div className="text-6xl mb-4">💬</div>
  //             <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
  //             <p>Start the conversation by sending a message!</p>
  //           </div>
  //         </div>
  //       ) : (
  //         messages.map((message) => (
  //           <div
  //             key={message._id}
  //             className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
  //           >
  //             <div
  //               className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl p-4 shadow-lg ${
  //                 message.sender._id === user._id
  //                   ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
  //                   : 'backdrop-blur-md bg-white/5 text-gray-100 border border-white/20'
  //               }`}
  //             >
  //               {/* Show sender name for other user's messages */}
  //               {message.sender._id !== user._id && (
  //                 <p className="text-xs text-gray-300 mb-1 font-medium">
  //                   {getDisplayName(message.sender)}
  //                 </p>
  //               )}
  //               <p className="whitespace-pre-wrap break-words">{message.text}</p>
  //               <p className={`text-xs mt-2 ${message.sender._id === user._id ? 'text-purple-200' : 'text-gray-400'}`}>
  //                 {formatTime(message.createdAt)}
  //               </p>
  //             </div>
  //           </div>
  //         ))
  //       )}
  //       <div ref={messagesEndRef} />
  //     </div>

  //     {/* Input Area */}
  //     <div className="backdrop-blur-md bg-white/5 border-t border-white/20 p-4 z-10">
  //       <div className="flex gap-3 max-w-4xl mx-auto">
  //         <textarea
  //           value={inputMessage}
  //           onChange={(e) => setInputMessage(e.target.value)}
  //           onKeyPress={handleKeyPress}
  //           placeholder="Type your message... (Press Enter to send)"
  //           className="flex-1 bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
  //           rows="1"
  //           disabled={isSending}
  //         />
  //         <button
  //           onClick={handleSendMessage}
  //           disabled={!inputMessage.trim() || isSending}
  //           className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center gap-2 min-w-[100px] justify-center"
  //         >
  //           {isSending ? (
  //             <>
  //               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
  //               <span>Sending</span>
  //             </>
  //           ) : (
  //             'Send'
  //           )}
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      {/* Header - Fixed Glassmorphism */}
      <div className="glass-panel rounded-none border-t-0 border-x-0 bg-white/5 backdrop-blur-xl p-4 flex items-center justify-between z-10 mx-[-2rem] md:mx-[-4rem] mt-[-2rem] md:mt-[-4rem] px-6 md:px-12">
        <div className="flex items-center gap-4">
          {/* Back button */}
          <button
            onClick={() => navigate('/chat')}
            className="p-2 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white border border-white/5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Avatar + Name */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl text-white shadow-lg border border-white/10">
                {getAvatar(otherUser)}
              </div>
              {otherUser.profile?.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#050810] shadow-glow" />
              )}
            </div>

            <div>
              <h2 className="font-bold text-lg text-bright leading-tight">
                {getDisplayName(otherUser)}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${otherUser.profile?.isOnline ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                <p className="text-xs font-medium text-gray-400">
                  {otherUser.profile?.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Button */}
        <Link to="/roomManager" className="p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 transition-all group">
          <FaVideo className="text-xl text-gray-400 group-hover:text-cyan-400" />
        </Link>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4 opacity-20">💬</div>
              <h3 className="text-lg font-semibold text-gray-400">No messages yet</h3>
              <p className="text-sm text-gray-500">Break the ice and start talking!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender._id === user._id;
            return (
              <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                <div className={`max-w-[85%] md:max-w-[70%] lg:max-w-[60%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  {!isOwn && (
                    <span className="text-[10px] font-bold text-gray-400 mb-1 ml-4 uppercase tracking-wider">
                      {getDisplayName(message.sender)}
                    </span>
                  )}
                  <div
                    className={`relative p-4 rounded-2xl shadow-xl transition-all ${isOwn
                      ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-none border border-white/10'
                      : 'glass-card bg-white/5 text-auto rounded-tl-none border border-white/10'
                      }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                    <div className={`text-[10px] mt-2 font-medium opacity-60 ${isOwn ? 'text-right' : 'text-left'}`}>
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
      <div className="glass-panel bg-white/5 border-b-0 border-x-0 rounded-none p-4 md:p-6 mx-[-2rem] md:mx-[-4rem] mb-[-2rem] md:mb-[-4rem]">
        <div className="flex gap-3 max-w-5xl mx-auto items-end">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-bright 
                       placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 
                       resize-none transition-all outline-none text-[15px]"
              rows="1"
              disabled={isSending}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
            className="h-[56px] px-8 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 
                     hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:scale-100
                     text-white font-bold transition-all transform hover:scale-[1.02] active:scale-95
                     flex items-center gap-2 shadow-lg shadow-cyan-900/20"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );


};

export default UserChatInterface;