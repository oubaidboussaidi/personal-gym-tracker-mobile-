import Dexie, { type EntityTable } from 'dexie';

export interface BodyMetric {
    id: number;
    date: Date;
    weight: number; // kg
    height: number; // cm
    fatPercentage?: number;
    // Flexible storage for other metrics if needed
    extraMetrics?: Record<string, number>;
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
    category?: string;
    notes?: string;
}

// Junction table: Which exercises are in a program
export interface ProgramExercise {
    id: number;
    programId: number;
    exerciseId: number;
    workoutTemplateId?: number; // Links to specific workout day/template
    order: number;
    targetSets?: number;
    targetReps?: string; // string to allow "8-12"
}


export interface Session {
    id: number;
    programId?: number; // Null if freestyle
    templateId?: number; // Which workout template/day was used
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

// User profile for goal calculations
export interface UserProfile {
    id: number;
    weight: number; // kg
    height: number; // cm
    age?: number;
    gender?: 'male' | 'female' | 'other';
    bodyFatPercentage?: number;
    updatedAt: Date;
}

// Nutrition goals
export interface NutritionGoals {
    id: number;
    caloriesTarget: number;
    proteinTarget: number; // g
    carbsTarget: number; // g
    fatTarget: number; // g
    mode: 'auto' | 'manual';
    goalType: 'maintain' | 'lean_bulk' | 'dirty_bulk' | 'normal_cut' | 'aggressive_cut';
    activityLevel: 'low' | 'moderate' | 'high';
    lastCalculated: Date;
}

// Notification settings
export interface NotificationSettings {
    id: number;
    enabled: boolean;
    startTime: string; // "18:00"
    endTime: string; // "00:00"
    silentDays: number[]; // [0,6] for Sun, Sat
    lastNotificationDate?: string; // YYYY-MM-DD
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
};

// Version 1: Original schema
db.version(1).stores({
    bodyMetrics: '++id, date',
    nutritionLogs: '++id, &date', // Unique index on date string
    programs: '++id, name, isArchived',
    exercises: '++id, name',
    programExercises: '++id, programId, exerciseId',
    sessions: '++id, date, programId',
    sets: '++id, sessionId, exerciseId'
});

// Version 2: Add nutrition goals and user profile
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
}).upgrade(async (tx) => {
    // Initialize default notification settings
    const settings = await tx.table('notificationSettings').toArray();
    if (settings.length === 0) {
        await tx.table('notificationSettings').add({
            enabled: false,
            startTime: '18:00',
            endTime: '00:00',
            silentDays: []
        });
    }

    // Initialize default nutrition goals (manual mode with common defaults)
    const goals = await tx.table('nutritionGoals').toArray();
    if (goals.length === 0) {
        await tx.table('nutritionGoals').add({
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
});

// Version 3: Add isCompleted to sessions
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
}).upgrade(async (tx) => {
    // Mark existing sessions as completed by default
    await tx.table('sessions').toCollection().modify({ isCompleted: 1 });
});

export interface WorkoutTemplate {
    id: number;
    programId: number;
    name: string;
    createdAt: Date;
}

// Version 4: Multi-Day Templates support
db.version(4).stores({
    bodyMetrics: '++id, date',
    nutritionLogs: '++id, &date',
    programs: '++id, name, isArchived',
    exercises: '++id, name',
    // Added workoutTemplateId to programExercises
    programExercises: '++id, programId, workoutTemplateId, exerciseId',
    // Added templateId to sessions
    sessions: '++id, date, programId, templateId, isCompleted',
    sets: '++id, sessionId, exerciseId',
    userProfile: '++id, updatedAt',
    nutritionGoals: '++id, mode, lastCalculated',
    notificationSettings: '++id',
    // New table
    workoutTemplates: '++id, programId, name'
}).upgrade(async (tx) => {
    // 1. Create a "Default" template for every existing program
    const programs = await tx.table('programs').toArray();

    for (const program of programs) {
        // Create default template
        const templateId = await tx.table('workoutTemplates').add({
            programId: program.id,
            name: 'Default Workout',
            createdAt: new Date()
        });

        // 2. Link existing programExercises to this template
        await tx.table('programExercises')
            .where('programId').equals(program.id)
            .modify({ workoutTemplateId: templateId });

        // 3. Link existing sessions to this template
        await tx.table('sessions')
            .where('programId').equals(program.id)
            .modify({ templateId: templateId });
    }
});

export { db };
