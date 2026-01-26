'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, X, Play, Pause, RotateCcw, Zap, Clock } from 'lucide-react';
import { Button, Card } from '@/components/ui/core';

interface RestTimerProps {
    duration: number; // default in seconds
    onClose: () => void;
}

export function RestTimer({ duration: initialDuration, onClose }: RestTimerProps) {
    const [duration, setDuration] = useState(initialDuration);
    const [timeLeft, setTimeLeft] = useState(initialDuration);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const percentage = (timeLeft / duration) * 100;

    const quickSettings = [60, 120, 180, 240, 300, 600];

    const changeDuration = (newSecs: number) => {
        setDuration(newSecs);
        setTimeLeft(newSecs);
        setIsActive(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-32 left-4 right-4 z-50 max-w-md mx-auto"
        >
            <Card className="glass p-4 border-primary/30 shadow-2xl relative overflow-hidden space-y-4">
                {/* Background Progress Bar */}
                <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-primary/30"
                    initial={{ width: '100%' }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                />

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-12 w-12 rounded-full border-2 border-primary/20 flex items-center justify-center bg-background/50">
                                <Timer className="text-primary animate-pulse" size={20} />
                            </div>
                            <svg className="absolute inset-0 h-12 w-12 -rotate-90">
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="22"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeDasharray={138}
                                    strokeDashoffset={138 - (138 * percentage) / 100}
                                    className="text-primary transition-all duration-1000 linear"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Rest Timer</p>
                            <h3 className="text-2xl font-black stat-number text-foreground">
                                {formatTime(timeLeft)}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
                            onClick={() => setIsActive(!isActive)}
                        >
                            {isActive ? <Pause size={20} /> : <Play size={20} />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-muted-foreground hover:text-foreground active:rotate-180 transition-transform duration-500"
                            onClick={() => setTimeLeft(duration)}
                        >
                            <RotateCcw size={20} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-destructive/70 hover:text-destructive active:scale-95 transition-all"
                            onClick={onClose}
                        >
                            <X size={20} />
                        </Button>
                    </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center justify-between gap-1 relative z-10">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {quickSettings.map((s) => (
                            <button
                                key={s}
                                onClick={() => changeDuration(s)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${duration === s
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                    }`}
                            >
                                {s}s
                            </button>
                        ))}
                    </div>
                    <div className="h-6 w-px bg-border/50 mx-1 shrink-0" />
                    <button className="h-8 w-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shrink-0">
                        <Clock size={14} />
                    </button>
                </div>

                {timeLeft === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-md pointer-events-none z-20"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1.2 }}
                            className="flex items-center gap-2 text-primary font-black uppercase tracking-tighter text-xl"
                        >
                            <Zap size={28} className="fill-primary" />
                            Ready!
                        </motion.div>
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );
}
