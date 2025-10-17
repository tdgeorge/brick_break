// Game constants
const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;
const FOOD_PER_LEVEL = 10;

// Game state
let canvas, ctx;
let lastUpdateTime = 0;
let isPaused = false;
let isGameOver = false;
let score = 0;
let highScore = 0;
let speed = INITIAL_SPEED;
let level = 1;
let foodInLevel = 0;
let animationId = null;

// Worm state
let worm = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let inputQueue = [];

// Food state
let food = { x: 0, y: 0 };

// Walls state
let walls = [];

// Predefined wall layouts for each level
const LEVEL_WALLS = {
    1: [], // No walls
    2: [{ x: 10, y: 5 }, { x: 10, y: 6 }, { x: 10, y: 7 }], // Horizontal wall in upper middle
    3: [
        { x: 10, y: 5 }, { x: 10, y: 6 }, { x: 10, y: 7 },
        { x: 5, y: 14 }, { x: 6, y: 14 }, { x: 7, y: 14 }
    ], // Two horizontal walls
    4: [
        { x: 10, y: 5 }, { x: 10, y: 6 }, { x: 10, y: 7 },
        { x: 5, y: 14 }, { x: 6, y: 14 }, { x: 7, y: 14 },
        { x: 15, y: 10 }, { x: 15, y: 11 }, { x: 15, y: 12 }
    ], // Three walls forming triangle
    5: [
        { x: 10, y: 5 }, { x: 10, y: 6 }, { x: 10, y: 7 },
        { x: 5, y: 14 }, { x: 6, y: 14 }, { x: 7, y: 14 },
        { x: 15, y: 10 }, { x: 15, y: 11 }, { x: 15, y: 12 },
        { x: 5, y: 5 }, { x: 6, y: 5 }
    ], // Four walls in corners
    6: [
        { x: 10, y: 5 }, { x: 10, y: 6 }, { x: 10, y: 7 }, { x: 10, y: 8 },
        { x: 5, y: 14 }, { x: 6, y: 14 }, { x: 7, y: 14 }, { x: 8, y: 14 },
        { x: 15, y: 10 }, { x: 15, y: 11 }, { x: 15, y: 12 }, { x: 15, y: 13 },
        { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }
    ], // Longer walls
    7: [
        { x: 10, y: 5 }, { x: 10, y: 6 }, { x: 10, y: 7 }, { x: 10, y: 8 },
        { x: 5, y: 14 }, { x: 6, y: 14 }, { x: 7, y: 14 }, { x: 8, y: 14 },
        { x: 15, y: 10 }, { x: 15, y: 11 }, { x: 15, y: 12 }, { x: 15, y: 13 },
        { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
        { x: 3, y: 10 }, { x: 4, y: 10 }
    ]
};

// DOM elements
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const currentScoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');
const currentLevelEl = document.getElementById('current-level');
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
    lastUpdateTime = performance.now();
    gameLoop();
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
    inputQueue = [];
    score = 0;
    level = 1;
    foodInLevel = 0;
    speed = INITIAL_SPEED;
    isPaused = false;
    isGameOver = false;
    currentScoreEl.textContent = score;
    currentLevelEl.textContent = level;
    loadLevel(level);
    spawnFood();
}

// Load walls for a specific level
function loadLevel(levelNum) {
    walls = LEVEL_WALLS[levelNum] || LEVEL_WALLS[7]; // Use level 7 walls for levels beyond 7
}

// Restart game
function restartGame() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    startGame();
}

// Toggle pause
function togglePause() {
    if (isGameOver) return;
    
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    
    if (!isPaused) {
        lastUpdateTime = performance.now();
    }
}

// Handle keyboard input with queue to prevent missed inputs
function handleKeyPress(e) {
    if (isGameOver) return;
    
    let newDirection = null;
    
    switch(e.key) {
        case 'ArrowUp':
            newDirection = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case 'ArrowDown':
            newDirection = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case 'ArrowLeft':
            newDirection = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case 'ArrowRight':
            newDirection = { x: 1, y: 0 };
            e.preventDefault();
            break;
        case ' ':
            togglePause();
            e.preventDefault();
            return;
    }
    
    // Add to input queue if valid direction
    if (newDirection) {
        // Get the last direction from queue or current direction
        const lastDir = inputQueue.length > 0 ? inputQueue[inputQueue.length - 1] : direction;
        
        // Only add if it's a valid turn (not opposite direction)
        if (newDirection.x !== -lastDir.x || newDirection.y !== -lastDir.y) {
            // Limit queue size to prevent spam
            if (inputQueue.length < 3) {
                inputQueue.push(newDirection);
            }
        }
    }
}

// Check if position collides with wall
function isWall(x, y) {
    return walls.some(wall => wall.x === x && wall.y === y);
}

// Main game loop using requestAnimationFrame
function gameLoop() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastUpdateTime;
    
    if (!isPaused && !isGameOver && deltaTime >= speed) {
        update();
        lastUpdateTime = currentTime;
    }
    
    // Always draw to keep display smooth
    draw();
    
    // Continue loop
    if (!isGameOver) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Main game update
function update() {
    // Process input queue
    if (inputQueue.length > 0) {
        const newDir = inputQueue.shift();
        // Validate the direction change
        if (newDir.x !== -direction.x || newDir.y !== -direction.y) {
            nextDirection = newDir;
        }
    }
    
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
    
    // Check obstacle wall collision
    if (isWall(head.x, head.y)) {
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
        foodInLevel++;
        currentScoreEl.textContent = score;
        
        // Check for level up
        if (foodInLevel >= FOOD_PER_LEVEL) {
            level++;
            foodInLevel = 0;
            currentLevelEl.textContent = level;
            loadLevel(level);
        }
        
        spawnFood();
        
        // Increase speed slightly
        if (score % 5 === 0 && speed > 50) {
            speed -= SPEED_INCREMENT;
        }
    } else {
        // Remove tail if no food eaten
        worm.pop();
    }
}

// Spawn food in random position
function spawnFood() {
    do {
        food.x = Math.floor(Math.random() * GRID_SIZE);
        food.y = Math.floor(Math.random() * GRID_SIZE);
    } while (
        worm.some(segment => segment.x === food.x && segment.y === food.y) ||
        isWall(food.x, food.y)
    );
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw grid
    drawGrid();
    
    // Draw walls
    ctx.fillStyle = '#34495e';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#2c3e50';
    walls.forEach(wall => {
        ctx.fillRect(
            wall.x * CELL_SIZE + 1,
            wall.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );
    });
    ctx.shadowBlur = 0;
    
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
    
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
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