'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/core';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                        <WifiOff size={40} className="text-muted-foreground" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">You're Offline</h1>
                    <p className="text-muted-foreground">
                        This page isn't available offline yet. Please check your internet connection and try again.
                    </p>
                </div>

                {isOnline && (
                    <div className="space-y-2">
                        <p className="text-sm text-primary font-semibold">
                            ✓ Connection restored!
                        </p>
                        <Button onClick={handleReload} className="gap-2">
                            <RefreshCw size={16} />
                            Reload Page
                        </Button>
                    </div>
                )}

                {!isOnline && (
                    <p className="text-xs text-muted-foreground">
                        Most features work offline once you've visited them while online.
                    </p>
                )}
            </div>
        </div>
    );
}
