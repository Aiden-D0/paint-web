// paint-web backend (Node.js with Express + Socket.io)

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static frontend from 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Store drawing and chat history per room
const roomData = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (roomCode) => {
    socket.join(roomCode);
    socket.roomCode = roomCode;
    console.log(`User joined room: ${roomCode}`);

    // Send past chat (optional)
    if (roomData[roomCode]?.chat) {
      roomData[roomCode].chat.forEach((msg) => {
        socket.emit("chatMessage", msg);
      });
    }
  });

  socket.on("draw", (data) => {
    if (!socket.roomCode) return;
    socket.to(socket.roomCode).emit("draw", data);
  });

  socket.on("chatMessage", ({ room, message }) => {
    if (!roomData[room]) roomData[room] = { chat: [] };
    roomData[room].chat.push(message);
    io.to(room).emit("chatMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
