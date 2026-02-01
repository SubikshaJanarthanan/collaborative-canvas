// ======= Collaborative Canvas Script =======

// Canvas + context
const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Pen defaults
let strokeColor = "#000000";
let strokeWidth = 2;

// Local stroke history
let strokes = [];

// ===== Canvas Setup =====

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redrawAll(strokes);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ===== Helpers =====

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function drawStroke(stroke) {
    const { start, end, style } = stroke;

    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}

function redrawAll(arr) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    arr.forEach(drawStroke);
}

// ===== Drawing =====

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    const pos = getMousePos(e);
    lastX = pos.x;
    lastY = pos.y;
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);

    const stroke = {
        start: { x: lastX, y: lastY },
        end: { x: pos.x, y: pos.y },
        style: { color: strokeColor, width: strokeWidth }
    };

    drawStroke(stroke);
    strokes.push(stroke);

    if (window.socket) {
        socket.emit("drawing_step", stroke);
    }

    lastX = pos.x;
    lastY = pos.y;
});

canvas.addEventListener("mouseup", () => isDrawing = false);
canvas.addEventListener("mouseleave", () => isDrawing = false);

// ===== Color Buttons (safe) =====

const colorButtons = document.querySelectorAll('#controls button[data-color]');
if (colorButtons.length > 0) {
    colorButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            strokeColor = btn.dataset.color;
        });
    });
}

// ===== Eraser (safe) =====

const eraserBtn = document.getElementById("eraser");
if (eraserBtn) {
    eraserBtn.addEventListener("click", () => {
        strokeColor = "#FFFFFF";
    });
}

// ===== Width Slider (safe) =====

const widthSlider = document.getElementById("strokeWidthSlider");
if (widthSlider) {
    widthSlider.addEventListener("input", () => {
        strokeWidth = parseInt(widthSlider.value, 10);
    });
}

// ===== Undo Sync =====

if (window.socket) {
    socket.on("sync_state", (serverStrokes) => {
        strokes = serverStrokes;
        redrawAll(strokes);
    });
}
