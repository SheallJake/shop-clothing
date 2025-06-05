"use client";

import { useEffect, useState } from "react";
import { connectSocket, getSocket, disconnectSocket } from "@/lib/socketClient";

/**
 * Хук для управління WebSocket підключенням та функціоналом чату
 * @returns {Object} Об'єкт з функціями та даними для роботи з чатом
 */
export const useChatSocket = () => {
  // Стан для зберігання інформації про користувача
  const [user, setUser] = useState(null);
  // Список всіх доступних чатів
  const [chatsList, setChatsList] = useState([]);
  // Історія повідомлень для всіх чатів
  const [chatHistories, setChatHistories] = useState({});
  // ID поточного активного чату
  const [currentChat, setCurrentChat] = useState(null);
  // WebSocket з'єднання
  const [socket, setSocket] = useState(null);

  /**
   * Отримання інформації про користувача з сесії
   * Виконується при монтуванні компонента
   */
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

  /**
   * Налаштування WebSocket підключення та обробників подій
   * Виконується при зміні користувача або поточного чату
   */
  useEffect(() => {
    if (!user) return;

    // Підключення до WebSocket сервера
    const sock = connectSocket();
    setSocket(sock);

    // Ініціалізація в залежності від ролі користувача
    if (user.userRole === "admin") {
      sock.emit("join-admin");
    } else {
      sock.emit("join-user", { userId: user.userId });
    }

    // Отримання списку чатів для адміністратора
    sock.on("chats-list", (list) => {
      setChatsList(list);
    });

    // Отримання історії повідомлень для чату
    sock.on("chat-messages", (history) => {
      setChatHistories((prev) => ({
        ...prev,
        [currentChat || user.userId]: history,
      }));
    });

    // Обробка нових повідомлень у реальному часі
    sock.on("new-message", (message) => {
      const chatId = message.userId;

      // Додавання нового чату до списку, якщо він ще не існує
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

      // Оновлення історії повідомлень
      setChatHistories((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), message],
      }));
    });

    // Відключення сокету при розмонтуванні компонента
    return () => {
      disconnectSocket();
    };
  }, [user, currentChat]);

  /**
   * Завантаження історії чату для конкретного користувача
   * @param {string} userId - ID користувача
   */
  const loadChat = (userId) => {
    if (socket) {
      socket.emit("load-chat", userId);
    }
    setCurrentChat(userId);
  };

  /**
   * Відправка нового повідомлення
   * @param {string} text - Текст повідомлення
   */
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

  // Отримання повідомлень поточного чату
  const messages = chatHistories[currentChat || user?.userId] || [];

  return { user, messages, sendMessage, chatsList, loadChat, currentChat };
};
