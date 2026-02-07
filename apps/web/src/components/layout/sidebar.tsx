"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Building2, ChartBar, CreditCard, FolderKanban, LayoutDashboard, Users } from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/sales", label: "Sales", icon: ChartBar },
  { href: "/purchasing", label: "Purchasing", icon: FolderKanban },
  { href: "/expenses", label: "Expenses", icon: CreditCard },
  { href: "/reports", label: "Reports", icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-surface p-6">
      <div className="mb-10 text-lg font-semibold uppercase tracking-[0.3em]">Opsync</div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 border border-transparent px-3 py-2 text-sm uppercase tracking-[0.2em]",
                active
                  ? "border-primary text-primary"
                  : "text-muted hover:border-border hover:text-text"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
