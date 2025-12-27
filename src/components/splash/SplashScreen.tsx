'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [hasShownBefore, setHasShownBefore] = useState(false);

    useEffect(() => {
        // Check if splash has been shown in this session
        const splashShown = sessionStorage.getItem('splashShown');

        if (splashShown === 'true') {
            setIsVisible(false);
            setHasShownBefore(true);
            return;
        }

        // Hide splash after animation completes (3 seconds)
        const timer = setTimeout(() => {
            setIsVisible(false);
            sessionStorage.setItem('splashShown', 'true');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    // Don't render anything if already shown
    if (hasShownBefore) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
                    style={{ isolation: 'isolate' }}
                >
                    <div className="relative flex flex-col items-center justify-center">
                        {/* Three animated dots */}
                        <div className="flex gap-3 mb-8">
                            {[0, 1, 2].map((index) => (
                                <motion.div
                                    key={index}
                                    initial={{ scale: 0, y: 0 }}
                                    animate={{
                                        scale: [0, 1.2, 1],
                                        y: [0, -20, 0],
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.15,
                                        ease: "easeInOut",
                                    }}
                                    className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"
                                />
                            ))}
                        </div>

                        {/* App Icon/Logo - appears after dots */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180, opacity: 0 }}
                            animate={{
                                scale: [0, 1.1, 1],
                                rotate: [180, 0, 0],
                                opacity: 1
                            }}
                            transition={{
                                duration: 0.8,
                                delay: 0.6,
                                ease: "easeOut",
                            }}
                            className="relative"
                        >
                            <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 border-4 border-primary/10">
                                <Image
                                    src="/icon-192.png"
                                    alt="FitTrack Pro"
                                    width={128}
                                    height={128}
                                    priority
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </motion.div>

                        {/* App Name - fades in last */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: 1.2,
                            }}
                            className="mt-6 text-center"
                        >
                            <h1 className="text-2xl font-black tracking-tight">FitTrack Pro</h1>
                            <p className="text-xs text-muted-foreground mt-1 font-semibold">
                                Your Offline Fitness Companion
                            </p>
                        </motion.div>

                        {/* Pulsing ring effect */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: [0.8, 1.5, 1.5],
                                opacity: [0, 0.3, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                delay: 0.6,
                                ease: "easeOut",
                            }}
                            className="absolute w-32 h-32 rounded-full border-4 border-primary"
                            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
