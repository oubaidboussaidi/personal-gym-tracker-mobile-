'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Button, Card, Input, Badge } from '@/components/ui/core';
import { Check, Plus, Timer, X, Trophy, ArrowLeft, Calendar, Zap, AlertCircle, Trash2, Ghost } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { RestTimer } from '@/components/workouts/RestTimer';

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const editSessionId = searchParams.get('editSessionId');
    const queryTemplateId = searchParams.get('templateId');

    const programId = parseInt(id);
    const router = useRouter();

    const [sessionId, setSessionId] = useState<number | null>(editSessionId ? parseInt(editSessionId) : null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(queryTemplateId ? parseInt(queryTemplateId) : null);
    const [isSelectingTemplate, setIsSelectingTemplate] = useState(!editSessionId && !queryTemplateId);
    const [sessionDate, setSessionDate] = useState<Date>(new Date());

    // Rest Timer state
    const [showTimer, setShowTimer] = useState(false);
    const [restDuration, setRestDuration] = useState(60);

    const program = useLiveQuery(() => db.programs.get(programId), [programId]);

    // Fetch existing session if editing
    useEffect(() => {
        if (editSessionId) {
            const loadSession = async () => {
                const session = await db.sessions.get(parseInt(editSessionId));
                if (session) {
                    setSelectedTemplateId(session.templateId || null);
                    setSessionDate(new Date(session.date));
                    setIsSelectingTemplate(false);
                }
            };
            loadSession();
        }
    }, [editSessionId]);

    // Fetch available templates
    const templates = useLiveQuery(() =>
        db.workoutTemplates.where('programId').equals(programId).toArray()
        , [programId]);

    const exercises = useLiveQuery(async () => {
        if (!selectedTemplateId) return [];

        const junctions = await db.programExercises
            .where({ programId, workoutTemplateId: selectedTemplateId })
            .toArray();

        junctions.sort((a, b) => a.order - b.order);

        return Promise.all(
            junctions.map(async (j) => {
                const exercise = await db.exercises.get(j.exerciseId);

                // Fetch previous performance for Ghost Sets & Overload Helper
                const previousSets = await db.sets
                    .where('exerciseId')
                    .equals(j.exerciseId)
                    .reverse()
                    .toArray();

                // Filter out sets from the current active session
                const filteredSets = previousSets.filter(s => s.sessionId !== sessionId);
                const lastSessionId = filteredSets[0]?.sessionId;
                const lastSessionSets = filteredSets.filter(s => s.sessionId === lastSessionId);

                return { ...j, exercise, lastSessionData: lastSessionSets };
            })
        );
    }, [programId, selectedTemplateId, sessionId]);

    const sets = useLiveQuery(() =>
        sessionId ? db.sets.where('sessionId').equals(sessionId).toArray() : []
        , [sessionId]);

    useEffect(() => {
        const initSession = async () => {
            if (selectedTemplateId && !sessionId && !editSessionId) {
                const sId = await db.sessions.add({
                    programId,
                    templateId: selectedTemplateId,
                    date: sessionDate,
                    isCompleted: 0,
                });
                setSessionId(sId);
            }
        };
        initSession();
    }, [selectedTemplateId, programId, editSessionId, sessionId]);

    const handleDateChange = async (dateStr: string) => {
        const newDate = new Date(dateStr);
        setSessionDate(newDate);
        if (sessionId) {
            await db.sessions.update(sessionId, { date: newDate });
        }
    };

    const addSet = async (exerciseId: number) => {
        if (!sessionId) return;
        const exerciseSets = sets?.filter(s => s.exerciseId === exerciseId) || [];
        const lastSet = exerciseSets[exerciseSets.length - 1];

        await db.sets.add({
            sessionId,
            exerciseId,
            setNumber: exerciseSets.length + 1,
            weight: lastSet?.weight || 0,
            reps: lastSet?.reps || 0,
            isWarmup: false,
            timestamp: new Date(),
        });
    };

    const updateSet = async (setId: number, updates: any) => {
        await db.sets.update(setId, updates);
    };

    const toggleSetComplete = async (setId: number) => {
        setShowTimer(true);
    };

    const deleteSet = async (setId: number) => {
        await db.sets.delete(setId);
    };

    const finishWorkout = async () => {
        if (sessionId) {
            await db.sessions.update(sessionId, {
                endTime: new Date(),
                isCompleted: 1
            });
            router.push('/progress');
        }
    };

    const cancelSession = async () => {
        if (confirm('Cancel this session? All logs for this session will be lost.')) {
            if (sessionId) {
                await db.sets.where('sessionId').equals(sessionId).delete();
                await db.sessions.delete(sessionId);
            }
            router.push('/workouts');
        }
    };

    if (!program || !templates) return null;

    if (isSelectingTemplate && templates.length > 1) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-black tracking-tight">{program.name}</h1>
                    <p className="text-muted-foreground">Select today's workout</p>
                </div>
                <div className="grid gap-3 w-full max-w-sm">
                    {templates.map(t => (
                        <Card
                            key={t.id}
                            onClick={() => { setSelectedTemplateId(t.id); setIsSelectingTemplate(false); }}
                            className="p-6 cursor-pointer hover:border-primary transition-all hover-lift active:scale-95 text-center space-y-2"
                        >
                            <Calendar className="mx-auto text-primary" size={24} />
                            <h3 className="font-bold text-lg">{t.name}</h3>
                        </Card>
                    ))}
                </div>
                <Button variant="ghost" onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-32 animate-fade-in">
            {/* Header */}
            <header className="sticky top-0 z-40 glass -mx-4 px-4 py-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black tracking-tight">{program.name}</h1>
                            <Badge variant="outline" className="text-[10px] h-5">
                                {templates.find(t => t.id === selectedTemplateId)?.name}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Timer size={12} className="text-primary" />
                                <span className="font-semibold uppercase tracking-wider">
                                    {editSessionId ? 'Editing' : 'Active'}
                                </span>
                            </div>
                            <input
                                type="date"
                                className="bg-transparent border-none text-xs font-bold text-muted-foreground focus:ring-0 p-0 w-24"
                                value={format(sessionDate, 'yyyy-MM-dd')}
                                onChange={(e) => handleDateChange(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={editSessionId ? () => router.back() : cancelSession}>
                        {editSessionId ? 'Back' : 'Cancel'}
                    </Button>
                </div>
            </header>

            {/* Exercises */}
            <div className="space-y-8">
                {exercises?.map((ex, exIdx) => (
                    <motion.section
                        key={ex.id}
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: exIdx * 0.1 }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-black">
                                    {exIdx + 1}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">{ex.exercise?.name}</h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest border-primary/20 bg-primary/5 text-primary">
                                            {ex.targetSets}s × {ex.targetReps}r
                                        </Badge>
                                        {ex.exercise?.category && (
                                            <Badge className="text-[9px] uppercase font-black tracking-widest bg-muted/50 border-none">
                                                {ex.exercise.category}
                                            </Badge>
                                        )}
                                        {ex.lastSessionData && ex.lastSessionData.length > 0 && (() => {
                                            const best = ex.lastSessionData.reduce((p, c) => (c.weight > p.weight || (c.weight === p.weight && c.reps > p.reps)) ? c : p);
                                            return (
                                                <div className="flex items-center gap-1 text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shadow-sm animate-pulse">
                                                    <Zap size={10} className="fill-amber-500" />
                                                    <span>GOAL: {best.weight}kg × {best.reps + 1}</span>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" className="gap-1 h-8 px-3 text-xs font-black uppercase tracking-widest" onClick={() => addSet(ex.exerciseId)}>
                                <Plus size={14} /> Set
                            </Button>
                        </div>

                        <Card className="p-0 overflow-hidden border-primary/10">
                            {/* Previous Session Info */}
                            {ex.lastSessionData && ex.lastSessionData.length > 0 && (
                                <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center justify-between animate-fade-in">
                                    <div className="flex items-center gap-2">
                                        <Ghost size={12} className="text-primary/60" />
                                        <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground/80">Ghost Set Reference</span>
                                    </div>
                                    <div className="font-black text-[10px] text-primary">
                                        {(() => {
                                            const best = ex.lastSessionData.reduce((prev, curr) =>
                                                (curr.weight > prev.weight || (curr.weight === prev.weight && curr.reps > prev.reps)) ? curr : prev
                                            );
                                            return `${best.weight}kg × ${best.reps}`;
                                        })()}
                                    </div>
                                </div>
                            )}

                            <div className="p-4 space-y-3">
                                <div className="grid grid-cols-[2.5rem_1fr_1fr_2.5rem] gap-2 px-1 text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-60">
                                    <span className="text-center">Set</span>
                                    <span>Weight</span>
                                    <span>Reps</span>
                                    <span></span>
                                </div>

                                {sets?.filter(s => s.exerciseId === ex.exerciseId).map((set, setIdx) => {
                                    const ghostSet = ex.lastSessionData?.[setIdx];
                                    const isImproved = ghostSet && (
                                        set.weight > ghostSet.weight ||
                                        (set.weight === ghostSet.weight && set.reps > ghostSet.reps)
                                    );

                                    return (
                                        <motion.div
                                            key={set.id}
                                            className={`grid grid-cols-[2.5rem_1fr_1fr_2.5rem] gap-2 items-center relative group p-1 rounded-xl transition-all ${isImproved ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <button
                                                onClick={() => toggleSetComplete(set.id)}
                                                className={`flex items-center justify-center h-10 w-10 rounded-xl font-black text-xs transition-all ${isImproved ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                                    }`}
                                            >
                                                {isImproved ? <Check size={16} strokeWidth={4} /> : setIdx + 1}
                                            </button>

                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    className="h-10 text-center font-black bg-muted/20 border-transparent focus:border-primary transition-all relative z-10"
                                                    value={set.weight || ''}
                                                    onChange={(e) => updateSet(set.id, { weight: parseFloat(e.target.value) })}
                                                    onFocus={(e) => e.target.select()}
                                                />
                                                {/* Ghost Value */}
                                                {!set.weight && ghostSet && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-black text-sm pointer-events-none">
                                                        {ghostSet.weight}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    className="h-10 text-center font-black bg-muted/20 border-transparent focus:border-primary transition-all relative z-10"
                                                    value={set.reps || ''}
                                                    onChange={(e) => updateSet(set.id, { reps: parseInt(e.target.value) })}
                                                    onFocus={(e) => e.target.select()}
                                                />
                                                {/* Ghost Value */}
                                                {!set.reps && ghostSet && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-black text-sm pointer-events-none">
                                                        {ghostSet.reps}
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 text-destructive/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => deleteSet(set.id)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>

                                            {/* Progress Indicator for non-empty sets */}
                                            {set.weight > 0 && ghostSet && (
                                                <div className="absolute -top-1 right-12">
                                                    {isImproved ? (
                                                        <Zap size={10} className="text-primary fill-primary animate-pulse" />
                                                    ) : set.weight < ghostSet.weight ? (
                                                        <div className="h-1.5 w-1.5 rounded-full bg-destructive/40" />
                                                    ) : null}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}

                                {sets?.filter(s => s.exerciseId === ex.exerciseId).length === 0 && (
                                    <div className="text-center py-8 border border-dashed rounded-2xl text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em]">
                                        Log First Set
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.section>
                ))}
            </div>

            <AnimatePresence>
                {showTimer && (
                    <RestTimer
                        duration={restDuration}
                        onClose={() => setShowTimer(false)}
                    />
                )}
            </AnimatePresence>

            <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40">
                <Button
                    className="w-full h-16 text-xs font-black uppercase tracking-[0.4em] gap-3 shadow-[0_20px_50px_rgba(var(--primary),0.2)] rounded-2xl relative overflow-hidden group border-2 border-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    onClick={finishWorkout}
                >
                    <div className="absolute inset-0 bg-primary opacity-100 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute inset-0 animate-pulse-glow opacity-30" />
                    <div className="relative z-10 flex items-center justify-center gap-3">
                        <Check size={20} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                        <span>{editSessionId ? 'Update Session' : 'Complete Workout'}</span>
                    </div>
                </Button>
            </div>
        </div>
    );
}
