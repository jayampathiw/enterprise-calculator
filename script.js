/**
 * @fileoverview Enterprise Calculator with Advanced Design Patterns
 * Implements: Singleton, Strategy, Command, Observer, Factory, State patterns
 * Features: Memory functions, History, Undo/Redo, Themes, Persistence, Error handling
 */

// 1. SINGLETON PATTERN - Logger Service
const Logger = (() => {
    let instance;
    
    function createInstance() {
        const logs = [];
        
        return {
            log: (level, message, data = null) => {
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    level,
                    message,
                    data
                };
                logs.push(logEntry);
                console.log(`[${level.toUpperCase()}] ${message}`, data || '');
            },
            getLogs: () => [...logs],
            clearLogs: () => logs.length = 0
        };
    }
    
    return {
        getInstance: () => {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

// 2. STRATEGY PATTERN - Calculation Strategies
const CalculationStrategies = {
    basic: {
        operations: {
            '+': (a, b) => a + b,
            '-': (a, b) => a - b,
            '*': (a, b) => a * b,
            '/': (a, b) => {
                if (b === 0) throw new Error('Division by zero');
                return a / b;
            },
            '%': (a, b) => a % b
        }
    },
    scientific: {
        operations: {
            sin: (x) => Math.sin(x * Math.PI / 180), // Convert to radians
            cos: (x) => Math.cos(x * Math.PI / 180),
            tan: (x) => Math.tan(x * Math.PI / 180),
            log: (x) => {
                if (x <= 0) throw new Error('Invalid logarithm input');
                return Math.log10(x);
            },
            ln: (x) => {
                if (x <= 0) throw new Error('Invalid natural logarithm input');
                return Math.log(x);
            },
            sqrt: (x) => {
                if (x < 0) throw new Error('Invalid square root input');
                return Math.sqrt(x);
            },
            power: (x) => Math.pow(x, 2),
            factorial: (x) => {
                if (x < 0 || !Number.isInteger(x) || x > 170) {
                    throw new Error('Invalid factorial input');
                }
                if (x === 0 || x === 1) return 1;
                let result = 1;
                for (let i = 2; i <= x; i++) {
                    result *= i;
                }
                return result;
            }
        }
    }
};

// 3. COMMAND PATTERN - For Undo/Redo functionality
class Command {
    execute() { throw new Error('Execute method must be implemented'); }
    undo() { throw new Error('Undo method must be implemented'); }
}

class CalculationCommand extends Command {
    constructor(calculator, operation, operand) {
        super();
        this.calculator = calculator;
        this.operation = operation;
        this.operand = operand;
        this.previousState = null;
    }

    execute() {
        this.previousState = this.calculator.getState();
        return this.calculator.performOperation(this.operation, this.operand);
    }

    undo() {
        if (this.previousState) {
            this.calculator.setState(this.previousState);
        }
    }
}

class CommandHistory {
    constructor() {
        this.commands = [];
        this.currentIndex = -1;
        this.maxHistory = 50;
    }

    execute(command) {
        // Remove any commands after current index
        this.commands = this.commands.slice(0, this.currentIndex + 1);
        
        const result = command.execute();
        this.commands.push(command);
        this.currentIndex++;
        
        // Limit history size
        if (this.commands.length > this.maxHistory) {
            this.commands.shift();
            this.currentIndex--;
        }
        
        return result;
    }

    undo() {
        if (this.currentIndex >= 0) {
            const command = this.commands[this.currentIndex];
            command.undo();
            this.currentIndex--;
            return true;
        }
        return false;
    }

    canUndo() {
        return this.currentIndex >= 0;
    }
}

// 4. OBSERVER PATTERN - Event System
class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    off(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    }

    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
        }
    }
}

// 5. STATE PATTERN - Calculator States
class CalculatorState {
    constructor(context) {
        this.context = context;
    }

    handleInput(input) { throw new Error('handleInput must be implemented'); }
}

class IdleState extends CalculatorState {
    handleInput(input) {
        if (input.type === 'number') {
            this.context.setState(new InputtingState(this.context));
            return this.context.handleInput(input);
        }
        return this.context.getCurrentValue();
    }
}

class InputtingState extends CalculatorState {
    handleInput(input) {
        if (input.type === 'operator') {
            this.context.setState(new OperatorState(this.context));
            return this.context.handleInput(input);
        }
        // Continue inputting numbers
        return input.value;
    }
}

class OperatorState extends CalculatorState {
    handleInput(input) {
        if (input.type === 'number') {
            this.context.setState(new InputtingState(this.context));
            return this.context.handleInput(input);
        }
        return this.context.getCurrentValue();
    }
}

// 6. REPOSITORY PATTERN - Data Persistence
class StorageRepository {
    constructor(storageKey = 'calculator-data') {
        this.storageKey = storageKey;
    }

    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            Logger.getInstance().log('error', 'Failed to save data', error);
            return false;
        }
    }

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            Logger.getInstance().log('error', 'Failed to load data', error);
            return null;
        }
    }

    clear() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            Logger.getInstance().log('error', 'Failed to clear data', error);
            return false;
        }
    }
}

// 7. ENHANCED CALCULATOR MODEL with multiple patterns
const CalculatorModel = (() => {
    // Private state
    let currentValue = '0';
    let previousValue = '';
    let operator = null;
    let isWaitingForOperand = false;
    let history = '';
    let memoryValue = 0;
    let calculationHistory = [];
    let currentStrategy = 'basic';
    let currentState = null;
    
    const eventEmitter = new EventEmitter();
    const commandHistory = new CommandHistory();
    const storage = new StorageRepository();
    const logger = Logger.getInstance();

    // Load saved data on initialization
    const savedData = storage.load();
    if (savedData) {
        memoryValue = savedData.memoryValue || 0;
        calculationHistory = savedData.calculationHistory || [];
    }

    // Private methods
    const saveState = () => {
        storage.save({
            memoryValue,
            calculationHistory
        });
    };

    const formatNumber = (number) => {
        if (isNaN(number) || !isFinite(number)) {
            throw new Error('Invalid number');
        }
        
        const numStr = number.toString();
        if (numStr.length > 12) {
            return Number(number).toExponential(5);
        }
        
        // Format large numbers with commas
        if (Math.abs(number) >= 1000 && numStr.indexOf('.') === -1) {
            return number.toLocaleString();
        }
        
        return numStr;
    };

    const addToHistory = (expression, result) => {
        const historyItem = {
            id: Date.now(),
            expression,
            result,
            timestamp: new Date().toISOString()
        };
        
        calculationHistory.unshift(historyItem);
        
        // Limit history size
        if (calculationHistory.length > 100) {
            calculationHistory = calculationHistory.slice(0, 100);
        }
        
        saveState();
        eventEmitter.emit('historyUpdated', calculationHistory);
    };

    // Public interface
    return {
        // Event system
        on: (event, callback) => eventEmitter.on(event, callback),
        off: (event, callback) => eventEmitter.off(event, callback),

        // State management
        getState: () => ({
            currentValue,
            previousValue,
            operator,
            isWaitingForOperand,
            history,
            memoryValue
        }),

        setState: (state) => {
            currentValue = state.currentValue;
            previousValue = state.previousValue;
            operator = state.operator;
            isWaitingForOperand = state.isWaitingForOperand;
            history = state.history;
            memoryValue = state.memoryValue;
            eventEmitter.emit('stateChanged', state);
        },

        // Getters
        getCurrentValue: () => currentValue,
        getPreviousValue: () => previousValue,
        getOperator: () => operator,
        getHistory: () => history,
        getMemoryValue: () => memoryValue,
        getCalculationHistory: () => [...calculationHistory],
        isWaitingForOperand: () => isWaitingForOperand,

        // Setters with validation
        setCurrentValue: (value) => {
            if (typeof value !== 'string') {
                throw new Error('Current value must be a string');
            }
            currentValue = value;
            eventEmitter.emit('valueChanged', value);
        },

        setPreviousValue: (value) => { previousValue = value; },
        setOperator: (op) => { operator = op; },
        setHistory: (hist) => { history = hist; },
        setWaitingForOperand: (waiting) => { isWaitingForOperand = waiting; },

        // Strategy pattern implementation
        setStrategy: (strategy) => {
            if (!CalculationStrategies[strategy]) {
                throw new Error(`Unknown strategy: ${strategy}`);
            }
            currentStrategy = strategy;
            logger.log('info', `Strategy changed to: ${strategy}`);
        },

        // Enhanced calculation with error handling
        calculate: (op, a, b) => {
            try {
                const strategy = CalculationStrategies[currentStrategy];
                if (!strategy.operations[op]) {
                    throw new Error(`Unknown operation: ${op}`);
                }
                
                const result = strategy.operations[op](a, b);
                logger.log('info', `Calculation: ${a} ${op} ${b} = ${result}`);
                return result;
            } catch (error) {
                logger.log('error', 'Calculation error', error);
                throw error;
            }
        },

        // Scientific calculations
        scientificCalculate: (func, value) => {
            try {
                const strategy = CalculationStrategies.scientific;
                if (!strategy.operations[func]) {
                    throw new Error(`Unknown function: ${func}`);
                }
                
                const result = strategy.operations[func](value);
                logger.log('info', `Scientific calculation: ${func}(${value}) = ${result}`);
                return result;
            } catch (error) {
                logger.log('error', 'Scientific calculation error', error);
                throw error;
            }
        },

        // Memory operations
        memoryStore: (value) => {
            memoryValue = parseFloat(value) || 0;
            saveState();
            eventEmitter.emit('memoryChanged', memoryValue);
            logger.log('info', `Memory stored: ${memoryValue}`);
        },

        memoryRecall: () => {
            logger.log('info', `Memory recalled: ${memoryValue}`);
            return memoryValue.toString();
        },

        memoryAdd: (value) => {
            memoryValue += parseFloat(value) || 0;
            saveState();
            eventEmitter.emit('memoryChanged', memoryValue);
            logger.log('info', `Memory add: ${value}, new value: ${memoryValue}`);
        },

        memorySubtract: (value) => {
            memoryValue -= parseFloat(value) || 0;
            saveState();
            eventEmitter.emit('memoryChanged', memoryValue);
            logger.log('info', `Memory subtract: ${value}, new value: ${memoryValue}`);
        },

        memoryClear: () => {
            memoryValue = 0;
            saveState();
            eventEmitter.emit('memoryChanged', memoryValue);
            logger.log('info', 'Memory cleared');
        },

        // History management
        addCalculationToHistory: (expression, result) => {
            addToHistory(expression, result);
        },

        clearHistory: () => {
            calculationHistory = [];
            saveState();
            eventEmitter.emit('historyUpdated', calculationHistory);
            logger.log('info', 'History cleared');
        },

        // Command pattern for undo/redo
        getCommandHistory: () => commandHistory,

        // Validation
        validateInput: (input) => {
            if (typeof input !== 'string') return false;
            return /^[0-9+\-*/.%()=]$/.test(input);
        },

        // Reset with event emission
        reset: () => {
            const oldState = {
                currentValue,
                previousValue,
                operator,
                isWaitingForOperand,
                history
            };
            
            currentValue = '0';
            previousValue = '';
            operator = null;
            isWaitingForOperand = false;
            history = '';
            
            eventEmitter.emit('reset', oldState);
            logger.log('info', 'Calculator reset');
        },

        // Format number with error handling
        formatNumber: formatNumber,

        // Get constants
        getConstants: () => ({
            pi: Math.PI,
            e: Math.E
        })
    };
})();

// 8. ENHANCED VIEW with additional UI patterns
const CalculatorView = (() => {
    const elements = {
        display: document.getElementById('display'),
        current: document.getElementById('result'),
        history: document.getElementById('calculation'),
        memoryIndicator: document.getElementById('memoryIndicator'),
        keypad: document.getElementById('keypad'),
        scientificFunctions: document.getElementById('scientificFunctions'),
        memoryFunctions: document.getElementById('memoryFunctions'),
        historyPanel: document.getElementById('historyPanel'),
        toast: document.getElementById('toast'),
        modeToggles: document.querySelectorAll('.mode-toggle'),
        themeToggle: document.getElementById('theme-toggle-checkbox')
    };

    let currentTheme = 'light';
    let showingHistory = false;

    // Private methods
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const showToast = (message, type = 'success') => {
        elements.toast.textContent = message;
        elements.toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 3000);
    };

    const updateHistoryPanel = (historyItems) => {
        const historyContent = elements.historyPanel.querySelector('.history-content');
        historyContent.innerHTML = '';
        
        if (historyItems.length === 0) {
            historyContent.innerHTML = '<div class="history-item">No calculations yet</div>';
            return;
        }

        historyItems.forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item';
            historyElement.innerHTML = `
                <div>${item.expression} = ${item.result}</div>
                <div style="font-size: 0.75rem; opacity: 0.7;">
                    ${new Date(item.timestamp).toLocaleTimeString()}
                </div>
            `;
            historyElement.addEventListener('click', () => {
                CalculatorController.loadFromHistory(item.result);
            });
            historyContent.appendChild(historyElement);
        });
    };

    // Public interface
    return {
        // Display updates with animations
        updateDisplay: debounce((current, history = '') => {
            elements.current.textContent = current;
            elements.history.textContent = history;
        }, 16), // 60fps

        updateMemoryIndicator: (hasMemory) => {
            if (hasMemory) {
                elements.memoryIndicator.textContent = 'M';
                elements.memoryIndicator.classList.add('active');
            } else {
                elements.memoryIndicator.textContent = '';
                elements.memoryIndicator.classList.remove('active');
            }
        },

        showError: (message = 'Error') => {
            elements.display.classList.add('error-state');
            elements.current.textContent = message;
            showToast(message, 'error');
        },

        clearError: () => {
            elements.display.classList.remove('error-state');
        },

        showLoading: (button) => {
            button.classList.add('loading');
            button.disabled = true;
        },

        hideLoading: (button) => {
            button.classList.remove('loading');
            button.disabled = false;
        },

        toggleScientificMode: (isScientific) => {
            if (isScientific) {
                elements.scientificFunctions.classList.add('active');
                elements.keypad.classList.add('keypad--scientific');
            } else {
                elements.scientificFunctions.classList.remove('active');
                elements.keypad.classList.remove('keypad--scientific');
            }
        },

        toggleHistoryPanel: () => {
            showingHistory = !showingHistory;
            elements.historyPanel.classList.toggle('active', showingHistory);
            return showingHistory;
        },

        updateHistoryPanel: updateHistoryPanel,

        toggleTheme: () => {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.body.setAttribute('data-theme', currentTheme);
            elements.themeToggle.checked = currentTheme === 'dark';
            return currentTheme;
        },

        updateModeToggles: (activeMode) => {
            elements.modeToggles.forEach(toggle => {
                toggle.classList.toggle('active', toggle.dataset.mode === activeMode);
            });
        },

        showToast: showToast,

        // Enhanced button state management
        setButtonState: (selector, state) => {
            const button = document.querySelector(selector);
            if (button) {
                button.disabled = state === 'disabled';
                button.classList.toggle('active', state === 'active');
            }
        },

        // Animation helpers
        animateButton: (button) => {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 100);
        },

        // Accessibility helpers
        announceToScreenReader: (message) => {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.style.position = 'absolute';
            announcement.style.left = '-10000px';
            announcement.textContent = message;
            document.body.appendChild(announcement);
            
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        },

        // Event binding with delegation
        bindEvents: (controller) => {
            // Enhanced event delegation
            document.addEventListener('click', (e) => {
                if (e.target.closest('.keypad')) {
                    controller.handleKeypadClick(e);
                } else if (e.target.closest('.scientific-functions')) {
                    controller.handleScientificClick(e);
                } else if (e.target.closest('.memory-functions')) {
                    controller.handleMemoryClick(e);
                } else if (e.target.dataset.mode) {
                    controller.handleModeToggle(e);
                } else if (e.target.dataset.action === 'history') {
                    controller.handleHistoryToggle(e);
                } else if (e.target.dataset.action === 'clear-history') {
                    controller.handleClearHistory(e);
                }
            });
            
            // Theme toggle event
            elements.themeToggle.addEventListener('change', () => {
                controller.handleThemeToggle();
            });

            // Enhanced keyboard support
            document.addEventListener('keydown', controller.handleKeyboard);
            
            // Touch events for mobile
            document.addEventListener('touchstart', (e) => {
                if (e.target.classList.contains('btn')) {
                    this.animateButton(e.target);
                }
            });
        }
    };
})();

// 9. ENHANCED CONTROLLER with advanced patterns
const CalculatorController = (() => {
    let currentMode = 'basic';
    
    // Initialize model event listeners
    CalculatorModel.on('valueChanged', (value) => {
        CalculatorView.updateDisplay(value, CalculatorModel.getHistory());
    });

    CalculatorModel.on('memoryChanged', (memoryValue) => {
        CalculatorView.updateMemoryIndicator(memoryValue !== 0);
    });

    CalculatorModel.on('historyUpdated', (history) => {
        CalculatorView.updateHistoryPanel(history);
    });

    CalculatorModel.on('reset', () => {
        updateView();
        CalculatorView.showToast('Calculator reset');
    });

    // Private methods
    const updateView = () => {
        CalculatorView.updateDisplay(
            CalculatorModel.getCurrentValue(),
            CalculatorModel.getHistory()
        );
        CalculatorView.updateMemoryIndicator(CalculatorModel.getMemoryValue() !== 0);
    };

    const formatNumber = (number) => {
        try {
            return CalculatorModel.formatNumber(number);
        } catch (error) {
            CalculatorView.showError('Invalid number');
            return '0';
        }
    };

    const inputNumber = (num) => {
        try {
            CalculatorView.clearError();
            
            if (CalculatorModel.isWaitingForOperand()) {
                CalculatorModel.setCurrentValue(num);
                CalculatorModel.setWaitingForOperand(false);
            } else {
                const current = CalculatorModel.getCurrentValue();
                const newValue = current === '0' ? num : current + num;
                
                // Limit input length
                if (newValue.length > 15) {
                    CalculatorView.showToast('Maximum digits reached', 'error');
                    return;
                }
                
                CalculatorModel.setCurrentValue(newValue);
            }
            updateView();
        } catch (error) {
            CalculatorView.showError('Input error');
        }
    };

    const inputOperator = (nextOperator) => {
        try {
            const current = parseFloat(CalculatorModel.getCurrentValue());
            const previous = CalculatorModel.getPreviousValue();
            const operator = CalculatorModel.getOperator();

            if (isNaN(current)) {
                CalculatorView.showError('Invalid input');
                return;
            }

            if (previous === '') {
                CalculatorModel.setPreviousValue(current.toString());
            } else if (operator && !CalculatorModel.isWaitingForOperand()) {
                const result = CalculatorModel.calculate(operator, parseFloat(previous), current);
                const formatted = formatNumber(result);
                CalculatorModel.setCurrentValue(formatted);
                CalculatorModel.setPreviousValue(result.toString());
            }

            CalculatorModel.setWaitingForOperand(true);
            CalculatorModel.setOperator(nextOperator);
            
            const history = `${CalculatorModel.getPreviousValue()} ${nextOperator}`;
            CalculatorModel.setHistory(history);
            updateView();
        } catch (error) {
            CalculatorView.showError(error.message);
        }
    };

    const calculate = () => {
        try {
            const current = parseFloat(CalculatorModel.getCurrentValue());
            const previous = CalculatorModel.getPreviousValue();
            const operator = CalculatorModel.getOperator();

            if (previous === '' || operator === null || isNaN(current)) {
                return;
            }

            const result = CalculatorModel.calculate(operator, parseFloat(previous), current);
            const formatted = formatNumber(result);
            const expression = `${previous} ${operator} ${current}`;
            
            // Add to history
            CalculatorModel.addCalculationToHistory(expression, formatted);
            
            CalculatorModel.setCurrentValue(formatted);
            CalculatorModel.setPreviousValue('');
            CalculatorModel.setOperator(null);
            CalculatorModel.setWaitingForOperand(true);
            CalculatorModel.setHistory(`${expression} =`);
            
            updateView();
            CalculatorView.announceToScreenReader(`Result: ${formatted}`);
        } catch (error) {
            CalculatorView.showError(error.message);
        }
    };

    // Public interface
    return {
        handleKeypadClick: function(e) {
            const target = e.target;
            CalculatorView.animateButton(target);
            
            if (target.dataset.number) {
                inputNumber(target.dataset.number);
            } else if (target.dataset.operator) {
                inputOperator(target.dataset.operator);
            } else if (target.dataset.action) {
                switch (target.dataset.action) {
                    case 'clear':
                        CalculatorModel.reset();
                        break;
                    case 'delete':
                        this.deleteLast();
                        break;
                    case 'decimal':
                        this.inputDecimal();
                        break;
                    case 'equals':
                        calculate();
                        break;
                    case 'undo':
                        this.undo();
                        break;
                    case 'percentage':
                        this.performPercentage();
                        break;
                }
            }
        },

        handleScientificClick: function(e) {
            const target = e.target;
            if (target.dataset.function) {
                this.performScientificFunction(target.dataset.function);
            }
        },

        handleMemoryClick: function(e) {
            const target = e.target;
            const action = target.dataset.memory;
            const current = CalculatorModel.getCurrentValue();
            
            CalculatorView.animateButton(target);
            
            switch (action) {
                case 'clear':
                    CalculatorModel.memoryClear();
                    CalculatorView.showToast('Memory cleared');
                    break;
                case 'recall':
                    const recalled = CalculatorModel.memoryRecall();
                    CalculatorModel.setCurrentValue(recalled);
                    CalculatorModel.setWaitingForOperand(true);
                    updateView();
                    CalculatorView.showToast('Memory recalled');
                    break;
                case 'add':
                    CalculatorModel.memoryAdd(current);
                    CalculatorView.showToast('Added to memory');
                    break;
                case 'subtract':
                    CalculatorModel.memorySubtract(current);
                    CalculatorView.showToast('Subtracted from memory');
                    break;
            }
        },

        handleModeToggle: function(e) {
            const mode = e.target.dataset.mode;
            const isScientific = mode === 'scientific';
            
            currentMode = mode;
            CalculatorModel.setStrategy(isScientific ? 'scientific' : 'basic');
            CalculatorView.toggleScientificMode(isScientific);
            CalculatorView.updateModeToggles(mode);
            CalculatorView.showToast(`${mode} mode activated`);
        },

        handleThemeToggle: function() {
            const newTheme = CalculatorView.toggleTheme();
            CalculatorView.showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme activated`);
        },

        handleHistoryToggle: function(e) {
            const isShowing = CalculatorView.toggleHistoryPanel();
            CalculatorView.updateHistoryPanel(CalculatorModel.getCalculationHistory());
            CalculatorView.showToast(isShowing ? 'History shown' : 'History hidden');
        },
        
        handleClearHistory: function(e) {
            CalculatorModel.clearHistory();
            CalculatorView.showToast('History cleared');
        },

        handleKeyboard: function(e) {
            // Prevent default for calculator keys
            if (/[0-9+\-*/.=]/.test(e.key) || ['Enter', 'Escape', 'Backspace'].includes(e.key)) {
                e.preventDefault();
            }
            
            if (e.key >= '0' && e.key <= '9') {
                inputNumber(e.key);
            } else if (['+', '-', '*', '/', '%'].includes(e.key)) {
                inputOperator(e.key);
            } else if (e.key === 'Enter' || e.key === '=') {
                calculate();
            } else if (e.key === 'Escape') {
                CalculatorModel.reset();
            } else if (e.key === 'Backspace') {
                this.deleteLast();
            } else if (e.key === '.') {
                this.inputDecimal();
            } else if (e.ctrlKey && e.key === 'z') {
                this.undo();
            }
        },

        deleteLast: function() {
            try {
                const current = CalculatorModel.getCurrentValue();
                if (current.length > 1 && current !== '0') {
                    CalculatorModel.setCurrentValue(current.slice(0, -1));
                } else {
                    CalculatorModel.setCurrentValue('0');
                }
                updateView();
            } catch (error) {
                CalculatorView.showError('Delete error');
            }
        },

        inputDecimal: function() {
            try {
                if (CalculatorModel.isWaitingForOperand()) {
                    CalculatorModel.setCurrentValue('0.');
                    CalculatorModel.setWaitingForOperand(false);
                } else if (CalculatorModel.getCurrentValue().indexOf('.') === -1) {
                    CalculatorModel.setCurrentValue(CalculatorModel.getCurrentValue() + '.');
                }
                updateView();
            } catch (error) {
                CalculatorView.showError('Decimal error');
            }
        },
        
        performPercentage: function() {
            try {
                const current = parseFloat(CalculatorModel.getCurrentValue());
                if (!isNaN(current)) {
                    const result = current / 100;
                    const formatted = formatNumber(result);
                    CalculatorModel.setCurrentValue(formatted);
                    CalculatorModel.setWaitingForOperand(true);
                    updateView();
                    CalculatorView.showToast('Percentage calculated');
                }
            } catch (error) {
                CalculatorView.showError('Percentage error');
            }
        },

        performScientificFunction: function(func) {
            try {
                CalculatorView.clearError();
                let result;
                
                if (func === 'pi' || func === 'e') {
                    const constants = CalculatorModel.getConstants();
                    result = constants[func];
                } else {
                    const current = parseFloat(CalculatorModel.getCurrentValue());
                    if (isNaN(current)) {
                        CalculatorView.showError('Invalid input for function');
                        return;
                    }
                    result = CalculatorModel.scientificCalculate(func, current);
                }
                
                const formatted = formatNumber(result);
                CalculatorModel.setCurrentValue(formatted);
                CalculatorModel.setWaitingForOperand(true);
                
                // Add to history
                const expression = func === 'pi' || func === 'e' ? func : `${func}(${CalculatorModel.getCurrentValue()})`;
                CalculatorModel.addCalculationToHistory(expression, formatted);
                
                updateView();
                CalculatorView.announceToScreenReader(`${func} result: ${formatted}`);
            } catch (error) {
                CalculatorView.showError(error.message);
            }
        },

        undo: function() {
            const commandHistory = CalculatorModel.getCommandHistory();
            if (commandHistory.undo()) {
                updateView();
                CalculatorView.showToast('Undone');
            } else {
                CalculatorView.showToast('Nothing to undo', 'error');
            }
        },

        loadFromHistory: function(value) {
            CalculatorModel.setCurrentValue(value.toString());
            CalculatorModel.setWaitingForOperand(true);
            updateView();
            CalculatorView.showToast('Loaded from history');
        },

        init: function() {
            try {
                CalculatorView.bindEvents(this);
                updateView();
                CalculatorView.updateHistoryPanel(CalculatorModel.getCalculationHistory());
                
                // Initialize with saved memory state
                CalculatorView.updateMemoryIndicator(CalculatorModel.getMemoryValue() !== 0);
                
                Logger.getInstance().log('info', 'Calculator initialized successfully');
            } catch (error) {
                Logger.getInstance().log('error', 'Calculator initialization failed', error);
                CalculatorView.showError('Initialization failed');
            }
        }
    };
})();

// Initialize the calculator
document.addEventListener('DOMContentLoaded', () => {
    try {
        CalculatorController.init();
    } catch (error) {
        console.error('Failed to initialize calculator:', error);
    }
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // This would register a service worker if we had one
        // navigator.serviceWorker.register('/sw.js');
    });
}