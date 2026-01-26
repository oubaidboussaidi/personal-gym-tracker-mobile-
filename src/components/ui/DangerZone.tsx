'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Card } from './core';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/components/ui/core';

interface DangerZoneProps {
    title: string;
    description: string;
    onReset: () => void;
    buttonLabel?: string;
    isDefaultExpanded?: boolean;
    className?: string;
}

export function DangerZone({
    title,
    description,
    onReset,
    buttonLabel = "Reset Data",
    isDefaultExpanded = false,
    className
}: DangerZoneProps) {
    const [isExpanded, setIsExpanded] = useState(isDefaultExpanded);

    return (
        <section className={cn("pt-4", className)}>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
            >
                <Card className={cn(
                    "border-destructive/20 bg-destructive/5 overflow-hidden transition-all duration-300",
                    !isExpanded && "hover:bg-destructive/10"
                )}>
                    {/* Header - Always visible and acts as toggle if not me-page style */}
                    <div
                        className={cn(
                            "flex items-center justify-between p-4 cursor-pointer",
                            isExpanded && "border-b border-destructive/10"
                        )}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertTriangle size={16} className={cn(isExpanded && "animate-pulse")} />
                            <h2 className="font-black uppercase tracking-widest text-[10px]">Danger Zone</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isExpanded && (
                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                                    {title}
                                </span>
                            )}
                            {isExpanded ? <ChevronUp size={14} className="text-destructive/50" /> : <ChevronDown size={14} className="text-destructive/50" />}
                        </div>
                    </div>

                    {/* Expandable Content */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <div className="p-4 space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-foreground">{title}</p>
                                        <p className="text-[9px] text-muted-foreground font-bold leading-relaxed">
                                            {description}
                                        </p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        className="w-full h-10 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-destructive/10 hover:scale-[1.01] active:scale-95 transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onReset();
                                        }}
                                    >
                                        <Trash2 size={14} className="mr-2" />
                                        {buttonLabel}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        </section>
    );
}
