// js/dashboard.js

const mySupabase = window.supabaseClient;
const leaderboardList = document.getElementById('leaderboard-list');

// 1. THE AUTH GUARD: Check if logged in before doing anything!
async function checkAuth() {
    const { data: { session }, error } = await mySupabase.auth.getSession();
    
    // If no session exists, kick them back to the login page
    if (error || !session) {
        window.location.href = 'index.html';
    } else {
        // If they are logged in, load the scores safely
        loadHighScores();
    }
}

async function loadHighScores() {
    // Ask Supabase for the data
    const { data, error } = await mySupabase
        .from('scores')
        .select('user_email, score')
        .eq('game', 'Snake') // Only get Snake scores
        .order('score', { ascending: false }) // Highest score at the top
        .limit(5); // Only grab the top 5

    if (error) {
        console.error("Error fetching scores:", error);
        leaderboardList.innerHTML = '<p style="color: #e94560;">Failed to load scores.</p>';
        return;
    }

    if (data.length === 0) {
        leaderboardList.innerHTML = '<p style="color: #888;">No scores yet. Be the first!</p>';
        return;
    }

    leaderboardList.innerHTML = '';

    data.forEach((entry, index) => {
        const item = document.createElement('div');
        item.style.padding = '8px 0';
        item.style.borderBottom = '1px solid #16213e';
        item.style.fontSize = '18px';
        
        // Chop off the "@email.com" part to show username
        const username = entry.user_email.split('@')[0];
        
        // Add Medals for top 3
        let rank = `#${index + 1}`;
        if (index === 0) rank = '🥇';
        if (index === 1) rank = '🥈';
        if (index === 2) rank = '🥉';

        item.innerText = `${rank} ${username}: ${entry.score} pts`;
        leaderboardList.appendChild(item);
    });
}

// Run the Auth Guard immediately when the page loads
checkAuth();
