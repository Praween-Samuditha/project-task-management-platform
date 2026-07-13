import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        // Sidebar (Linear-style dark)
        sidebar: {
          bg: "#0f0f13",
          hover: "#1a1a21",
          active: "#25252f",
          border: "#2a2a35",
          text: "#8a8a96",
          "text-active": "#f0f0f2",
        },
        // Content surface
        surface: "#f4f4f6",
        // Cards
        card: {
          DEFAULT: "#ffffff",
          border: "#e4e4e8",
        },
        // Ink (text)
        ink: {
          900: "#0d0d12",
          700: "#3a3a45",
          500: "#6b6b78",
          300: "#9a9aaa",
        },
        // Accent (Linear purple-blue)
        accent: {
          DEFAULT: "#5e6ad2",
          hover: "#4f5bbf",
          light: "#eef0fc",
        },
        // Status colors
        status: {
          todo: "#9a9aaa",
          progress: "#f59e0b",
          review: "#8b5cf6",
          done: "#10b981",
        },
        // Priority colors
        priority: {
          low: "#10b981",
          medium: "#3b82f6",
          high: "#f59e0b",
          urgent: "#ef4444",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.04)",
        modal: "0 25px 50px -12px rgba(0,0,0,.25)",
        "card-hover": "0 4px 12px 0 rgba(0,0,0,.08)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
