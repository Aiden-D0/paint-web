// client.js - Handles drawing, chat, and room connection

const socket = io();

// Get room/user from URL
const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get("code") || "LOBBY";
const userName = urlParams.get("user") || "Guest";

// DOM refs
const canvas = document.getElementById("paintCanvas");
const ctx = canvas.getContext("2d");
const chatMessages = document.getElementById("chatMessages");
const chatText = document.getElementById("chatText");
const roomInfo = document.getElementById("roomInfo");

// Show user/room info
roomInfo.textContent = `Room: ${roomCode} | User: ${userName}`;

// Join room
socket.emit("joinRoom", roomCode);

// Drawing logic
let drawing = false;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.addEventListener("mousedown", () => (drawing = true));
canvas.addEventListener("mouseup", () => (drawing = false));
canvas.addEventListener("mouseout", () => (drawing = false));
canvas.addEventListener("mousemove", draw);

function draw(e) {
  if (!drawing) return;
  const x = e.clientX;
  const y = e.clientY;
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
  socket.emit("draw", { x, y });
}

socket.on("draw", ({ x, y }) => {
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
});

// Chat
function sendMessage() {
  const msg = chatText.value.trim();
  if (msg === "") return;
  const message = `${userName}: ${msg}`;
  socket.emit("chatMessage", { room: roomCode, message });
  chatText.value = "";
}

socket.on("chatMessage", (msg) => {
  const el = document.createElement("div");
  el.textContent = msg;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Enter key = send
chatText.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
