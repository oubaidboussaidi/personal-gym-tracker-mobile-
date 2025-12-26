import type { UserProfile, NutritionGoals } from '@/db/db';

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 * Men: (10 × weight) + (6.25 × height) - (5 × age) + 5
 * Women: (10 × weight) + (6.25 × height) - (5 × age) - 161
 */
export function calculateBMR(profile: UserProfile): number {
    const { weight, height, age, gender } = profile;

    // Use age 25 as default if not provided
    const ageValue = age || 25;

    // Base calculation
    const base = (10 * weight) + (6.25 * height) - (5 * ageValue);

    // Gender adjustment
    if (gender === 'female') {
        return base - 161;
    } else {
        // Default to male formula for 'male' or 'other'
        return base + 5;
    }
}

/**
 * Calculate Total Daily Energy Expenditure
 */
export function calculateTDEE(bmr: number, activityLevel: 'low' | 'moderate' | 'high'): number {
    const multipliers = {
        low: 1.2,       // Sedentary (little or no exercise)
        moderate: 1.55, // Moderate (exercise 3-5 days/week)
        high: 1.9       // Very active (hard exercise 6-7 days/week)
    };

    return bmr * multipliers[activityLevel];
}

/**
 * Apply goal type adjustments to TDEE
 */
export function applyGoalAdjustment(
    tdee: number,
    goalType: NutritionGoals['goalType']
): number {
    const adjustments = {
        maintain: 0,
        lean_bulk: 250,
        dirty_bulk: 500,
        normal_cut: -300,
        aggressive_cut: -600
    };

    return tdee + adjustments[goalType];
}

/**
 * Calculate macro distribution
 */
export function calculateMacros(
    targetCalories: number,
    weight: number
): {
    protein: number;
    fat: number;
    carbs: number;
} {
    // Protein: 2.0 g/kg (middle of 1.8-2.2 range)
    const protein = Math.round(weight * 2.0);

    // Fat: 0.9 g/kg (middle of 0.8-1.0 range)
    const fat = Math.round(weight * 0.9);

    // Calculate calories from protein and fat
    const proteinCalories = protein * 4; // 4 kcal per gram
    const fatCalories = fat * 9; // 9 kcal per gram

    // Remaining calories go to carbs
    const remainingCalories = targetCalories - proteinCalories - fatCalories;
    const carbs = Math.round(remainingCalories / 4); // 4 kcal per gram

    return {
        protein,
        fat,
        carbs: Math.max(0, carbs) // Ensure non-negative
    };
}

/**
 * Calculate complete nutrition goals from user profile
 */
export function calculateNutritionGoals(
    profile: UserProfile,
    goalType: NutritionGoals['goalType'],
    activityLevel: NutritionGoals['activityLevel']
): Omit<NutritionGoals, 'id' | 'mode' | 'lastCalculated'> {
    // Calculate BMR
    const bmr = calculateBMR(profile);

    // Calculate TDEE
    const tdee = calculateTDEE(bmr, activityLevel);

    // Apply goal adjustment
    const targetCalories = Math.round(applyGoalAdjustment(tdee, goalType));

    // Calculate macros
    const macros = calculateMacros(targetCalories, profile.weight);

    return {
        caloriesTarget: targetCalories,
        proteinTarget: macros.protein,
        carbsTarget: macros.carbs,
        fatTarget: macros.fat,
        goalType,
        activityLevel
    };
}

/**
 * Get user-friendly goal type label
 */
export function getGoalTypeLabel(goalType: NutritionGoals['goalType']): string {
    const labels = {
        maintain: 'Maintain Weight',
        lean_bulk: 'Lean Bulk (+250 kcal)',
        dirty_bulk: 'Dirty Bulk (+500 kcal)',
        normal_cut: 'Normal Cut (-300 kcal)',
        aggressive_cut: 'Aggressive Cut (-600 kcal)'
    };

    return labels[goalType];
}

/**
 * Get user-friendly activity level label
 */
export function getActivityLevelLabel(level: NutritionGoals['activityLevel']): string {
    const labels = {
        low: 'Low (Sedentary)',
        moderate: 'Moderate (3-5 days/week)',
        high: 'High (6-7 days/week)'
    };

    return labels[level];
}
