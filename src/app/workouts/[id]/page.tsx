'use client';

import { useState, use, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Button, Card, Input, SectionHeader, Badge, EmptyState } from '@/components/ui/core';
import { Plus, Trash2, ArrowLeft, GripVertical, Play, CalendarPlus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const programId = parseInt(id);
    const router = useRouter();

    const [isAddingExercise, setIsAddingExercise] = useState(false);
    const [exerciseName, setExerciseName] = useState('');
    const [targetSets, setTargetSets] = useState('3');
    const [targetReps, setTargetReps] = useState('8-12');

    // Template Management State
    const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
    const [isAddingDay, setIsAddingDay] = useState(false);
    const [newDayName, setNewDayName] = useState('');

    const program = useLiveQuery(() => db.programs.get(programId), [programId]);

    const templates = useLiveQuery(() =>
        db.workoutTemplates
            .where('programId').equals(programId)
            .toArray()
        , [programId]);

    // Set active template on load
    useEffect(() => {
        if (templates && templates.length > 0 && activeTemplateId === null) {
            setActiveTemplateId(templates[0].id);
        }
    }, [templates, activeTemplateId]);

    const exercisesInProgram = useLiveQuery(async () => {
        if (!activeTemplateId) return [];

        const junctions = await db.programExercises
            .where({ programId, workoutTemplateId: activeTemplateId }) // Compound index usage or filter
            .toArray();

        // Manual sort since compound index might not be fully optimized for sort yet
        junctions.sort((a, b) => a.order - b.order);

        return Promise.all(
            junctions.map(async (j) => {
                const exercise = await db.exercises.get(j.exerciseId);
                return { ...j, exercise };
            })
        );
    }, [programId, activeTemplateId]);

    const handleAddDay = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDayName.trim()) return;

        const id = await db.workoutTemplates.add({
            programId,
            name: newDayName.trim(),
            createdAt: new Date()
        });

        setNewDayName('');
        setIsAddingDay(false);
        setActiveTemplateId(id);
    };

    const handleAddExercise = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!exerciseName || !activeTemplateId) return;

        // 1. Create or find exercise globally
        let exercise = await db.exercises.where('name').equalsIgnoreCase(exerciseName).first();
        if (!exercise) {
            const exId = await db.exercises.add({ name: exerciseName });
            exercise = await db.exercises.get(exId);
        }

        // 2. Add to program_exercises for specific template
        // Count exercises in this specific template
        const allInTemplate = await db.programExercises
            .where({ programId, workoutTemplateId: activeTemplateId })
            .count();

        await db.programExercises.add({
            programId,
            workoutTemplateId: activeTemplateId,
            exerciseId: exercise!.id,
            order: allInTemplate + 1,
            targetSets: parseInt(targetSets) || 3,
            targetReps: targetReps,
        });

        setExerciseName('');
        setIsAddingExercise(false);
    };

    const removeExercise = async (junctionId: number) => {
        if (confirm('Remove this exercise from the workout?')) {
            await db.programExercises.delete(junctionId);
        }
    };

    const deleteTemplate = async (templateId: number) => {
        if (confirm('Delete this workout day and all its exercises?')) {
            // Delete exercises first
            await db.programExercises
                .where({ programId, workoutTemplateId: templateId })
                .delete();

            // Delete template
            await db.workoutTemplates.delete(templateId);

            // Reset active to first available or null
            if (activeTemplateId === templateId) {
                setActiveTemplateId(null); // Effect will pick next
            }
        }
    };

    if (!program) return <div className="p-4">Loading...</div>;

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            {/* Header */}
            <header className="flex items-center gap-4">
                <Link href="/workouts">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-black tracking-tight">{program.name}</h1>
                    <p className="text-sm text-muted-foreground">
                        Configure your workout schedule
                    </p>
                </div>
            </header>

            {/* Template Tabs (Workout Days) */}
            <section className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Workout Days
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs gap-1"
                        onClick={() => setIsAddingDay(true)}
                    >
                        <Plus size={12} /> Add Day
                    </Button>
                </div>

                {/* Add Day Input */}
                {isAddingDay && (
                    <motion.form
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleAddDay}
                        className="flex gap-2 mb-2"
                    >
                        <Input
                            value={newDayName}
                            onChange={e => setNewDayName(e.target.value)}
                            placeholder="Day Name (e.g. Upper A)"
                            autoFocus
                            className="h-9"
                        />
                        <Button type="submit" size="sm" className="h-9">Save</Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => setIsAddingDay(false)}
                        >
                            <X size={16} />
                        </Button>
                    </motion.form>
                )}

                {/* Tags/Tabs List */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {templates?.map(t => (
                        <div key={t.id} className="relative group">
                            <button
                                onClick={() => setActiveTemplateId(t.id)}
                                className={`
                                    px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all
                                    ${activeTemplateId === t.id
                                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}
                                `}
                            >
                                {t.name}
                            </button>
                            {/* Simple delete via long press logic or small button could go here, 
                                but for mobile, maybe just a small x if active? */}
                            {activeTemplateId === t.id && templates.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteTemplate(t.id);
                                    }}
                                    className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={10} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Exercises Section */}
            <section className="space-y-4">
                <SectionHeader
                    title={templates?.find(t => t.id === activeTemplateId)?.name || "Exercises"}
                    action={
                        <Button
                            size="sm"
                            disabled={!activeTemplateId}
                            onClick={() => setIsAddingExercise(!isAddingExercise)}
                            className="gap-2"
                        >
                            <Plus size={16} /> Add Exercise
                        </Button>
                    }
                />

                {isAddingExercise && activeTemplateId && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Card className="p-4 border-primary/30 bg-primary/5">
                            <form onSubmit={handleAddExercise} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">
                                        Exercise Name
                                    </label>
                                    <Input
                                        placeholder="Bench Press, Squat, etc."
                                        value={exerciseName}
                                        onChange={(e) => setExerciseName(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">
                                            Sets
                                        </label>
                                        <Input
                                            type="number"
                                            value={targetSets}
                                            onChange={e => setTargetSets(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">
                                            Reps Goal
                                        </label>
                                        <Input
                                            placeholder="e.g. 10 or 8-12"
                                            value={targetReps}
                                            onChange={e => setTargetReps(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" className="flex-1">
                                        Add to {templates?.find(t => t.id === activeTemplateId)?.name}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setIsAddingExercise(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                )}

                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {exercisesInProgram?.map((item, index) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="p-4 hover-lift group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="cursor-grab text-muted-foreground">
                                                <GripVertical size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold">{item.exercise?.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.targetSets} sets
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.targetReps} reps
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive opacity-50 hover:opacity-100 transition-opacity"
                                            onClick={() => removeExercise(item.id)}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {exercisesInProgram?.length === 0 && !isAddingExercise && (
                        <EmptyState
                            icon={CalendarPlus}
                            title="Empty Workout"
                            description={`Add exercises to "${templates?.find(t => t.id === activeTemplateId)?.name}" to build this routine.`}
                            action={
                                <Button onClick={() => setIsAddingExercise(true)} className="gap-2">
                                    <Plus size={18} />
                                    Add Exercise
                                </Button>
                            }
                        />
                    )}
                </div>
            </section>

            {/* Floating Start Button */}
            {exercisesInProgram && exercisesInProgram.length > 0 && (
                <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
                    <Link href={`/workouts/session/${programId}`}>
                        <Button className="w-full h-14 text-lg font-black gap-2 shadow-2xl animate-pulse-glow">
                            <Play size={24} fill="currentColor" />
                            Start {templates?.find(t => t.id === activeTemplateId)?.name}
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
