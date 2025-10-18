// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const PIPE_SPEED = 2;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_FREQUENCY = 100; // frames between pipe creation
const BACKGROUND_SPEED = 0.5; // Speed for parallax background

// Background layers with different speeds for parallax effect
const backgroundLayers = [
    { emojis: ['☁️', '☁️', '☁️'], speed: 0.3, y: 30, spacing: 150, offset: 0 },  // Clouds (slowest)
    { emojis: ['⛰️', '⛰️'], speed: 0.5, y: canvas.height - 80, spacing: 200, offset: 0 },  // Mountains
    { emojis: ['🌲', '🌲', '🌳', '🌲'], speed: 0.8, y: canvas.height - 50, spacing: 120, offset: 0 },  // Trees
    { emojis: ['🌿', '🌾', '🌿', '🌾', '🌿'], speed: 1.2, y: canvas.height - 30, spacing: 80, offset: 0 }  // Bushes (fastest)
];

// Bird object - now using owl emoji
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    emoji: '🦉' // Owl emoji
};

// Game state
let pipes = [];
let score = 0;
let gameOver = false;
let frameCount = 0;

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameOver) {
            restartGame();
        } else {
            bird.velocity = FLAP_STRENGTH;
        }
        e.preventDefault();
    }
});

canvas.addEventListener('click', () => {
    if (gameOver) {
        restartGame();
    } else {
        bird.velocity = FLAP_STRENGTH;
    }
});

// Update background layers for parallax effect
function updateBackground() {
    if (gameOver) return;
    
    backgroundLayers.forEach(layer => {
        layer.offset -= layer.speed;
        // Reset offset when it scrolls too far
        if (layer.offset <= -layer.spacing) {
            layer.offset = 0;
        }
    });
}

// Draw background layers
function drawBackground() {
    ctx.font = '25px Arial';
    ctx.textBaseline = 'bottom';
    
    backgroundLayers.forEach(layer => {
        // Draw multiple sets of emojis to create seamless scrolling
        for (let setIndex = 0; setIndex < 4; setIndex++) {
            layer.emojis.forEach((emoji, index) => {
                const x = layer.offset + (setIndex * layer.spacing * layer.emojis.length) + (index * layer.spacing);
                if (x > -50 && x < canvas.width + 50) {
                    ctx.fillText(emoji, x, layer.y);
                }
            });
        }
    });
}

// Create a new pipe
function createPipe() {
    const minHeight = 40;
    const maxHeight = canvas.height - PIPE_GAP - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + PIPE_GAP,
        passed: false
    });
}

// Update game state
function update() {
    if (gameOver) return;

    frameCount++;

    // Update background
    updateBackground();

    // Update bird physics
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Check if bird hit the ground or top
    if (bird.y + bird.height / 2 > canvas.height || bird.y - bird.height / 2 < 0) {
        gameOver = true;
    }

    // Create new pipes
    if (frameCount % PIPE_FREQUENCY === 0) {
        createPipe();
    }

    // Update pipes and check collisions
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= PIPE_SPEED;

        // Check collision with pipe
        if (
            bird.x + bird.width / 2 > pipes[i].x &&
            bird.x - bird.width / 2 < pipes[i].x + PIPE_WIDTH
        ) {
            if (
                bird.y - bird.height / 2 < pipes[i].topHeight ||
                bird.y + bird.height / 2 > pipes[i].bottomY
            ) {
                gameOver = true;
            }

            // Increment score when passing pipe
            if (!pipes[i].passed && pipes[i].x < bird.x) {
                pipes[i].passed = true;
                score++;
            }
        }

        // Remove off-screen pipes
        if (pipes[i].x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
        }
    }
}

// Draw game
function draw() {
    // Draw sky gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');  // Sky blue at top
    gradient.addColorStop(1, '#E0F6FF');  // Light blue at bottom
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw parallax background layers
    drawBackground();

    // Draw pipes
    ctx.fillStyle = '#2ecc71';
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 3;
    for (let pipe of pipes) {
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, canvas.height - pipe.bottomY);
        ctx.strokeRect(pipe.x, pipe.bottomY, PIPE_WIDTH, canvas.height - pipe.bottomY);
    }

    // Draw bird
    ctx.font = `${bird.width}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bird.emoji, bird.x, bird.y);

    // Draw score with background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(5, 5, 120, 40);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);

    // Draw game over screen
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over! 💀', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Final Score: ${score} 🏆`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.font = '16px Arial';
        ctx.fillText('Click or Press Space to Restart', canvas.width / 2, canvas.height / 2 + 50);
    }
}

// Restart game
function restartGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    frameCount = 0;
    // Reset background positions
    backgroundLayers.forEach(layer => {
        layer.offset = 0;
    });
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();