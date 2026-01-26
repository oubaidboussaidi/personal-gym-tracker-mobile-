import Dexie, { type EntityTable } from 'dexie';

export interface BodyMetric {
    id: number;
    date: Date;
    weight: number; // kg
    height: number; // cm
    fatPercentage?: number;
    extraMetrics?: Record<string, number>;
}

export interface ProgressPhoto {
    id: number;
    date: Date;
    photo: Blob;
    label?: 'front' | 'side' | 'back';
}

export interface NutritionLog {
    id: number;
    date: string; // YYYY-MM-DD for querying
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    items: Array<{
        id: string;
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    }>;
}

export interface Program {
    id: number;
    name: string;
    description?: string;
    isArchived: 0 | 1;
    createdAt: Date;
}

export interface Exercise {
    id: number;
    name: string;
    category?: string; // We can use this for Muscle Group!
    notes?: string;
}

export interface ProgramExercise {
    id: number;
    programId: number;
    exerciseId: number;
    workoutTemplateId?: number;
    order: number;
    targetSets?: number;
    targetReps?: string;
}

export interface Session {
    id: number;
    programId?: number;
    templateId?: number;
    date: Date;
    note?: string;
    endTime?: Date;
    isCompleted: 0 | 1;
}

export interface SetLog {
    id: number;
    sessionId: number;
    exerciseId: number;
    setNumber: number;
    weight: number;
    reps: number;
    isWarmup: boolean;
    timestamp: Date;
}

export interface UserProfile {
    id: number;
    weight: number;
    height: number;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    bodyFatPercentage?: number;
    updatedAt: Date;
}

export interface NutritionGoals {
    id: number;
    caloriesTarget: number;
    proteinTarget: number;
    carbsTarget: number;
    fatTarget: number;
    mode: 'auto' | 'manual';
    goalType: 'maintain' | 'lean_bulk' | 'dirty_bulk' | 'normal_cut' | 'aggressive_cut';
    activityLevel: 'low' | 'moderate' | 'high';
    lastCalculated: Date;
}

export interface NotificationSettings {
    id: number;
    enabled: boolean;
    startTime: string;
    endTime: string;
    silentDays: number[];
    lastNotificationDate?: string;
}

export interface WorkoutTemplate {
    id: number;
    programId: number;
    name: string;
    createdAt: Date;
}

const db = new Dexie('FitnessTrackerDB') as Dexie & {
    bodyMetrics: EntityTable<BodyMetric, 'id'>;
    nutritionLogs: EntityTable<NutritionLog, 'id'>;
    programs: EntityTable<Program, 'id'>;
    exercises: EntityTable<Exercise, 'id'>;
    programExercises: EntityTable<ProgramExercise, 'id'>;
    sessions: EntityTable<Session, 'id'>;
    sets: EntityTable<SetLog, 'id'>;
    userProfile: EntityTable<UserProfile, 'id'>;
    nutritionGoals: EntityTable<NutritionGoals, 'id'>;
    notificationSettings: EntityTable<NotificationSettings, 'id'>;
    workoutTemplates: EntityTable<WorkoutTemplate, 'id'>;
    progressPhotos: EntityTable<ProgressPhoto, 'id'>;
};

// Database versions
db.version(1).stores({
    bodyMetrics: '++id, date',
    nutritionLogs: '++id, &date',
    programs: '++id, name, isArchived',
    exercises: '++id, name',
    programExercises: '++id, programId, exerciseId',
    sessions: '++id, date, programId',
    sets: '++id, sessionId, exerciseId'
});

db.version(2).stores({
    bodyMetrics: '++id, date',
    nutritionLogs: '++id, &date',
    programs: '++id, name, isArchived',
    exercises: '++id, name',
    programExercises: '++id, programId, exerciseId',
    sessions: '++id, date, programId',
    sets: '++id, sessionId, exerciseId',
    userProfile: '++id, updatedAt',
    nutritionGoals: '++id, mode, lastCalculated',
    notificationSettings: '++id'
});

db.version(3).stores({
    bodyMetrics: '++id, date',
    nutritionLogs: '++id, &date',
    programs: '++id, name, isArchived',
    exercises: '++id, name',
    programExercises: '++id, programId, exerciseId',
    sessions: '++id, date, programId, isCompleted',
    sets: '++id, sessionId, exerciseId',
    userProfile: '++id, updatedAt',
    nutritionGoals: '++id, mode, lastCalculated',
    notificationSettings: '++id'
});

db.version(4).stores({
    bodyMetrics: '++id, date',
    nutritionLogs: '++id, &date',
    programs: '++id, name, isArchived',
    exercises: '++id, name',
    programExercises: '++id, programId, workoutTemplateId, exerciseId',
    sessions: '++id, date, programId, templateId, isCompleted',
    sets: '++id, sessionId, exerciseId',
    userProfile: '++id, updatedAt',
    nutritionGoals: '++id, mode, lastCalculated',
    notificationSettings: '++id',
    workoutTemplates: '++id, programId, name'
});

db.version(5).stores({
    bodyMetrics: '++id, date',
    nutritionLogs: '++id, &date',
    programs: '++id, name, isArchived',
    exercises: '++id, name',
    programExercises: '++id, programId, workoutTemplateId, exerciseId',
    sessions: '++id, date, programId, templateId, isCompleted',
    sets: '++id, sessionId, exerciseId',
    userProfile: '++id, updatedAt',
    nutritionGoals: '++id, mode, lastCalculated',
    notificationSettings: '++id',
    workoutTemplates: '++id, programId, name',
    progressPhotos: '++id, date'
});

export { db };
