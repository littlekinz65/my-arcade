// js/calculator.js

const mySupabase = window.supabaseClient;
const display = document.getElementById('calc-display');
const historyList = document.getElementById('history-list');

// Variables to remember what the user is typing
let currentInput = '';
let previousInput = '';
let operator = undefined;
let userEmail = '';

// 1. MATH LOGIC
function appendNumber(number) {
    if (number === '.' && currentInput.includes('.')) return; // Prevent double decimals
    currentInput = currentInput.toString() + number.toString();
    updateDisplay();
}

function chooseOperation(op) {
    if (currentInput === '') return;
    if (previousInput !== '') {
        compute();
    }
    operator = op;
    previousInput = currentInput;
    currentInput = '';
}

function clearDisplay() {
    currentInput = '';
    previousInput = '';
    operator = undefined;
    updateDisplay();
}

function updateDisplay() {
    display.innerText = currentInput || previousInput || '0';
}

async function compute() {
    let computation;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    
    if (isNaN(prev) || isNaN(current)) return;

    // Do the actual math based on the chosen operator
    switch (operator) {
        case '+': computation = prev + current; break;
        case '-': computation = prev - current; break;
        case '*': computation = prev * current; break;
        case '/': computation = prev / current; break;
        default: return;
    }

    // Create a string like "5 + 5 = 10"
    const equationString = `${prev} ${operator} ${current} = ${computation}`;
    
    currentInput = computation;
    operator = undefined;
    previousInput = '';
    updateDisplay();

    // Send it to the database!
    await saveCalculation(equationString);
}

// 2. DATABASE LOGIC

async function saveCalculation(equation) {
    if (!userEmail) return; // Don't save if no one is logged in

    const { error } = await mySupabase.from('calculations').insert([
        { user_email: userEmail, equation: equation }
    ]);

    if (!error) {
        loadHistory(); // Refresh the list on the screen
    }
}

async function loadHistory() {
    // Grab the current logged-in user
    const { data: { user } } = await mySupabase.auth.getUser();
    
    if (user) {
        userEmail = user.email;
        
        // Ask Supabase for all calculations by this user, ordered by newest first
        const { data, error } = await mySupabase
            .from('calculations')
            .select('*')
            .eq('user_email', userEmail)
            .order('created_at', { ascending: false });

        if (!error) {
            // Clear the "Loading..." text
            historyList.innerHTML = ''; 
            
            if (data.length === 0) {
                historyList.innerHTML = '<p style="font-size: 14px; color: #888;">No history yet.</p>';
                return;
            }

            // Loop through the data and create HTML for each row
            data.forEach(row => {
                const p = document.createElement('div');
                p.className = 'history-item';
                p.innerText = row.equation;
                historyList.appendChild(p);
            });
        }
    }
}

// When the page first loads, fetch the history!
loadHistory();