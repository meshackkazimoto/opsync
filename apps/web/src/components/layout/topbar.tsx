"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { logout } from "@/services/auth-service";
import { useRouter } from "next/navigation";

export function Topbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
      <div className="text-sm uppercase tracking-[0.3em] text-muted">Admin Console</div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Dropdown
          trigger={<Button variant="ghost">Account</Button>}
        >
          <DropdownItem onClick={() => router.push("/employees")}>Profile</DropdownItem>
          <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
