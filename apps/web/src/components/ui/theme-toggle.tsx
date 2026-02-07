"use client";

import { useTheme } from "@/lib/theme/theme-provider";
import { Button } from "./button";

export function ThemeToggle() {
  const { mode, setMode, resolvedTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        onClick={() => setMode(resolvedTheme === "dark" ? "light" : "dark")}
      >
        {resolvedTheme === "dark" ? "Light" : "Dark"}
      </Button>
      <Button variant="ghost" onClick={() => setMode("system")}>
        {mode === "system" ? "System" : "Auto"}
      </Button>
    </div>
  );
}
