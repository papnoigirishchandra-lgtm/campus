import { useContext } from 'react';
import ThemeContext from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative inline-flex h-10 w-20 items-center rounded-full bg-transparent border border-white/30 p-1 text-sm shadow-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
    >
      <span
        className={`absolute h-8 w-8 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${
          theme === 'dark' ? 'translate-x-10' : 'translate-x-0'
        }`}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
      <span className="absolute left-3 text-xs font-semibold text-white opacity-70 pointer-events-none">
        Light
      </span>
      <span className="absolute right-3 text-xs font-semibold text-white opacity-70 pointer-events-none">
        Dark
      </span>
    </button>
  );
};

export default ThemeToggle;
