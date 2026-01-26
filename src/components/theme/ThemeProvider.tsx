'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
export type Personality = 'onyx' | 'cyberpunk' | 'ocean';

interface ThemeContextType {
    theme: Theme;
    personality: Personality;
    toggleTheme: () => void;
    setPersonality: (p: Personality) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [personality, setPersonalityState] = useState<Personality>('onyx');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('fitness-tracker-theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            setTheme(savedTheme as Theme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }

        // Load personality
        const savedPersonality = localStorage.getItem('fitness-tracker-personality') as Personality;
        if (['onyx', 'cyberpunk', 'ocean'].includes(savedPersonality)) {
            setPersonalityState(savedPersonality);
        }

        // Request persistent storage
        if (typeof navigator !== 'undefined' && 'storage' in navigator && 'persist' in navigator.storage) {
            navigator.storage.persist().then(persistent => {
                if (persistent) console.log("Storage will not be cleared except by explicit user action");
            });
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        root.classList.remove('light', 'dark', 'onyx', 'cyberpunk', 'ocean');
        root.classList.add(theme);
        root.classList.add(personality);

        localStorage.setItem('fitness-tracker-theme', theme);
        localStorage.setItem('fitness-tracker-personality', personality);
    }, [theme, personality, mounted]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const setPersonality = (p: Personality) => {
        setPersonalityState(p);
    };

    return (
        <ThemeContext.Provider value={{ theme, personality, toggleTheme, setPersonality }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
