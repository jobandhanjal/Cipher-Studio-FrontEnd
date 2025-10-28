import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

// theme: 'dark' | 'light'
export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    try {
      const saved = localStorage.getItem('app-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {
      // ignore
    }
    // prefer dark by default
    return 'dark';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  const applyTheme = useCallback((t) => {
    const doc = document.documentElement;
    if (!doc) return;
    if (t === 'dark') {
      doc.classList.add('dark');
    } else {
      doc.classList.remove('dark');
    }
    try {
      localStorage.setItem('app-theme', t);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};