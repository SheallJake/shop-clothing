"use client";
import { useChat } from "@/context/ChatContext";
import { useState } from "react";

export default function UserChatWidget() {
  const { user, messages, sendMessage } = useChat();
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() !== "") {
      sendMessage(input);
      setInput("");
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 shadow-lg rounded-lg border bg-white flex flex-col">
      <div className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-t-lg">
        Онлайн підтримка
      </div>

      <div className="flex-1 overflow-y-auto p-2 h-60 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <b>
              {msg.sender === user.userId ? "Я:" : msg.senderName || "Адмін:"}
            </b>{" "}
            {msg.text}
            <div className="text-xs text-gray-400">{msg.timestamp}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex border-t p-2">
        <input
          className="flex-1 border rounded px-2 py-1 text-sm"
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
