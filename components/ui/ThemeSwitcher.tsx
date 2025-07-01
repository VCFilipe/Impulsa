import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeSwitcherProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void; // Can be simplified if direct set is preferred based on tab
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, toggleTheme }) => {
  const setThemeToLight = () => {
    if (theme === 'dark') toggleTheme();
  };

  const setThemeToDark = () => {
    if (theme === 'light') toggleTheme();
  };

  const baseTabStyles = "p-1.5 rounded-md transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-800 focus-visible:ring-primary dark:focus-visible:ring-sky-500";
  const activeTabStyles = "bg-primary/10 dark:bg-sky-500/20 text-primary dark:text-sky-300 shadow-sm";
  const inactiveTabStyles = "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200";
  
  return (
    <div 
      role="tablist" 
      aria-label="Seleção de tema" 
      className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-750 p-0.5 rounded-lg"
    >
      <button
        role="tab"
        aria-selected={theme === 'light'}
        aria-controls="app-theme-panel" // Hypothetical panel, not strictly needed if it just changes theme
        onClick={setThemeToLight}
        className={`${baseTabStyles} ${theme === 'light' ? activeTabStyles : inactiveTabStyles}`}
        title="Ativar modo claro"
      >
        <Sun size={18} />
        <span className="sr-only">Modo Claro</span>
      </button>
      <button
        role="tab"
        aria-selected={theme === 'dark'}
        aria-controls="app-theme-panel"
        onClick={setThemeToDark}
        className={`${baseTabStyles} ${theme === 'dark' ? activeTabStyles : inactiveTabStyles}`}
        title="Ativar modo escuro"
      >
        <Moon size={18} />
        <span className="sr-only">Modo Escuro</span>
      </button>
    </div>
  );
};

export default ThemeSwitcher;