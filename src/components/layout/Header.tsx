'use client';

import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/core';
import { Activity } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

export function Header() {
    const pathname = usePathname();
    const { theme } = useTheme();

    // Get title based on pathname
    const getTitle = () => {
        if (pathname.startsWith('/workouts')) return 'Workouts';
        if (pathname.startsWith('/nutrition')) return 'Nutrition';
        if (pathname.startsWith('/progress')) return 'Progress';
        if (pathname.startsWith('/me')) return 'Profile';
        return 'FitTrack Pro';
    };

    return (
        <header className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-3">
                <div className={`
                    h-10 w-10 rounded-xl flex items-center justify-center overflow-hidden border shadow-lg transition-all duration-300
                    ${theme === 'dark'
                        ? 'bg-primary/10 border-primary/20 shadow-primary/10'
                        : 'bg-white border-border shadow-sm'
                    }
                `}>
                    <img
                        src={theme === 'light' ? "/icon-light.png" : "/icon-192.png"}
                        alt="FitTrack Pro"
                        className="h-full w-full object-cover transition-all duration-300"
                        onError={(e) => {
                            // Fallback if image fails to load
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement?.classList.add('bg-primary');
                        }}
                    />
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tight leading-none">{getTitle()}</h1>
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 mt-0.5 border-primary/20 text-primary/70">
                        Pro
                    </Badge>
                </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center border border-border/50">
                <Activity size={16} className="text-muted-foreground" />
            </div>
        </header>
    );
}
