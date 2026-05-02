import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="
        relative w-14 h-7 rounded-full border
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 
        focus:ring-purple-500 focus:ring-offset-2
        bg-gray-200 border-gray-300
        dark:bg-purple-600 dark:border-purple-500
      "
    >
      {/* Sliding circle */}
      <span
        className={`
          absolute top-[1px] left-[1px]
          w-[24px] h-[24px] rounded-full
          flex items-center justify-center
          text-[10px]
          transition-all duration-300 ease-in-out
          bg-white shadow-md
          ${isDark ? 'translate-x-7' : 'translate-x-0'}
        `}
      >
        {/* Sun icon — shown in light mode */}
        <span className={`block transition-opacity duration-300 ${isDark ? 'hidden' : 'opacity-100'} text-yellow-500 text-xs mt-[-1px]`}>
          ☀️
        </span>
        {/* Moon icon — shown in dark mode */}
        <span className={`transition-opacity duration-300 ${!isDark ? 'hidden' : 'block opacity-100'} text-gray-800 text-xs mt-[-1px]`}>
          🌙
        </span>
      </span>
    </button>
  );
}
