"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export type ToastTone = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
};

const ToastContext = createContext<{
  notify: (toast: Omit<ToastItem, "id">) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-6 top-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "w-72 border bg-surface px-4 py-3 shadow-subtle",
                toast.tone === "success" && "border-secondary text-secondary",
                toast.tone === "error" && "border-danger text-danger",
                toast.tone === "info" && "border-primary text-primary"
              )}
            >
              <p className="text-sm font-semibold text-text">{toast.title}</p>
              {toast.description && <p className="text-xs text-muted">{toast.description}</p>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
