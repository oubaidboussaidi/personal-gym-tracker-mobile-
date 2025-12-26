import { Session, SetLog } from '@/db/db';
import { startOfWeek } from 'date-fns';

export interface ExerciseStat {
    date: Date;
    maxWeight: number;
    volume: number;
    reps: number;
}

export interface ProgramTrend {
    weekStart: Date;
    volume: number;
    sessionsCount: number;
    intensityIndex: number; // Avg max weight across exercises
}

/**
 * Calculates progressive overload stats for a specific exercise across completed sessions.
 */
export function getExerciseStats(
    exerciseId: number,
    sessions: Session[],
    sets: SetLog[]
): ExerciseStat[] {
    const completedSessions = sessions.filter(s => s.isCompleted);

    return completedSessions.map(session => {
        const sessionSets = sets.filter(s => s.sessionId === session.id && s.exerciseId === exerciseId);
        if (sessionSets.length === 0) return null;

        const maxWeight = Math.max(...sessionSets.map(s => s.weight));
        const volume = sessionSets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
        const reps = sessionSets.reduce((acc, s) => acc + s.reps, 0);

        return {
            date: session.date,
            maxWeight,
            volume,
            reps
        };
    }).filter((stat): stat is ExerciseStat => stat !== null);
}

/**
 * Aggregates program intensity and volume by week.
 */
export function getProgramTrends(
    programId: number,
    sessions: Session[],
    sets: SetLog[]
): ProgramTrend[] {
    const programSessions = sessions.filter(s => s.isCompleted && s.programId === programId);

    // Group by week
    const weeks: Record<string, Session[]> = {};
    programSessions.forEach(session => {
        const weekKey = startOfWeek(session.date, { weekStartsOn: 1 }).toISOString();
        if (!weeks[weekKey]) weeks[weekKey] = [];
        weeks[weekKey].push(session);
    });

    return Object.entries(weeks).map(([weekKey, weekSessions]) => {
        let totalVolume = 0;
        let totalWeight = 0;
        let setCount = 0;

        weekSessions.forEach(session => {
            const sessionSets = sets.filter(s => s.sessionId === session.id);
            totalVolume += sessionSets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
            totalWeight += sessionSets.reduce((acc, s) => acc + s.weight, 0);
            setCount += sessionSets.length;
        });

        return {
            weekStart: new Date(weekKey),
            volume: totalVolume,
            sessionsCount: weekSessions.length,
            intensityIndex: setCount > 0 ? totalWeight / setCount : 0
        };
    }).sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
}

/**
 * Detects if the latest session shows progress over the previous one.
 */
export function detectProgress(stats: ExerciseStat[]) {
    if (stats.length < 2) return { weightGain: 0, volumeGain: 0 };

    const latest = stats[stats.length - 1];
    const previous = stats[stats.length - 2];

    return {
        weightGain: latest.maxWeight - previous.maxWeight,
        volumeGain: latest.volume - previous.volume,
        isImproving: latest.volume > previous.volume || latest.maxWeight > previous.maxWeight
    };
}
