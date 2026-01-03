import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../Context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl glass-panel hover:scale-110 active:scale-90 transition-all duration-300 group relative overflow-hidden shadow-lg"
            aria-label="Toggle Theme"
        >
            <div className="relative z-10 flex items-center justify-center">
                {theme === 'light' ? (
                    <Moon className="w-5 h-5 text-purple-500 animate-in fade-in zoom-in spin-in-45 duration-500" />
                ) : (
                    <Sun className="w-5 h-5 text-yellow-400 animate-in fade-in zoom-in spin-in-45 duration-500" />
                )}
            </div>

            {/* Subtle glow effect */}
            <div className={`absolute inset-0 opacity-10 blur-xl transition-all duration-700 bg-gradient-to-br ${theme === 'light' ? 'from-purple-500 to-indigo-600' : 'from-yellow-400 to-orange-500'
                }`} />
        </button>
    );
};

export default ThemeToggle;
