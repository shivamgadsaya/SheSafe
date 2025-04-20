import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Filter out React Router warnings in the console
const originalConsoleWarn = console.warn;
console.warn = function filterWarnings(msg, ...args) {
  if (typeof msg === 'string' && msg.includes('React Router')) {
    // Suppress React Router warnings
    return;
  }
  originalConsoleWarn(msg, ...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
); 