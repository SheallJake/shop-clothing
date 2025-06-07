"use client";
import { useChat } from "@/context/ChatContext";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function AdminChatPage() {
  const { user, chatsList, messages, loadChat, sendMessage, currentChat } =
    useChat();
  const [input, setInput] = useState("");
  const [newChatAnimation, setNewChatAnimation] = useState({});
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const hasShownToast = useRef(false);

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

      if (!data.user || data.user.role !== "admin") {
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
        throw new Error(errorData.error || "Failed to send message");
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

  if (!user) return null;
  if (user.userRole !== "admin") {
    return (
      <div className="p-6 text-red-500 font-bold animate-fade-in">
        Ви не маєте доступу
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div className="p-4 min-h-[calc(100vh-64px)] -mt-16">
      <h1
        className={`text-xl font-bold mb-4 ${isDark ? "text-zinc-100" : "text-zinc-900"}`}
      >
        Адмін панель - Чати
      </h1>
      <div
        className={`flex h-[calc(100vh-140px)] border rounded-lg shadow-lg ${
          isDark ? "border-zinc-700 bg-zinc-800" : "border-zinc-200 bg-white"
        }`}
      >
        <div
          className={`w-1/3 border-r overflow-y-auto ${
            isDark ? "border-zinc-700" : "border-zinc-200"
          }`}
        >
          <h2
            className={`font-semibold mb-2 p-3 ${
              isDark ? "bg-zinc-700 text-zinc-100" : "bg-zinc-900 text-zinc-100"
            }`}
          >
            Активні чати:
          </h2>
          <ul className="space-y-2 p-2">
            {chatsList.map(({ userId, userName }) => (
              <li
                key={userId}
                className={`transition-all duration-200 hover:scale-[1.02] ${
                  newChatAnimation[userId] ? "animate-slide-in-right" : ""
                }`}
              >
                <button
                  className={`px-4 py-2 rounded-lg w-full text-left transition-all duration-200 ${
                    currentChat === userId
                      ? isDark
                        ? "bg-zinc-700 text-zinc-100 shadow-md"
                        : "bg-zinc-900 text-zinc-100 shadow-md"
                      : isDark
                        ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                        : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                  }`}
                  onClick={() => loadChat(userId)}
                >
                  {userName} (ID: {userId})
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3 flex flex-col">
          {currentChat ? (
            <>
              <div
                className={`font-semibold px-4 py-2 ${
                  isDark
                    ? "bg-zinc-700 text-zinc-100"
                    : "bg-zinc-900 text-zinc-100"
                }`}
              >
                Чат з користувачем: {currentChat}
              </div>
              <div
                className={`flex-1 overflow-y-auto p-4 ${
                  isDark ? "bg-zinc-800" : "bg-zinc-50"
                }`}
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-3 ${
                      msg.sender === user.userId
                        ? "animate-slide-in-right"
                        : "animate-slide-in-left"
                    }`}
                    style={{
                      animationDelay: `${idx * 0.1}s`,
                      animationFillMode: "both",
                    }}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-[80%] ${
                        msg.sender === user.userId
                          ? isDark
                            ? "bg-zinc-700 text-zinc-100 ml-auto"
                            : "bg-zinc-900 text-zinc-100 ml-auto"
                          : isDark
                            ? "bg-zinc-700 text-zinc-200"
                            : "bg-zinc-200 text-zinc-800"
                      }`}
                    >
                      <b className="block mb-1 text-sm">
                        {msg.sender === user.userId
                          ? "Я (адмін):"
                          : msg.senderName || "Користувач:"}
                      </b>
                      <div className="text-sm">{msg.text}</div>
                      <div
                        className={`text-xs mt-1 ${
                          isDark ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={handleSend}
                className={`flex border-t p-3 ${
                  isDark
                    ? "border-zinc-700 bg-zinc-800"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <input
                  className={`flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors duration-200 ${
                    isDark
                      ? "border-zinc-700 bg-zinc-700 text-zinc-100 focus:border-zinc-600"
                      : "border-zinc-200 text-zinc-900 focus:border-zinc-900"
                  }`}
                  placeholder="Написати повідомлення..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  className={`ml-2 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-[1.02] ${
                    isDark
                      ? "bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                      : "bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                  }`}
                >
                  Відправити
                </button>
              </form>
            </>
          ) : (
            <div
              className={`flex-1 p-4 flex items-center justify-center ${
                isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Оберіть чат для перегляду
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
