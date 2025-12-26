'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Button, Input, Card, SectionHeader, ProgressRing, Badge } from '@/components/ui/core';
import { MacroProgress } from '@/components/nutrition/MacroProgress';
import { GoalsCard } from '@/components/nutrition/GoalsCard';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { ChevronLeft, ChevronRight, Plus, Utensils, Zap } from 'lucide-react';
import { checkAndNotify } from '@/lib/notifications/nutritionReminder';
import { format, addDays, subDays } from 'date-fns';
import { motion } from 'framer-motion';

export default function NutritionPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAdding, setIsAdding] = useState(false);

    // Quick add states
    const [cal, setCal] = useState('');
    const [pro, setPro] = useState('');
    const [carb, setCarb] = useState('');
    const [fat, setFat] = useState('');

    const dateKey = format(selectedDate, 'yyyy-MM-dd');

    const dailyLog = useLiveQuery(() =>
        db.nutritionLogs.where('date').equals(dateKey).first()
        , [dateKey]);

    // Get dynamic goals from database
    const nutritionGoals = useLiveQuery(() =>
        db.nutritionGoals.toCollection().first()
    );

    const goals = {
        calories: nutritionGoals?.caloriesTarget || 2500,
        protein: nutritionGoals?.proteinTarget || 180,
        carbs: nutritionGoals?.carbsTarget || 250,
        fats: nutritionGoals?.fatTarget || 70
    };

    useEffect(() => {
        const initGoals = async () => {
            const count = await db.nutritionGoals.count();
            if (count === 0) {
                await db.nutritionGoals.add({
                    caloriesTarget: 2500,
                    proteinTarget: 180,
                    carbsTarget: 250,
                    fatTarget: 70,
                    mode: 'manual',
                    goalType: 'maintain',
                    activityLevel: 'moderate',
                    lastCalculated: new Date()
                });
            }
        };
        initGoals();
    }, []);

    const current = {
        calories: dailyLog?.calories || 0,
        protein: dailyLog?.protein || 0,
        carbs: dailyLog?.carbs || 0,
        fats: dailyLog?.fat || 0
    };

    const calorieProgress = (current.calories / goals.calories) * 100;

    const handleAddMacro = async (e: React.FormEvent) => {
        e.preventDefault();
        const newCal = (dailyLog?.calories || 0) + (parseFloat(cal) || 0);
        const newPro = (dailyLog?.protein || 0) + (parseFloat(pro) || 0);
        const newCarb = (dailyLog?.carbs || 0) + (parseFloat(carb) || 0);
        const newFat = (dailyLog?.fat || 0) + (parseFloat(fat) || 0);

        if (dailyLog) {
            await db.nutritionLogs.update(dailyLog.id, {
                calories: newCal,
                protein: newPro,
                carbs: newCarb,
                fat: newFat,
            });
        } else {
            await db.nutritionLogs.add({
                date: dateKey,
                calories: newCal,
                protein: newPro,
                carbs: newCarb,
                fat: newFat,
                items: []
            });
        }

        setCal('');
        setPro('');
        setCarb('');
        setFat('');
        setIsAdding(false);

        // Trigger notification check after logging
        checkAndNotify();
    };

    const resetDay = async () => {
        if (dailyLog && confirm('Reset all macros for this day?')) {
            await db.nutritionLogs.update(dailyLog.id, {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
            });
        }
    };

    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <header className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Nutrition</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Track your daily intake
                        </p>
                    </div>
                    <Button
                        size="icon"
                        onClick={() => setIsAdding(!isAdding)}
                        className="rounded-full h-12 w-12"
                    >
                        <Plus size={24} />
                    </Button>
                </div>

                {/* Date Picker */}
                <Card className="p-3 glass">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                            className="rounded-full"
                        >
                            <ChevronLeft size={20} />
                        </Button>
                        <div className="text-center">
                            <span className="font-bold text-lg">
                                {isToday ? 'Today' : format(selectedDate, 'EEEE')}
                            </span>
                            <p className="text-xs text-muted-foreground">
                                {format(selectedDate, 'MMM dd, yyyy')}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                            className="rounded-full"
                        >
                            <ChevronRight size={20} />
                        </Button>
                    </div>
                </Card>
            </header>

            {/* Goals Card */}
            <GoalsCard />

            {/* Notification Settings */}
            <NotificationSettings />

            {/* Main Calorie Ring */}
            <Card className="p-6 gradient-card relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Zap size={120} />
                </div>
                <div className="relative z-10 flex flex-col items-center space-y-4">
                    <ProgressRing progress={Math.min(calorieProgress, 100)} size={160} strokeWidth={12}>
                        <div className="text-center">
                            <div className="text-4xl font-black stat-number text-primary">
                                {current.calories}
                            </div>
                            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                Calories
                            </div>
                        </div>
                    </ProgressRing>
                    <div className="text-center space-y-1">
                        <div className="text-sm font-medium">
                            Goal: {goals.calories} kcal
                        </div>
                        <Badge variant={calorieProgress > 100 ? 'warning' : 'default'}>
                            {Math.max(0, goals.calories - current.calories)} remaining
                        </Badge>
                    </div>
                </div>
            </Card>

            {/* Quick Add Form */}
            {isAdding && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    <Card className="p-4 border-primary/30 bg-primary/5">
                        <form onSubmit={handleAddMacro} className="space-y-4">
                            <SectionHeader title="Quick Log" icon={Plus} />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Calories</label>
                                    <Input type="number" placeholder="0" value={cal} onChange={e => setCal(e.target.value)} autoFocus />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Protein (g)</label>
                                    <Input type="number" placeholder="0" value={pro} onChange={e => setPro(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Carbs (g)</label>
                                    <Input type="number" placeholder="0" value={carb} onChange={e => setCarb(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Fats (g)</label>
                                    <Input type="number" placeholder="0" value={fat} onChange={e => setFat(e.target.value)} />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button type="submit" className="flex-1">Add to Log</Button>
                                <Button variant="outline" type="button" onClick={() => setIsAdding(false)}>Cancel</Button>
                            </div>
                        </form>
                    </Card>
                </motion.div>
            )}

            {/* Macros Section */}
            <section className="space-y-4">
                <SectionHeader title="Macro Breakdown" icon={Utensils} />
                <Card className="p-4 space-y-6">
                    <MacroProgress
                        label="Protein"
                        current={current.protein}
                        target={goals.protein}
                        unit="g"
                        colorClass="bg-red-500"
                        percentage={(current.protein / goals.protein) * 100}
                    />
                    <MacroProgress
                        label="Carbohydrates"
                        current={current.carbs}
                        target={goals.carbs}
                        unit="g"
                        colorClass="bg-amber-500"
                        percentage={(current.carbs / goals.carbs) * 100}
                    />
                    <MacroProgress
                        label="Fats"
                        current={current.fats}
                        target={goals.fats}
                        unit="g"
                        colorClass="bg-blue-500"
                        percentage={(current.fats / goals.fats) * 100}
                    />
                </Card>
            </section>

            <div className="pt-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={resetDay}
                    disabled={!dailyLog}
                >
                    Reset day logs
                </Button>
            </div>
        </div>
    );
}
