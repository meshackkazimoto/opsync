import { cn } from "@/lib/utils/cn";
import { ReactNode } from "react";

export function Badge({ variant = "neutral", children }: { variant?: "neutral" | "primary" | "secondary" | "danger"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-1 text-[11px] uppercase tracking-[0.2em]",
        variant === "neutral" && "border-border text-muted",
        variant === "primary" && "border-primary text-primary",
        variant === "secondary" && "border-secondary text-secondary",
        variant === "danger" && "border-danger text-danger"
      )}
    >
      {children}
    </span>
  );
}
