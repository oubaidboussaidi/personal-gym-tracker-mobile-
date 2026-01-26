'use client';

import { useTheme, type Personality } from '@/components/theme/ThemeProvider';
import { Button } from '@/components/ui/core';
import { Palette, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function PersonalityToggle() {
    const { personality, setPersonality } = useTheme();
    const pathname = usePathname();

    // Only show on the Me page
    if (pathname !== '/me') return null;

    const personalities: Personality[] = ['onyx', 'cyberpunk', 'ocean'];

    const cyclePersonality = () => {
        const currentIndex = personalities.indexOf(personality);
        const nextIndex = (currentIndex + 1) % personalities.length;
        setPersonality(personalities[nextIndex]);
    };

    const getPersonalityColor = (p: Personality) => {
        switch (p) {
            case 'cyberpunk': return 'bg-[#ff0099]';
            case 'ocean': return 'bg-[#00c2ff]';
            default: return 'bg-[#22c55e]';
        }
    };

    return (
        <div className="fixed top-20 right-5 z-50 flex flex-col items-center gap-2">
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Button
                    variant="outline"
                    size="icon"
                    onClick={cyclePersonality}
                    className="h-12 w-12 rounded-full border-2 border-primary/20 glass shadow-lg relative overflow-hidden group"
                >
                    <div className={`absolute inset-0 opacity-10 ${getPersonalityColor(personality)}`} />
                    <Palette size={20} className="text-primary group-hover:rotate-12 transition-transform" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={personality}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute -bottom-0.5 right-0"
                        >
                            <Sparkles size={8} className="text-primary fill-primary" />
                        </motion.div>
                    </AnimatePresence>
                </Button>
            </motion.div>

            <AnimatePresence>
                <motion.span
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-background/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-primary/10 text-[8px] font-black uppercase tracking-widest text-primary shadow-sm pointer-events-none"
                >
                    {personality}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}
