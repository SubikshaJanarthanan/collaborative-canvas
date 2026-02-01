// Object to store strokes for each user
const strokesByUser = {};

// Add a new stroke
function addStroke(userId, stroke) {
  if (!strokesByUser[userId]) {
    strokesByUser[userId] = [];
  }
  strokesByUser[userId].push(stroke);
}

// Undo last stroke for a user
function undoStroke(userId) {
  if (strokesByUser[userId] && strokesByUser[userId].length > 0) {
    strokesByUser[userId].pop(); // remove last stroke
  }

  // Combine all users' strokes into a single array
  let allStrokes = [];
  Object.values(strokesByUser).forEach(userStrokes => {
    allStrokes = allStrokes.concat(userStrokes);
  });

  return allStrokes; // return updated strokes to sync with clients
}

// Get all strokes (for new users)
function getState() {
  let allStrokes = [];
  Object.values(strokesByUser).forEach(userStrokes => {
    allStrokes = allStrokes.concat(userStrokes);
  });
  return allStrokes;
}

// Export functions for server.js
module.exports = {
  addStroke,
  undoStroke,
  getState
};
