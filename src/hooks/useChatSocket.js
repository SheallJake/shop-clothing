import { useEffect, useState } from "react";
import { connectSocket, getSocket, disconnectSocket } from "@/lib/socketClient";

export const useChatSocket = ({ chatId, userName, userRole }) => {
  const [messages, setMessages] = useState([]);
  const [chatsList, setChatsList] = useState([]);

  useEffect(() => {
    const socket = connectSocket();

    socket.on("connect", () => {
      socket.emit("join-chat", { chatId, userName, userRole });
    });

    socket.on("chat-messages", (history) => {
      setMessages(history);
    });

    socket.on("new-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("chats-list", (list) => {
      setChatsList(list);
    });

    return () => {
      disconnectSocket();
    };
  }, [chatId, userName, userRole]);

  const sendMessage = (text) => {
    const socket = getSocket();
    if (socket) {
      socket.emit("send-message", {
        chatId,
        text,
        sender: userName,
        userName,
      });
    }
  };

  return { messages, sendMessage, chatsList };
};
