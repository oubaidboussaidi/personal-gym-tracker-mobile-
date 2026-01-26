import { INTERACTIVE_MUSCLE_IDS } from './muscleMappingConstants';

// Map specific SVG IDs to broader muscle groups (keys used in the database/app)
export const SVG_MUSCLE_GROUPS: Record<string, string> = {
    'neck': 'neck',
    'upper-trapezius': 'traps',
    'trapezius': 'traps',
    'anterior-deltoid': 'shoulders',
    'lateral-deltoid': 'shoulders',
    'posterior-deltoid': 'shoulders',
    'upper-pectoralis': 'chest',
    'mid-lower-pectoralis': 'chest',
    'upper-abdominals': 'abs',
    'lower-abdominals': 'abs',
    'obliques': 'abs',
    'long-head-bicep': 'biceps',
    'short-head-bicep': 'biceps',
    'triceps': 'triceps',
    'wrist-extensors': 'forearms',
    'wrist-flexors': 'forearms',
    'latissimus-dorsi': 'back',
    'lower-back': 'back',
    'outer-quadricep': 'quads',
    'rectus-femoris': 'quads',
    'inner-quadricep': 'quads',
    'inner-thigh': 'adductors', // can map to legs or specialized
    'gluteus': 'glutes',
    'hamstrings': 'hamstrings',
    'gastrocnemius': 'calves',
    'soleus': 'calves',
    'tibialis': 'calves',
    // Back View Mappings
    'lats': 'back',
    'lowerback': 'back',
    'gluteus-maximus': 'glutes',
    'gluteus-medius': 'glutes',
    'medial-hamstrings': 'hamstrings',
    'lateral-hamstrings': 'hamstrings',
    'medial-head-triceps': 'triceps',
    'long-head-triceps': 'triceps',
    'lateral-head-triceps': 'triceps',
    'lower-trapezius': 'traps',
    'traps-middle': 'traps',
};

// Inverse map: App Muscle Key -> SVG IDs
export const CSV_TO_SVG_MUSCLE_MAP: Record<string, string[]> = {};

// Populate inverse map
Object.entries(SVG_MUSCLE_GROUPS).forEach(([svgId, pKey]) => {
    if (!CSV_TO_SVG_MUSCLE_MAP[pKey]) CSV_TO_SVG_MUSCLE_MAP[pKey] = [];
    CSV_TO_SVG_MUSCLE_MAP[pKey].push(svgId);
});

// Also handle broad 'legs' category if used
CSV_TO_SVG_MUSCLE_MAP['legs'] = [
    'outer-quadricep', 'rectus-femoris', 'inner-quadricep', 'inner-thigh',
    'hamstrings', 'gluteus', 'gastrocnemius', 'soleus', 'tibialis'
];

export const getVolumeColor = (volume: number, maxVolume: number = 1): string => {
    if (!volume || volume === 0) return 'hsl(var(--muted) / 0.2)'; // Inactive: Faint gray/muted depending on theme

    const intensity = Math.min(volume / (maxVolume || 1), 1);

    // Intensity Logic:
    // Low usage -> Low opacity primary (faded, subtle) .
    // High usage -> High opacity primary (vibrant, clear).
    // Range: 0.15 (subtle tint) -> 1.0 (solid theme color)
    const opacity = 0.15 + (intensity * 0.85);

    return `hsl(var(--primary) / ${opacity})`;
};
