'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, Button, Input, Badge } from '@/components/ui/core';
import { Camera, X, Check, Loader2, Zap, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MealScannerProps {
    onClose: () => void;
    onConfirm: (meal: any) => void;
}

export function MealScanner({ onClose, onConfirm }: MealScannerProps) {
    const [step, setStep] = useState<'camera' | 'scanning' | 'result'>('camera');
    const [isProcessing, setIsProcessing] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, []);

    const startCamera = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            setStream(s);
            if (videoRef.current) videoRef.current.srcObject = s;
        } catch (err) {
            console.error("Camera error:", err);
            setError("Could not access camera. Please check permissions.");
        }
    };

    const handleScan = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setStep('scanning');
        setError(null);

        try {
            // Capture image from video
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Could not get canvas context");

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

            // Call real AI Analyzer
            const response = await fetch('/api/analyze-food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setResult(data);
            setStep('result');
        } catch (err: any) {
            console.error("Scanning error:", err);
            setError(err.message || "Failed to analyze meal. Please try again.");
            setStep('camera');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md animate-fade-in">
            {/* Header */}
            <header className="p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <Sparkles size={18} />
                    </div>
                    <span className="font-black text-white tracking-tight uppercase text-xs">AI Meal Scanner</span>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={onClose}>
                    <X size={24} />
                </Button>
            </header>

            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {step === 'camera' && (
                        <motion.div
                            key="camera"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col"
                        >
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="h-full w-full object-cover"
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Scanning UI Overlays */}
                            <div className="absolute inset-x-8 top-1/4 bottom-1/4 border-2 border-primary/50 rounded-3xl overflow-hidden">
                                <motion.div
                                    className="h-1 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)] absolute w-full"
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent h-1/4" />
                            </div>

                            <div className="absolute bottom-12 inset-x-0 flex flex-col items-center gap-4">
                                {error && (
                                    <div className="bg-destructive/90 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg mb-4 text-center max-w-[80%]">
                                        {error}
                                    </div>
                                )}
                                <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                    Place food within the frame
                                </p>
                                <Button
                                    size="lg"
                                    className="h-20 w-20 rounded-full bg-white border-[6px] border-primary/30 p-0 shadow-2xl hover:scale-110 active:scale-95 transition-all"
                                    onClick={handleScan}
                                >
                                    <div className="h-full w-full rounded-full border-2 border-black/5 flex items-center justify-center">
                                        <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white">
                                            <Camera size={28} />
                                        </div>
                                    </div>
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'scanning' && (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center space-y-8"
                        >
                            <div className="relative">
                                <motion.div
                                    className="h-32 w-32 rounded-full border-4 border-primary border-t-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="text-primary animate-pulse" size={40} />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-black text-white">Analyzing Meal...</h3>
                                <p className="text-primary font-bold text-xs uppercase tracking-widest animate-pulse">Running Neural Vision</p>
                            </div>
                        </motion.div>
                    )}

                    {step === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex flex-col p-6 items-center justify-center"
                        >
                            <Card className="w-full max-w-sm p-6 space-y-6 bg-zinc-900 border-primary/20 shadow-2xl">
                                <div className="text-center space-y-3">
                                    <Badge variant="outline" className="text-primary bg-primary/10 border-primary/20">Scan Complete</Badge>

                                    {/* Main Detected Name Display */}
                                    <div className="space-y-1">
                                        <div className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(var(--primary),0.3)] capitalize">
                                            {result.name}
                                        </div>
                                        <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] opacity-80">AI Vision Match</p>
                                    </div>

                                    <p className="text-sm text-zinc-400">Review the estimated nutrition values below</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Meal Name</label>
                                        <Input
                                            value={result.name}
                                            onChange={e => setResult({ ...result, name: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white font-bold h-12"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Calories</label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={result.calories}
                                                    onChange={e => setResult({ ...result, calories: parseFloat(e.target.value) || 0 })}
                                                    className="bg-white/5 border-white/10 text-white font-bold h-12 pr-12"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600">kcal</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Protein</label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={result.protein}
                                                    onChange={e => setResult({ ...result, protein: parseFloat(e.target.value) || 0 })}
                                                    className="bg-zinc-800/50 border-white/10 text-white font-bold h-12 pr-10"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600">g</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Carbs</label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={result.carbs}
                                                    onChange={e => setResult({ ...result, carbs: parseFloat(e.target.value) || 0 })}
                                                    className="bg-zinc-800/50 border-white/10 text-white font-bold h-12 pr-10"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600">g</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Fat</label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={result.fat}
                                                    onChange={e => setResult({ ...result, fat: parseFloat(e.target.value) || 0 })}
                                                    className="bg-zinc-800/50 border-white/10 text-white font-bold h-12 pr-10"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600">g</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-white/10 text-white h-14 font-black uppercase tracking-widest gap-2"
                                        onClick={() => setStep('camera')}
                                    >
                                        <RefreshCw size={18} />
                                        Retake
                                    </Button>
                                    <Button
                                        className="flex-1 h-14 font-black uppercase tracking-widest gap-2 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                                        onClick={() => onConfirm(result)}
                                    >
                                        <Check size={20} strokeWidth={3} />
                                        Confirm
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
