"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <label className="flex flex-col gap-2 text-sm">
        {label && <span className="text-xs uppercase tracking-[0.2em] text-muted">{label}</span>}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-11 border border-border bg-surface px-3 text-sm text-text",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            error && "border-danger focus:ring-danger",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-danger">{error}</span>}
      </label>
    );
  }
);

Select.displayName = "Select";
