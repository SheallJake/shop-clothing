import { io } from "socket.io-client";

let socket = null;
let connectionPromise = null;

export const connectSocket = () => {
  if (!socket) {
    try {
      socket = io({
        reconnectionAttempts: 5,
        timeout: 10000,
        transports: ["websocket"],
        path: "/socket.io",
        autoConnect: true,
        forceNew: true,
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

      socket.on("connect", () => {
        console.log("Socket connected successfully");
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
