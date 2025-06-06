let chatRooms = {}; // { userId: { userName, messages: [] } }

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Адмін підключається одразу
    socket.on("join-admin", () => {
      socket.join("admin");
      const chatsList = Object.entries(chatRooms).map(([userId, data]) => ({
        userId,
        userName: data.userName,
      }));
      socket.emit("chats-list", chatsList);
    });

    // Користувач приєднується тільки при першому повідомленні
    socket.on("send-message", ({ userId, text, sender, senderName }) => {
      if (!userId || !text || !sender) return;

      const message = {
        userId,
        text,
        sender,
        senderName,
        timestamp: new Date().toISOString(),
      };

      if (!chatRooms[userId]) {
        chatRooms[userId] = {
          userName: senderName,
          messages: [],
        };
      }

      chatRooms[userId].messages.push(message);

      io.to(userId).emit("new-message", message);
      io.to("admin").emit("new-message", message);
    });

    // Завантаження історії
    socket.on("load-chat", (userId) => {
      if (!userId) return;
      const history = chatRooms[userId]?.messages || [];
      socket.emit("chat-messages", history);
    });

    // Користувач приєднується у свою кімнату тільки при відкритті
    socket.on("join-user", ({ userId }) => {
      if (userId) {
        socket.join(userId);
        const history = chatRooms[userId]?.messages || [];
        socket.emit("chat-messages", history);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupSocket };
