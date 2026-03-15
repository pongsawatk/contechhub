import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: "2px",
      },
      fontFamily: {
        sans: ["var(--font-sarabun)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        accent: {
          cyan: "#38bdf8",
          blue: "#3b82f6",
          indigo: "#6366f1",
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".glass": {
          background: "rgba(10, 30, 70, 0.45)",
          "backdrop-filter": "blur(20px)",
          "-webkit-backdrop-filter": "blur(20px)",
          border: "1px solid rgba(100, 220, 255, 0.15)",
          "border-radius": "16px",
        },
        ".glass-nav": {
          background: "rgba(5, 13, 31, 0.75)",
          "backdrop-filter": "blur(24px)",
          "-webkit-backdrop-filter": "blur(24px)",
          "border-bottom": "1px solid rgba(56, 189, 248, 0.12)",
        },
        ".glass-input": {
          background: "rgba(10, 30, 70, 0.5)",
          border: "1px solid rgba(56, 189, 248, 0.2)",
          color: "white",
          "border-radius": "10px",
        },
        ".glass-btn": {
          background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          "border-radius": "10px",
          color: "white",
          transition: "all 0.2s ease",
        },
        ".glass-ghost": {
          background: "rgba(56, 189, 248, 0.08)",
          border: "1px solid rgba(56, 189, 248, 0.2)",
          color: "rgba(255, 255, 255, 0.85)",
          "border-radius": "10px",
          transition: "all 0.2s ease",
        },
        ".glass-card": {
          background: "rgba(10, 30, 70, 0.45)",
          "backdrop-filter": "blur(20px)",
          "-webkit-backdrop-filter": "blur(20px)",
          border: "1px solid rgba(100, 220, 255, 0.15)",
          "border-radius": "16px",
          transition: "all 0.2s ease",
        },
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    }),
  ],
};

export default config;
