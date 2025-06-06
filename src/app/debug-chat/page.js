// src/app/debug-chat/page.js
"use client";

import { useState } from "react";
import { useChatSocket } from "@/hooks/useChatSocket";

export default function DebugChat() {
  const [chatId, setChatId] = useState("debug-room");
  const [userName, setUserName] = useState("TestUser");
  const [userRole, setUserRole] = useState("admin");
  const [input, setInput] = useState("");

  const { messages, sendMessage, chatsList } = useChatSocket({
    chatId,
    userName,
    userRole,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() !== "") {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto border border-gray-300">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Debug WebSocket Chat
      </h1>
      <div className="mb-4">
        <label className="text-gray-700">Chat ID:</label>
        <input
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          className="border border-gray-300 px-2 py-1 ml-2 text-gray-800 bg-white"
        />
        <label className="ml-4 text-gray-700">Username:</label>
        <input
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="border border-gray-300 px-2 py-1 ml-2 text-gray-800 bg-white"
        />
      </div>
      <div className="mb-4">
        <label className="text-gray-700">Role:</label>
        <select
          value={userRole}
          onChange={(e) => setUserRole(e.target.value)}
          className="border border-gray-300 px-2 py-1 ml-2 text-gray-800 bg-white"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="border border-gray-300 p-4 h-80 overflow-y-scroll bg-white mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2 text-gray-800">
            <b>{msg.userName}:</b> {msg.text}{" "}
            <span className="text-xs text-gray-500">{msg.timestamp}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          className="flex-1 border border-gray-300 px-2 py-1 text-gray-800 bg-white"
          placeholder="Type message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="ml-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </form>
      <div className="mt-4 text-sm text-gray-700">
        <b>Chats list (admin only):</b> {chatsList.join(", ")}
      </div>
    </div>
  );
}
