"use client";
import { useChat } from "@/context/ChatContext";
import { useState, useEffect } from "react";

export default function AdminChatPage() {
  const { user, chatsList, messages, loadChat, sendMessage, currentChat } =
    useChat();
  const [input, setInput] = useState("");

  useEffect(() => {
    if (chatsList.length > 0 && !currentChat) {
      loadChat(chatsList[0].userId);
    }
  }, [chatsList, currentChat]);

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
      <div className="p-6 text-red-500 font-bold">Ви не маєте доступу</div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Адмін панель - Чати</h1>
      <div className="flex h-[80vh] border rounded shadow-md">
        <div className="w-1/3 border-r overflow-y-auto">
          <h2 className="font-semibold mb-2 p-2 bg-gray-100">Активні чати:</h2>
          <ul className="space-y-2 p-2">
            {chatsList.map(({ userId, userName }) => (
              <li key={userId}>
                <button
                  className={`px-4 py-2 rounded w-full text-left ${
                    currentChat === userId
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
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
              <div className="bg-blue-500 text-white font-semibold px-4 py-2">
                Чат з користувачем: {currentChat}
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.map((msg, idx) => (
                  <div key={idx} className="mb-3">
                    <b>
                      {msg.sender === user.userId
                        ? "Я (адмін):"
                        : msg.senderName || "Користувач:"}
                    </b>{" "}
                    {msg.text}
                    <div className="text-xs text-gray-400">{msg.timestamp}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSend} className="flex border-t p-2">
                <input
                  className="flex-1 border rounded px-2 py-1 text-sm"
                  placeholder="Написати повідомлення..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="ml-2 bg-blue-500 text-white px-4 rounded"
                >
                  Відправити
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 p-4 text-gray-500">
              Оберіть чат для перегляду
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
