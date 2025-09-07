class Calculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.shouldResetDisplay = false;
        
        this.calculationDisplay = document.getElementById('calculation');
        this.resultDisplay = document.getElementById('result');
        this.calculator = document.getElementById('calculator');
        
        this.initializeEventListeners();
        this.updateDisplay();
    }
    
    initializeEventListeners() {
        // Button event listeners
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleButtonClick(button);
            });
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
    }
    
    handleButtonClick(button) {
        // Visual feedback
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
        
        const action = button.dataset.action;
        const number = button.dataset.number;
        
        if (number !== undefined) {
            this.inputNumber(number);
        } else {
            this.performAction(action);
        }
    }
    
    handleKeyPress(e) {
        e.preventDefault();
        
        const key = e.key;
        
        if (/[0-9]/.test(key)) {
            this.inputNumber(key);
        } else if (key === '.') {
            this.performAction('decimal');
        } else if (key === '+') {
            this.performAction('add');
        } else if (key === '-') {
            this.performAction('subtract');
        } else if (key === '*') {
            this.performAction('multiply');
        } else if (key === '/') {
            this.performAction('divide');
        } else if (key === 'Enter' || key === '=') {
            this.performAction('equals');
        } else if (key === 'Escape' || key.toLowerCase() === 'c') {
            this.performAction('clear');
        } else if (key === 'Backspace') {
            this.performAction('backspace');
        } else if (key === '%') {
            this.performAction('percentage');
        }
    }
    
    inputNumber(num) {
        if (this.waitingForOperand || this.shouldResetDisplay) {
            this.currentInput = num;
            this.waitingForOperand = false;
            this.shouldResetDisplay = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
        
        this.updateDisplay();
    }
    
    performAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'plus-minus':
                this.toggleSign();
                break;
            case 'percentage':
                this.percentage();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.performOperation(action);
                break;
            case 'equals':
                this.calculate();
                break;
            case 'backspace':
                this.backspace();
                break;
        }
    }
    
    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.shouldResetDisplay = false;
        this.clearActiveOperator();
        this.clearError();
        this.updateDisplay();
    }
    
    toggleSign() {
        if (this.currentInput !== '0') {
            this.currentInput = this.currentInput.startsWith('-') 
                ? this.currentInput.slice(1) 
                : '-' + this.currentInput;
            this.updateDisplay();
        }
    }
    
    percentage() {
        const value = parseFloat(this.currentInput);
        if (!isNaN(value)) {
            this.currentInput = (value / 100).toString();
            this.shouldResetDisplay = true;
            this.updateDisplay();
        }
    }
    
    inputDecimal() {
        if (this.waitingForOperand || this.shouldResetDisplay) {
            this.currentInput = '0.';
            this.waitingForOperand = false;
            this.shouldResetDisplay = false;
        } else if (this.currentInput.indexOf('.') === -1) {
            this.currentInput += '.';
        }
        
        this.updateDisplay();
    }
    
    backspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }
    
    performOperation(nextOperation) {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operation) {
            const currentValue = this.previousInput || 0;
            const newValue = this.performCalculation(currentValue, inputValue, this.operation);
            
            if (newValue === null) return;
            
            this.currentInput = String(newValue);
            this.previousInput = newValue;
        }
        
        this.waitingForOperand = true;
        this.operation = nextOperation;
        this.setActiveOperator(nextOperation);
        this.updateDisplay();
    }
    
    calculate() {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput !== '' && this.operation) {
            const currentValue = this.previousInput;
            const newValue = this.performCalculation(currentValue, inputValue, this.operation);
            
            if (newValue === null) return;
            
            this.currentInput = String(newValue);
            this.previousInput = '';
            this.operation = null;
            this.waitingForOperand = true;
            this.shouldResetDisplay = true;
            this.clearActiveOperator();
            this.updateDisplay();
        }
    }
    
    performCalculation(firstOperand, secondOperand, operation) {
        try {
            let result;
            
            switch (operation) {
                case 'add':
                    result = firstOperand + secondOperand;
                    break;
                case 'subtract':
                    result = firstOperand - secondOperand;
                    break;
                case 'multiply':
                    result = firstOperand * secondOperand;
                    break;
                case 'divide':
                    if (secondOperand === 0) {
                        this.showError('Cannot divide by zero');
                        return null;
                    }
                    result = firstOperand / secondOperand;
                    break;
                default:
                    return null;
            }
            
            // Handle floating point precision
            if (result % 1 !== 0) {
                result = parseFloat(result.toFixed(10));
            }
            
            // Check for overflow
            if (!isFinite(result)) {
                this.showError('Result too large');
                return null;
            }
            
            return result;
        } catch (error) {
            this.showError('Error');
            return null;
        }
    }
    
    setActiveOperator(operation) {
        this.clearActiveOperator();
        
        const operatorMap = {
            'add': '+',
            'subtract': '−',
            'multiply': '×',
            'divide': '÷'
        };
        
        const operatorButton = document.querySelector(`[data-action="${operation}"]`);
        if (operatorButton) {
            operatorButton.classList.add('active');
        }
    }
    
    clearActiveOperator() {
        document.querySelectorAll('.btn--operator').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    showError(message) {
        this.calculator.classList.add('display--error');
        this.resultDisplay.textContent = message;
        this.calculationDisplay.textContent = '';
        
        setTimeout(() => {
            this.clear();
        }, 2000);
    }
    
    clearError() {
        this.calculator.classList.remove('display--error');
    }
    
    formatNumber(num) {
        const number = parseFloat(num);
        
        if (isNaN(number)) return '0';
        
        // Handle very large or very small numbers
        if (Math.abs(number) >= 1e15 || (Math.abs(number) < 1e-6 && number !== 0)) {
            return number.toExponential(6);
        }
        
        // Format with appropriate decimal places
        const formatted = number.toString();
        
        // Limit display length
        if (formatted.length > 12) {
            if (formatted.includes('.')) {
                const parts = formatted.split('.');
                const availableDecimals = 12 - parts[0].length - 1;
                return availableDecimals > 0 ? 
                    number.toFixed(availableDecimals) : 
                    parts[0];
            }
            return number.toExponential(6);
        }
        
        return formatted;
    }
    
    getCalculationDisplay() {
        if (this.previousInput === '' && this.operation === null) {
            return '';
        }
        
        let display = '';
        
        if (this.previousInput !== '') {
            display += this.formatNumber(this.previousInput);
        }
        
        if (this.operation) {
            const operatorMap = {
                'add': '+',
                'subtract': '−',
                'multiply': '×',
                'divide': '÷'
            };
            display += ` ${operatorMap[this.operation]}`;
            
            if (!this.waitingForOperand) {
                display += ` ${this.formatNumber(this.currentInput)}`;
            }
        }
        
        return display;
    }
    
    updateDisplay() {
        this.resultDisplay.textContent = this.formatNumber(this.currentInput);
        this.calculationDisplay.textContent = this.getCalculationDisplay();
    }
}

// Theme management
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || 'light';
        this.themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
        
        this.applyTheme(this.currentTheme);
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        this.themeToggleCheckbox.addEventListener('change', () => {
            this.toggleTheme();
        });
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.storeTheme(this.currentTheme);
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.themeToggleCheckbox.checked = theme === 'dark';
    }
    
    getStoredTheme() {
        return localStorage.getItem('calculator-theme');
    }
    
    storeTheme(theme) {
        localStorage.setItem('calculator-theme', theme);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
    new ThemeManager();
});

// Add some visual enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 1;
            `;
            
            // Add ripple CSS if not already added
            if (!document.querySelector('#ripple-style')) {
                const style = document.createElement('style');
                style.id = 'ripple-style';
                style.textContent = `
                    @keyframes ripple {
                        to {
                            transform: scale(2);
                            opacity: 0;
                        }
                    }
                    .btn {
                        position: relative;
                        overflow: hidden;
                    }
                `;
                document.head.appendChild(style);
            }
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});