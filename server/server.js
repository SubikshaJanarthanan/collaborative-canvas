const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { addStroke, undoStroke, getState } = require("./state-manager");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the client files
app.use(express.static("client"));

// When a user connects
io.on("connection", (socket) => {
  console.log("New user:", socket.id);

  // Send all previous strokes to the new user
  socket.emit("init_state", getState());

  // Listen for new drawing strokes
  socket.on("drawing_step", (stroke) => {
    addStroke(socket.id, stroke);         // Save it in server memory
    socket.broadcast.emit("drawing_step", stroke); // Show it to other users
  });

  // Listen for undo request
  socket.on("undo", () => {
    const updated = undoStroke(socket.id); // Remove last stroke of this user
    io.emit("sync_state", updated);        // Update all users
  });

  // Track cursor movement
  socket.on("cursor_move", (pos) => {
    socket.broadcast.emit("cursor_move", { id: socket.id, ...pos });
  });

  // When user disconnects
  socket.on("disconnect", () => {
    console.log("User left:", socket.id);
  });
});

// Start server
server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
