import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { type LucideIcon } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/* ============================================
   BUTTON COMPONENT
   ============================================ */
export function Button({
    className,
    variant = 'default',
    size = 'default',
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'success';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}) {
    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        success: "bg-success text-primary-foreground hover:bg-success/90 shadow-md",
    };

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
}

/* ============================================
   INPUT COMPONENT
   ============================================ */
export function Input({
    className,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={cn(
                "flex h-10 w-full rounded-lg border-2 border-input bg-background px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
}

/* ============================================
   CARD COMPONENT
   ============================================ */
export function Card({
    className,
    gradient = false,
    hover = false,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {
    gradient?: boolean;
    hover?: boolean;
}) {
    return (
        <div
            className={cn(
                "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200",
                gradient && "gradient-card",
                hover && "hover-lift cursor-pointer",
                className
            )}
            {...props}
        />
    );
}

/* ============================================
   STAT CARD COMPONENT
   ============================================ */
export function StatCard({
    icon: Icon,
    label,
    value,
    unit,
    trend,
    trendValue,
    className,
}: {
    icon?: LucideIcon;
    label: string;
    value: string | number;
    unit?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    className?: string;
}) {
    const trendColors = {
        up: 'text-success',
        down: 'text-destructive',
        neutral: 'text-muted-foreground',
    };

    return (
        <Card className={cn("p-4 space-y-2", className)} hover>
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {label}
                </span>
                {Icon && <Icon className="h-4 w-4 text-primary" />}
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black stat-number">{value}</span>
                {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </div>
            {trend && trendValue && (
                <div className={cn("text-xs font-medium", trendColors[trend])}>
                    {trendValue}
                </div>
            )}
        </Card>
    );
}

/* ============================================
   SECTION HEADER COMPONENT
   ============================================ */
export function SectionHeader({
    title,
    action,
    icon: Icon,
    className,
}: {
    title: string;
    action?: React.ReactNode;
    icon?: LucideIcon;
    className?: string;
}) {
    return (
        <div className={cn("flex items-center justify-between", className)}>
            <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
                {Icon && <Icon className="h-5 w-5 text-primary" />}
                {title}
            </h2>
            {action}
        </div>
    );
}

/* ============================================
   BADGE COMPONENT
   ============================================ */
export function Badge({
    children,
    variant = 'default',
    className,
}: {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
    className?: string;
}) {
    const variants = {
        default: "bg-primary/10 text-primary border-primary/20",
        success: "bg-success/10 text-success border-success/20",
        warning: "bg-warning/10 text-warning border-warning/20",
        destructive: "bg-destructive/10 text-destructive border-destructive/20",
        outline: "bg-transparent border-border",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}

/* ============================================
   PROGRESS RING COMPONENT
   ============================================ */
export function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 8,
    children,
    className,
}: {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    children?: React.ReactNode;
    className?: string;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="hsl(var(--muted))"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="hsl(var(--primary))"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}

/* ============================================
   EMPTY STATE COMPONENT
   ============================================ */
export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 text-center space-y-4", className)}>
            <div className="rounded-full bg-muted/50 p-6">
                <Icon className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                {description && (
                    <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}
