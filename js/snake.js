// js/snake.js

const mySupabase = window.supabaseClient;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); 
const scoreDisplay = document.getElementById('score-display');
const gameOverText = document.getElementById('game-over-text');

let currentUserEmail = null;

// 1. THE AUTH GUARD
async function checkAuth() {
    const { data: { session }, error } = await mySupabase.auth.getSession();
    
    if (error || !session) {
        window.location.href = 'index.html'; // Kick out unauthorized users
    } else {
        currentUserEmail = session.user.email;
        // Start the game only after we confirm they are logged in!
        placeFood();
        gameLoop = setInterval(drawGame, 100); 
    }
}

// Game Settings
const gridSize = 20; 
let snake = [{x: 200, y: 200}]; 
let food = {x: 100, y: 100};
let dx = gridSize; 
let dy = 0;
let score = 0;
let gameLoop;

function placeFood() {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
}

function drawGame() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head); 

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        if(scoreDisplay) scoreDisplay.innerText = score;
        placeFood(); 
    } else {
        snake.pop(); 
    }

    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || isSnakeCollision(head)) {
        clearInterval(gameLoop); 
        if(gameOverText) gameOverText.style.display = 'block'; 
        saveScoreToDatabase(score); 
        return;
    }

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e94560'; 
    ctx.fillRect(food.x, food.y, gridSize - 2, gridSize - 2);

    ctx.fillStyle = '#43bccd'; 
    snake.forEach(part => {
        ctx.fillRect(part.x, part.y, gridSize - 2, gridSize - 2);
    });
}

function isSnakeCollision(head) {
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -gridSize; }
    if (event.key === 'ArrowDown' && dy === 0) { dx = 0; dy = gridSize; }
    if (event.key === 'ArrowLeft' && dx === 0) { dx = -gridSize; dy = 0; }
    if (event.key === 'ArrowRight' && dx === 0) { dx = gridSize; dy = 0; }
});

async function saveScoreToDatabase(finalScore) {
    if (currentUserEmail) {
        const { error } = await mySupabase.from('scores').insert([
            { user_email: currentUserEmail, game: 'Snake', score: finalScore }
        ]);
        
        if (error) {
            console.error("Database error:", error);
        } else {
            console.log("Score successfully saved to database!");
        }
    }
}

// Run the auth check on load instead of starting the game immediately
checkAuth();
