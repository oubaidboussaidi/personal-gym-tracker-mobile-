'use client';

import { useState, useMemo } from 'react';
import { Card, Badge, SectionHeader } from '@/components/ui/core';
import { Session, SetLog, Program, Exercise } from '@/db/db';
import { getExerciseStats, detectProgress } from '@/lib/progress/progress-utils';
import { SessionHistorySection } from './SessionHistorySection';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, Trophy, ChevronRight, ChevronLeft, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgramProgressCardProps {
    program: Program;
    exercises: Exercise[];
    sessions: Session[];
    sets: SetLog[];
}

export function ProgramProgressCard({ program, exercises, sessions, sets }: ProgramProgressCardProps) {
    const [selectedExIndex, setSelectedExIndex] = useState(0);
    const activeExercise = exercises[selectedExIndex];

    const stats = useMemo(() => {
        if (!activeExercise) return [];
        return getExerciseStats(activeExercise.id, sessions, sets);
    }, [activeExercise, sessions, sets]);

    const progress = useMemo(() => detectProgress(stats), [stats]);

    if (!activeExercise || stats.length === 0) {
        return (
            <Card className="p-6 text-center space-y-3 opacity-60">
                <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center">
                    <TrendingUp size={24} className="text-muted-foreground" />
                </div>
                <div>
                    <h3 className="font-bold">{program.name}</h3>
                    <p className="text-xs text-muted-foreground">Log more sessions to see progress trends</p>
                </div>
            </Card>
        );
    }

    const currentPR = Math.max(...stats.map(s => s.maxWeight));

    return (
        <Card className="overflow-hidden border-primary/10 shadow-xl shadow-primary/5">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-black tracking-tight">{program.name}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Program Performance
                    </p>
                </div>
                <div className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-full border border-primary/10">
                    <Trophy size={12} className="text-yellow-500" />
                    <span className="text-xs font-bold">{currentPR}kg PR</span>
                </div>
            </div>

            {/* Exercise Selector */}
            <div className="flex items-center gap-2 p-2 px-4 border-b overflow-x-auto no-scrollbar">
                {exercises.map((ex, idx) => (
                    <button
                        key={ex.id}
                        onClick={() => setSelectedExIndex(idx)}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedExIndex === idx
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                            : 'hover:bg-muted text-muted-foreground'
                            }`}
                    >
                        {ex.name}
                    </button>
                ))}
            </div>

            <div className="p-4 space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Volume Trend</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black">{Math.round(stats[stats.length - 1].volume)}kg</span>
                            {progress.volumeGain !== 0 && (
                                <Badge variant={progress.volumeGain > 0 ? 'default' : 'destructive'} className="h-5 px-1">
                                    {progress.volumeGain > 0 ? '+' : ''}{Math.round(progress.volumeGain)}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Peak Load</p>
                        <div className="flex items-center justify-end gap-2">
                            {progress.weightGain > 0 && (
                                <Badge variant="default" className="h-5 px-1 bg-green-500/20 text-green-500 border-green-500/20">
                                    +{progress.weightGain}kg
                                </Badge>
                            )}
                            <span className="text-xl font-black">{stats[stats.length - 1].maxWeight}kg</span>
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="h-48 w-full -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.map(s => ({ ...s, dateFormatted: format(s.date, 'MMM dd') }))}>
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.3} />
                            <XAxis
                                dataKey="dateFormatted"
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                                stroke="hsl(var(--muted-foreground))"
                            />
                            <YAxis
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                                stroke="hsl(var(--muted-foreground))"
                                hide={true}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderRadius: '12px',
                                    border: '1px solid hsl(var(--border))',
                                    boxShadow: 'var(--shadow-lg)',
                                    fontSize: '12px'
                                }}
                                formatter={(value: any) => [`${value}kg`, 'Weight']}
                            />
                            <Area
                                type="monotone"
                                dataKey="maxWeight"
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                                fill="url(#chartGradient)"
                                animationDuration={1000}
                                dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Micro Analysis */}
                <div className="bg-muted/30 rounded-xl p-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Target size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold">Progressive Overload Detected</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                            {progress.weightGain > 0
                                ? `You've increased your peak weight by ${progress.weightGain}kg since last session. Keep it up!`
                                : "Consistency is key. Focus on form and maintaining your intensity for the next session."}
                        </p>
                    </div>
                </div>

                {/* Session History */}
                <div className="pt-2">
                    <SessionHistorySection
                        exerciseId={activeExercise.id}
                        exerciseName={activeExercise.name}
                        sessions={sessions}
                        sets={sets}
                        defaultLimit={3}
                    />
                </div>
            </div>
        </Card>
    );
}
