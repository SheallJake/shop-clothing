"use client";
import { useChat } from "@/context/ChatContext";
import { useState, useEffect } from "react";

export default function AdminChatPage() {
  const { user, chatsList, messages, loadChat, sendMessage, currentChat } =
    useChat();
  const [input, setInput] = useState("");
  const [newChatAnimation, setNewChatAnimation] = useState({});

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

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">
        Адмін панель - Чати
      </h1>
      <div className="flex h-[80vh] border border-gray-200 rounded-lg shadow-lg bg-white">
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          <h2 className="font-semibold mb-2 p-3 bg-gray-900 text-white">
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
                  className={`px-4 py-3 rounded-lg w-full text-left transition-all duration-200 ${
                    currentChat === userId
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
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
              <div className="bg-gray-900 text-white font-semibold px-4 py-3">
                Чат з користувачем: {currentChat}
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-4 ${
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
                          ? "bg-gray-900 text-white ml-auto"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <b className="block mb-1">
                        {msg.sender === user.userId
                          ? "Я (адмін):"
                          : msg.senderName || "Користувач:"}
                      </b>
                      {msg.text}
                      <div className="text-xs mt-1 opacity-70">
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={handleSend}
                className="flex border-t border-gray-200 p-3 bg-white"
              >
                <input
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-900 transition-colors duration-200 text-gray-900"
                  placeholder="Написати повідомлення..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="ml-2 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 transform hover:scale-[1.02]"
                >
                  Відправити
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 p-4 text-gray-500 flex items-center justify-center">
              Оберіть чат для перегляду
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
