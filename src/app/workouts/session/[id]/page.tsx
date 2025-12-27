'use client';

import { useState, useEffect, use } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Button, Card, Input, Badge } from '@/components/ui/core';
import { Check, Plus, Timer, X, Trophy, ArrowLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const programId = parseInt(id);
    const router = useRouter();

    const [sessionId, setSessionId] = useState<number | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [isSelectingTemplate, setIsSelectingTemplate] = useState(true);

    const program = useLiveQuery(() => db.programs.get(programId), [programId]);

    // Fetch available templates
    const templates = useLiveQuery(() =>
        db.workoutTemplates.where('programId').equals(programId).toArray()
        , [programId]);

    // Auto-select if only one template exists
    useEffect(() => {
        if (templates && templates.length === 1 && !sessionId) {
            setSelectedTemplateId(templates[0].id);
            setIsSelectingTemplate(false);
        } else if (templates && templates.length > 1) {
            // Stay in selection mode
        }
    }, [templates, sessionId]);

    const exercises = useLiveQuery(async () => {
        if (!selectedTemplateId) return [];

        const junctions = await db.programExercises
            .where({ programId, workoutTemplateId: selectedTemplateId })
            .toArray();

        // Manual sort 
        junctions.sort((a, b) => a.order - b.order);

        return Promise.all(
            junctions.map(async (j) => {
                const exercise = await db.exercises.get(j.exerciseId);
                return { ...j, exercise };
            })
        );
    }, [programId, selectedTemplateId]);

    // Sets for the current session
    const sets = useLiveQuery(() =>
        sessionId ? db.sets.where('sessionId').equals(sessionId).toArray() : []
        , [sessionId]);

    // Create session ONLY when template is selected
    useEffect(() => {
        const initSession = async () => {
            if (selectedTemplateId && !sessionId) {
                // Check if we already have an active session for today? (Optional, maybe later)

                const sId = await db.sessions.add({
                    programId,
                    templateId: selectedTemplateId,
                    date: new Date(),
                    isCompleted: 0, // Not completed yet
                });
                setSessionId(sId);
            }
        };
        initSession();
    }, [selectedTemplateId, programId]); // removed sessionId dependency to prevent double init, logic handled inside

    const addSet = async (exerciseId: number) => {
        if (!sessionId) return;

        // Get last set for this exercise in this session to default values
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

    const deleteSet = async (setId: number) => {
        await db.sets.delete(setId);
    };

    const finishWorkout = async () => {
        if (sessionId) {
            await db.sessions.update(sessionId, {
                endTime: new Date(),
                isCompleted: 1 // Officially logged
            });
            router.push('/workouts');
        }
    };

    const cancelSession = async () => {
        if (confirm('Cancel this session? All logs for this session will be lost.')) {
            if (sessionId) {
                // Cleanup sets for this session
                await db.sets.where('sessionId').equals(sessionId).delete();
                // Delete the session itself
                await db.sessions.delete(sessionId);
            }
            router.push('/workouts');
        }
    };

    const handleTemplateSelect = (templateId: number) => {
        setSelectedTemplateId(templateId);
        setIsSelectingTemplate(false);
    };

    if (!program || !templates) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Loading Workout...</p>
                </div>
            </div>
        );
    }

    // Selection View
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
                            onClick={() => handleTemplateSelect(t.id)}
                            className="p-6 cursor-pointer hover:border-primary transition-all hover-lift active:scale-95 text-center space-y-2"
                        >
                            <Calendar className="mx-auto text-primary" size={24} />
                            <h3 className="font-bold text-lg">{t.name}</h3>
                        </Card>
                    ))}
                </div>

                <Button variant="ghost" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    if (!sessionId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Starting Session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-32 animate-fade-in">
            {/* Header */}
            <header className="sticky top-0 z-10 glass -mx-4 px-4 py-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black tracking-tight">{program.name}</h1>
                            <Badge variant="outline" className="text-[10px] h-5">
                                {templates.find(t => t.id === selectedTemplateId)?.name}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Timer size={12} className="text-primary" />
                            <span className="font-semibold uppercase tracking-wider">Active Session</span>
                        </div>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={cancelSession}
                    >
                        Cancel
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
                                        <Badge variant="outline" className="text-xs">
                                            {ex.targetSets} × {ex.targetReps}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => addSet(ex.exerciseId)}
                            >
                                <Plus size={14} /> Set
                            </Button>
                        </div>

                        <Card className="p-4 space-y-3">
                            {/* Header Row */}
                            <div className="grid grid-cols-[3rem_1fr_1fr_2.5rem] gap-2 px-2 text-[10px] font-bold uppercase text-muted-foreground">
                                <span className="text-center">Set</span>
                                <span>Weight (kg)</span>
                                <span>Reps</span>
                                <span className="text-center"></span>
                            </div>

                            {/* Sets */}
                            {sets?.filter(s => s.exerciseId === ex.exerciseId).map((set, setIdx) => (
                                <motion.div
                                    key={set.id}
                                    className="grid grid-cols-[3rem_1fr_1fr_2.5rem] gap-2 items-center"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: setIdx * 0.05 }}
                                >
                                    <div className="flex items-center justify-center h-10 rounded-lg bg-muted/30 font-bold text-sm">
                                        {setIdx + 1}
                                    </div>
                                    <Input
                                        type="number"
                                        className="h-10 text-center font-bold"
                                        value={set.weight || ''}
                                        step="0.5"
                                        onChange={(e) => updateSet(set.id, { weight: parseFloat(e.target.value) })}
                                        onFocus={(e) => e.target.select()}
                                    />
                                    <Input
                                        type="number"
                                        className="h-10 text-center font-bold"
                                        value={set.reps || ''}
                                        onChange={(e) => updateSet(set.id, { reps: parseInt(e.target.value) })}
                                        onFocus={(e) => e.target.select()}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-destructive/50 hover:text-destructive"
                                        onClick={() => deleteSet(set.id)}
                                    >
                                        <X size={16} />
                                    </Button>
                                </motion.div>
                            ))}

                            {sets?.filter(s => s.exerciseId === ex.exerciseId).length === 0 && (
                                <div className="text-center py-6 border border-dashed rounded-lg text-xs text-muted-foreground">
                                    Tap "Add Set" to log your performance
                                </div>
                            )}
                        </Card>
                    </motion.section>
                ))}
            </div>

            {/* Floating Finish Button */}
            <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
                <Button
                    className="w-full h-14 text-lg font-black uppercase tracking-widest gap-3 shadow-2xl"
                    onClick={finishWorkout}
                >
                    <Check size={24} strokeWidth={3} />
                    Finish Workout
                </Button>
            </div>
        </div>
    );
}
