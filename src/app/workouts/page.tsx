'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Button, Card, Input, SectionHeader, Badge, EmptyState, StatCard } from '@/components/ui/core';
import { Plus, Dumbbell, Play, Settings2, Calendar, TrendingUp, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export default function WorkoutsPage() {
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Show all programs (active and archived) for now, or filter? 
    // User asked for "delete", sticking to active for main view but normally we might want an archive view.
    // For now, listing active (isArchived: 0).
    const programs = useLiveQuery(() =>
        db.programs.where('isArchived').equals(0).toArray()
    ) || [];

    // Get sessions this week for stats
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const sessionsThisWeek = useLiveQuery(() =>
        db.sessions
            .where('date')
            .between(weekStart, weekEnd, true, true)
            .count()
    ) || 0;

    const handleCreateProgram = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setError(null);
        try {
            await db.programs.add({
                name: newName.trim(),
                isArchived: 0,
                createdAt: new Date(),
            });

            setNewName('');
            setIsAdding(false);
        } catch (err) {
            console.error('Failed to create program:', err);
            setError('Failed to create program. Please try again.');
        }
    };

    // Cascade delete function
    const deleteProgram = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete "${name}"?\n\nThis will remove ALL workout templates, sessions, and history associated with this program.\n\nThis action cannot be undone.`)) {
            return;
        }

        try {
            await db.transaction('rw', [db.programs, db.workoutTemplates, db.programExercises, db.sessions, db.sets], async () => {
                // 1. Delete Sets (need to find sessions first)
                const sessions = await db.sessions.where('programId').equals(id).toArray();
                const sessionIds = sessions.map(s => s.id);
                if (sessionIds.length > 0) {
                    await db.sets.where('sessionId').anyOf(sessionIds).delete();
                }

                // 2. Delete Sessions
                await db.sessions.where('programId').equals(id).delete();

                // 3. Delete Program Exercises Junctions
                await db.programExercises.where('programId').equals(id).delete();

                // 4. Delete Workout Templates
                await db.workoutTemplates.where('programId').equals(id).delete();

                // 5. Delete Program
                await db.programs.delete(id);
            });
        } catch (error) {
            console.error("Failed to delete program:", error);
            alert("Failed to delete program. See console for details.");
        }
    };

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <div className="min-h-screen animate-pulse bg-background" />;
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {mounted ? format(new Date(), 'EEEE, MMMM dd') : 'Loading...'}
                </p>
                <Button
                    size="icon"
                    onClick={() => setIsAdding(!isAdding)}
                    className="rounded-full h-12 w-12 shadow-lg shadow-primary/20"
                >
                    <Plus size={24} />
                </Button>
            </div>

            {/* Stats Row */}
            <header className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        icon={Dumbbell}
                        label="Active Programs"
                        value={programs.length}
                    />
                    <StatCard
                        icon={Calendar}
                        label="Sessions This Week"
                        value={sessionsThisWeek}
                    />
                </div>
            </header>

            {/* Add Program Form */}
            {isAdding && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    <Card className="p-4 border-primary/30 bg-primary/5">
                        <form onSubmit={handleCreateProgram} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Program Name
                                </label>
                                <Input
                                    placeholder="e.g. Upper Body, Legs PPL, Full Body"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            {error && (
                                <p className="text-xs text-destructive font-semibold">
                                    {error}
                                </p>
                            )}
                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1">
                                    Create Program
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Card>
                </motion.div>
            )}

            {/* Programs Section */}
            <section className="space-y-4">
                <SectionHeader title="Your Programs" icon={Dumbbell} />

                <div className="grid gap-3">
                    {programs.map((program, index) => (
                        <motion.div
                            key={program.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <WorkoutProgramCard
                                program={program}
                                onDelete={() => deleteProgram(program.id, program.name)}
                            />
                        </motion.div>
                    ))}

                    {programs.length === 0 && !isAdding && (
                        <EmptyState
                            icon={Dumbbell}
                            title="No programs yet"
                            description="Create your first training program to get started with your fitness journey."
                            action={
                                <Button onClick={() => setIsAdding(true)} className="gap-2">
                                    <Plus size={18} />
                                    Create Program
                                </Button>
                            }
                        />
                    )}
                </div>
            </section>

            {/* Copyright */}
            <footer className="pt-8 pb-4 text-center">
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/40">
                    © 2025-2026 Oubaid Boussaidi
                </p>
                <p className="text-[9px] text-muted-foreground/30 mt-1">
                    All rights reserved. FitTrack Pro v1.2.0
                </p>
            </footer>
        </div>
    );
}

function WorkoutProgramCard({ program, onDelete }: { program: any, onDelete: () => void }) {
    const exerciseCount = useLiveQuery(() =>
        db.programExercises.where('programId').equals(program.id).count()
        , [program.id]);

    const lastSession = useLiveQuery(() =>
        db.sessions
            .where('programId')
            .equals(program.id)
            .reverse()
            .first()
        , [program.id]);

    return (
        <Card className="p-4 hover-lift group relative overflow-hidden">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 space-y-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                        <h3 className="font-bold text-lg leading-tight">{program.name}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                                {exerciseCount || 0} exercises
                            </Badge>
                            {lastSession && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp size={12} />
                                    Last: {format(lastSession.date, 'MMM dd')}
                                </span>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-8 w-8 -mr-1 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Link href={`/workouts/${program.id}`} className="flex-1">
                        <Button variant="outline" className="w-full gap-2">
                            <Settings2 size={16} />
                            Configure
                        </Button>
                    </Link>
                    <Link href={`/workouts/session/${program.id}`} className="flex-1">
                        <Button className="w-full gap-2">
                            <Play size={16} fill="currentColor" />
                            Start
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
}
