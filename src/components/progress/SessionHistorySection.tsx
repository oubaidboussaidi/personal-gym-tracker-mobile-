'use client';

import { useState, useMemo } from 'react';
import { Card, Badge, Button } from '@/components/ui/core';
import { Session, SetLog, Exercise } from '@/db/db';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Clock, Dumbbell, Hash, Weight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionHistorySectionProps {
    exerciseId: number;
    exerciseName: string;
    sessions: Session[];
    sets: SetLog[];
    defaultLimit?: number;
}

interface SessionDetail {
    session: Session;
    sets: SetLog[];
    totalVolume: number;
    maxWeight: number;
    totalReps: number;
}

export function SessionHistorySection({
    exerciseId,
    exerciseName,
    sessions,
    sets,
    defaultLimit = 3
}: SessionHistorySectionProps) {
    const [expanded, setExpanded] = useState(false);

    // Get all sessions with sets for this exercise
    const sessionsWithSets = useMemo<SessionDetail[]>(() => {
        const sessionDetails: SessionDetail[] = [];

        sessions.forEach(session => {
            const sessionSets = sets.filter(
                set => set.sessionId === session.id && set.exerciseId === exerciseId && !set.isWarmup
            );

            if (sessionSets.length > 0) {
                const totalVolume = sessionSets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
                const maxWeight = Math.max(...sessionSets.map(s => s.weight));
                const totalReps = sessionSets.reduce((acc, s) => acc + s.reps, 0);

                sessionDetails.push({
                    session,
                    sets: sessionSets,
                    totalVolume,
                    maxWeight,
                    totalReps
                });
            }
        });

        // Sort by most recent first
        return sessionDetails.sort((a, b) => b.session.date.getTime() - a.session.date.getTime());
    }, [sessions, sets, exerciseId]);

    const displayedSessions = expanded ? sessionsWithSets : sessionsWithSets.slice(0, defaultLimit);
    const hasMore = sessionsWithSets.length > defaultLimit;

    if (sessionsWithSets.length === 0) {
        return (
            <div className="p-6 text-center text-muted-foreground text-xs rounded-xl border-2 border-dashed">
                No workout history for this exercise yet
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <h3 className="text-sm font-bold">Session History</h3>
                    <Badge variant="outline" className="text-[10px]">
                        {sessionsWithSets.length} total
                    </Badge>
                </div>
            </div>

            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {displayedSessions.map((detail, index) => (
                        <SessionDetailCard
                            key={detail.session.id}
                            detail={detail}
                            index={index}
                        />
                    ))}
                </AnimatePresence>

                {hasMore && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-2"
                    >
                        <Button
                            variant="outline"
                            className="w-full gap-2 text-xs"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? (
                                <>
                                    <ChevronUp size={14} />
                                    Show Less
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={14} />
                                    Show {sessionsWithSets.length - defaultLimit} More Sessions
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function SessionDetailCard({ detail, index }: { detail: SessionDetail; index: number }) {
    const [showSets, setShowSets] = useState(false);
    const { session, sets, totalVolume, maxWeight, totalReps } = detail;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.03 }}
        >
            <Card className="overflow-hidden border-l-4 border-l-primary/30 hover-lift">
                <button
                    onClick={() => setShowSets(!showSets)}
                    className="w-full p-3 text-left"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-sm">
                                    {format(session.date, 'EEEE, MMM dd, yyyy')}
                                </p>
                                {index === 0 && (
                                    <Badge variant="default" className="text-[9px] px-1.5 py-0">
                                        Latest
                                    </Badge>
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                {format(session.date, 'HH:mm')} • {sets.length} sets
                            </p>

                            <div className="grid grid-cols-3 gap-3 pt-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Dumbbell size={10} />
                                        <span className="text-[9px] uppercase font-bold tracking-wider">Volume</span>
                                    </div>
                                    <p className="text-sm font-black">{Math.round(totalVolume)}kg</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Weight size={10} />
                                        <span className="text-[9px] uppercase font-bold tracking-wider">Peak</span>
                                    </div>
                                    <p className="text-sm font-black">{maxWeight}kg</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Hash size={10} />
                                        <span className="text-[9px] uppercase font-bold tracking-wider">Reps</span>
                                    </div>
                                    <p className="text-sm font-black">{totalReps}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <motion.div
                                animate={{ rotate: showSets ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={16} className="text-muted-foreground" />
                            </motion.div>
                        </div>
                    </div>
                </button>

                <AnimatePresence>
                    {showSets && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="border-t bg-muted/20 p-3 space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Set Details
                                </p>
                                <div className="space-y-1.5">
                                    {sets.map((set, idx) => (
                                        <div
                                            key={set.id}
                                            className="flex items-center justify-between bg-background/50 rounded-lg px-3 py-2 text-xs"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                                                    #{idx + 1}
                                                </Badge>
                                                <span className="font-semibold">{set.weight}kg</span>
                                                <span className="text-muted-foreground">×</span>
                                                <span className="font-semibold">{set.reps} reps</span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {Math.round(set.weight * set.reps)}kg volume
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
}
