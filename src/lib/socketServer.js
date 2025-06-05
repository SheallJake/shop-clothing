let chatRoom = {};

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join-chat", ({ chatId, userName, userRole }) => {
      socket.join(chatId);
      console.log(`${userName} joined chat ${chatId}`);

      if (!chatRoom[chatId]) chatRoom[chatId] = [];
      socket.emit("chat-messages", chatRoom[chatId]);

      if (userRole === "admin") {
        const chatsList = Object.keys(chatRoom);
        socket.emit("chats-list", chatsList);
      }
    });

    socket.on("send-message", ({ chatId, text, sender, userName }) => {
      const message = {
        chatId,
        text,
        sender,
        userName,
        timestamp: new Date().toISOString(),
      };

      if (!chatRoom[chatId]) chatRoom[chatId] = [];
      chatRoom[chatId].push(message);

      io.to(chatId).emit("new-message", message);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupSocket };
