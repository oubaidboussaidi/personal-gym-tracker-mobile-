'use client';

import { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Button, Card, SectionHeader } from '@/components/ui/core';
import { Camera, Plus, Trash2, Calendar, ChevronLeft, Image as ImageIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PhotoVaultPage() {
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const photos = useLiveQuery(() =>
        db.progressPhotos.orderBy('date').reverse().toArray()
    ) || [];

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Convert file to Blob
        const reader = new FileReader();
        reader.onload = async () => {
            if (reader.result instanceof ArrayBuffer) {
                const blob = new Blob([reader.result], { type: file.type });
                await db.progressPhotos.add({
                    date: new Date(),
                    photo: blob,
                    label: 'front' // Default
                });
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const deletePhoto = async (id: number) => {
        if (confirm('Delete this photo?')) {
            await db.progressPhotos.delete(id);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ChevronLeft size={24} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Photo Vault</h1>
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest opacity-60">Visual Progress</p>
                    </div>
                </div>
                <Button
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full h-12 w-12 shadow-lg shadow-primary/20"
                >
                    <Camera size={24} />
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                />
            </header>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 gap-3">
                {photos.map((photo, index) => (
                    <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="group relative aspect-[3/4] overflow-hidden border-none shadow-xl">
                            <img
                                src={URL.createObjectURL(photo.photo)}
                                alt={`Progress ${format(photo.date, 'MMM dd, yyyy')}`}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                            {/* Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                                    {format(photo.date, 'MMM dd, yyyy')}
                                </p>
                                <p className="text-[8px] font-bold uppercase tracking-tighter opacity-60">
                                    {format(photo.date, 'EEEE')}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10"
                                    onClick={() => deletePhoto(photo.id)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}

                {photos.length === 0 && (
                    <div className="col-span-2 py-20 text-center space-y-4">
                        <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto">
                            <ImageIcon size={32} className="text-muted-foreground/30" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-muted-foreground">Your vault is empty</p>
                            <p className="text-[10px] text-muted-foreground/60 uppercase font-black">Take your first progress photo</p>
                        </div>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-full gap-2">
                            <Camera size={16} />
                            Upload Photo
                        </Button>
                    </div>
                )}
            </div>

            {/* Comparison Tool Hint */}
            {photos.length >= 2 && (
                <Card className="p-4 bg-primary/5 border-primary/20 border-dashed">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase text-foreground">Transformation View</p>
                            <p className="text-[10px] text-muted-foreground font-bold leading-tight">Swipe between your photos in the vault to track visual changes.</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
