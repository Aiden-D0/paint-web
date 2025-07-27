const canvas = document.getElementById("paint-canvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("color-picker");
const brushSize = document.getElementById("brush-size");

const socket = io();
const params = new URLSearchParams(window.location.search);
const roomCode = params.get("code");
document.getElementById("room-display").textContent = `Room: ${roomCode}`;

let tool = "brush";
let drawing = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 50;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

socket.emit("joinRoom", roomCode);

canvas.addEventListener("mousedown", e => {
  drawing = true;
  if (tool === "fill") {
    const color = colorPicker.value;
    socket.emit("fill", { x: e.offsetX, y: e.offsetY, color });
    fillAt(e.offsetX, e.offsetY, color);
  } else {
    drawLine(e.offsetX, e.offsetY, e.offsetX, e.offsetY, colorPicker.value, brushSize.value);
    socket.emit("draw", { x0: e.offsetX, y0: e.offsetY, x1: e.offsetX, y1: e.offsetY, color: colorPicker.value, size: brushSize.value });
  }
});

canvas.addEventListener("mousemove", e => {
  if (!drawing || tool !== "brush") return;
  const x1 = e.offsetX, y1 = e.offsetY;
  drawLine(lastX, lastY, x1, y1, colorPicker.value, brushSize.value);
  socket.emit("draw", { x0: lastX, y0: lastY, x1, y1, color: colorPicker.value, size: brushSize.value });
  lastX = x1;
  lastY = y1;
});

canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);

let lastX = 0, lastY = 0;
canvas.addEventListener("mousedown", e => {
  lastX = e.offsetX;
  lastY = e.offsetY;
});

function drawLine(x0, y0, x1, y1, color, size) {
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

function fillAt(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - 5, y - 5, 10, 10); // simple fill placeholder
}

function setTool(t) {
  tool = t;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit("clear");
}

function exportImage() {
  const link = document.createElement("a");
  link.download = `room-${roomCode}.png`;
  link.href = canvas.toDataURL();
  link.click();
}

// Socket listeners
socket.on("draw", data => drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size));
socket.on("fill", data => fillAt(data.x, data.y, data.color));
socket.on("clear", () => ctx.clearRect(0, 0, canvas.width, canvas.height));
