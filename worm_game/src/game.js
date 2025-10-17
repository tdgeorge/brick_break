// Existing code ...

// Input queue to buffer direction changes
let inputQueue = [];

// Game loop using requestAnimationFrame
function gameLoop(timestamp) {
    // Logic for game updates
    // Call the update function here
    updateGame();
    // Draw the game
    drawGame();

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

// Function to handle keyboard input
function handleKeyPress(event) {
    // Validate and add input to queue
    const direction = getDirectionFromKey(event.key);
    if (isValidInput(direction)) {
        // Add to queue if not already full
        if (inputQueue.length < 3) {
            inputQueue.push(direction);
        }
    }
}

// Function to update game state based on input
function updateGame() {
    if (inputQueue.length > 0) {
        const direction = inputQueue.shift(); // Get the first input
        // Process the direction change
        changeDirection(direction);
    }
    // Other game update logic...
}

// Function to validate input direction
function isValidInput(direction) {
    // Logic to prevent opposite directions
    // Example: if currentDirection === "left" && direction === "right" then return false;
    return true; // Placeholder for actual validation
}

// Start the game loop
requestAnimationFrame(gameLoop);
