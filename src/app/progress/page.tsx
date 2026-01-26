'use client';

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Card, Button, SectionHeader, StatCard, Badge, EmptyState } from '@/components/ui/core';
import { DangerZone } from '@/components/ui/DangerZone';
import { ProgramProgressCard } from '@/components/progress/ProgramProgressCard';
import { MuscleHeatmap } from '@/components/progress/MuscleHeatmap';
import { TrendingUp, Trophy, Activity, Calendar, Zap, ChartBar, Edit2, Activity as ActivityIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import Link from 'next/link';

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

    const profile = useLiveQuery(() =>
        db.userProfile.toCollection().first()
    );

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

    // Calculate muscle group frequency for the heatmap (last 30 days)
    const muscleData = useMemo(() => {
        const thirtyDaysAgo = subDays(new Date(), 30);
        const recentSessions = sessions.filter(s => new Date(s.date) >= thirtyDaysAgo);
        const recentSessionIds = new Set(recentSessions.map(s => s.id));

        const counts: Record<string, number> = {
            chest: 0, back: 0, legs: 0, shoulders: 0, arms: 0, abs: 0,
            biceps: 0, triceps: 0, forearms: 0, quads: 0, hamstrings: 0, glutes: 0, calves: 0, traps: 0
        };

        const activeSets = sets.filter(s => recentSessionIds.has(s.sessionId));

        activeSets.forEach(set => {
            const exercise = exercises.find(ex => ex.id === set.exerciseId);
            if (exercise?.category && counts.hasOwnProperty(exercise.category)) {
                counts[exercise.category]++;
            }
        });

        return counts;
    }, [sessions, sets, exercises]);

    const handleResetAnalytics = async () => {
        if (!confirm('⚠️ CLEAR ALL ANALYTICS?\n\nThis will remove your entire workout history (sessions and sets) to reset your progress charts. Your programs and profile will stay.')) {
            return;
        }
        await db.transaction('rw', [db.sessions, db.sets], async () => {
            await db.sets.clear();
            await db.sessions.clear();
        });
        window.location.reload();
    };

    return (
        <div className="space-y-8 animate-fade-in pb-24">
            {/* Header */}
            <header>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/10">
                        <ChartBar size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Progress</h1>
                        <p className="text-sm text-muted-foreground uppercase font-black tracking-widest opacity-60">Analytics Center</p>
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

            {/* Muscle Heatmap Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Muscle Heatmap" icon={ActivityIcon} />
                    <Badge variant="outline" className="text-[10px] font-black uppercase bg-primary/5 text-primary">Last 30 Days</Badge>
                </div>
                <Card className="p-1 border-primary/10 shadow-lg">
                    <MuscleHeatmap
                        data={muscleData}
                        gender={profile?.gender === 'female' ? 'female' : 'male'}
                    />
                </Card>
            </section>

            {/* Program Specific Performance */}
            <section className="space-y-4">
                <SectionHeader title="Training Programs" icon={TrendingUp} />

                <div className="grid gap-6">
                    {programs.map((program, index) => {
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
                            <Link href={`/workouts/session/${session.programId}?editSessionId=${session.id}`}>
                                <Card className="p-4 hover-lift group relative overflow-hidden cursor-pointer border-primary/5">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative flex justify-between items-center">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-black text-sm">{format(session.date, 'EEEE, MMM dd')}</p>
                                                <Edit2 size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] py-0 font-black">
                                                    {programs.find(p => p.id === session.programId)?.name || 'Custom Session'}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground font-bold">
                                                    {format(session.date, 'HH:mm')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 justify-end text-primary">
                                                <TrendingUp size={12} />
                                                <span className="text-xs font-black">
                                                    {Math.round(sets.filter(s => s.sessionId === session.id).reduce((acc, s) => acc + (s.weight * s.reps), 0))}kg
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                                                Total Volume
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}

                    {sessions.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground text-sm border border-dashed rounded-xl grayscale opacity-50">
                            No training history yet
                        </div>
                    )}
                </div>
            </section>

            {/* Danger Zone */}
            <DangerZone
                title="Reset Analytics"
                description="This will clear all your session and set history while keeping your programs intact. Best for starting a new season."
                onReset={handleResetAnalytics}
                buttonLabel="Clear Progress History"
            />
        </div>
    );
}
