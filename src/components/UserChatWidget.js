// src/components/UserChatWidget.js
"use client";

import { useState } from "react";
import { useChatSocket } from "@/hooks/useChatSocket";

export default function UserChatWidget({ userName }) {
  const chatId = "support-chat"; // можемо зробити унікальний chatId по userId, якщо потрібно
  const userRole = "user";
  const { messages, sendMessage } = useChatSocket({
    chatId,
    userName,
    userRole,
  });

  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() !== "") {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="fixed bottom-4 min-h-[300px] right-4 w-80 shadow-lg rounded-lg border bg-white flex flex-col">
      <div className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-t-lg">
        Онлайн підтримка
      </div>

      <div className="flex-1 overflow-y-auto p-2 h-60 text-black">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <b>{msg.userName}:</b> {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex border-t p-2">
        <input
          className="flex-1 border rounded px-2 py-1 text-sm text-black"
          placeholder="Доброго дня! Чим можемо допомогти?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="ml-2 bg-blue-500 text-white px-3 rounded"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
