// Game variables
const gameBoard = document.getElementById('gameBoard');
const ball = document.getElementById('ball');
const leftPaddle = document.getElementById('leftPaddle');
const rightPaddle = document.getElementById('rightPaddle');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');
const resetBtn = document.getElementById('resetBtn');

// Game constants
const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 400;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;
const BALL_SPEED = 5;
const PADDLE_SPEED = 6;
const MAX_BALL_SPEED = 8;

// Game state
let gameState = {
    ballX: BOARD_WIDTH / 2 - BALL_SIZE / 2,
    ballY: BOARD_HEIGHT / 2 - BALL_SIZE / 2,
    ballSpeedX: BALL_SPEED,
    ballSpeedY: BALL_SPEED,
    leftPaddleY: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    rightPaddleY: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    playerScore: 0,
    computerScore: 0,
    gameRunning: true
};

// Input handling
let keys = {};
let mouseY = BOARD_HEIGHT / 2;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

gameBoard.addEventListener('mousemove', (e) => {
    const rect = gameBoard.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player paddle position (mouse and arrow keys)
function updatePlayerPaddle() {
    // Arrow keys control
    if (keys['ArrowUp']) {
        gameState.leftPaddleY -= PADDLE_SPEED;
    }
    if (keys['ArrowDown']) {
        gameState.leftPaddleY += PADDLE_SPEED;
    }

    // Mouse control
    const targetY = mouseY - PADDLE_HEIGHT / 2;
    const diff = targetY - gameState.leftPaddleY;
    if (Math.abs(diff) > 5) {
        gameState.leftPaddleY += diff * 0.15;
    }

    // Boundary checking
    gameState.leftPaddleY = Math.max(0, Math.min(BOARD_HEIGHT - PADDLE_HEIGHT, gameState.leftPaddleY));
}

// Update computer paddle (AI)
function updateComputerPaddle() {
    const paddleCenter = gameState.rightPaddleY + PADDLE_HEIGHT / 2;
    const ballCenter = gameState.ballY + BALL_SIZE / 2;
    const diff = ballCenter - paddleCenter;

    // AI difficulty - follows ball with some lag
    const difficulty = 0.08; // Adjust this value for difficulty (0-1)
    if (Math.abs(diff) > 10) {
        gameState.rightPaddleY += diff * difficulty;
    }

    // Boundary checking
    gameState.rightPaddleY = Math.max(0, Math.min(BOARD_HEIGHT - PADDLE_HEIGHT, gameState.rightPaddleY));
}

// Ball physics and collision detection
function updateBall() {
    gameState.ballX += gameState.ballSpeedX;
    gameState.ballY += gameState.ballSpeedY;

    // Wall collision (top and bottom)
    if (gameState.ballY <= 0 || gameState.ballY + BALL_SIZE >= BOARD_HEIGHT) {
        gameState.ballSpeedY *= -1;
        gameState.ballY = Math.max(0, Math.min(BOARD_HEIGHT - BALL_SIZE, gameState.ballY));
    }

    // Left paddle collision
    if (
        gameState.ballX <= PADDLE_WIDTH + 15 &&
        gameState.ballY + BALL_SIZE >= gameState.leftPaddleY &&
        gameState.ballY <= gameState.leftPaddleY + PADDLE_HEIGHT
    ) {
        gameState.ballSpeedX *= -1;
        gameState.ballX = PADDLE_WIDTH + 15;
        
        // Add spin based on paddle position
        const hitPos = (gameState.ballY - gameState.leftPaddleY) / PADDLE_HEIGHT;
        gameState.ballSpeedY += (hitPos - 0.5) * 4;
        gameState.ballSpeedY = Math.max(-MAX_BALL_SPEED, Math.min(MAX_BALL_SPEED, gameState.ballSpeedY));
    }

    // Right paddle collision
    if (
        gameState.ballX + BALL_SIZE >= BOARD_WIDTH - PADDLE_WIDTH - 15 &&
        gameState.ballY + BALL_SIZE >= gameState.rightPaddleY &&
        gameState.ballY <= gameState.rightPaddleY + PADDLE_HEIGHT
    ) {
        gameState.ballSpeedX *= -1;
        gameState.ballX = BOARD_WIDTH - PADDLE_WIDTH - 15 - BALL_SIZE;
        
        // Add spin based on paddle position
        const hitPos = (gameState.ballY - gameState.rightPaddleY) / PADDLE_HEIGHT;
        gameState.ballSpeedY += (hitPos - 0.5) * 4;
        gameState.ballSpeedY = Math.max(-MAX_BALL_SPEED, Math.min(MAX_BALL_SPEED, gameState.ballSpeedY));
    }

    // Scoring
    if (gameState.ballX < 0) {
        gameState.computerScore++;
        computerScoreDisplay.textContent = gameState.computerScore;
        resetBall();
    }

    if (gameState.ballX > BOARD_WIDTH) {
        gameState.playerScore++;
        playerScoreDisplay.textContent = gameState.playerScore;
        resetBall();
    }
}

// Reset ball position
function resetBall() {
    gameState.ballX = BOARD_WIDTH / 2 - BALL_SIZE / 2;
    gameState.ballY = BOARD_HEIGHT / 2 - BALL_SIZE / 2;
    gameState.ballSpeedX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    gameState.ballSpeedY = BALL_SPEED * (Math.random() - 0.5) * 2;
}

// Render game objects
function render() {
    ball.style.left = gameState.ballX + 'px';
    ball.style.top = gameState.ballY + 'px';

    leftPaddle.style.top = gameState.leftPaddleY + 'px';
    rightPaddle.style.top = gameState.rightPaddleY + 'px';
}

// Game loop
function gameLoop() {
    if (gameState.gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
        render();
    }
    requestAnimationFrame(gameLoop);
}

// Reset game
function resetGame() {
    gameState.playerScore = 0;
    gameState.computerScore = 0;
    gameState.leftPaddleY = BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    gameState.rightPaddleY = BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    playerScoreDisplay.textContent = '0';
    computerScoreDisplay.textContent = '0';
    resetBall();
    gameState.gameRunning = true;
}

// Event listeners
resetBtn.addEventListener('click', resetGame);

// Start the game
resetBall();
gameLoop();
