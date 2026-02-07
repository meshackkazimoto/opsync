import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        primary: "var(--color-primary)",
        "primary-foreground": "var(--color-primary-foreground)",
        secondary: "var(--color-secondary)",
        "secondary-foreground": "var(--color-secondary-foreground)",
        danger: "var(--color-danger)",
        "danger-foreground": "var(--color-danger-foreground)",
      },
      boxShadow: {
        soft: "0 10px 30px -18px rgba(0,0,0,0.3)",
        subtle: "0 8px 20px -16px rgba(0,0,0,0.25)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        fadeIn: "fadeIn 240ms ease-out",
        slideUp: "slideUp 320ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
