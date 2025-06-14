"use client";

import { useChat } from "@/context/ChatContext";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWidget() {
  const {
    user,
    chatsList,
    messages,
    loadChat,
    sendMessage,
    currentChat,
    isChatOpen,
    setIsChatOpen,
  } = useChat();
  const { theme } = useTheme();
  const [input, setInput] = useState("");
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef(null);
  const widgetRef = useRef(null);

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
    if (!user) return;

    if (user.userRole === "admin" && chatsList.length > 0 && !currentChat) {
      loadChat(chatsList[0].userId);
    }
  }, [user, chatsList, currentChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() !== "") {
      sendMessage(input);
      setInput("");
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Сьогодні, ${date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Вчора, ${date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {!isChatOpen && (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`shadow-md p-2 ${theme === "light" ? "bg-gradient-to-r from-stone-300 to-stone-200 text-slate-700 hover:from-stone-400 hover:to-stone-300" : "bg-gradient-to-r from-zinc-700 to-zinc-800 text-zinc-50 hover:from-zinc-600 hover:to-zinc-700"} px-4 sm:px-6 py-2 sm:py-3 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 hidden sm:block`}
          onClick={() => setIsChatOpen(true)}
        >
          💬 Чат
        </motion.button>
      )}

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            ref={widgetRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
          >
            <div
              className={`${currentStyles.container} fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 sm:w-[400px] sm:h-[600px] rounded-xl shadow-xl flex flex-col overflow-hidden border transition-all duration-500 ease-in-out transform`}
            >
              <div
                className={`flex justify-between items-center bg-gradient-to-r ${currentStyles.header} px-4 py-3 border-b-2 shadow-md`}
              >
                <span className="font-semibold text-lg">
                  {user.userRole === "admin"
                    ? "Чати адміну"
                    : "Онлайн підтримка"}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className={`${currentStyles.textSecondary} hover:text-white transition-all duration-300 transform hover:scale-110 text-xl`}
                  >
                    <span className="inline-block transition-transform duration-300">
                      {isFullscreen ? "⤓" : "⤢"}
                    </span>
                  </button>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className={`${currentStyles.textSecondary} hover:text-white transition-all duration-300 transform hover:scale-110 text-xl`}
                  >
                    <span className="inline-block transition-transform duration-300">
                      ×
                    </span>
                  </button>
                </div>
              </div>

              {user.userRole === "admin" ? (
                <div className="flex flex-row flex-1 relative">
                  <div
                    className={`bg-gradient-to-b ${currentStyles.sidebar} overflow-y-auto overflow-x-hidden transition-all duration-300 ${
                      menuCollapsed ? "w-0" : "w-full sm:w-1/3"
                    }`}
                  >
                    <div
                      className={`flex justify-between items-center p-3 border-b-2 bg-gradient-to-r ${currentStyles.header}`}
                    >
                      <h2 className="font-semibold text-base">Користувачі</h2>
                    </div>
                    <ul className="space-y-1 p-2">
                      {chatsList.map(({ userId, userName }) => (
                        <li key={userId}>
                          <button
                            className={`w-full px-3 py-2.5 rounded-lg text-left transition-all duration-200 truncate text-base ${
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
                      className={`absolute left-[calc(100%-1rem)] sm:left-[calc(33.333%-1rem)] top-1/2 -translate-y-1/2 bg-gradient-to-r ${currentStyles.button} p-2 rounded-l-lg shadow-lg transition-all duration-300 z-10 group`}
                    >
                      <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                        ←
                      </span>
                    </button>
                  )}

                  {currentChat ? (
                    <div
                      className={`flex flex-col transition-all duration-300 ${
                        menuCollapsed ? "w-full" : "w-0 sm:w-2/3"
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
                                className={`relative px-4 py-2.5 rounded-2xl transition-all duration-200 ${
                                  msg.sender === user.userId
                                    ? `bg-gradient-to-r ${currentStyles.sentMessage} rounded-tr-none shadow-md`
                                    : `bg-gradient-to-r ${currentStyles.receivedMessage} rounded-tl-none shadow-md`
                                } max-w-[85%] sm:max-w-[75%]`}
                              >
                                {msg.sender !== user.userId && (
                                  <b
                                    className={`block text-sm mb-1 ${currentStyles.textSecondary}`}
                                  >
                                    {msg.senderName || "Користувач"}
                                  </b>
                                )}
                                <div className="break-words text-base leading-relaxed">
                                  {msg.text}
                                </div>
                                <div
                                  className={`text-xs ${currentStyles.textSecondary} mt-1 text-right`}
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
                        className={`flex p-3 border-t-2 bg-gradient-to-r ${currentStyles.inputArea} shadow-inner`}
                      >
                        <input
                          className={`flex-1 border-2 rounded-lg px-3 py-2.5 text-base ${currentStyles.inputField} focus:outline-none transition-colors duration-200`}
                          placeholder="Написати..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                        />
                        <button
                          type="submit"
                          className={`ml-3 bg-gradient-to-r ${currentStyles.button} px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 active:scale-95 shadow-md text-base`}
                        >
                          ➤
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div
                      className={`flex flex-col items-center justify-center transition-all duration-300 ${
                        menuCollapsed ? "w-full" : "w-0 sm:w-2/3"
                      } bg-gradient-to-b ${currentStyles.chatBg}`}
                    >
                      <div
                        className={`${currentStyles.textSecondary} text-center p-4`}
                      >
                        <p className="text-lg mb-2">Виберіть чат зі списку</p>
                        <p className="text-base">
                          Для початку спілкування виберіть користувача зі списку
                          зліва
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col flex-1">
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
                          className="mb-4"
                        >
                          <div
                            className={`flex ${msg.sender === user.userId ? "justify-end" : "justify-start"}`}
                          >
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={`relative px-4 py-2.5 rounded-2xl max-w-[85%] sm:max-w-[75%] shadow-md ${
                                msg.sender === user.userId
                                  ? `bg-gradient-to-r ${currentStyles.sentMessage} rounded-tr-none`
                                  : `bg-gradient-to-r ${currentStyles.receivedMessage} rounded-tl-none`
                              }`}
                            >
                              {msg.sender !== user.userId && (
                                <motion.b
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className={`${currentStyles.textSecondary} block text-sm mb-1`}
                                >
                                  {msg.senderName || "Адмін"}
                                </motion.b>
                              )}
                              <div className="break-words text-base leading-relaxed">
                                {msg.text}
                              </div>
                              <div
                                className={`text-xs ${currentStyles.textSecondary} mt-1 text-right`}
                              >
                                {formatDate(msg.timestamp)}
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>

                  <form
                    onSubmit={handleSend}
                    className={`flex border-t-2 p-3 bg-gradient-to-r ${currentStyles.inputArea} shadow-inner`}
                  >
                    <input
                      className={`flex-1 border-2 rounded-lg px-3 py-2.5 text-base ${currentStyles.inputField} focus:outline-none transition-colors duration-200`}
                      placeholder="Доброго дня! Чим можемо допомогти?"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      className={`ml-3 bg-gradient-to-r ${currentStyles.button} px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 active:scale-95 shadow-md text-base`}
                    >
                      ➤
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
