import { cn } from "@/lib/utils/cn";
import { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("border border-border bg-surface p-6 shadow-subtle", className)}>{children}</div>;
}

export function CardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      {description && <p className="text-sm text-muted">{description}</p>}
    </div>
  );
}
