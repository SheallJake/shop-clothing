"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { connectSocket, disconnectSocket } from "@/lib/socketClient";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [chatsList, setChatsList] = useState([]);
  const [chatHistories, setChatHistories] = useState({});
  const [currentChat, setCurrentChat] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/session");
        const data = await res.json();
        if (data?.user?.id) {
          setUser({
            userId: data.user.id.toString(),
            userRole: data.user.role || "user",
            userName: data.user.name || "User",
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
        setError("Failed to fetch user data");
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    let sock = null;
    setIsConnecting(true);
    setError(null);

    try {
      sock = connectSocket();
      setSocket(sock);

      if (user.userRole.toLowerCase() === "admin") {
        sock.emit("join-admin");
      } else {
        sock.emit("join-user", { userId: user.userId });
      }

      sock.on("chats-list", (list) => {
        setChatsList(list);
      });

      sock.on("chat-messages", (history) => {
        setChatHistories((prev) => ({
          ...prev,
          [currentChat || user.userId]: history,
        }));
      });

      sock.on("new-message", (message) => {
        const chatId = message.userId;

        setChatHistories((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), message],
        }));

        if (user.userRole === "admin") {
          setChatsList((prev) => {
            const exists = prev.some((chat) => chat.userId === chatId);
            if (!exists) {
              return [
                ...prev,
                { userId: chatId, userName: message.senderName || "User" },
              ];
            }
            return prev;
          });
        }
      });

      sock.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setError("Failed to connect to chat server");
      });
    } catch (error) {
      console.error("Error setting up socket:", error);
      setError("Failed to initialize chat connection");
    } finally {
      setIsConnecting(false);
    }

    return () => {
      if (sock) {
        disconnectSocket();
      }
    };
  }, [user, currentChat]);

  const loadChat = (userId) => {
    if (socket) {
      try {
        socket.emit("load-chat", userId);
        setCurrentChat(userId);
      } catch (error) {
        console.error("Error loading chat:", error);
        setError("Failed to load chat");
      }
    }
  };

  const sendMessage = (text) => {
    if (socket) {
      try {
        socket.emit("send-message", {
          userId: currentChat || user.userId,
          text,
          sender: user.userId,
          senderName: user.userName,
        });
      } catch (error) {
        console.error("Error sending message:", error);
        setError("Failed to send message");
      }
    }
  };

  const messages = chatHistories[currentChat || user?.userId] || [];

  return (
    <ChatContext.Provider
      value={{
        user,
        messages,
        sendMessage,
        chatsList,
        loadChat,
        currentChat,
        isConnecting,
        error,
        isChatOpen,
        setIsChatOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
