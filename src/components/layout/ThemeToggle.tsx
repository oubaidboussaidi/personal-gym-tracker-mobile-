'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/components/ui/core';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
                "fixed top-5 right-5 z-[100] h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                "backdrop-blur-xl border",
                theme === 'dark'
                    ? "bg-white/10 border-white/20 text-yellow-400 shadow-black/40"
                    : "bg-black/5 border-black/10 text-indigo-600 shadow-indigo-500/20"
            )}
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                    <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Sun size={20} fill="currentColor" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="moon"
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Moon size={20} fill="currentColor" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subtle glow effect around the button */}
            <div className={cn(
                "absolute inset-0 rounded-full -z-10 blur-md opacity-20 transition-colors duration-500",
                theme === 'dark' ? "bg-yellow-400" : "bg-indigo-600"
            )} />
        </motion.button>
    );
}
