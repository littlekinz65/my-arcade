// js/snake.js

const mySupabase = window.supabaseClient;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // This gives us the tools to draw 2D shapes
const scoreDisplay = document.getElementById('score-display');
const gameOverText = document.getElementById('game-over-text');

// Game Settings
const gridSize = 20; // The size of each square of the snake
let snake = [{x: 200, y: 200}]; // The snake starts in the middle
let food = {x: 100, y: 100};
let dx = gridSize; // Snake moves right by default
let dy = 0;
let score = 0;
let gameLoop;

// Function to put the food in a random spot
function placeFood() {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
}

// The Main Game Loop (Runs constantly)
function drawGame() {
    // 1. Calculate where the new head of the snake will be
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head); // Add the new head to the snake body

    // 2. Did the snake eat the food?
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.innerText = score;
        placeFood(); // Move food to new spot
    } else {
        snake.pop(); // Remove the tail piece so the snake doesn't grow infinitely
    }

    // 3. Did the snake crash into a wall or itself?
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || isSnakeCollision(head)) {
        clearInterval(gameLoop); // Stop the game loop
        gameOverText.style.display = 'block'; // Show Game Over text
        saveScoreToDatabase(score); // Send the score to Supabase
        return;
    }

    // 4. Draw the black background to clear the old frames
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 5. Draw the neon red food
    ctx.fillStyle = '#e94560'; 
    ctx.fillRect(food.x, food.y, gridSize - 2, gridSize - 2);

    // 6. Draw the cyan snake
    ctx.fillStyle = '#43bccd'; 
    snake.forEach(part => {
        ctx.fillRect(part.x, part.y, gridSize - 2, gridSize - 2);
    });
}

// Check if the snake's head hit its own body
function isSnakeCollision(head) {
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
}

// Listen for keyboard arrows to change direction
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -gridSize; }
    if (event.key === 'ArrowDown' && dy === 0) { dx = 0; dy = gridSize; }
    if (event.key === 'ArrowLeft' && dx === 0) { dx = -gridSize; dy = 0; }
    if (event.key === 'ArrowRight' && dx === 0) { dx = gridSize; dy = 0; }
});

// Send the final score to Supabase
async function saveScoreToDatabase(finalScore) {
    // Check who is currently logged in
    const { data: { user } } = await mySupabase.auth.getUser();
    
    if (user) {
        // Insert a new row into the 'scores' table we created
        const { error } = await mySupabase.from('scores').insert([
            { user_email: user.email, game: 'Snake', score: finalScore }
        ]);
        
        if (error) {
            console.error("Database error:", error);
        } else {
            console.log("Score successfully saved to database!");
        }
    }
}

// Start the game!
placeFood();
gameLoop = setInterval(drawGame, 100); // 100 milliseconds = runs 10 times a second