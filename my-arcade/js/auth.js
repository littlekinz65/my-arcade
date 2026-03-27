// js/auth.js

// We changed the name here to 'mySupabase' to avoid the collision!
const mySupabase = window.supabaseClient;

// ==========================================
// 1. SIGN UP LOGIC
// ==========================================
const signupBtn = document.getElementById('signup-btn');
if (signupBtn) {
    signupBtn.addEventListener('click', async () => {
        const name = document.getElementById('signup-name').value;
        const age = parseInt(document.getElementById('signup-age').value); 
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        if (age < 18) {
            alert("Sorry, you must be 18 or older to access the arcade.");
            return; 
        }

        if (!email || !password || !name) {
            alert("Please fill in all fields.");
            return;
        }

        // Using our new mySupabase name here
        const { data, error } = await mySupabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name,
                    age: age
                }
            }
        });

        if (error) {
            alert("Error signing up: " + error.message);
        } else {
            alert("Success! Check your email to verify your account, then log in.");
            document.getElementById('signup-section').style.display = 'none';
            document.getElementById('login-section').style.display = 'block';
        }
    });
}

// ==========================================
// 2. LOG IN LOGIC
// ==========================================
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        // Using our new mySupabase name here
        const { data, error } = await mySupabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            alert("Error logging in: " + error.message);
        } else {
            window.location.href = 'dashboard.html';
        }
    });
}

// ==========================================
// 3. LOG OUT LOGIC (For the Dashboard)
// ==========================================
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        // Using our new mySupabase name here
        const { error } = await mySupabase.auth.signOut();
        if (error) {
            alert("Error logging out: " + error.message);
        } else {
            window.location.href = 'index.html';
        }
    });
}