"use client";

import { cn } from "@/lib/utils/cn";

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "border px-3 py-2 text-xs uppercase tracking-[0.2em]",
            active === tab.id
              ? "border-primary text-primary"
              : "border-border text-muted hover:text-text"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
