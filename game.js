// ============================================
// FLAPPY MARIO - GAME LOGIC
// ============================================

// Game State
const gameState = {
    isPlaying: false,
    gameOver: false,
    score: 0,
    pipesSpawned: 0,
    highScore: localStorage.getItem('flappyMarioHighScore') || 0
};

// Bird Physics
const bird = {
    x: 100,
    y: 300,
    width: 40,
    height: 40,
    gravity: 0.6,
    velocity: 0,
    jumpPower: -12,
    maxVelocity: 12
};

// Game Configuration
const gameConfig = {
    pipeGap: 150,           // Space between upper and lower pipe
    pipeWidth: 60,
    pipeSpeed: 5,           // Pixels per frame
    spawnRate: 3000,        // Milliseconds
    minPipeHeight: 50,
    maxPipeHeight: 250
};

// DOM Elements
const birdEl = document.getElementById('bird');
const gameCanvasEl = document.getElementById('gameCanvas');
const scoreValueEl = document.getElementById('scoreValue');
const finalScoreEl = document.getElementById('finalScore');
const pipesPassed = document.getElementById('pipesPassed');
const progressFillEl = document.getElementById('progressFill');

// ============================================
// SCENE MANAGEMENT
// ============================================

function showScene(sceneName) {
    // Hide all scenes
    document.querySelectorAll('.scene').forEach(scene => {
        scene.classList.remove('active');
    });
    
    // Show target scene
    document.getElementById(sceneName).classList.add('active');
}

// ============================================
// GAME LOOP
// ============================================

let gameLoopId = null;

function gameLoop() {
    if (!gameState.isPlaying) return;

    // 1. UPDATE BIRD PHYSICS
    updateBirdPhysics();

    // 2. UPDATE BIRD POSITION
    updateBirdVisuals();

    // 3. CHECK COLLISIONS
    if (checkCollisions()) {
        endGame();
        return;
    }

    // 4. UPDATE PIPES (movement handled by CSS/JS)
    updatePipes();

    // Continue loop
    gameLoopId = requestAnimationFrame(gameLoop);
}

// ============================================
// BIRD PHYSICS
// ============================================

function updateBirdPhysics() {
    // Apply gravity
    bird.velocity += bird.gravity;

    // Cap maximum velocity
    if (bird.velocity > bird.maxVelocity) {
        bird.velocity = bird.maxVelocity;
    }

    // Update position
    bird.y += bird.velocity;

    // Boundary check (top and bottom)
    if (bird.y < 0) {
        endGame();
        return;
    }

    if (bird.y + bird.height > gameCanvasEl.offsetHeight) {
        endGame();
        return;
    }
}

function updateBirdVisuals() {
    birdEl.style.top = bird.y + 'px';

    // Rotate bird based on velocity
    const maxRotation = 45;
    const rotation = (bird.velocity / bird.maxVelocity) * maxRotation;
    birdEl.style.transform = `rotate(${rotation}deg)`;
}

// ============================================
// JUMP/FLAP
// ============================================

function makeBirdJump() {
    if (!gameState.isPlaying) return;
    bird.velocity = bird.jumpPower;
}

// Keyboard control
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        makeBirdJump();
    }
});

// Mouse/Touch control
gameCanvasEl.addEventListener('click', makeBirdJump);
document.addEventListener('touchstart', (e) => {
    if (gameState.isPlaying && e.target === gameCanvasEl) {
        makeBirdJump();
    }
});

// ============================================
// PIPE MANAGEMENT
// ============================================

let spawnIntervalId = null;

function startPipeSpawning() {
    spawnIntervalId = setInterval(() => {
        if (gameState.isPlaying) {
            spawnPipePair();
        }
    }, gameConfig.spawnRate);
}

function stopPipeSpawning() {
    if (spawnIntervalId) {
        clearInterval(spawnIntervalId);
        spawnIntervalId = null;
    }
}

function spawnPipePair() {
    // Random height for top pipe
    const topHeight = Math.random() * 
        (gameConfig.maxPipeHeight - gameConfig.minPipeHeight) + 
        gameConfig.minPipeHeight;

    // Create upper pipe
    createPipe(topHeight, 'upper');

    // Create lower pipe
    const lowerY = topHeight + gameConfig.pipeGap;
    createPipe(lowerY, 'lower');

    // Increase spawn count
    gameState.pipesSpawned++;
}

function createPipe(yPosition, type) {
    const pipe = document.createElement('div');
    pipe.className = `pipe ${type}`;
    pipe.style.top = yPosition + 'px';
    pipe.style.right = '-' + gameConfig.pipeWidth + 'px';
    pipe.style.height = '200px';

    gameCanvasEl.appendChild(pipe);

    // Animate pipe
    let pipeX = window.innerWidth;
    const movePipeId = setInterval(() => {
        pipeX -= gameConfig.pipeSpeed;
        pipe.style.right = (window.innerWidth - pipeX) + 'px';

        // Remove pipe when off screen
        if (pipeX < -gameConfig.pipeWidth) {
            clearInterval(movePipeId);
            pipe.remove();

            // Increase score when pipe passes bird
            if (type === 'upper' && pipeX < bird.x) {
                incrementScore();
            }
        }
    }, 30);

    // Store interval ID for cleanup
    pipe.dataset.intervalId = movePipeId;
}

function updatePipes() {
    // This is handled by the animation interval above
    // This function can be used for other pipe logic if needed
}

function clearAllPipes() {
    const pipes = gameCanvasEl.querySelectorAll('.pipe');
    pipes.forEach(pipe => {
        pipe.remove();
    });
}

// ============================================
// COLLISION DETECTION
// ============================================

function checkCollisions() {
    const birdRect = {
        x: bird.x,
        y: bird.y,
        width: bird.width,
        height: bird.height
    };

    const pipes = gameCanvasEl.querySelectorAll('.pipe');

    for (let pipe of pipes) {
        const rect = pipe.getBoundingClientRect();
        const canvasRect = gameCanvasEl.getBoundingClientRect();

        const pipeRect = {
            x: rect.left - canvasRect.left,
            y: rect.top - canvasRect.top,
            width: rect.width,
            height: rect.height
        };

        // Detailed collision check
        if (!(birdRect.x + birdRect.width < pipeRect.x ||
              birdRect.x > pipeRect.x + pipeRect.width ||
              birdRect.y + birdRect.height < pipeRect.y ||
              birdRect.y > pipeRect.y + pipeRect.height)) {
            return true; // Collision detected
        }
    }

    return false; // No collision
}

// ============================================
// SCORING
// ============================================

function incrementScore() {
    gameState.score++;
    updateScoreDisplay();
    updateProgressBar();

    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('flappyMarioHighScore', gameState.highScore);
    }
}

function updateScoreDisplay() {
    scoreValueEl.textContent = gameState.score;
}

function updateProgressBar() {
    // Progress based on score (every 10 points = 10%)
    const percentage = Math.min((gameState.score / 100) * 100, 100);
    progressFillEl.style.width = percentage + '%';
}

// ============================================
// GAME START
// ============================================

document.getElementById('startBtn').addEventListener('click', startGame);

function startGame() {
    // Reset game state
    gameState.isPlaying = true;
    gameState.gameOver = false;
    gameState.score = 0;
    gameState.pipesSpawned = 0;

    // Reset bird
    bird.y = 300;
    bird.velocity = 0;

    // Clear pipes
    clearAllPipes();

    // Update UI
    updateScoreDisplay();
    updateProgressBar();

    // Show game screen
    showScene('gameScreen');

    // Start game
    startPipeSpawning();
    gameLoop();
}

// ============================================
// GAME END
// ============================================

function endGame() {
    gameState.isPlaying = false;
    gameState.gameOver = true;

    // Stop everything
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
    }
    stopPipeSpawning();

    // Update game over screen
    finalScoreEl.textContent = gameState.score;
    pipesPassed.textContent = gameState.pipesSpawned;

    // Show game over screen (with delay for dramatic effect)
    setTimeout(() => {
        showScene('gameOverScreen');
    }, 500);
}

// Retry button
document.getElementById('retryBtn').addEventListener('click', startGame);

// Main menu button
document.getElementById('mainMenuBtn').addEventListener('click', () => {
    clearAllPipes();
    showScene('startScreen');
});

// ============================================
// INITIALIZATION
// ============================================

// Show start screen on load
window.addEventListener('load', () => {
    showScene('startScreen');
    console.log('🎮 Flappy Mario loaded! High Score:', gameState.highScore);
});

// ============================================
// FULLSCREEN SUPPORT (Optional)
// ============================================

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Bonus: Pause with P key
document.addEventListener('keydown', (e) => {
    if (e.key.toUpperCase() === 'P' && gameState.isPlaying) {
        gameState.isPlaying = false;
        console.log('⏸️ Game paused');
    } else if (e.key.toUpperCase() === 'P' && gameState.gameOver === false) {
        gameState.isPlaying = true;
        gameLoop();
        console.log('▶️ Game resumed');
    }
});

console.log('Game logic loaded ✓');

