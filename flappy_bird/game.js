// Flappy Bird Game Logic

// Game Variables
let bird = { x: 50, y: 150, width: 20, height: 20, gravity: 0.6, lift: -15, velocity: 0 };
let pipes = []; // Array to store pipe objects
let score = 0;
let gameOver = false;

// Pipe creation
function createPipe() {
    let pipeHeight = Math.random() * (canvas.height - 100) + 20;
    pipes.push({ x: canvas.width, y: 0, width: 40, height: pipeHeight });
    pipes.push({ x: canvas.width, y: pipeHeight + 100, width: 40, height: canvas.height - pipeHeight - 100 });
}

// Initialize game
function setup() {
    createCanvas(400, 600);
    frameRate(60);
    setInterval(createPipe, 1500); // Create a pipe every 1.5 seconds
}

// Update game state
function update() {
    if (!gameOver) {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        if (bird.y > canvas.height) {
            gameOver = true;
        }

        for (let i = 0; i < pipes.length; i++) {
            pipes[i].x -= 2; // Move pipes to the left
            if (pipes[i].x + pipes[i].width < 0) {
                pipes.splice(i, 1); // Remove off-screen pipes
                score++;
            }
        }

        checkCollision();
    }
}

// Render game
function render() {
    background(135, 206, 250); // Sky color
    fill(255, 255, 0); // Bird color
    rect(bird.x, bird.y, bird.width, bird.height);

    for (let pipe of pipes) {
        fill(0, 255, 0); // Pipe color
        rect(pipe.x, pipe.y, pipe.width, pipe.height);
    }

    fill(0);
    textSize(32);
    text(`Score: ${score}`, 10, 30);

    if (gameOver) {
        textSize(64);
        text('Game Over!', canvas.width / 2 - 160, canvas.height / 2);
    }
}

// Check for collisions
function checkCollision() {
    for (let pipe of pipes) {
        if (bird.x < pipe.x + pipe.width && bird.x + bird.width > pipe.x && bird.y < pipe.y + pipe.height && bird.y + bird.height > pipe.y) {
            gameOver = true;
        }
    }
}

// Handle user input
function keyPressed() {
    if (key === ' ') {
        bird.velocity += bird.lift; // Flap action
    }
}

// Main game loop
function draw() {
    update();
    render();
}

setup();