import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context with default values
const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  // Initialize state from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // First check localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }
    // Then check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Effect to update the DOM and localStorage when theme changes
  useEffect(() => {
    console.log('Theme effect triggered. isDarkMode:', isDarkMode);
    // Update document class - critical for Tailwind dark mode
    const htmlElement = document.documentElement;
    
    if (isDarkMode) {
      htmlElement.classList.add('dark');
      console.log('Dark mode applied: Added dark class');
    } else {
      htmlElement.classList.remove('dark');
      console.log('Light mode applied: Removed dark class');
    }
    
    // Verify class was actually added/removed
    console.log('Current HTML classes:', htmlElement.classList.toString());
    
    // Persist the theme choice in localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    console.log('Theme saved to localStorage:', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Toggle function with forced boolean casting for reliability
  const toggleTheme = () => {
    console.log('Toggle theme called, current mode:', isDarkMode ? 'dark' : 'light');
    // Using the current state directly instead of callback for more predictable behavior
    const newMode = !isDarkMode;
    console.log('Setting new mode to:', newMode ? 'dark' : 'light');
    setIsDarkMode(newMode);
  };

  // Provide the theme state and toggle function to children
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for consuming the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 