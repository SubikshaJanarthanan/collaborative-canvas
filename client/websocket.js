// Connect to the server using Socket.IO
const socket = io(); // window.socket will also be available globally
window.socket = socket; // make accessible in canvas.js

// Draw a stroke received from another user
function drawStrokeFromServer(stroke) {
    const { start, end, style } = stroke;
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}

// When a new user joins, server sends full canvas state
socket.on("init_state", (strokes) => {
    strokes.forEach(stroke => drawStrokeFromServer(stroke));
});

// When someone draws a new stroke
socket.on("drawing_step", (stroke) => {
    drawStrokeFromServer(stroke);
});

// When undo is done
socket.on("sync_state", (strokes) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all strokes
    strokes.forEach(stroke => drawStrokeFromServer(stroke));
});

// Handle cursor movement of other users (optional for now)
socket.on("cursor_move", (data) => {
    // You can implement ghost cursors here if needed
    // data.id, data.x, data.y
});
