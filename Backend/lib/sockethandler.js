
// socketHandlers.js
export const setupSocketHandlers = (io) => {
  // Keep a map of userId -> socketId
  const userSocketMap = new Map();

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // Optionally authenticate socket on connect via token in handshake auth
    const auth = socket.handshake.auth || {};
    if (auth.userId) {
      userSocketMap.set(auth.userId, socket.id);
      socket.userId = auth.userId;
      console.log("🔑 socket auth userId", auth.userId);
    }

    // join video room
    socket.on("join_video_room", ({ chatRoomId, userId }) => {
      if (!chatRoomId) return;
      socket.join(chatRoomId);
      if (userId) userSocketMap.set(userId, socket.id);
      console.log(`🪪 ${userId} joined room ${chatRoomId}`);
    });

    // start_call: caller sends offer + receiverId
    socket.on("start_call", ({ chatRoomId, senderId, receiverId, offer }) => {
      if (!receiverId) return;
      const toSocket = userSocketMap.get(receiverId);
      // notify callee
      if (toSocket) {
        io.to(toSocket).emit("incoming_call", { chatRoomId, from: senderId, offer });
        console.log(`📞 incoming_call -> ${receiverId}`);
      } else {
        // optionally notify caller that callee is not reachable
        io.to(socket.id).emit("callee_unavailable", { receiverId });
      }
    });

    // answer_call: callee sends answer to callerId
    socket.on("answer_call", ({ chatRoomId, senderId, receiverId, answer }) => {
      const toSocket = userSocketMap.get(receiverId);
      if (toSocket) {
        io.to(toSocket).emit("call_answered", { chatRoomId, from: senderId, answer });
        console.log(`📲 call_answered -> ${receiverId}`);
      }
    });

    // ICE candidates forwarded
    socket.on("ice_candidate", ({ chatRoomId, candidate, to }) => {
      const toSocket = userSocketMap.get(to);
      if (toSocket) io.to(toSocket).emit("ice_candidate", { candidate, from: socket.userId });
    });

    // end call
    socket.on("end_call", ({ chatRoomId, callId, to }) => {
      if (to) {
        const toSocket = userSocketMap.get(to);
        if (toSocket) io.to(toSocket).emit("call_ended", { callId });
      } else if (chatRoomId) {
        io.to(chatRoomId).emit("call_ended", { chatRoomId, callId });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", socket.id, reason);
      if (socket.userId) userSocketMap.delete(socket.userId);
    });
  });
};
