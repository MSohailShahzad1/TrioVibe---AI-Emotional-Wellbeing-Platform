

// src/components/Chat/UserChatDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../Context/UserContext';
import { chatAPI, userAPI, testBackendConnection } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import BackgroundOrbs from '../ShootingStar/BackgroundOrbs';

const UserChatDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('chats');
  const [chatRooms, setChatRooms] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  useEffect(() => {
    checkBackendConnection();
    loadInitialData();
  }, []);

  const checkBackendConnection = async () => {
    const connected = await testBackendConnection();
    setIsBackendConnected(connected);
    if (!connected) {
      setBackendError('Cannot connect to server. Please make sure the backend is running.');
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setBackendError(null);

      // Load chat rooms
      try {
        const chatRoomsResponse = await chatAPI.getChatRooms();
        if (chatRoomsResponse.success) {
          setChatRooms(chatRoomsResponse.chatRooms);
        }
      } catch (error) {
        console.warn('Failed to load chat rooms:', error.message);
        setChatRooms(getMockChatRooms());
      }

      // Load suggested users
      try {
        const suggestedUsersResponse = await userAPI.getSuggestedUsers();
        if (suggestedUsersResponse.success) {
          setSuggestedUsers(suggestedUsersResponse.users);
        }
      } catch (error) {
        console.warn('Failed to load suggested users:', error.message);
        setSuggestedUsers(getMockUsers());
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setBackendError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development when backend is not available
  const getMockChatRooms = () => [
    {
      _id: '1',
      participants: [
        {
          user: {
            _id: '2',
            username: 'john_doe',
            profile: {
              fullName: 'John Doe',
              avatar: '👨',
              bio: 'Mental health advocate',
              isOnline: true
            }
          }
        },
        { user: { _id: user._id, username: user.username, profile: user.profile } }
      ],
      lastMessage: {
        text: 'Hey, how are you feeling today?',
        timestamp: new Date(Date.now() - 3600000),
        sender: '2'
      },
      unreadCount: 2,
      updatedAt: new Date()
    },
    {
      _id: '2',
      participants: [
        {
          user: {
            _id: '3',
            username: 'sarah_smith',
            profile: {
              fullName: 'Sarah Smith',
              avatar: '👩',
              bio: 'Psychology student',
              isOnline: false
            }
          }
        },
        { user: { _id: user._id, username: user.username, profile: user.profile } }
      ],
      lastMessage: {
        text: 'Thanks for your support yesterday!',
        timestamp: new Date(Date.now() - 86400000),
        sender: user._id
      },
      unreadCount: 0,
      updatedAt: new Date(Date.now() - 86400000)
    }
  ];

  const getMockUsers = () => [
    {
      _id: '4',
      username: 'alex_chen',
      profile: {
        fullName: 'Alex Chen',
        avatar: '👨‍💼',
        bio: 'Meditation enthusiast and wellness coach',
        interests: ['Meditation', 'Mindfulness', 'Yoga'],
        isOnline: true,
        lastSeen: new Date()
      }
    },
    {
      _id: '5',
      username: 'maya_rodriguez',
      profile: {
        fullName: 'Maya Rodriguez',
        avatar: '👩‍🎨',
        bio: 'Art therapy lover and mental health advocate',
        interests: ['Art Therapy', 'Creative Expression', 'Self-care'],
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000)
      }
    }
  ];

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await chatAPI.searchUsers(query);
      if (response.success) {
        setSearchResults(response.users);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to filtering suggested users
      const filtered = suggestedUsers.filter(user =>
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        (user.profile?.fullName && user.profile.fullName.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(filtered);
    } finally {
      setSearchLoading(false);
    }
  };

  const startChat = async (otherUser) => {
    try {
      const response = await chatAPI.startChat(otherUser._id);
      if (response.success) {
        navigate(`/chat/${response.chatRoom._id}`, {
          state: { chatRoom: response.chatRoom }
        });
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      // Create a mock chat room for demo
      const mockChatRoom = {
        _id: `mock_${Date.now()}`,
        participants: [
          { user: { _id: user._id, username: user.username, profile: user.profile } },
          { user: otherUser }
        ],
        lastMessage: {
          text: 'Start of conversation',
          timestamp: new Date(),
          sender: user._id
        },
        unreadCount: 0,
        updatedAt: new Date()
      };
      navigate(`/chat/${mockChatRoom._id}`, { state: { chatRoom: mockChatRoom } });
    }
  };

  const openChat = (chatRoom) => {
    navigate(`/chat/${chatRoom._id}`, { state: { chatRoom } });
  };

  const displayUsers = searchQuery ? searchResults : suggestedUsers;

  // FIXED: Better user data handling with proper fallbacks
  const getOtherParticipant = (chatRoom) => {
    const otherParticipant = chatRoom.participants?.find(p =>
      p.user?._id !== user._id && p.user?._id !== user.id
    )?.user;

    console.log('Chat Room:', chatRoom); // Debug log
    console.log('Other Participant:', otherParticipant); // Debug log

    return otherParticipant;
  };

  // FIXED: Consistent display name function
  const getDisplayName = (userObj) => {
    if (!userObj) return 'Unknown User';

    console.log('User object for display name:', userObj); // Debug log

    // Check different possible name fields in order of priority
    if (userObj.profile?.fullName) return userObj.profile.fullName;
    if (userObj.name) return userObj.name;
    if (userObj.username) return userObj.username;
    if (userObj.profile?.name) return userObj.profile.name;

    // If no name fields found, use the user ID or a default
    return userObj._id ? `User ${userObj._id.slice(-4)}` : 'Unknown User';
  };

  // FIXED: Consistent avatar function
  const getAvatar = (userObj) => {
    return userObj?.profile?.avatar || userObj?.avatar || '👤';
  };

  // FIXED: Check if user is online
  const isUserOnline = (userObj) => {
    return userObj?.profile?.isOnline || false;
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Unknown';
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now - lastSeenDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return lastSeenDate.toLocaleDateString();
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-main flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-6" />
        <h2 className="text-2xl font-bold tracking-tight text-bright">Loading Conversations</h2>
        <p className="text-dim mt-2">Connecting to the neural network...</p>
      </div>
    );
  }

  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
  //     <BackgroundOrbs />

  //     <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
  //       {/* Backend Connection Warning */}
  //       {!isBackendConnected && (
  //         <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-2xl text-yellow-200">
  //           <div className="flex items-center gap-3">
  //             <span className="text-xl">⚠️</span>
  //             <div>
  //               <p className="font-semibold">Demo Mode</p>
  //               <p className="text-sm">Using sample data. Start a chat to test the interface.</p>
  //             </div>
  //           </div>
  //         </div>
  //       )}

  //       {/* Header */}
  //       <div className="text-center mb-12">
  //         <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
  //           Community Chat
  //         </h1>
  //         <p className="text-xl text-gray-300 max-w-2xl mx-auto">
  //           Connect with others on their mental wellness journey
  //         </p>
  //       </div>

  //       {/* Tabs */}
  //       <div className="flex border-b border-gray-700 mb-6">
  //         <button
  //           onClick={() => setActiveTab('chats')}
  //           className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
  //             activeTab === 'chats' 
  //               ? 'border-purple-500 text-purple-400' 
  //               : 'border-transparent text-gray-400 hover:text-gray-300'
  //           }`}
  //         >
  //           💬 My Chats ({chatRooms.length})
  //         </button>
  //         <button
  //           onClick={() => setActiveTab('discover')}
  //           className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
  //             activeTab === 'discover' 
  //               ? 'border-purple-500 text-purple-400' 
  //               : 'border-transparent text-gray-400 hover:text-gray-300'
  //           }`}
  //         >
  //           👥 Discover People ({suggestedUsers.length})
  //         </button>
  //       </div>

  //       {/* Search Bar - Only show in Discover tab */}
  //       {activeTab === 'discover' && (
  //         <div className="mb-6">
  //           <input
  //             type="text"
  //             placeholder="Search users by name or username..."
  //             value={searchQuery}
  //             onChange={(e) => handleSearch(e.target.value)}
  //             className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
  //           />
  //           {searchLoading && (
  //             <div className="mt-2 text-purple-400 text-sm">
  //               🔍 Searching...
  //             </div>
  //           )}
  //         </div>
  //       )}

  //       {/* Chats Tab */}
  //       {activeTab === 'chats' && (
  //         <div className="space-y-4">
  //           {chatRooms.length === 0 ? (
  //             <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10">
  //               <div className="text-6xl mb-4">💬</div>
  //               <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
  //               <p className="text-gray-400 mb-6">Start a conversation with someone from the Discover tab!</p>
  //               <button
  //                 onClick={() => setActiveTab('discover')}
  //                 className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
  //               >
  //                 Discover People
  //               </button>
  //             </div>
  //           ) : (
  //             chatRooms.map(chatRoom => {
  //               const otherUser = getOtherParticipant(chatRoom);
  //               const displayName = getDisplayName(otherUser);
  //               const avatar = getAvatar(otherUser);
  //               const isOnline = isUserOnline(otherUser);

  //               return (
  //                 <div
  //                   key={chatRoom._id}
  //                   onClick={() => openChat(chatRoom)}
  //                   className="chat-item rounded-2xl p-4 cursor-pointer group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/30 transition-all duration-300"
  //                 >
  //                   <div className="flex items-center gap-4">
  //                     <div className="relative">
  //                       <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg">
  //                         {avatar}
  //                       </div>
  //                       {isOnline && (
  //                         <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
  //                       )}
  //                     </div>

  //                     <div className="flex-1 min-w-0">
  //                       <div className="flex items-center justify-between mb-1">
  //                         <h3 className="font-semibold text-lg truncate text-white">
  //                           {displayName}
  //                         </h3>
  //                         <span className="text-xs text-gray-400">
  //                           {formatMessageTime(chatRoom.updatedAt)}
  //                         </span>
  //                       </div>

  //                       <p className="text-gray-300 text-sm truncate">
  //                         {chatRoom.lastMessage?.text || 'No messages yet'}
  //                       </p>
  //                     </div>

  //                     {chatRoom.unreadCount > 0 && (
  //                       <span className="unread-counter bg-purple-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
  //                         {chatRoom.unreadCount}
  //                       </span>
  //                     )}
  //                   </div>
  //                 </div>
  //               );
  //             })
  //           )}
  //         </div>
  //       )}

  //       {/* Discover Tab */}
  //       {activeTab === 'discover' && (
  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  //           {displayUsers.length === 0 ? (
  //             <div className="col-span-full text-center py-12">
  //               <div className="text-6xl mb-4">🔍</div>
  //               <h3 className="text-xl font-semibold mb-2">
  //                 {searchQuery ? 'No users found' : 'No suggested users'}
  //               </h3>
  //               <p className="text-gray-400">
  //                 {searchQuery 
  //                   ? 'Try searching with different keywords' 
  //                   : 'Check back later for new community members'
  //                 }
  //               </p>
  //             </div>
  //           ) : (
  //             displayUsers.map(person => {
  //               const displayName = getDisplayName(person);
  //               const avatar = getAvatar(person);
  //               const isOnline = isUserOnline(person);

  //               return (
  //                 <div
  //                   key={person._id}
  //                   className="user-card rounded-2xl p-6 transition-all duration-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/30"
  //                 >
  //                   <div className="text-center mb-4">
  //                     <div className="relative inline-block">
  //                       <div className="user-avatar w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-2xl mb-3 mx-auto shadow-lg">
  //                         {avatar}
  //                       </div>
  //                       {isOnline && (
  //                         <div className="online-status absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
  //                       )}
  //                     </div>

  //                     <h3 className="font-semibold text-lg mb-1 text-white">
  //                       {displayName}
  //                     </h3>
  //                     <p className="text-gray-400 text-sm mb-2">@{person.username}</p>
  //                     <p className="text-gray-300 text-sm mb-4 line-clamp-2">
  //                       {person.profile?.bio || 'No bio available'}
  //                     </p>

  //                     {person.profile?.interests && person.profile.interests.length > 0 && (
  //                       <div className="flex flex-wrap gap-1 justify-center mb-4">
  //                         {person.profile.interests.slice(0, 3).map((interest, idx) => (
  //                           <span key={idx} className="interest-tag px-2 py-1 rounded text-xs bg-white/10 text-gray-200">
  //                             {interest}
  //                           </span>
  //                         ))}
  //                         {person.profile.interests.length > 3 && (
  //                           <span className="text-xs text-gray-400">
  //                             +{person.profile.interests.length - 3} more
  //                           </span>
  //                         )}
  //                       </div>
  //                     )}

  //                     <div className="text-xs text-gray-400 mb-4">
  //                       {isOnline 
  //                         ? '🟢 Online now' 
  //                         : `Last seen ${formatLastSeen(person.profile?.lastSeen)}`
  //                       }
  //                     </div>
  //                   </div>

  //                   <button
  //                     onClick={() => startChat(person)}
  //                     className="start-chat-btn w-full text-white py-2 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
  //                   >
  //                     Start Chat
  //                   </button>
  //                 </div>
  //               );
  //             })
  //           )}
  //         </div>
  //       )}

  //       {/* Debug Info - Remove in production */}
  //       <div className="mt-8 text-center text-sm text-gray-500">
  //         <p>Backend: {isBackendConnected ? '✅ Connected' : '❌ Disconnected'}</p>
  //         <p>Active Tab: {activeTab} | Displaying: {displayUsers.length} users</p>
  //         {searchQuery && <p>Searching for: "{searchQuery}"</p>}
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="min-h-full w-full flex flex-col animate-fade-in-up">
      {/* Header with Title and Tab Navigation */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text tracking-tight">
          Community Hub
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl font-medium">
          Sync with peers on your personal wellness journey.
        </p>
      </div>

      {/* Premium Tabs */}
      <div className="flex gap-2 p-1.5 glass-panel bg-white/5 border-white/10 mb-10 w-fit">
        <button
          onClick={() => setActiveTab('chats')}
          className={`px-8 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'chats'
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg'
            : 'text-dim hover:text-bright hover:bg-white/5'
            }`}
        >
          My Conversations ({chatRooms.length})
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`px-8 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'discover'
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg'
            : 'text-dim hover:text-bright hover:bg-white/5'
            }`}
        >
          Find People ({suggestedUsers.length})
        </button>
      </div>

      {/* Search (only for discover) */}
      {activeTab === 'discover' && (
        <div className="mb-10 relative group animate-fade-in-up">
          <input
            type="text"
            placeholder="Lookup members by name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-bright 
                     placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 
                     backdrop-blur-xl transition-all"
          />
          {searchLoading && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Chats Tab */}
        {activeTab === 'chats' && (
          <div className="grid gap-4 animate-fade-in-up">
            {chatRooms.length === 0 ? (
              <div className="text-center py-20 glass-panel border-dashed border-white/10">
                <div className="text-5xl mb-4 opacity-20">💬</div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">No active chats</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">Start exploring the community to begin your first conversation.</p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="auth-btn max-w-[200px] mx-auto"
                >
                  Find Members
                </button>
              </div>
            ) : (
              chatRooms.map(chatRoom => {
                const otherUser = getOtherParticipant(chatRoom);
                const displayName = getDisplayName(otherUser);
                const avatar = getAvatar(otherUser);
                const isOnline = isUserOnline(otherUser);

                return (
                  <div
                    key={chatRoom._id}
                    onClick={() => openChat(chatRoom)}
                    className="glass-card flex items-center gap-5 p-5 cursor-pointer group hover:scale-[1.01]"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-xl border border-white/10">
                        {avatar}
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-3 border-[#050810] shadow-glow" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-bold text-lg text-bright group-hover:text-cyan-400 transition-colors">
                          {displayName}
                        </h3>
                        <span className="text-xs font-medium text-gray-500">
                          {formatMessageTime(chatRoom.updatedAt)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm truncate pr-8">
                        {chatRoom.lastMessage?.text || 'No messages yet...'}
                      </p>
                    </div>

                    {chatRoom.unreadCount > 0 && (
                      <span className="bg-cyan-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        {chatRoom.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {displayUsers.length === 0 ? (
              <div className="col-span-full text-center py-20 opacity-50">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-300">No results found</h3>
              </div>
            ) : (
              displayUsers.map(person => {
                const displayName = getDisplayName(person);
                const avatar = getAvatar(person);
                const isOnline = isUserOnline(person);

                return (
                  <div
                    key={person._id}
                    className="glass-card flex flex-col p-8 text-center items-center group active:scale-95"
                  >
                    <div className="relative mb-6">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-2xl border border-white/10 group-hover:rotate-3 transition-transform">
                        {avatar}
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#050810]" />
                      )}
                    </div>

                    <h3 className="font-bold text-xl text-bright mb-1 group-hover:text-cyan-400 transition-colors">
                      {displayName}
                    </h3>
                    <p className="text-cyan-500/60 text-xs font-bold uppercase tracking-widest mb-4">
                      @{person.username}
                    </p>

                    <p className="text-sm text-gray-400 line-clamp-2 min-h-[2.5rem] mb-6">
                      {person.profile?.bio || 'Passionate about emotional wellness and community.'}
                    </p>

                    {person.profile?.interests?.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center mb-8">
                        {person.profile.interests.slice(0, 2).map((i, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-lg text-[10px] font-bold bg-white/5 border border-white/5 text-gray-400 uppercase">
                            {i}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => startChat(person)}
                      className="auth-btn w-full !h-12 text-sm"
                    >
                      Send Message
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );

};

export default UserChatDashboard;