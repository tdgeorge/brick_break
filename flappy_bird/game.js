// Assuming necessary assets and context are already defined

// Initialize background layer Y positions after canvas is loaded
let backgroundLayers = [
    { image: 'clouds.png', y: 0, speed: 0.5 },
    { image: 'mountains.png', y: 0, speed: 1 },
    { image: 'trees.png', y: 0, speed: 1.5 },
    { image: 'bushes.png', y: 0, speed: 2 }
];

function initializeBackground() {
    for (let layer of backgroundLayers) {
        layer.y = Math.random() * canvas.height; // Spread layers across the canvas
    }
}

// Ensure proper text rendering
context.fillStyle = '#000'; // Example color

function drawBackground() {
    for (let layer of backgroundLayers) {
        context.drawImage(layer.image, 0, layer.y);
        layer.y += layer.speed; // Scroll the layers
        if (layer.y > canvas.height) {
            layer.y = -layer.image.height; // Reset position
        }
    }
}

// Call initializeBackground after canvas is loaded
canvas.addEventListener('load', initializeBackground);

// Call drawBackground in the game loop
function gameLoop() {
    drawBackground();
    requestAnimationFrame(gameLoop);
}
gameLoop();