"use client";

import { useState } from "react";
import { useChatSocket } from "@/hooks/useChatSocket";

export default function AdminChatPage() {
  const [currentChatId, setCurrentChatId] = useState(null);
  const { messages, sendMessage, chatsList } = useChatSocket({
    chatId: currentChatId || "",
    userName: "Admin",
    userRole: "admin",
  });

  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (currentChatId && input.trim() !== "") {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Адмін панель - Чати</h1>

      <div className="flex">
        <div className="w-1/3 border-r pr-4">
          <h2 className="font-semibold mb-2">Активні чати:</h2>
          <ul className="space-y-2">
            {chatsList.map((chatId) => (
              <li key={chatId}>
                <button
                  className={`px-4 py-2 rounded ${
                    currentChatId === chatId
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                  onClick={() => setCurrentChatId(chatId)}
                >
                  {chatId}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-2/3 pl-4">
          {currentChatId ? (
            <>
              <h2 className="font-semibold mb-2">Чат: {currentChatId}</h2>
              <div className="border h-80 overflow-y-scroll p-2 mb-2 bg-gray-50">
                {messages.map((msg, idx) => (
                  <div key={idx} className="mb-2">
                    <b>{msg.userName}:</b> {msg.text}{" "}
                    <span className="text-xs text-gray-400">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSend} className="flex">
                <input
                  className="flex-1 border rounded px-2 py-1 text-sm"
                  placeholder="Написати відповідь..."
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
            <div className="text-gray-500">
              Оберіть чат для перегляду повідомлень
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
