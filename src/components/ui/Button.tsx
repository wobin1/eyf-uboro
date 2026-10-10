import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-gradient-to-r from-gold to-gold-dark text-navy hover:shadow-lg hover:shadow-gold/20 active:scale-[0.98]",
      secondary:
        "bg-white/5 border border-border text-foreground hover:bg-white/10 hover:border-border-light active:scale-[0.98]",
      danger:
        "bg-coral/10 border border-coral/20 text-coral hover:bg-coral/20 active:scale-[0.98]",
      ghost:
        "text-text-muted hover:text-foreground hover:bg-white/5 active:scale-[0.98]",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3 gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
