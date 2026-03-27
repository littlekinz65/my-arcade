// js/dashboard.js

const mySupabase = window.supabaseClient;
const leaderboardList = document.getElementById('leaderboard-list');

async function loadHighScores() {
    // 1. Ask Supabase for the data
    const { data, error } = await mySupabase
        .from('scores')
        .select('user_email, score')
        .eq('game', 'Snake') // Only get Snake scores
        .order('score', { ascending: false }) // Highest score at the top
        .limit(5); // Only grab the top 5

    // 2. If there's an error, log it
    if (error) {
        console.error("Error fetching scores:", error);
        leaderboardList.innerHTML = '<p style="color: #e94560;">Failed to load scores.</p>';
        return;
    }

    // 3. If no one has played yet
    if (data.length === 0) {
        leaderboardList.innerHTML = '<p style="color: #888;">No scores yet. Be the first!</p>';
        return;
    }

    // 4. Clear the "Loading..." text
    leaderboardList.innerHTML = '';

    // 5. Loop through the scores and put them on the screen
    data.forEach((entry, index) => {
        const item = document.createElement('div');
        item.style.padding = '8px 0';
        item.style.borderBottom = '1px solid #16213e';
        item.style.fontSize = '18px';
        
        // Let's chop off the "@email.com" part so we only show the username for privacy!
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

// Run the function as soon as the dashboard loads!
loadHighScores();