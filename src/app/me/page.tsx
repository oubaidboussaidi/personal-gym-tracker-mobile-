'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { WeightChart } from '@/components/me/WeightChart';
import { Button, Input, Card, SectionHeader, StatCard, Badge } from '@/components/ui/core';
import { DangerZone } from '@/components/ui/DangerZone';
import { Plus, History, Scale, Ruler, TrendingUp, TrendingDown, AlertTriangle, Trash2, User, Zap, Palette, Sparkles, Camera, ArrowRight, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/theme/ThemeProvider';
import Link from 'next/link';

export default function MePage() {
    const { personality } = useTheme();
    const [isAdding, setIsAdding] = useState(false);

    // Form states
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [fat, setFat] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');

    const metrics = useLiveQuery(() =>
        db.bodyMetrics.orderBy('date').reverse().toArray()
    ) || [];

    const activeProfile = useLiveQuery(() => db.userProfile.toCollection().first());

    // Recent photos for the preview
    const recentPhotos = useLiveQuery(() =>
        db.progressPhotos.orderBy('date').reverse().limit(4).toArray()
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

        const valWeight = parseFloat(weight);
        const valHeight = parseFloat(height) || latestMetric?.height || activeProfile?.height || 0;
        const valFat = parseFloat(fat) || undefined;
        const valAge = age ? parseInt(age) : activeProfile?.age;

        // 1. Save to history
        await db.bodyMetrics.add({
            date: new Date(),
            weight: valWeight,
            height: valHeight,
            fatPercentage: valFat,
        });

        // 2. Sync to active user profile for nutrition calculations
        const profile = await db.userProfile.toCollection().first();
        const profileData = {
            weight: valWeight,
            height: valHeight,
            age: valAge,
            gender: gender || profile?.gender || 'male',
            bodyFatPercentage: valFat || profile?.bodyFatPercentage,
            updatedAt: new Date()
        };

        if (profile) {
            await db.userProfile.update(profile.id, profileData);
        } else {
            await db.userProfile.add(profileData);
        }

        setWeight('');
        setFat('');
        setIsAdding(false);
    };

    const handleResetData = async () => {
        const confirmed = window.confirm(
            '⚠️ RESET ALL DATA?\n\nThis will permanently delete ALL your workouts, nutrition logs, progress history, and settings. This action cannot be undone.'
        );

        if (confirmed) {
            const secondConfirm = window.confirm('Final warning: Are you ABSOLUTELY sure?');
            if (secondConfirm) {
                await db.delete();
                window.location.reload();
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 px-1">
            {/* Header */}
            <header className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Me</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Your physical profile
                        </p>
                    </div>
                    <Button
                        size="icon"
                        onClick={() => {
                            setIsAdding(!isAdding);
                            if (!isAdding && activeProfile) {
                                setHeight(activeProfile.height?.toString() || '');
                                setAge(activeProfile.age?.toString() || '');
                                setGender(activeProfile.gender || 'male');
                                setFat(activeProfile.bodyFatPercentage?.toString() || '');
                            }
                        }}
                        className="rounded-full h-12 w-12 shadow-lg shadow-primary/20"
                    >
                        <Plus size={24} />
                    </Button>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 space-y-3 gradient-card border-primary/10 overflow-hidden relative">
                    <div className="absolute -right-2 -top-2 h-16 w-16 bg-primary/5 rounded-full blur-2xl" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                            Weight
                        </span>
                        <Scale className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1 relative z-10">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black stat-number">
                                {activeProfile?.weight || latestMetric?.weight || '--'}
                            </span>
                            <span className="text-xs font-bold text-muted-foreground uppercase">kg</span>
                        </div>
                        {weightTrend !== 0 && (
                            <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full w-fit ${weightTrend > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                                }`}>
                                {weightTrend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {Math.abs(weightTrend).toFixed(1)}kg
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="p-4 space-y-3 gradient-card border-primary/10 overflow-hidden relative">
                    <div className="absolute -right-2 -top-2 h-16 w-16 bg-primary/5 rounded-full blur-2xl" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                            Body Fat
                        </span>
                        <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1 relative z-10">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black stat-number">
                                {activeProfile?.bodyFatPercentage || latestMetric?.fatPercentage || '--'}
                            </span>
                            <span className="text-xs font-bold text-muted-foreground">%</span>
                        </div>
                        <div className="text-[9px] font-black text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full w-fit uppercase tracking-tighter">
                            Katch-McArdle
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/30 rounded-2xl p-3 text-center border border-primary/5">
                    <p className="text-[8px] font-black uppercase text-muted-foreground/60 mb-0.5 tracking-widest">Height</p>
                    <p className="text-sm font-black">{activeProfile?.height || '--'}cm</p>
                </div>
                <div className="bg-muted/30 rounded-2xl p-3 text-center border border-primary/5">
                    <p className="text-[8px] font-black uppercase text-muted-foreground/60 mb-0.5 tracking-widest">Age</p>
                    <p className="text-sm font-black">{activeProfile?.age || '--'}y</p>
                </div>
                <div className="bg-muted/30 rounded-2xl p-3 text-center border border-primary/5">
                    <p className="text-[8px] font-black uppercase text-muted-foreground/60 mb-0.5 tracking-widest">Gender</p>
                    <p className="text-sm font-black capitalize">{activeProfile?.gender || '--'}</p>
                </div>
            </div>

            {/* Input Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="p-5 border-primary/30 bg-primary/5 space-y-5">
                            <SectionHeader title="Log Body Metrics" icon={User} />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground">Weight (kg)</label>
                                    <Input type="number" step="0.1" placeholder="75.5" value={weight} onChange={(e) => setWeight(e.target.value)} autoFocus />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground">Height (cm)</label>
                                    <Input type="number" placeholder="180" value={height} onChange={(e) => setHeight(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground">Body Fat (%)</label>
                                    <Input type="number" step="0.1" placeholder="15" value={fat} onChange={(e) => setFat(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground">Age</label>
                                    <Input type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-muted-foreground">Gender</label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value as any)}
                                    className="w-full h-11 px-4 rounded-xl border-2 border-primary/10 bg-background font-black text-sm focus:border-primary outline-none transition-all"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button type="submit" onClick={handleSubmit} className="flex-1 h-12 font-black">
                                    Update Profile
                                </Button>
                                <Button variant="outline" type="button" onClick={() => setIsAdding(false)} className="h-12">
                                    Cancel
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Chart */}
            <section className="space-y-3">
                <SectionHeader title="Weight Trend" icon={History} />
                <Card className="p-4 pt-8 border-primary/5 bg-gradient-to-b from-card to-background overflow-hidden relative shadow-inner">
                    <WeightChart data={chartData} />
                </Card>
            </section>

            {/* History List */}
            <section className="space-y-3">
                <SectionHeader title="Metric History" icon={History} />
                <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar mask-fade-bottom">
                    {metrics.map((m, index) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="p-4 hover-lift group relative overflow-hidden border-primary/5 bg-card/50">
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex flex-col">
                                        <span className="font-black text-sm">
                                            {format(m.date, 'MMM dd, yyyy')}
                                        </span>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {format(m.date, 'HH:mm')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right mr-2">
                                            <p className="text-sm font-black">{m.weight}kg</p>
                                            {m.fatPercentage && (
                                                <p className="text-[9px] font-bold text-primary">{m.fatPercentage}% BF</p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                if (confirm('Delete this entry?')) {
                                                    db.bodyMetrics.delete(m.id);
                                                }
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                    {metrics.length === 0 && (
                        <Card className="p-10 border-dashed bg-muted/20 text-center border-primary/10">
                            <Scale className="mx-auto text-muted-foreground/30 mb-2" size={32} />
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">No records yet</p>
                        </Card>
                    )}
                </div>
            </section>

            {/* Improved Photo Vault Shortcut - Moved below history */}
            <section className="space-y-3">
                <SectionHeader title="Progress Photos" icon={Camera} />
                <Link href="/me/photos">
                    <Card className="group p-1 bg-card hover:border-primary/50 transition-all border-primary/10 shadow-lg active:scale-[0.98] overflow-hidden relative">
                        <div className="flex items-center gap-4 p-3 relative z-10">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0 ring-4 ring-primary/5 transition-all group-hover:ring-primary/20">
                                <Camera size={28} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-sm uppercase tracking-widest text-foreground">Visual Vault</h3>
                                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full ring-1 ring-primary/20">{recentPhotos.length} Shots</span>
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground leading-tight mt-1">Document your transformation journey through progress photos.</p>

                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex -space-x-3">
                                        {recentPhotos.length > 0 ? recentPhotos.map((photo, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ x: -10, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="h-10 w-10 btn-secondary rounded-xl border-2 border-background overflow-hidden shadow-xl ring-1 ring-black/5"
                                            >
                                                <img src={URL.createObjectURL(photo.photo)} className="h-full w-full object-cover" alt="Progress" />
                                            </motion.div>
                                        )) : (
                                            <div className="h-10 w-10 rounded-xl bg-muted/50 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground/30">
                                                <ImageIcon size={14} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute -right-2 -top-2 h-20 w-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                    </Card>
                </Link>
            </section>

            {/* Danger Zone */}
            <DangerZone
                title="Application Reset"
                description="This will clear your entire local database including photos, workouts, progress, and settings. This cannot be undone."
                onReset={handleResetData}
                buttonLabel="Reset All App Data"
                isDefaultExpanded={false}
                className="mt-8"
            />

            {/* Copyright */}
            <footer className="pt-10 pb-6 text-center">
                <p className="text-[9px] uppercase font-black tracking-[0.4em] text-muted-foreground/20">
                    FitTrack Pro © 2026
                </p>
                <div className="h-1 w-12 bg-primary/10 mx-auto mt-4 rounded-full" />
            </footer>
        </div>
    );
}
