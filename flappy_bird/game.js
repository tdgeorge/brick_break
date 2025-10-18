// Flappy Bird Game Code

// Setup canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const PIPE_SPEED = 2;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_FREQUENCY = 100;

// Background layers Y positions
const CLOUD_Y = 50;
const MOUNTAIN_Y = 240;
const TREE_Y = 270;
const BUSH_Y = 290;

// Bird representation
const BIRD_EMOJI = '🦉';

// Game variables
let pipes = [];
let score = 0;
let birdY = canvas.height / 2;
let birdVelocity = 0;
let gameOver = false;

// Create a pipe
function createPipe() {
    const pipe = {
        x: canvas.width,
        height: Math.random() * (canvas.height - PIPE_GAP - 30) + 10,
        passed: false,
    };
    pipes.push(pipe);
}

// Update background
function updateBackground() {
    // Update background layers for parallax effect
}

// Draw background
function drawBackground() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillText('Clouds', canvas.width / 2, CLOUD_Y);
    ctx.fillText('Mountains', canvas.width / 2, MOUNTAIN_Y);
    ctx.fillText('Trees', canvas.width / 2, TREE_Y);
    ctx.fillText('Bushes', canvas.width / 2, BUSH_Y);
}

// Update game state
function update() {
    // Update bird position and velocity
    birdVelocity += GRAVITY;
    birdY += birdVelocity;
    // Update pipes
}

// Draw game elements
function draw() {
    drawBackground();
    ctx.fillText(BIRD_EMOJI, 50, birdY);
    // Draw pipes and score
}

// Restart game
function restartGame() {
    pipes = [];
    score = 0;
    birdY = canvas.height / 2;
    birdVelocity = 0;
    gameOver = false;
}

// Game loop
function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Event listeners
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        birdVelocity = FLAP_STRENGTH;
    }
});

// Start game
setInterval(createPipe, PIPE_FREQUENCY);
gameLoop();