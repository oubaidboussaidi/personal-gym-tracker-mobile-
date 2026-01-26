'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Button, Card, Input, Badge, SectionHeader } from '@/components/ui/core';
import { Settings2, Zap, TrendingUp, Edit3, Calculator } from 'lucide-react';
import { calculateNutritionGoals, getGoalTypeLabel, getActivityLevelLabel } from '@/lib/nutrition/goalCalculator';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { requestNotificationPermission } from '@/lib/notifications/nutritionReminder';

export function GoalsCard() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const goals = useLiveQuery(() => db.nutritionGoals.toCollection().first());
    const profile = useLiveQuery(() => db.userProfile.toCollection().first());

    const [mode, setMode] = useState<'auto' | 'manual'>(goals?.mode || 'manual');
    const [goalType, setGoalType] = useState(goals?.goalType || 'maintain');
    const [activityLevel, setActivityLevel] = useState(goals?.activityLevel || 'moderate');

    // Manual mode values
    const [manualCalories, setManualCalories] = useState(goals?.caloriesTarget.toString() || '2500');
    const [manualProtein, setManualProtein] = useState(goals?.proteinTarget.toString() || '180');
    const [manualCarbs, setManualCarbs] = useState(goals?.carbsTarget.toString() || '250');
    const [manualFat, setManualFat] = useState(goals?.fatTarget.toString() || '70');

    const handleModeToggle = async () => {
        if (!profile && mode === 'manual') {
            sendMissingStatsNotification();
            router.push('/me');
            return;
        }

        const newMode = mode === 'auto' ? 'manual' : 'auto';
        setMode(newMode);

        if (newMode === 'auto' && profile) {
            const calculated = calculateNutritionGoals(profile, goalType, activityLevel);
            if (goals) {
                await db.nutritionGoals.update(goals.id, {
                    ...calculated,
                    mode: 'auto',
                    lastCalculated: new Date()
                });
            }
        } else if (newMode === 'manual' && goals) {
            await db.nutritionGoals.update(goals.id, { mode: 'manual' });
        }
    };

    const sendMissingStatsNotification = async () => {
        if ('Notification' in window) {
            const granted = await requestNotificationPermission();
            if (granted) {
                new Notification('FitTrack Pro', {
                    body: 'Enter body metrics for the auto option',
                    icon: '/icon-192.png'
                });
            }
        }
    };

    const handleGoalTypeChange = async (newGoalType: typeof goalType) => {
        setGoalType(newGoalType);
        if (mode === 'auto' && profile && goals) {
            const calculated = calculateNutritionGoals(profile, newGoalType, activityLevel);
            await db.nutritionGoals.update(goals.id, {
                ...calculated,
                lastCalculated: new Date()
            });
        }
    };

    const handleActivityChange = async (newActivity: typeof activityLevel) => {
        setActivityLevel(newActivity);
        if (mode === 'auto' && profile && goals) {
            const calculated = calculateNutritionGoals(profile, goalType, newActivity);
            await db.nutritionGoals.update(goals.id, {
                ...calculated,
                lastCalculated: new Date()
            });
        }
    };

    const handleManualSave = async () => {
        if (!goals) return;
        await db.nutritionGoals.update(goals.id, {
            caloriesTarget: parseInt(manualCalories),
            proteinTarget: parseInt(manualProtein),
            carbsTarget: parseInt(manualCarbs),
            fatTarget: parseInt(manualFat)
        });
        setIsEditing(false);
    };

    if (!goals) return null;

    const canUseAuto = !!profile;

    return (
        <Card className="p-4 space-y-4 gradient-card relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Zap size={100} />
            </div>

            <div className="relative z-10 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <SectionHeader title="Nutrition Goals" icon={Zap} />
                    <div className="flex items-center gap-2">
                        <Button
                            variant={mode === 'auto' ? 'default' : 'outline'}
                            size="sm"
                            onClick={handleModeToggle}
                            className="gap-2"
                        >
                            {mode === 'auto' ? <Calculator size={14} /> : <Edit3 size={14} />}
                            {mode === 'auto' ? 'Auto' : 'Manual'}
                        </Button>
                    </div>
                </div>

                {/* Auto mode controls */}
                <AnimatePresence mode="wait">
                    {mode === 'auto' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Goal Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['maintain', 'lean_bulk', 'dirty_bulk', 'normal_cut', 'aggressive_cut'] as const).map((type) => (
                                        <Button
                                            key={type}
                                            variant={goalType === type ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleGoalTypeChange(type)}
                                            className="text-xs h-auto py-2"
                                        >
                                            {getGoalTypeLabel(type).split(' (')[0]}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Activity Level</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['low', 'moderate', 'high'] as const).map((level) => (
                                        <Button
                                            key={level}
                                            variant={activityLevel === level ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleActivityChange(level)}
                                            className="text-xs capitalize"
                                        >
                                            {level}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/me')}
                                className="w-full gap-2"
                            >
                                <Settings2 size={14} />
                                Update Profile Stats
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Goals Display / Edit */}
                <div className="space-y-3 pt-2">
                    {isEditing && mode === 'manual' ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Calories</label>
                                    <Input type="number" value={manualCalories} onChange={(e) => setManualCalories(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Protein (g)</label>
                                    <Input type="number" value={manualProtein} onChange={(e) => setManualProtein(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Carbs (g)</label>
                                    <Input type="number" value={manualCarbs} onChange={(e) => setManualCarbs(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Fats (g)</label>
                                    <Input type="number" value={manualFat} onChange={(e) => setManualFat(e.target.value)} />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleManualSave} className="flex-1">Save Goals</Button>
                                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                                <span className="text-sm font-semibold">Calories</span>
                                <span className="text-lg font-black stat-number">{goals.caloriesTarget} kcal</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 rounded-lg bg-muted/30 text-center">
                                    <div className="text-xs text-muted-foreground">Protein</div>
                                    <div className="font-bold stat-number">{goals.proteinTarget}g</div>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/30 text-center">
                                    <div className="text-xs text-muted-foreground">Carbs</div>
                                    <div className="font-bold stat-number">{goals.carbsTarget}g</div>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/30 text-center">
                                    <div className="text-xs text-muted-foreground">Fats</div>
                                    <div className="font-bold stat-number">{goals.fatTarget}g</div>
                                </div>
                            </div>

                            {mode === 'manual' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                    className="w-full gap-2 mt-2"
                                >
                                    <Edit3 size={14} />
                                    Edit Goals
                                </Button>
                            )}
                            {mode === 'auto' && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                    <TrendingUp size={12} />
                                    <span>Syncing with your Profile</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!canUseAuto && mode === 'manual' && (
                    <div
                        className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => {
                            sendMissingStatsNotification();
                            router.push('/me');
                        }}
                    >
                        💡 Add your body stats to enable auto goal calculation
                    </div>
                )}
            </div>
        </Card>
    );
}
