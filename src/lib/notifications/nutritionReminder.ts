import { db, type NutritionLog, type NutritionGoals, type NotificationSettings } from '@/db/db';
import { format } from 'date-fns';

/**
 * Request notification permission from the browser
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

/**
 * Check if we should send a notification
 */
export async function checkShouldNotify(
    currentLog: NutritionLog | undefined,
    goals: NutritionGoals,
    settings: NotificationSettings
): Promise<boolean> {
    // Check if notifications are enabled
    if (!settings.enabled) {
        return false;
    }

    // Check if permission is granted
    if (Notification.permission !== 'granted') {
        return false;
    }

    // Check time window
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinutes;

    const [startHour, startMin] = settings.startTime.split(':').map(Number);
    const [endHour, endMin] = settings.endTime.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Handle time window that crosses midnight
    const inTimeWindow = endTime < startTime
        ? (currentTime >= startTime || currentTime < endTime)
        : (currentTime >= startTime && currentTime < endTime);

    if (!inTimeWindow) {
        return false;
    }

    // Check silent days
    const dayOfWeek = now.getDay();
    if (settings.silentDays.includes(dayOfWeek)) {
        return false;
    }

    // Check if already notified today
    const today = format(now, 'yyyy-MM-dd');
    if (settings.lastNotificationDate === today) {
        return false;
    }

    // Check if log exists and meets thresholds
    if (!currentLog) {
        return true; // No log at all - definitely notify
    }

    // Check calorie threshold (< 80%)
    const calorieProgress = currentLog.calories / goals.caloriesTarget;
    if (calorieProgress < 0.8) {
        return true;
    }

    // Check protein threshold (< 100%)
    const proteinProgress = currentLog.protein / goals.proteinTarget;
    if (proteinProgress < 1.0) {
        return true;
    }

    return false;
}

/**
 * Get a random motivational message
 */
function getRandomMessage(): string {
    const messages = [
        "You're close 💪 Log your last meal to hit today's calories.",
        "Protein goal not reached yet 🥩 Finish strong today.",
        "Don't lose today's streak — log your nutrition now.",
        "Almost there! 🎯 Complete your nutrition log.",
        "Keep going! 🔥 You're doing great, just finish logging.",
        "One more meal to log 🍽️ You've got this!",
        "Your goals are waiting ⏰ Log your nutrition now."
    ];

    return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Send a nutrition reminder notification
 */
export async function sendNutritionReminder(): Promise<void> {
    if (Notification.permission !== 'granted') {
        return;
    }

    const message = getRandomMessage();

    const notification = new Notification('FitTrack Pro', {
        body: message,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'nutrition-reminder',
        requireInteraction: false,
        silent: false
    });

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    // Update last notification date
    const settings = await db.notificationSettings.toCollection().first();
    if (settings) {
        await db.notificationSettings.update(settings.id, {
            lastNotificationDate: format(new Date(), 'yyyy-MM-dd')
        });
    }
}

/**
 * Check and send notification if needed
 */
export async function checkAndNotify(): Promise<void> {
    try {
        // Get settings
        const settings = await db.notificationSettings.toCollection().first();
        if (!settings || !settings.enabled) {
            return;
        }

        // Get goals
        const goals = await db.nutritionGoals.toCollection().first();
        if (!goals) {
            return;
        }

        // Get today's log
        const today = format(new Date(), 'yyyy-MM-dd');
        const currentLog = await db.nutritionLogs.where('date').equals(today).first();

        // Check if we should notify
        const shouldNotify = await checkShouldNotify(currentLog, goals, settings);

        if (shouldNotify) {
            await sendNutritionReminder();
        }
    } catch (error) {
        console.error('Error checking notifications:', error);
    }
}

/**
 * Schedule periodic notification checks
 * This runs every 30 minutes while the app is open
 */
export function scheduleNotificationChecks(): void {
    // Check immediately
    checkAndNotify();

    // Check every 30 minutes
    setInterval(() => {
        checkAndNotify();
    }, 30 * 60 * 1000); // 30 minutes
}
