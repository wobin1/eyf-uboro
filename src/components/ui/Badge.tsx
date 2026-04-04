import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  const variants = {
    default: "bg-white/10 text-text-muted",
    success: "bg-emerald/10 text-emerald border-emerald/20",
    warning: "bg-gold/10 text-gold border-gold/20",
    danger: "bg-coral/10 text-coral border-coral/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
