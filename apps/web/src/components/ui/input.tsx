"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <label className="flex flex-col gap-2 text-sm">
        {label && <span className="text-xs uppercase tracking-[0.2em] text-muted">{label}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 border border-border bg-surface px-3 text-sm text-text placeholder:text-muted",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            error && "border-danger focus:ring-danger",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
      </label>
    );
  }
);

Input.displayName = "Input";
