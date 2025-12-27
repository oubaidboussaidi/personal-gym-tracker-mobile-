'use client';

import { useEffect } from 'react';
import { scheduleNotificationChecks } from '@/lib/notifications/nutritionReminder';

export function NotificationInitializer() {
    useEffect(() => {
        // Initialize notification checks when app loads
        scheduleNotificationChecks();
    }, []);

    return null; // This component doesn't render anything
}
