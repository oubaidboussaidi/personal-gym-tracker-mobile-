'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Button, Card, Input, SectionHeader } from '@/components/ui/core';
import { Bell, BellOff, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestNotificationPermission } from '@/lib/notifications/nutritionReminder';

export function NotificationSettings() {
    const settings = useLiveQuery(() => db.notificationSettings.toCollection().first());
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);

    // Local states for form
    const [enabled, setEnabled] = useState(false);
    const [startTime, setStartTime] = useState('18:00');
    const [endTime, setEndTime] = useState('00:00');
    const [silentDays, setSilentDays] = useState<number[]>([]);

    useEffect(() => {
        if (settings) {
            setEnabled(settings.enabled);
            setStartTime(settings.startTime);
            setEndTime(settings.endTime);
            setSilentDays(settings.silentDays);
        }
    }, [settings]);

    const handleToggle = async () => {
        if (!enabled) {
            const granted = await requestNotificationPermission();
            if (!granted) {
                alert('Notification permission denied. Please enable notifications in your browser settings.');
                return;
            }
        }
        setEnabled(!enabled);
        updateSettings({ enabled: !enabled });
    };

    const updateSettings = async (updates: any) => {
        if (!settings) return;
        setIsSaving(true);
        await db.notificationSettings.update(settings.id, updates);
        setIsSaving(false);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
    };

    const toggleDay = (day: number) => {
        const newDays = silentDays.includes(day)
            ? silentDays.filter(d => d !== day)
            : [...silentDays, day];
        setSilentDays(newDays);
        updateSettings({ silentDays: newDays });
    };

    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    if (!settings) return null;

    return (
        <Card className="p-4 space-y-4 glass">
            <div className="flex items-center justify-between">
                <SectionHeader title="Reminders" icon={Bell} />
                <div className="flex items-center gap-2">
                    <AnimatePresence>
                        {showSaved && (
                            <motion.span
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-xs text-primary font-bold flex items-center gap-1"
                            >
                                <CheckCircle2 size={12} /> Saved
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={handleToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-primary' : 'bg-muted'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {enabled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-2"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                                    <Clock size={12} /> Start Time
                                </label>
                                <Input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => {
                                        setStartTime(e.target.value);
                                        updateSettings({ startTime: e.target.value });
                                    }}
                                    className="h-9 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                                    <Clock size={12} /> End Time
                                </label>
                                <Input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => {
                                        setEndTime(e.target.value);
                                        updateSettings({ endTime: e.target.value });
                                    }}
                                    className="h-9 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                                <Calendar size={12} /> Silent Days
                            </label>
                            <div className="flex justify-between">
                                {days.map((day, i) => (
                                    <button
                                        key={i}
                                        onClick={() => toggleDay(i)}
                                        className={`h-8 w-8 rounded-full text-xs font-bold transition-all ${silentDays.includes(i)
                                            ? 'bg-destructive/20 text-destructive border-destructive/30'
                                            : 'bg-muted/50 text-muted-foreground border-transparent'
                                            } border`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">
                                * No notifications will be sent on selected days.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!enabled && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 text-muted-foreground">
                    <BellOff size={16} />
                    <p className="text-xs">Reminders are currently disabled.</p>
                </div>
            )}
        </Card>
    );
}
