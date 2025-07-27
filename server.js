const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", socket => {
  socket.on("joinRoom", room => {
    socket.join(room);
    socket.room = room;
  });

  socket.on("draw", data => {
    socket.to(socket.room).emit("draw", data);
  });

  socket.on("fill", data => {
    socket.to(socket.room).emit("fill", data);
  });

  socket.on("clear", () => {
    socket.to(socket.room).emit("clear");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
