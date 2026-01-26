'use client';

import { useState } from 'react';
import { Card, Button, Input, Badge } from '@/components/ui/core';
import { Trash2, Edit2, Check, X, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MealItemProps {
    item: {
        id: string;
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    onDelete: () => void;
    onUpdate: (updates: any) => void;
}

export function MealItem({ item, onDelete, onUpdate }: MealItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(item);

    const handleSave = () => {
        onUpdate(editData);
        setIsEditing(false);
    };

    return (
        <Card className="p-4 hover-lift group overflow-hidden relative">
            <AnimatePresence mode="wait">
                {!isEditing ? (
                    <motion.div
                        key="view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Utensils size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm">{item.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-black text-primary">{item.calories} kcal</span>
                                    <div className="flex items-center gap-1.5 ml-2">
                                        <Badge variant="outline" className="text-[9px] h-4 bg-red-500/5 text-red-500 border-red-500/20">{item.protein}P</Badge>
                                        <Badge variant="outline" className="text-[9px] h-4 bg-amber-500/5 text-amber-500 border-amber-500/20">{item.carbs}C</Badge>
                                        <Badge variant="outline" className="text-[9px] h-4 bg-blue-500/5 text-blue-500 border-blue-500/20">{item.fat}F</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                                <Edit2 size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="edit"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <Input
                                className="h-8 font-bold text-sm bg-transparent border-none p-0 focus:ring-0"
                                value={editData.name}
                                onChange={e => setEditData({ ...editData, name: e.target.value })}
                            />
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={handleSave}>
                                    <Check size={14} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setIsEditing(false)}>
                                    <X size={14} />
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-muted-foreground">kCal</label>
                                <Input type="number" className="h-8 text-xs px-2" value={editData.calories} onChange={e => setEditData({ ...editData, calories: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-muted-foreground">Pro</label>
                                <Input type="number" className="h-8 text-xs px-2" value={editData.protein} onChange={e => setEditData({ ...editData, protein: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-muted-foreground">Carb</label>
                                <Input type="number" className="h-8 text-xs px-2" value={editData.carbs} onChange={e => setEditData({ ...editData, carbs: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-muted-foreground">Fat</label>
                                <Input type="number" className="h-8 text-xs px-2" value={editData.fat} onChange={e => setEditData({ ...editData, fat: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
