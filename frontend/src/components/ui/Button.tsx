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
                    "inline-flexitems-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none ring-offset-slate-900",
                    {
                        "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
                        "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700": variant === "secondary",
                        "bg-rose-600 text-white hover:bg-rose-700": variant === "danger",
                        "bg-emerald-600 text-white hover:bg-emerald-700": variant === "success",
                        "hover:bg-slate-800 hover:text-slate-100 text-slate-300": variant === "ghost",
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
