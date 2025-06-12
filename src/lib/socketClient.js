import { io } from "socket.io-client";

let socket = null;
let connectionPromise = null;

export const connectSocket = () => {
  if (!socket) {
    try {
      socket = io({
        reconnectionAttempts: 3,
        timeout: 5000,
        transports: ["websocket", "polling"],
        autoConnect: false,
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        socket = null;
        connectionPromise = null;
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        if (reason === "io server disconnect") {
          socket.connect();
        }
      });

      socket.connect();
    } catch (error) {
      console.error("Socket initialization error:", error);
      socket = null;
      connectionPromise = null;
      throw error;
    }
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    try {
      socket.disconnect();
    } catch (error) {
      console.error("Error disconnecting socket:", error);
    } finally {
      socket = null;
      connectionPromise = null;
    }
  }
};

export const getSocket = () => socket;
