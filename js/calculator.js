// js/calculator.js

const mySupabase = window.supabaseClient;
const display = document.getElementById('calc-display');
const historyList = document.getElementById('history-list');

let currentInput = '';
let previousInput = '';
let operator = undefined;
let userEmail = '';

// 1. THE AUTH GUARD
async function checkAuth() {
    const { data: { session }, error } = await mySupabase.auth.getSession();
    
    if (error || !session) {
        window.location.href = 'index.html'; // Kick out unauthorized users
    } else {
        // Save the active user's email so we can use it for calculations
        userEmail = session.user.email;
        loadHistory(); 
    }
}

// MATH LOGIC
function appendNumber(number) {
    if (number === '.' && currentInput.includes('.')) return; 
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

    switch (operator) {
        case '+': computation = prev + current; break;
        case '-': computation = prev - current; break;
        case '*': computation = prev * current; break;
        case '/': computation = prev / current; break;
        default: return;
    }

    const equationString = `${prev} ${operator} ${current} = ${computation}`;
    
    currentInput = computation;
    operator = undefined;
    previousInput = '';
    updateDisplay();

    await saveCalculation(equationString);
}

// DATABASE LOGIC
async function saveCalculation(equation) {
    if (!userEmail) return; 

    const { error } = await mySupabase.from('calculations').insert([
        { user_email: userEmail, equation: equation }
    ]);

    if (!error) {
        loadHistory(); 
    }
}

async function loadHistory() {
    if (!userEmail) return;

    const { data, error } = await mySupabase
        .from('calculations')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

    if (!error) {
        historyList.innerHTML = ''; 
        
        if (data.length === 0) {
            historyList.innerHTML = '<p style="font-size: 14px; color: #888;">No history yet.</p>';
            return;
        }

        data.forEach(row => {
            const p = document.createElement('div');
            p.className = 'history-item';
            p.innerText = row.equation;
            historyList.appendChild(p);
        });
    }
}

// Run the Auth Guard immediately when the page loads
checkAuth();
