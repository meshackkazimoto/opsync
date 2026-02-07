"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedTheme: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const storageKey = "opsync.theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setMode(stored);
    }
  }, []);

  useEffect(() => {
    const update = () => {
      const system = getSystemTheme();
      const next = mode === "system" ? system : mode;
      setResolvedTheme(next);
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next === "dark");
      }
    };

    update();
    const media = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    media?.addEventListener("change", update);
    return () => media?.removeEventListener("change", update);
  }, [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedTheme,
      setMode: (next) => {
        setMode(next);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(storageKey, next);
        }
      },
      toggle: () => {
        setMode((prev) => {
          const next = prev === "dark" ? "light" : "dark";
          if (typeof window !== "undefined") {
            window.localStorage.setItem(storageKey, next);
          }
          return next;
        });
      },
    }),
    [mode, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return value;
}
