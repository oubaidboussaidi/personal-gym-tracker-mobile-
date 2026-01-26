'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Button, Input, Card, SectionHeader, ProgressRing, Badge } from '@/components/ui/core';
import { MacroProgress } from '@/components/nutrition/MacroProgress';
import { GoalsCard } from '@/components/nutrition/GoalsCard';
import { DangerZone } from '@/components/ui/DangerZone';
import { ChevronLeft, ChevronRight, Plus, Utensils, Zap, Camera, Trash2, Edit2, X } from 'lucide-react';
import { checkAndNotify } from '@/lib/notifications/nutritionReminder';
import { format, addDays, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { MealItem } from '@/components/nutrition/MealItem';
import { MealScanner } from '@/components/nutrition/MealScanner';

export default function NutritionPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAdding, setIsAdding] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // Quick add states
    const [cal, setCal] = useState('');
    const [pro, setPro] = useState('');
    const [carb, setCarb] = useState('');
    const [fat, setFat] = useState('');

    const dateKey = format(selectedDate, 'yyyy-MM-dd');

    const dailyLog = useLiveQuery(() =>
        db.nutritionLogs.where('date').equals(dateKey).first()
        , [dateKey]);

    const nutritionGoals = useLiveQuery(() =>
        db.nutritionGoals.toCollection().first()
    );

    const goals = {
        calories: nutritionGoals?.caloriesTarget || 2500,
        protein: nutritionGoals?.proteinTarget || 180,
        carbs: nutritionGoals?.carbsTarget || 250,
        fats: nutritionGoals?.fatTarget || 70
    };

    const current = {
        calories: dailyLog?.calories || 0,
        protein: dailyLog?.protein || 0,
        carbs: dailyLog?.carbs || 0,
        fats: dailyLog?.fat || 0
    };

    const calorieProgress = (current.calories / goals.calories) * 100;

    const handleAddMacro = async (e: React.FormEvent) => {
        e.preventDefault();
        const mealName = `Meal ${(dailyLog?.items?.length || 0) + 1}`;
        const newItem = {
            id: crypto.randomUUID(),
            name: mealName,
            calories: parseFloat(cal) || 0,
            protein: parseFloat(pro) || 0,
            carbs: parseFloat(carb) || 0,
            fat: parseFloat(fat) || 0,
        };

        const newCal = (dailyLog?.calories || 0) + newItem.calories;
        const newPro = (dailyLog?.protein || 0) + newItem.protein;
        const newCarb = (dailyLog?.carbs || 0) + newItem.carbs;
        const newFat = (dailyLog?.fat || 0) + newItem.fat;

        if (dailyLog) {
            await db.nutritionLogs.update(dailyLog.id, {
                calories: newCal,
                protein: newPro,
                carbs: newCarb,
                fat: newFat,
                items: [...(dailyLog.items || []), newItem]
            });
        } else {
            await db.nutritionLogs.add({
                date: dateKey,
                calories: newCal,
                protein: newPro,
                carbs: newCarb,
                fat: newFat,
                items: [newItem]
            });
        }

        setCal('');
        setPro('');
        setCarb('');
        setFat('');
        setIsAdding(false);
        checkAndNotify();
    };

    const deleteItem = async (itemId: string) => {
        if (!dailyLog) return;
        const itemToDelete = dailyLog.items.find(i => i.id === itemId);
        if (!itemToDelete) return;

        const newItems = dailyLog.items.filter(i => i.id !== itemId);
        await db.nutritionLogs.update(dailyLog.id, {
            calories: Math.max(0, dailyLog.calories - itemToDelete.calories),
            protein: Math.max(0, dailyLog.protein - itemToDelete.protein),
            carbs: Math.max(0, dailyLog.carbs - itemToDelete.carbs),
            fat: Math.max(0, dailyLog.fat - itemToDelete.fat),
            items: newItems
        });
    };

    const updateItem = async (itemId: string, updates: any) => {
        if (!dailyLog) return;
        const itemIndex = dailyLog.items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;

        const newItems = [...dailyLog.items];
        newItems[itemIndex] = { ...newItems[itemIndex], ...updates };

        const totals = newItems.reduce((acc, item) => ({
            calories: acc.calories + item.calories,
            protein: acc.protein + item.protein,
            carbs: acc.carbs + item.carbs,
            fat: acc.fat + item.fat,
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        await db.nutritionLogs.update(dailyLog.id, {
            ...totals,
            items: newItems
        });
    };

    const resetDay = async () => {
        if (dailyLog && confirm('Reset all macros for this day?')) {
            await db.nutritionLogs.update(dailyLog.id, {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                items: []
            });
        }
    };

    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            {/* Header */}
            <header className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Nutrition</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Track your daily intake
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsScanning(true)}
                            className="rounded-full h-12 w-12"
                        >
                            <Camera size={24} />
                        </Button>
                        <Button
                            size="icon"
                            onClick={() => setIsAdding(!isAdding)}
                            className="rounded-full h-12 w-12"
                        >
                            <Plus size={24} />
                        </Button>
                    </div>
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

            {/* AI Scanner Overlay */}
            {isScanning && (
                <MealScanner
                    onClose={() => setIsScanning(false)}
                    onConfirm={(meal) => {
                        const newItem = {
                            id: crypto.randomUUID(),
                            ...meal
                        };
                        const handleConfirmResult = async () => {
                            const newCal = (dailyLog?.calories || 0) + newItem.calories;
                            const newPro = (dailyLog?.protein || 0) + newItem.protein;
                            const newCarb = (dailyLog?.carbs || 0) + newItem.carbs;
                            const newFat = (dailyLog?.fat || 0) + newItem.fat;

                            if (dailyLog) {
                                await db.nutritionLogs.update(dailyLog.id, {
                                    calories: newCal,
                                    protein: newPro,
                                    carbs: newCarb,
                                    fat: newFat,
                                    items: [...(dailyLog.items || []), newItem]
                                });
                            } else {
                                await db.nutritionLogs.add({
                                    date: dateKey,
                                    calories: newCal,
                                    protein: newPro,
                                    carbs: newCarb,
                                    fat: newFat,
                                    items: [newItem]
                                });
                            }
                            setIsScanning(false);
                            checkAndNotify();
                        };
                        handleConfirmResult();
                    }}
                />
            )}

            {/* Goals Card */}
            <GoalsCard />

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
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
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
            </AnimatePresence>

            {/* Meal History */}
            <section className="space-y-4">
                <SectionHeader title="Daily History" icon={Utensils} />
                <div className="space-y-3">
                    {dailyLog?.items && dailyLog.items.length > 0 ? (
                        dailyLog.items.map(item => (
                            <MealItem
                                key={item.id}
                                item={item}
                                onDelete={() => deleteItem(item.id)}
                                onUpdate={(updates) => updateItem(item.id, updates)}
                            />
                        ))
                    ) : (
                        <Card className="p-8 text-center bg-muted/20 border-dashed">
                            <Utensils className="mx-auto text-muted-foreground/30 mb-2" size={32} />
                            <p className="text-sm text-muted-foreground">No meals logged for this day</p>
                        </Card>
                    )}
                </div>
            </section>

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

            {/* Danger Zone */}
            <DangerZone
                title="Clear Daily Logs"
                description="This will permanently delete all meals logged for the selected date. Your macro goals and profile data will not be affected."
                onReset={resetDay}
                buttonLabel="Reset Today's Progress"
            />
        </div>
    );
}
