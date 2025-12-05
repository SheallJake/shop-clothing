const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const { setupSocket } = require("./src/lib/socketServer");

const parsedPort = process.env.PORT != null ? parseInt(process.env.PORT, 10) : NaN;
const port = !isNaN(parsedPort) && parsedPort >= 0 ? parsedPort : 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
    transports: ["websocket"],
    pingTimeout: 10000,
    pingInterval: 5000,
  });

  setupSocket(io);

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
