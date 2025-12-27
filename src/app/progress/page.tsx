'use client';

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Card, Button, SectionHeader, StatCard, Badge, EmptyState } from '@/components/ui/core';
import { ProgramProgressCard } from '@/components/progress/ProgramProgressCard';
import { TrendingUp, Trophy, Activity, Calendar, Zap, ChartBar } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function ProgressPage() {
    const sessions = useLiveQuery(() =>
        db.sessions.where('isCompleted').equals(1).sortBy('date')
    ) || [];

    const sets = useLiveQuery(() =>
        db.sets.toArray()
    ) || [];

    const exercises = useLiveQuery(() =>
        db.exercises.toArray()
    ) || [];

    const programs = useLiveQuery(() =>
        db.programs.where('isArchived').equals(0).toArray()
    ) || [];

    const programExercises = useLiveQuery(() =>
        db.programExercises.toArray()
    ) || [];

    // Calculate total volume from completed sessions
    const totalVolume = useMemo(() => {
        const completedSessionIds = new Set(sessions.map(s => s.id));
        return sets
            .filter(s => completedSessionIds.has(s.sessionId))
            .reduce((acc, s) => acc + (s.weight * s.reps), 0);
    }, [sessions, sets]);

    // Count unique exercises with logged sets
    const uniqueExercisesCount = useMemo(() => {
        const completedSessionIds = new Set(sessions.map(s => s.id));
        return new Set(
            sets
                .filter(s => completedSessionIds.has(s.sessionId))
                .map(s => s.exerciseId)
        ).size;
    }, [sessions, sets]);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <header>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/10">
                        <ChartBar size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Progress</h1>
                        <p className="text-sm text-muted-foreground">Track your progressive overload</p>
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3">
                <StatCard
                    icon={Activity}
                    label="Workouts"
                    value={sessions.length}
                />
                <StatCard
                    icon={Zap}
                    label="Volume"
                    value={Math.round(totalVolume / 1000)}
                    unit="k"
                />
                <StatCard
                    icon={Trophy}
                    label="Exercises"
                    value={uniqueExercisesCount}
                />
            </div>

            {/* Program Specific Performance */}
            <section className="space-y-4">
                <SectionHeader title="Program Performance" icon={TrendingUp} />

                <div className="grid gap-6">
                    {programs.map((program, index) => {
                        // Get exercises for this program
                        const programExIds = new Set(
                            programExercises
                                .filter(pe => pe.programId === program.id)
                                .map(pe => pe.exerciseId)
                        );
                        const exercisesInProgram = exercises.filter(ex => programExIds.has(ex.id));

                        return (
                            <motion.div
                                key={program.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <ProgramProgressCard
                                    program={program}
                                    exercises={exercisesInProgram}
                                    sessions={sessions}
                                    sets={sets}
                                />
                            </motion.div>
                        );
                    })}

                    {programs.length === 0 && (
                        <EmptyState
                            icon={Activity}
                            title="No active programs"
                            description="Go to the Workouts page to create and start a training program."
                        />
                    )}
                </div>
            </section>

            {/* Recent History */}
            <section className="space-y-4">
                <SectionHeader title="Recent Sessions" icon={Calendar} />
                <div className="grid gap-3">
                    {sessions.slice().reverse().slice(0, 5).map((session, index) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="p-4 hover-lift group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex justify-between items-center">
                                    <div className="space-y-1">
                                        <p className="font-black text-sm">{format(session.date, 'EEEE, MMM dd')}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px] py-0">
                                                {programs.find(p => p.id === session.programId)?.name || 'Custom Session'}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground">
                                                {format(session.date, 'HH:mm')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 justify-end text-primary">
                                            <TrendingUp size={12} />
                                            <span className="text-xs font-bold">
                                                {Math.round(sets.filter(s => s.sessionId === session.id).reduce((acc, s) => acc + (s.weight * s.reps), 0))}kg
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                                            Total Volume
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}

                    {sessions.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground text-sm border border-dashed rounded-xl grayscale opacity-50">
                            No training history yet
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
