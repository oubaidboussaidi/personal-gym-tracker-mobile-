'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/core'; // Adjust import path
import { Info, Zap, RotateCcw } from 'lucide-react';
import { BodyMap } from './bodyMap/BodyMap'; // Adjust path
import { CSV_TO_SVG_MUSCLE_MAP } from './bodyMap/utils/muscle/muscleMapping';

interface MuscleHeatmapProps {
    data: Record<string, number>;
    className?: string;
    gender?: 'male' | 'female';
}

export function MuscleHeatmap({ data, className, gender = 'male' }: MuscleHeatmapProps) {
    const [view, setView] = useState<'front' | 'back'>('front');

    // Transform single muscle scores into detailed SVG-mapped volumes
    const muscleVolumes = useMemo(() => {
        const map = new Map<string, number>();

        Object.entries(data).forEach(([muscleKey, volume]) => {
            // Get all specific SVG IDs for this muscle group (e.g. 'chest' -> ['upper-pectoralis', ...])
            const ids = CSV_TO_SVG_MUSCLE_MAP[muscleKey] || [];

            ids.forEach(id => {
                // Determine existing volume if overlap (e.g. compound movements)
                const current = map.get(id) || 0;
                map.set(id, Math.max(current, volume));
            });
        });

        return map;
    }, [data]);

    const maxVolume = Math.max(...Object.values(data), 1);

    // Determine the primary focus
    const focusArea = Object.entries(data).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const totalSets = Object.values(data).reduce((a, b) => a + b, 0);

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            <Card className="relative bg-card border-border overflow-hidden shadow-xl p-4 min-h-[500px] flex flex-col items-center justify-center">
                {/* View Toggles */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                        onClick={() => setView(v => v === 'front' ? 'back' : 'front')}
                        className="bg-background/80 backdrop-blur-md p-2 rounded-full border border-border shadow-sm hover:text-primary transition-colors"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>

                <div className="w-full max-w-md h-full flex items-center justify-center">
                    <div className="w-full h-full flex justify-center">
                        <BodyMap
                            muscleVolumes={muscleVolumes}
                            maxVolume={maxVolume}
                            onPartClick={() => { }}
                            selectedPart={null}
                            gender={gender}
                            viewMode="muscle"
                            side={view}
                        />
                    </div>
                </div>

                {/* Floating Stats */}
                <div className="absolute bottom-6 left-6 space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Zones</h3>
                    </div>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {Object.entries(data).filter(([_, v]) => v > 0).slice(0, 4).map(([k]) => (
                            <span key={k} className="text-[8px] font-black px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20 uppercase">
                                {k}
                            </span>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 bg-card border-border flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Info size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase text-muted-foreground">Focus</p>
                        <p className="text-sm font-black text-foreground capitalize">{focusArea}</p>
                    </div>
                </Card>
                <Card className="p-4 bg-card border-border flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Zap size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase text-muted-foreground">Volume</p>
                        <p className="text-sm font-black text-foreground">{totalSets} Sets</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
