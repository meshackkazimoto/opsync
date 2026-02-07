"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function Breadcrumb() {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
      <Link href="/">Home</Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = segment.replace(/-/g, " ");
        return (
          <span key={href} className="flex items-center gap-2">
            <span>/</span>
            <Link href={href}>{label}</Link>
          </span>
        );
      })}
    </div>
  );
}
