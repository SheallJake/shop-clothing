"use client";

import { useChat } from "@/context/ChatContext";
import { useState, useEffect, useRef } from "react";

export default function ChatWidget() {
  const { user, chatsList, messages, loadChat, sendMessage, currentChat } =
    useChat();
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef(null);
  const widgetRef = useRef(null);

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

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open && (
        <button
          className="bg-black text-white px-6 py-3 rounded-full shadow-lg text-lg font-semibold transition-all duration-300 hover:scale-105 hover:bg-gray-800 active:scale-95"
          onClick={() => setOpen(true)}
        >
          💬 Чат
        </button>
      )}

      <div
        ref={widgetRef}
        className={`fixed bottom-4 right-4 z-50 transition-all duration-500 ease-in-out transform ${
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        } ${isFullscreen ? "fixed bottom-6 right-6" : ""}`}
      >
        <div
          className={`bg-black text-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-gray-700 transition-all duration-500 ease-in-out transform ${
            isFullscreen
              ? "h-[calc(100vh-3rem)] w-[calc(100vw-3rem)] rounded-none border-none origin-bottom-right"
              : "w-[400px] h-[600px] origin-bottom-right"
          }`}
        >
          <div className="flex justify-between items-center bg-white text-black px-4 py-3">
            <span className="font-semibold text-lg">
              {user.userRole === "admin" ? "Чати адміну" : "Онлайн підтримка"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-gray-600 hover:text-black transition-all duration-300 transform hover:scale-110"
              >
                <span className="inline-block transition-transform duration-300">
                  {isFullscreen ? "⤓" : "⤢"}
                </span>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-600 hover:text-black transition-all duration-300 transform hover:scale-110"
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
                className={`bg-gray-900 border-r border-gray-700 overflow-y-auto overflow-x-hidden transition-all duration-300 ${
                  menuCollapsed ? "w-0" : "w-1/3"
                }`}
              >
                <div className="flex justify-between items-center p-3 border-b border-gray-700">
                  <h2 className="font-semibold">Користувачі</h2>
                </div>
                <ul className="space-y-1 p-2">
                  {chatsList.map(({ userId, userName }) => (
                    <li key={userId}>
                      <button
                        className={`w-full px-3 py-2 rounded-lg text-left transition-all duration-200 truncate ${
                          currentChat === userId
                            ? "bg-gray-700 text-white"
                            : "hover:bg-gray-700 text-gray-300"
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
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-r-lg shadow-lg hover:bg-gray-700 transition-all duration-300 z-10 group"
                >
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setMenuCollapsed(true)}
                  className="absolute left-[calc(33.333%-1rem)] top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-l-lg shadow-lg hover:bg-gray-700 transition-all duration-300 z-10 group"
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
                  <div className="flex-1 overflow-y-auto p-3 bg-black">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`mb-3 animate-fadeIn ${
                          msg.sender === user.userId
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        <div
                          className={`inline-block px-3 py-2 rounded-lg transition-all duration-200 ${
                            msg.sender === user.userId
                              ? "bg-gray-700 text-white"
                              : "bg-gray-800 text-gray-200"
                          }`}
                        >
                          {msg.sender !== user.userId && (
                            <b className="block text-sm mb-1">
                              {msg.senderName || "Користувач"}:
                            </b>
                          )}
                          {msg.text}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {msg.timestamp}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <form
                    onSubmit={handleSend}
                    className="flex p-3 border-t border-gray-700 bg-gray-900"
                  >
                    <input
                      className="flex-1 border border-gray-700 rounded-lg px-3 py-2 text-sm bg-black text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 transition-colors duration-200"
                      placeholder="Написати..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="ml-3 bg-gray-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200 active:scale-95"
                    >
                      ➤
                    </button>
                  </form>
                </div>
              ) : (
                <div
                  className={`flex flex-col items-center justify-center transition-all duration-300 ${
                    menuCollapsed ? "w-full" : "w-2/3"
                  } bg-black`}
                >
                  <div className="text-gray-400 text-center p-4">
                    <p className="text-lg mb-2">Виберіть чат зі списку</p>
                    <p className="text-sm">
                      Для початку спілкування виберіть користувача зі списку
                      зліва
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col flex-1">
              <div className="flex-1 overflow-y-auto p-3 bg-black">
                {messages.map((msg, idx) => (
                  <div key={idx} className="mb-2 animate-fadeIn">
                    {msg.sender !== user.userId && (
                      <b className="text-gray-300">
                        {msg.senderName || "Адмін"}:
                      </b>
                    )}{" "}
                    <span className="text-gray-200">{msg.text}</span>
                    <div className="text-xs text-gray-500">{msg.timestamp}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="flex border-t border-gray-700 p-3 bg-gray-900"
              >
                <input
                  className="flex-1 border border-gray-700 rounded-lg px-3 py-2 text-sm bg-black text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 transition-colors duration-200"
                  placeholder="Доброго дня! Чим можемо допомогти?"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="ml-3 bg-gray-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200 active:scale-95"
                >
                  ➤
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
