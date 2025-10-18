const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.5;
const FLAP_STRENGTH = -12;
const PIPE_WIDTH = 50;
const PIPE_GAP = 100;
const PIPE_SPEED = 4;
const PIPE_FREQUENCY = 100; // frames between pipe creation

// Bird object
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    emoji: '🐦'
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
    // Clear canvas
    ctx.fillStyle = '#E0F6FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pipes
    ctx.fillStyle = '#2ecc71';
    for (let pipe of pipes) {
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, canvas.height - pipe.bottomY);
    }

    // Draw bird
    ctx.font = `${bird.width}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bird.emoji, bird.x, bird.y);

    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Score: ${score}`, 10, 10);

    // Draw game over message
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Click or Press SPACE to Restart', canvas.width / 2, canvas.height / 2 + 60);
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
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();