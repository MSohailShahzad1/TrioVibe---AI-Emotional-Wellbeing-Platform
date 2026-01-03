import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = (props) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("userProfile");
    const auth = token ? { token } : {};
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user._id) auth.userId = user._id;
      } catch {}
    }

    console.log("🔄 Initializing socket connection...");
    const socketInstance = io(url, { 
      auth, 
      transports: ["websocket", "polling"] // Add polling as fallback
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      setIsConnected(true);
    });
    
    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("🔥 Socket connection error:", error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket connection");
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  // Socket utility functions
  const emit = (event, data) => {
    if (socket?.connected) {
      socket.emit(event, data);
      console.log(`📤 Emitted: ${event}`, data);
    } else {
      console.warn(`⚠️ Cannot emit ${event} - socket not connected`);
    }
  };

  const on = (event, handler) => {
    socket?.on(event, handler);
  };

  const off = (event, handler) => {
    socket?.off(event, handler);
  };

  const value = {
    socket,
    isConnected,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {props.children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;