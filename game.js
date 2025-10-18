// Updated game.js for Flappy Bird with Parallax Background and Right-Facing Bird Emoji

// Constants for background layers
const BACKGROUND_LAYERS = [
    { emoji: '☁️', speed: 0.1, offset: 0 }, // Clouds (far background)
    { emoji: '🌲', speed: 0.3, offset: 0 }, // Trees (middle ground)
    { emoji: '🌿', speed: 0.5, offset: 0 }, // Bushes (near ground)
];

// Initialize background positions
function initBackground() {
    BACKGROUND_LAYERS.forEach(layer => {
        layer.offset = 0; // Initialize offsets
    });
}

// Update background positions
function updateBackground() {
    BACKGROUND_LAYERS.forEach(layer => {
        layer.offset -= layer.speed; // Move background layer
        if (layer.offset <= -canvas.width) {
            layer.offset = 0; // Reset offset for looping
        }
    });
}

// Draw background elements
function drawBackground() {
    BACKGROUND_LAYERS.forEach(layer => {
        const emoji = layer.emoji;
        const yPosition = 50; // Adjust for your game's needs
        ctx.fillText(emoji, layer.offset, yPosition);
        ctx.fillText(emoji, layer.offset + canvas.width, yPosition); // Repeat for continuous effect
    });
}

// Main game loop
function update() {
    updateBackground(); // Update background first
    // Existing update logic...
}

function draw() {
    drawBackground(); // Draw background first
    // Existing drawing logic...
    ctx.fillText('🐦‍➡️', birdX, birdY); // Update bird emoji to right-facing
    // Draw pipes and other elements...
}

// Initialize background elements
initBackground();