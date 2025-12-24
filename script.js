// Calculator State
let currentInput = '0';
let previousInput = '';
let operator = '';
let shouldResetDisplay = false;
let wrongMode = true; // Start in wrong mode

// DOM Elements
const displayExpression = document.getElementById('expression');
const displayResult = document.getElementById('result');
const modeBtn = document.getElementById('modeBtn');
const modeText = document.getElementById('modeText');
const emojiReaction = document.getElementById('emojiReaction');

// Emoji reactions for wrong calculations
const wrongEmojis = ['😄', '🤪', '😅', '🙃', '😉', '🤔', '😏'];
const correctEmojis = ['✅', '🎯', '👍', '✨', '💯'];

/**
 * Generate a believable wrong result
 * The wrong result should be close to the correct answer but intentionally incorrect
 */
function makeWrongResult(correctResult) {
    if (!wrongMode) {
        return correctResult;
    }

    // Convert to number for calculations
    const num = parseFloat(correctResult);
    
    // Different wrong calculation strategies based on the result
    let wrongResult;
    
    if (num === 0) {
        // For zero, make it slightly off
        wrongResult = Math.random() < 0.5 ? 1 : -1;
    } else if (Math.abs(num) < 10) {
        // For small numbers, add/subtract 1-3
        const offset = Math.floor(Math.random() * 3) + 1;
        wrongResult = num + (Math.random() < 0.5 ? offset : -offset);
    } else if (Math.abs(num) < 100) {
        // For medium numbers, add/subtract 2-5
        const offset = Math.floor(Math.random() * 4) + 2;
        wrongResult = num + (Math.random() < 0.5 ? offset : -offset);
    } else {
        // For large numbers, add/subtract a percentage (5-15%)
        const percentage = (Math.random() * 0.1 + 0.05) * (Math.random() < 0.5 ? 1 : -1);
        wrongResult = num * (1 + percentage);
    }
    
    // Round to reasonable decimal places
    if (Number.isInteger(num)) {
        wrongResult = Math.round(wrongResult);
    } else {
        // Keep similar decimal places as original
        const decimals = correctResult.toString().split('.')[1]?.length || 0;
        wrongResult = parseFloat(wrongResult.toFixed(Math.min(decimals, 2)));
    }
    
    return wrongResult;
}

/**
 * Perform the actual calculation (correctly)
 */
function calculate(a, b, op) {
    const num1 = parseFloat(a);
    const num2 = parseFloat(b);
    
    switch (op) {
        case '+':
            return num1 + num2;
        case '-':
            return num1 - num2;
        case '×':
            return num1 * num2;
        case '÷':
            if (num2 === 0) {
                return 'Error';
            }
            return num1 / num2;
        default:
            return num2;
    }
}

/**
 * Update the display with current input
 */
function updateDisplay() {
    displayResult.textContent = currentInput;
    
    // Show expression if there's an operation
    if (previousInput && operator) {
        displayExpression.textContent = `${previousInput} ${operator} ${currentInput}`;
    } else {
        displayExpression.textContent = '';
    }
}

/**
 * Show emoji reaction
 */
function showEmoji() {
    const emojis = wrongMode ? wrongEmojis : correctEmojis;
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    emojiReaction.textContent = randomEmoji;
    emojiReaction.classList.add('show');
    
    setTimeout(() => {
        emojiReaction.classList.remove('show');
    }, 600);
}

/**
 * Handle number button clicks
 */
function handleNumber(number) {
    if (shouldResetDisplay) {
        currentInput = '0';
        shouldResetDisplay = false;
    }
    
    if (currentInput === '0') {
        currentInput = number;
    } else {
        currentInput += number;
    }
    
    updateDisplay();
}

/**
 * Handle operator button clicks
 */
function handleOperator(op) {
    if (previousInput && operator && !shouldResetDisplay) {
        // Calculate previous operation first
        const correctResult = calculate(previousInput, currentInput, operator);
        const result = makeWrongResult(correctResult);
        currentInput = result.toString();
        updateDisplay();
        showEmoji();
    }
    
    previousInput = currentInput;
    operator = op;
    shouldResetDisplay = true;
}

/**
 * Handle equals button click
 */
function handleEquals() {
    if (!previousInput || !operator) {
        return;
    }
    
    // Perform the correct calculation
    const correctResult = calculate(previousInput, currentInput, operator);
    
    // Make it wrong if in wrong mode
    const result = makeWrongResult(correctResult);
    
    // Update display
    displayExpression.textContent = `${previousInput} ${operator} ${currentInput} =`;
    currentInput = result.toString();
    displayResult.textContent = currentInput;
    
    // Show emoji reaction
    showEmoji();
    
    // Reset for next calculation
    previousInput = '';
    operator = '';
    shouldResetDisplay = true;
}

/**
 * Handle clear button
 */
function handleClear() {
    currentInput = '0';
    previousInput = '';
    operator = '';
    shouldResetDisplay = false;
    updateDisplay();
}

/**
 * Handle clear entry button
 */
function handleClearEntry() {
    currentInput = '0';
    updateDisplay();
}

/**
 * Handle backspace button
 */
function handleBackspace() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

/**
 * Handle decimal point
 */
function handleDecimal() {
    if (shouldResetDisplay) {
        currentInput = '0';
        shouldResetDisplay = false;
    }
    
    if (!currentInput.includes('.')) {
        currentInput += '.';
    }
    
    updateDisplay();
}

/**
 * Toggle between wrong and correct mode
 */
function toggleMode() {
    wrongMode = !wrongMode;
    modeText.textContent = wrongMode ? 'Wrong Mode' : 'Correct Mode';
    const indicator = modeBtn.querySelector('.mode-indicator');
    indicator.textContent = wrongMode ? '🔴' : '🟢';
    
    // Show a brief message
    const tempText = wrongMode ? 'Math is optional 😄' : 'Math is correct ✅';
    const subtitle = document.querySelector('.subtitle');
    const originalText = subtitle.textContent;
    subtitle.textContent = tempText;
    
    setTimeout(() => {
        subtitle.textContent = originalText;
    }, 2000);
}

// Event Listeners for Buttons
document.querySelectorAll('.btn-number').forEach(button => {
    button.addEventListener('click', () => {
        const number = button.getAttribute('data-number');
        handleNumber(number);
    });
});

document.querySelectorAll('.btn-operator').forEach(button => {
    button.addEventListener('click', () => {
        const operator = button.getAttribute('data-operator');
        if (operator) {
            handleOperator(operator);
        } else {
            // Backspace button
            handleBackspace();
        }
    });
});

document.querySelector('[data-action="equals"]').addEventListener('click', handleEquals);
document.querySelector('[data-action="clear"]').addEventListener('click', handleClear);
document.querySelector('[data-action="clearEntry"]').addEventListener('click', handleClearEntry);
document.querySelector('[data-action="decimal"]').addEventListener('click', handleDecimal);
modeBtn.addEventListener('click', toggleMode);

// Keyboard Support
document.addEventListener('keydown', (e) => {
    // Prevent default behavior for calculator keys
    if (/[0-9+\-*/.=]/.test(e.key) || e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Escape') {
        e.preventDefault();
    }
    
    // Number keys
    if (/[0-9]/.test(e.key)) {
        handleNumber(e.key);
    }
    
    // Operator keys
    if (e.key === '+') {
        handleOperator('+');
    } else if (e.key === '-') {
        handleOperator('-');
    } else if (e.key === '*' || e.key === '×') {
        handleOperator('×');
    } else if (e.key === '/') {
        handleOperator('÷');
    }
    
    // Equals
    if (e.key === '=' || e.key === 'Enter') {
        handleEquals();
    }
    
    // Decimal
    if (e.key === '.') {
        handleDecimal();
    }
    
    // Backspace
    if (e.key === 'Backspace') {
        handleBackspace();
    }
    
    // Escape (clear)
    if (e.key === 'Escape') {
        handleClear();
    }
});

// Initialize display
updateDisplay();

