import "@/styles/globals.css";

import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { QueryProvider } from "@/lib/query/query-client";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

const bodyFont = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
const displayFont = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Opsync Admin",
  description: "Opsync operations dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>{children}</ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
