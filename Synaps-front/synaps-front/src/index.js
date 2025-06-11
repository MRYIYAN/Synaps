import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// FILTRO para quitar basura de aitopia.ai en consola
const originalConsoleError = console.error;
console.error = function (...args) {
    if(args.some(arg => typeof arg === 'string' && arg.includes('aitopia.ai'))) {
        return;
    }
    originalConsoleError.apply(console, args);
};

// Render normal
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

//  Performance (no tocar)
reportWebVitals();
