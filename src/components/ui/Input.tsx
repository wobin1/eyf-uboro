import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-text-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-4 py-2.5 bg-white/5 border border-border rounded-xl text-foreground placeholder-text-dim text-sm",
            "focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50",
            "transition-all duration-200",
            error && "border-coral/50 focus:ring-coral/30 focus:border-coral/50",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-coral">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
