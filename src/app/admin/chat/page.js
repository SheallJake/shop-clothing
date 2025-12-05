"use client";
import { useChat } from "@/context/ChatContext";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminChatPage() {
  const { user, chatsList, messages, loadChat, sendMessage, currentChat } =
    useChat();
  const { theme } = useTheme();
  const [input, setInput] = useState("");
  const [newChatAnimation, setNewChatAnimation] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const hasShownToast = useRef(false);
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const messagesEndRef = useRef(null);

  // Theme-specific styles
  const styles = {
    light: {
      container: "bg-white border-slate-200",
      header: "from-slate-100 to-slate-200 text-slate-800 border-slate-300",
      sidebar: "from-slate-50 to-slate-100 border-slate-200",
      chatBg: "from-slate-50 to-slate-100",
      sentMessage: "from-stone-300 to-stone-200 text-slate-700",
      receivedMessage: "from-slate-200 to-slate-300 text-slate-800",
      inputArea: "from-slate-50 to-slate-100 border-slate-200",
      inputField:
        "bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-400",
      button:
        "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
      activeChat: "from-blue-400 to-blue-500 text-white",
      hoverChat: "hover:bg-slate-200 text-slate-700",
      textSecondary: "text-slate-500",
      textPrimary: "text-slate-800",
    },
    dark: {
      container: "bg-zinc-900 border-zinc-800/50",
      header: "from-zinc-800 to-zinc-900 text-zinc-50 border-zinc-700/50",
      sidebar: "from-zinc-800 to-zinc-900 border-zinc-700/50",
      chatBg: "from-zinc-900 to-zinc-800",
      sentMessage: "from-zinc-700 to-zinc-800 text-zinc-50",
      receivedMessage: "from-gray-800 to-gray-700 text-zinc-50",
      inputArea: "from-zinc-800 to-zinc-900 border-zinc-700/50",
      inputField:
        "bg-zinc-800 border-zinc-700/50 text-zinc-50 placeholder-zinc-500 focus:border-zinc-600",
      button:
        "from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-zinc-50",
      activeChat: "from-zinc-700 to-zinc-800 text-zinc-50",
      hoverChat: "hover:bg-zinc-800/50 text-zinc-50",
      textSecondary: "text-zinc-400",
      textPrimary: "text-zinc-50",
    },
  };

  const currentStyles = styles[theme];

  useEffect(() => {
    if (chatsList.length > 0 && !currentChat) {
      loadChat(chatsList[0].userId);
    }
  }, [chatsList, currentChat]);

  // Track new chats for animation
  useEffect(() => {
    const newChats = {};
    chatsList.forEach((chat) => {
      if (!newChatAnimation[chat.userId]) {
        newChats[chat.userId] = true;
      }
    });
    if (Object.keys(newChats).length > 0) {
      setNewChatAnimation((prev) => ({ ...prev, ...newChats }));
      // Remove animation class after animation completes
      setTimeout(() => {
        setNewChatAnimation((prev) => {
          const updated = { ...prev };
          Object.keys(newChats).forEach((key) => {
            delete updated[key];
          });
          return updated;
        });
      }, 1000);
    }
  }, [chatsList]);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/session");
      if (!res.ok) throw new Error("Session check failed");
      const data = await res.json();

      if (!data.user || data.user.role.toLowerCase() !== "admin") {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.error("Доступ заборонено");
          router.push("/");
        }
        return;
      }
    } catch (err) {
      console.error("Помилка перевірки сесії:", err);
      if (!hasShownToast.current) {
        hasShownToast.current = true;
        toast.error("Помилка перевірки сесії");
        router.push("/");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("query", searchQuery);

      const response = await fetch(`/api/admin/chats?${queryParams}`);

      if (response.status === 401) {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.error("Доступ заборонено");
          router.push("/");
        }
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      setChats(data.chats);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError(err.message);
      if (err.message.includes("Unauthorized")) {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.error("Доступ заборонено");
          router.push("/");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [searchQuery]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    try {
      const response = await fetch(
        `/api/admin/chats/${selectedChat.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: message.trim() }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не вдалося надіслати повідомлення");
      }

      setMessage("");
      fetchChats();
      toast.success("Повідомлення надіслано");
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.message);
      toast.error(err.message || "Помилка при надсиланні повідомлення");
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() !== "") {
      sendMessage(input);
      setInput("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return null;
  if (user.userRole !== "admin") {
    return (
      <div className="p-6 text-red-500 font-bold animate-fade-in">
        Ви не маєте доступу
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-row flex-1 relative">
        <div
          className={`bg-gradient-to-b ${currentStyles.sidebar} overflow-y-auto overflow-x-hidden transition-all duration-300 ${
            menuCollapsed ? "w-0" : "w-1/3"
          }`}
        >
          <div
            className={`flex justify-between items-center p-3 border-b-2 bg-gradient-to-r ${currentStyles.header}`}
          >
            <h2 className="font-semibold">Користувачі</h2>
          </div>
          <ul className="space-y-1 p-2">
            {chatsList.map(({ userId, userName }) => (
              <li key={userId}>
                <button
                  className={`w-full px-3 py-2 rounded-lg text-left transition-all duration-200 truncate ${
                    currentChat === userId
                      ? `bg-gradient-to-r ${currentStyles.activeChat} shadow-md`
                      : currentStyles.hoverChat
                  }`}
                  onClick={() => loadChat(userId)}
                >
                  {userName} (ID: {userId})
                </button>
              </li>
            ))}
          </ul>
        </div>

        {menuCollapsed ? (
          <button
            onClick={() => setMenuCollapsed(false)}
            className={`absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r ${currentStyles.button} p-2 rounded-r-lg shadow-lg transition-all duration-300 z-10 group`}
          >
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        ) : (
          <button
            onClick={() => setMenuCollapsed(true)}
            className={`absolute left-[calc(33.333%-1rem)] top-1/2 -translate-y-1/2 bg-gradient-to-r ${currentStyles.button} p-2 rounded-l-lg shadow-lg transition-all duration-300 z-10 group`}
          >
            <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
          </button>
        )}

        {currentChat ? (
          <div
            className={`flex flex-col transition-all duration-300 ${
              menuCollapsed ? "w-full" : "w-2/3"
            }`}
          >
            <div
              className={`flex-1 overflow-y-auto p-4 bg-gradient-to-b ${currentStyles.chatBg}`}
            >
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-4 ${
                      msg.sender === user.userId
                        ? "flex justify-end"
                        : "flex justify-start"
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className={`relative px-4 py-2 rounded-2xl transition-all duration-200 ${
                        msg.sender === user.userId
                          ? `bg-gradient-to-r ${currentStyles.sentMessage} rounded-tr-none shadow-md`
                          : `bg-gradient-to-r ${currentStyles.receivedMessage} rounded-tl-none shadow-md`
                      } max-w-[75%]`}
                    >
                      {msg.sender !== user.userId && (
                        <b
                          className={`block text-sm mb-1 ${currentStyles.textSecondary}`}
                        >
                          {msg.senderName || "Користувач"}
                        </b>
                      )}
                      <div className="break-words text-[15px] leading-relaxed">
                        {msg.text}
                      </div>
                      <div
                        className={`text-[11px] ${currentStyles.textSecondary} mt-1 text-right`}
                      >
                        {formatDate(msg.timestamp)}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className={`flex p-4 border-t-2 bg-gradient-to-r ${currentStyles.inputArea} shadow-inner`}
            >
              <input
                className={`flex-1 border-2 rounded-lg px-3 py-2 text-sm ${currentStyles.inputField} focus:outline-none transition-colors duration-200`}
                placeholder="Написати..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                className={`ml-3 bg-gradient-to-r ${currentStyles.button} px-5 py-2 rounded-lg font-semibold transition-colors duration-200 active:scale-95 shadow-md`}
              >
                ➤
              </button>
            </form>
          </div>
        ) : (
          <div
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              menuCollapsed ? "w-full" : "w-2/3"
            } bg-gradient-to-b ${currentStyles.chatBg}`}
          >
            <div className={`${currentStyles.textSecondary} text-center p-4`}>
              <p className="text-lg mb-2">Виберіть чат зі списку</p>
              <p className="text-sm">
                Для початку спілкування виберіть користувача зі списку зліва
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
