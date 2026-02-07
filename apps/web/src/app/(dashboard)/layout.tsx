"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useRequireAuth } from "@/lib/auth/require-auth";
import { motion } from "framer-motion";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  useRequireAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-text">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <motion.main
          className="flex-1 overflow-y-auto p-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
