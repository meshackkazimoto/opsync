"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const MotionButton = motion.button;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <MotionButton
        ref={ref}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 border px-4 py-2 text-sm font-medium uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-60",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0",
          variant === "primary" && "bg-primary text-primary-foreground border-primary",
          variant === "secondary" && "bg-secondary text-secondary-foreground border-secondary",
          variant === "ghost" && "bg-transparent text-text border-border hover:bg-surface",
          variant === "danger" && "bg-danger text-danger-foreground border-danger",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
