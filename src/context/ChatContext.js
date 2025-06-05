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
      } catch {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const sock = connectSocket();
    setSocket(sock);

    if (user.userRole === "admin") {
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

    return () => {
      disconnectSocket();
    };
  }, [user, currentChat]);

  const loadChat = (userId) => {
    if (socket) {
      socket.emit("load-chat", userId);
    }
    setCurrentChat(userId);
  };

  const sendMessage = (text) => {
    if (socket) {
      socket.emit("send-message", {
        userId: currentChat || user.userId,
        text,
        sender: user.userId,
        senderName: user.userName,
      });
    }
  };

  const messages = chatHistories[currentChat || user?.userId] || [];

  return (
    <ChatContext.Provider
      value={{ user, messages, sendMessage, chatsList, loadChat, currentChat }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
