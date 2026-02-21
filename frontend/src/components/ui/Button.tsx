import React from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
    size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mero-teal disabled:opacity-50 disabled:pointer-events-none ring-offset-white dark:ring-offset-slate-900",
                    {
                        "bg-mero-teal text-white hover:bg-mero-darkTeal": variant === "primary",
                        "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:border-slate-600": variant === "secondary",
                        "bg-rose-600 text-white hover:bg-rose-700": variant === "danger",
                        "bg-emerald-600 text-white hover:bg-emerald-700": variant === "success",
                        "hover:bg-slate-100 hover:text-slate-800 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200": variant === "ghost",
                        "h-9 px-3 text-sm": size === "sm",
                        "h-10 py-2 px-4": size === "md",
                        "h-11 px-8 text-lg": size === "lg",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";
