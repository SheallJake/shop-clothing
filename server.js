const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const { setupSocket } = require("./src/lib/socketServer");

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Track compilation status
let compilationStatus = {
  mainPage: false,
  apiSession: false,
};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  setupSocket(io);

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
