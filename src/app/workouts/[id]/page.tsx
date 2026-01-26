'use client';

import { useState, use, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Button, Card, Input, SectionHeader, Badge, EmptyState, cn } from '@/components/ui/core';
import {
    Plus, Trash2, ArrowLeft, Play, CalendarPlus, X, Target, Zap,
    Activity, Shield, Check, ChevronDown, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';



const MUSCLE_GROUPS = [
    { id: 'chest', label: 'Chest', category: 'Upper Body' },
    { id: 'back', label: 'Back', category: 'Upper Body' },
    { id: 'shoulders', label: 'Shoulders', category: 'Upper Body' },
    { id: 'biceps', label: 'Biceps', category: 'Upper Body' },
    { id: 'triceps', label: 'Triceps', category: 'Upper Body' },
    { id: 'forearms', label: 'Forearms', category: 'Upper Body' },
    { id: 'traps', label: 'Traps', category: 'Upper Body' },
    { id: 'quads', label: 'Quads', category: 'Lower Body' },
    { id: 'hamstrings', label: 'Hamstrings', category: 'Lower Body' },
    { id: 'glutes', label: 'Glutes', category: 'Lower Body' },
    { id: 'calves', label: 'Calves', category: 'Lower Body' },
    { id: 'abs', label: 'Abs', category: 'Core' },
] as const;

const MUSCLE_CATEGORIES = ['Upper Body', 'Lower Body', 'Core'] as const;

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const programId = parseInt(id);
    const router = useRouter();

    const [isAddingExercise, setIsAddingExercise] = useState(false);
    const [exerciseName, setExerciseName] = useState('');
    const [targetSets, setTargetSets] = useState('3');
    const [targetReps, setTargetReps] = useState('8-12');
    const [selectedCategory, setSelectedCategory] = useState<string>('chest');
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['Upper Body']);

    const toggleCategory = (cat: string) => {
        setExpandedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

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
            .where({ programId, workoutTemplateId: activeTemplateId })
            .toArray();

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
            const exId = await db.exercises.add({
                name: exerciseName,
                category: selectedCategory
            });
            exercise = await db.exercises.get(exId);
        } else if (exercise.category !== selectedCategory) {
            // Update category if it was changed globally
            await db.exercises.update(exercise.id, { category: selectedCategory });
        }

        // 2. Add to program_exercises for specific template
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
            await db.programExercises
                .where({ programId, workoutTemplateId: templateId })
                .delete();
            await db.workoutTemplates.delete(templateId);
            if (activeTemplateId === templateId) {
                setActiveTemplateId(null);
            }
        }
    };

    if (!program) return <div className="p-4">Loading...</div>;

    const getMuscleCategory = (muscleId: string) => {
        return MUSCLE_GROUPS.find(m => m.id === muscleId)?.category || 'Upper Body';
    };

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
                    <p className="text-sm text-muted-foreground uppercase font-black tracking-widest opacity-60">
                        Workout Structure
                    </p>
                </div>
            </header>

            {/* Template Tabs (Workout Days) */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Workout Days" icon={Activity} />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1 font-black"
                        onClick={() => setIsAddingDay(true)}
                    >
                        <Plus size={14} /> NEW DAY
                    </Button>
                </div>

                {isAddingDay && (
                    <motion.form
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleAddDay}
                        className="flex gap-2 mb-2 p-3 bg-secondary/20 rounded-2xl"
                    >
                        <Input
                            value={newDayName}
                            onChange={e => setNewDayName(e.target.value)}
                            placeholder="e.g. Upper Body"
                            autoFocus
                            className="bg-background font-bold"
                        />
                        <Button type="submit" className="font-black px-4">ADD</Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsAddingDay(false)}
                        >
                            <X size={18} />
                        </Button>
                    </motion.form>
                )}

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {templates?.map(t => (
                        <div key={t.id} className="relative group shrink-0">
                            <button
                                onClick={() => setActiveTemplateId(t.id)}
                                className={`
                                    px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2
                                    ${activeTemplateId === t.id
                                        ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                                        : 'bg-card border-border text-muted-foreground hover:border-primary/30'}
                                `}
                            >
                                {t.name}
                            </button>
                            {activeTemplateId === t.id && templates.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteTemplate(t.id);
                                    }}
                                    className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-1 shadow-lg border-2 border-background"
                                >
                                    <X size={8} strokeWidth={4} />
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
                    icon={Target}
                    action={
                        <Button
                            size="sm"
                            disabled={!activeTemplateId}
                            onClick={() => setIsAddingExercise(!isAddingExercise)}
                            className="gap-2 h-9 rounded-xl font-black"
                        >
                            <Plus size={16} /> ADD
                        </Button>
                    }
                />

                {isAddingExercise && activeTemplateId && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="p-5 border-primary/30 bg-primary/5 space-y-5 shadow-2xl">
                            <form onSubmit={handleAddExercise} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                        Exercise Name
                                    </label>
                                    <Input
                                        placeholder="Bench Press, Squat, etc."
                                        value={exerciseName}
                                        onChange={(e) => setExerciseName(e.target.value)}
                                        autoFocus
                                        className="h-11 bg-background font-bold"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                        Primary Muscle Group
                                        <span className="h-px flex-1 bg-border" />
                                    </label>

                                    <div className="space-y-2">
                                        {MUSCLE_CATEGORIES.map(catName => {
                                            const categoryMuscles = MUSCLE_GROUPS.filter(m => m.category === catName);
                                            const isExpanded = expandedCategories.includes(catName);

                                            return (
                                                <div key={catName} className="space-y-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCategory(catName)}
                                                        className="w-full flex items-center justify-between p-3 px-4 rounded-2xl bg-card/40 border border-border/40 hover:bg-muted/30 transition-all group shadow-sm active:scale-[0.98]"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                                                                {catName}
                                                            </span>
                                                        </div>
                                                        <div className={`transition-transform duration-500 ease-out ${isExpanded ? 'rotate-180' : ''}`}>
                                                            <ChevronDown size={18} className="text-muted-foreground/60" />
                                                        </div>
                                                    </button>

                                                    <AnimatePresence initial={false}>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0, y: -10 }}
                                                                animate={{ height: 'auto', opacity: 1, y: 0 }}
                                                                exit={{ height: 0, opacity: 0, y: -10 }}
                                                                transition={{ duration: 0.3, ease: "circOut" }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="grid grid-cols-2 gap-2.5 py-3">
                                                                    {categoryMuscles.map((mg) => {
                                                                        const isSelected = selectedCategory === mg.id;
                                                                        return (
                                                                            <button
                                                                                key={mg.id}
                                                                                type="button"
                                                                                onClick={() => setSelectedCategory(mg.id)}
                                                                                className={`
                                                                                    flex items-center justify-between px-5 h-14 rounded-2xl border-2 transition-all relative overflow-hidden backdrop-blur-sm
                                                                                    ${isSelected
                                                                                        ? 'border-primary bg-primary shadow-xl shadow-primary/25 z-10 scale-[1.03] animate-in fade-in zoom-in-95 duration-200'
                                                                                        : 'border-border bg-card/50 text-foreground/60 dark:text-foreground/80 hover:border-primary/40 hover:bg-accent'}
                                                                                `}
                                                                            >
                                                                                <span className={`text-[11px] font-black uppercase tracking-wide ${isSelected ? 'text-black dark:text-white' : ''}`}>
                                                                                    {mg.label}
                                                                                </span>
                                                                                {isSelected && (
                                                                                    <motion.div
                                                                                        initial={{ scale: 0, x: 20 }}
                                                                                        animate={{ scale: 1, x: 0 }}
                                                                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                                                    >
                                                                                        <div className="bg-black/10 dark:bg-white/20 rounded-full p-1 border border-black/5 dark:border-white/5">
                                                                                            <Check size={12} strokeWidth={4} className="text-black dark:text-white" />
                                                                                        </div>
                                                                                    </motion.div>
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                            Sets
                                        </label>
                                        <Input
                                            type="number"
                                            value={targetSets}
                                            onChange={e => setTargetSets(e.target.value)}
                                            className="h-11 bg-background font-bold text-center"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                            Reps Goal
                                        </label>
                                        <Input
                                            placeholder="e.g. 8-12"
                                            value={targetReps}
                                            onChange={e => setTargetReps(e.target.value)}
                                            className="h-11 bg-background font-bold text-center"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button type="submit" className="flex-1 h-12 font-black uppercase tracking-widest">
                                        Save Exercise
                                    </Button>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setIsAddingExercise(false)}
                                        className="h-12"
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
                            >
                                <Card className="p-4 hover-lift group border-primary/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm tracking-tight">{item.exercise?.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-[9px] h-5 px-2 bg-muted/50 border-none font-black uppercase">
                                                        {item.targetSets} sets
                                                    </Badge>
                                                    <Badge variant="outline" className="text-[9px] h-5 px-2 bg-muted/50 border-none font-black uppercase" >
                                                        {item.targetReps} reps
                                                    </Badge>
                                                    {item.exercise?.category && (
                                                        <Badge className="text-[9px] h-5 px-2 bg-primary/10 text-primary border-none font-black uppercase">
                                                            {item.exercise.category}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive opacity-30 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeExercise(item.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {exercisesInProgram?.length === 0 && !isAddingExercise && (
                        <EmptyState
                            icon={CalendarPlus}
                            title="Plan empty"
                            description={`Add your first exercise to the "${templates?.find(t => t.id === activeTemplateId)?.name}" routine.`}
                            action={
                                <Button onClick={() => setIsAddingExercise(true)} className="gap-2 h-11 px-6 rounded-xl font-black">
                                    <Plus size={18} />
                                    ADD EXERCISE
                                </Button>
                            }
                        />
                    )}
                </div>
            </section>

            {/* Floating Start Button */}
            {exercisesInProgram && exercisesInProgram.length > 0 && (
                <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40">
                    <Link href={`/workouts/session/${programId}?templateId=${activeTemplateId}`}>
                        <Button className="w-full h-14 text-sm font-black uppercase tracking-[0.2em] gap-3 shadow-2xl rounded-2xl animate-pulse-glow">
                            <Play size={20} fill="currentColor" />
                            Start Workout
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
