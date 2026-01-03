
import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

export const useSocket = () => {
  const socketRef = useRef(null);
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

    const socket = io(url, { auth, transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("✅ Connected to socket", socket.id);
    });
    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      console.warn("❌ Socket disconnected:", reason);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, []);

  const emit = useCallback((event, data) => {
    const socket = socketRef.current;
    if (socket && socket.connected) socket.emit(event, data);
    else console.warn(`⚠️ Socket not connected. Cannot emit: ${event}`);
  }, []);

  const on = useCallback((event, handler) => {
    const socket = socketRef.current;
    socket?.on(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    const socket = socketRef.current;
    socket?.off(event, handler);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
  };
};

