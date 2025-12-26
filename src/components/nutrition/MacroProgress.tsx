'use client';

import { cn } from "@/components/ui/core";

interface MacroProgressProps {
    label: string;
    current: number;
    target?: number;
    unit: string;
    colorClass: string;
    percentage: number;
}

export function MacroProgress({ label, current, target, unit, colorClass, percentage }: MacroProgressProps) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-xs font-semibold uppercase text-muted-foreground">{label}</span>
                <span className="text-sm font-bold">
                    {current}
                    {target ? <span className="text-xs font-normal text-muted-foreground ml-1">/ {target}{unit}</span> : <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
                </span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-500 ease-out", colorClass)}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    );
}
