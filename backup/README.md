# Calculator App

A modern, responsive calculator application with beautiful light and dark themes, built with vanilla HTML, CSS, and JavaScript.

## Features

### 🧮 Calculator Functions
- **Basic Operations**: Addition (+), Subtraction (−), Multiplication (×), Division (÷)
- **Advanced Functions**: Percentage (%), Sign toggle (±), Decimal support
- **Input Methods**: Mouse clicks and full keyboard support
- **Error Handling**: Division by zero protection and overflow detection
- **Memory**: Maintains calculation history display

### 🎨 Theme System
- **Dual Themes**: Beautiful light and dark modes
- **Theme Toggle**: Easy switching with moon/sun button
- **Persistent Settings**: Theme preference saved to localStorage
- **CSS Variables**: Centralized theming system for easy customization

### ✨ User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Staggered button appearances and hover effects
- **Visual Feedback**: Button press animations and ripple effects
- **Active States**: Operator highlighting during calculations
- **Keyboard Support**: Full functionality via keyboard input

### 🎯 Technical Highlights
- **Clean Architecture**: Separated HTML, CSS, and JavaScript files
- **Modular Code**: Object-oriented JavaScript with Calculator and ThemeManager classes
- **CSS Variables**: Easy theme customization through CSS custom properties
- **Performance**: Optimized animations and efficient event handling

## File Structure

```
calculator-app/
├── index.html      # HTML structure and layout
├── styles.css      # Styling with CSS variables
├── script.js       # Calculator logic and theme management
└── README.md       # This file
```

## Usage

### Running the App
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start calculating!

### Keyboard Shortcuts
- **Numbers**: `0-9` for digit input
- **Operations**: `+`, `-`, `*`, `/` for basic operations
- **Decimal**: `.` for decimal point
- **Calculate**: `Enter` or `=` to execute calculation
- **Clear**: `Escape` or `C` to clear all
- **Backspace**: `Backspace` to delete last digit
- **Percentage**: `%` for percentage calculation

### Theme Toggle
- Click the 🌙/☀️ button in the top-right corner to switch themes
- Your theme preference is automatically saved

## Customization

The app uses CSS variables for easy customization. You can modify colors, fonts, spacing, and animations by editing the variables in `styles.css`:

### Color Customization
```css
:root {
  /* Primary colors */
  --primary-color: #4ecdc4;
  --primary-color-hover: #3db3aa;
  
  /* Background gradient */
  --background-gradient-start: #4ecdc4;
  --background-gradient-end: #44a08d;
  
  /* Light theme colors */
  --bg-color: rgba(255, 255, 255, 0.95);
  --text-color: #333;
  --function-btn-bg: #f0f0f0;
  /* ... and many more */
}
```

### Dark Theme Override
```css
[data-theme="dark"] {
  --bg-color: rgba(30, 30, 30, 0.95);
  --text-color: #fff;
  --function-btn-bg: #444;
  /* ... dark theme specific variables */
}
```

### Typography and Layout
```css
:root {
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-result: 3rem;
  --font-size-button: 1.25rem;
  
  /* Layout */
  --calculator-width: 280px;
  --button-height: 60px;
  --keypad-gap: 1rem;
}
```

## Browser Support

- ✅ Chrome (60+)
- ✅ Firefox (55+)
- ✅ Safari (12+)
- ✅ Edge (79+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Technical Details

### CSS Features Used
- CSS Grid for button layout
- CSS Variables for theming
- CSS Animations and Keyframes
- Backdrop filters for glass morphism effect
- Media queries for responsive design

### JavaScript Features Used
- ES6+ Classes and modules
- Event delegation and handling
- LocalStorage for theme persistence
- Error handling and validation
- Keyboard event processing

### Performance Optimizations
- Efficient DOM queries with caching
- Throttled animations
- Minimal reflows and repaints
- Optimized event listeners

## Development

### Adding New Themes
1. Create new CSS variables in the `:root` section
2. Add theme-specific overrides using `[data-theme="your-theme"]`
3. Update the ThemeManager class in `script.js` to include the new theme
4. Add theme toggle logic

### Extending Functionality
1. Add new buttons to the HTML keypad
2. Define corresponding CSS styles
3. Implement the calculation logic in the Calculator class
4. Add keyboard support if needed

## Design Inspiration

This calculator design is inspired by modern calculator interfaces with a focus on:
- **Minimalist aesthetics**
- **Accessible color contrasts**
- **Smooth, delightful animations**
- **Intuitive user interactions**
- **Cross-platform consistency**

## License

This project is open source and available under the MIT License.

---

Made with ❤️ using vanilla HTML, CSS, and JavaScript