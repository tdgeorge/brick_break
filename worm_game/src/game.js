// Game constants
const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;

// Game state
let canvas, ctx;
let gameLoop;
let isPaused = false;
let isGameOver = false;
let score = 0;
let highScore = 0;
let speed = INITIAL_SPEED;

// Worm state
let worm = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

// Food state
let food = { x: 0, y: 0 };

// DOM elements
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const currentScoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const playAgainBtn = document.getElementById('play-again-btn');

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Load high score from localStorage
    highScore = parseInt(localStorage.getItem('wormGameHighScore')) || 0;
    highScoreEl.textContent = highScore;
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartGame);
    playAgainBtn.addEventListener('click', () => {
        gameOverEl.classList.add('hidden');
        restartGame();
    });
    
    document.addEventListener('keydown', handleKeyPress);
    
    // Draw initial state
    drawGrid();
}

// Start game
function startGame() {
    resetGame();
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    restartBtn.disabled = false;
    gameLoop = setInterval(update, speed);
}

// Reset game state
function resetGame() {
    // Initialize worm in the center, moving right
    worm = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    speed = INITIAL_SPEED;
    isPaused = false;
    isGameOver = false;
    currentScoreEl.textContent = score;
    spawnFood();
}

// Restart game
function restartGame() {
    clearInterval(gameLoop);
    startGame();
}

// Toggle pause
function togglePause() {
    if (isGameOver) return;
    
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    
    if (isPaused) {
        clearInterval(gameLoop);
    } else {
        gameLoop = setInterval(update, speed);
    }
}

// Handle keyboard input
function handleKeyPress(e) {
    if (isGameOver) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            e.preventDefault();
            break;
        case ' ':
            togglePause();
            e.preventDefault();
            break;
    }
}

// Main game update
function update() {
    if (isPaused || isGameOver) return;
    
    // Update direction
    direction = { ...nextDirection };
    
    // Calculate new head position
    const head = { ...worm[0] };
    head.x += direction.x;
    head.y += direction.y;
    
    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        endGame();
        return;
    }
    
    // Check self collision
    if (worm.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }
    
    // Add new head
    worm.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        currentScoreEl.textContent = score;
        spawnFood();
        
        // Increase speed slightly
        if (score % 5 === 0 && speed > 50) {
            clearInterval(gameLoop);
            speed -= SPEED_INCREMENT;
            gameLoop = setInterval(update, speed);
        }
    } else {
        // Remove tail if no food eaten
        worm.pop();
    }
    
    // Draw everything
    draw();
}

// Spawn food in random position
function spawnFood() {
    do {
        food.x = Math.floor(Math.random() * GRID_SIZE);
        food.y = Math.floor(Math.random() * GRID_SIZE);
    } while (worm.some(segment => segment.x === food.x && segment.y === food.y));
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw grid
    drawGrid();
    
    // Draw food
    ctx.fillStyle = '#e74c3c';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#e74c3c';
    ctx.fillRect(
        food.x * CELL_SIZE + 2,
        food.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4
    );
    ctx.shadowBlur = 0;
    
    // Draw worm
    worm.forEach((segment, index) => {
        // Gradient from head to tail
        const alpha = 1 - (index / worm.length) * 0.5;
        ctx.fillStyle = index === 0 ? '#2ecc71' : `rgba(46, 204, 113, ${alpha})`;
        
        if (index === 0) {
            // Head with glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#2ecc71';
        }
        
        ctx.fillRect(
            segment.x * CELL_SIZE + 2,
            segment.y * CELL_SIZE + 2,
            CELL_SIZE - 4,
            CELL_SIZE - 4
        );
        
        ctx.shadowBlur = 0;
    });
}

// Draw grid lines
function drawGrid() {
    ctx.strokeStyle = '#1a2940';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= GRID_SIZE; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();
        
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
    }
}

// End game
function endGame() {
    isGameOver = true;
    clearInterval(gameLoop);
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('wormGameHighScore', highScore);
        highScoreEl.textContent = highScore;
    }
    
    // Show game over screen
    finalScoreEl.textContent = score;
    gameOverEl.classList.remove('hidden');
    
    // Reset buttons
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    restartBtn.disabled = true;
}

// Start when page loads
window.addEventListener('DOMContentLoaded', init);