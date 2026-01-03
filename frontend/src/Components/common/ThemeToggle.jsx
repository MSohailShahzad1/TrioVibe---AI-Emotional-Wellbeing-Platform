import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../Context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl glass-panel hover:scale-110 active:scale-95 transition-all duration-300 group relative overflow-hidden"
            aria-label="Toggle Theme"
        >
            <div className="relative z-10">
                {theme === 'light' ? (
                    <Moon className="w-5 h-5 text-purple-600 group-hover:rotate-12 transition-transform" />
                ) : (
                    <Sun className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                )}
            </div>

            {/* Subtle glow effect */}
            <div className={`absolute inset-0 opacity-20 blur-xl transition-colors duration-500 ${theme === 'light' ? 'bg-purple-500' : 'bg-cyan-400'
                }`} />
        </button>
    );
};

export default ThemeToggle;
