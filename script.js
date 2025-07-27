const socket = io();

const canvas = document.getElementById("paintCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const x = e.clientX;
  const y = e.clientY;
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
});

// Handle room code
const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get("code");

if (roomCode) {
  socket.emit("joinRoom", roomCode);
  document.getElementById("roomCodeDisplay").innerText = `Room: ${roomCode}`;
} else {
  alert("Room code not found in URL.");
}

// Chat feature
const chatMessages = document.getElementById("chatMessages");
const chatText = document.getElementById("chatText");

function sendMessage() {
  const message = chatText.value.trim();
  if (message && roomCode) {
    socket.emit("chatMessage", { room: roomCode, message });
    chatText.value = "";
  }
}

socket.on("chatMessage", (msg) => {
  const p = document.createElement("p");
  p.textContent = msg;
  chatMessages.appendChild(p);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
