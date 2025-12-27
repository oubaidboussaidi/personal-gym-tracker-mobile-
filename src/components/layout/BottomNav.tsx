'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dumbbell, Utensils, User, Activity, Moon, Sun } from 'lucide-react';
import { cn } from '@/components/ui/core';
import { useTheme } from '@/components/theme/ThemeProvider';
import { motion } from 'framer-motion';

export function BottomNav() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { href: '/workouts', label: 'Workout', icon: Dumbbell },
        { href: '/nutrition', label: 'Nutrition', icon: Utensils },
        { href: '/progress', label: 'Progress', icon: Activity },
        { href: '/me', label: 'Me', icon: User },
    ];

    return (
        <nav className={cn(
            "fixed bottom-0 left-0 right-0 z-50 border-t pb-safe-area-inset-bottom transition-colors duration-300",
            theme === 'dark'
                ? "bg-[#0b1220] border-white/5"
                : "bg-[#f4f5f7] border-black/5"
        )}>
            <div className="flex h-16 items-center justify-around px-2">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary/10 rounded-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                                className="relative z-10 transition-transform duration-200 active:scale-90"
                            />
                            <span className={cn(
                                "relative z-10 text-[10px] font-semibold transition-all duration-200",
                                isActive && "font-bold"
                            )}>
                                {label}
                            </span>
                        </Link>
                    );
                })}

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-90"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? (
                        <Sun size={22} strokeWidth={2} className="transition-transform duration-200" />
                    ) : (
                        <Moon size={22} strokeWidth={2} className="transition-transform duration-200" />
                    )}
                    <span className="text-[10px] font-semibold">Theme</span>
                </button>
            </div>
        </nav>
    );
}
