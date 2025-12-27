'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { WeightChart } from '@/components/me/WeightChart';
import { Button, Input, Card, SectionHeader, StatCard, Badge } from '@/components/ui/core';
import { Plus, History, Scale, Ruler, TrendingUp, TrendingDown, AlertTriangle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function MePage() {
    const [isAdding, setIsAdding] = useState(false);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');

    const metrics = useLiveQuery(() =>
        db.bodyMetrics.orderBy('date').reverse().toArray()
    ) || [];

    const latestMetric = metrics[0];
    const previousMetric = metrics[1];
    const chartData = metrics.slice(0, 10).reverse().map(m => ({ date: m.date, weight: m.weight }));

    // Calculate weight trend
    const weightTrend = latestMetric && previousMetric
        ? latestMetric.weight - previousMetric.weight
        : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!weight) return;

        await db.bodyMetrics.add({
            date: new Date(),
            weight: parseFloat(weight),
            height: parseFloat(height) || latestMetric?.height || 0,
        });

        setWeight('');
        setIsAdding(false);
    };

    const handleResetData = async () => {
        const confirmed = window.confirm(
            '⚠️ RESET ALL DATA?\n\nThis will permanently delete ALL your workouts, nutrition logs, progress history, and settings. This action cannot be undone.'
        );

        if (confirmed) {
            // Give a second confirmation for safety
            const secondConfirm = window.confirm('Final warning: Are you ABSOLUTELY sure?');
            if (secondConfirm) {
                await db.delete();
                // Database will be recreated on reload
                window.location.reload();
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <header className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Body Metrics</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Track your physical progress
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
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 space-y-3 gradient-card">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Weight
                        </span>
                        <Scale className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black stat-number">
                                {latestMetric?.weight || '--'}
                            </span>
                            <span className="text-sm text-muted-foreground">kg</span>
                        </div>
                        {weightTrend !== 0 && (
                            <div className={`flex items-center gap-1 text-xs font-semibold ${weightTrend > 0 ? 'text-warning' : 'text-success'
                                }`}>
                                {weightTrend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {Math.abs(weightTrend).toFixed(1)} kg
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="p-4 space-y-3 gradient-card">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Height
                        </span>
                        <Ruler className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black stat-number">
                                {latestMetric?.height || '--'}
                            </span>
                            <span className="text-sm text-muted-foreground">cm</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Input Form */}
            {isAdding && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    <Card className="p-4 border-primary/30 bg-primary/5">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <SectionHeader title="Log Metrics" icon={Plus} />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">
                                        Weight (kg)
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="75.5"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">
                                        Height (cm)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="180"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1">
                                    Save Progress
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

            {/* Progress Chart */}
            <section className="space-y-3">
                <SectionHeader title="Weight Trend" icon={History} />
                <Card className="p-4 pt-8">
                    <WeightChart data={chartData} />
                </Card>
            </section>

            {/* History List */}
            <section className="space-y-3">
                <SectionHeader title="Log History" icon={History} />
                <div className="space-y-2">
                    {metrics.map((m, index) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Card className="p-3 hover-lift group">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-semibold">
                                            {format(m.date, 'MMMM dd, yyyy')}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(m.date, 'HH:mm')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="default" className="font-bold">
                                            {m.weight} kg
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                if (confirm('Delete this entry?')) {
                                                    db.bodyMetrics.delete(m.id);
                                                }
                                            }}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                    {metrics.length === 0 && (
                        <Card className="p-8">
                            <div className="text-center text-muted-foreground">
                                No records yet. Start tracking your metrics!
                            </div>
                        </Card>
                    )}
                </div>
            </section>

            {/* Danger Zone */}
            <section className="pt-4 pb-2">
                <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
                    <div className="p-4 space-y-4">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertTriangle size={20} />
                            <h2 className="font-bold tracking-tight">Danger Zone</h2>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold">Reset Application Data</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Permanently delete all your local records, settings, and progress.
                                This action is irreversible.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            className="w-full gap-2 font-bold"
                            onClick={handleResetData}
                        >
                            <Trash2 size={16} />
                            Reset All Data
                        </Button>
                    </div>
                </Card>
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
