import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: "2px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        accent: {
          green: "#4ade80",
          purple: "#a78bfa",
          emerald: "#0F6E56",
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".glass": {
          background: "rgba(255, 255, 255, 0.07)",
          "backdrop-filter": "blur(20px)",
          "-webkit-backdrop-filter": "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          "border-radius": "16px",
        },
        ".glass-nav": {
          background: "rgba(10, 22, 40, 0.7)",
          "backdrop-filter": "blur(24px)",
          "-webkit-backdrop-filter": "blur(24px)",
          "border-bottom": "1px solid rgba(255, 255, 255, 0.08)",
        },
        ".glass-input": {
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "white",
          "border-radius": "10px",
        },
        ".glass-btn": {
          background: "linear-gradient(135deg, #0F6E56, #1a8f70)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          "border-radius": "10px",
          color: "white",
          transition: "all 0.2s ease",
        },
        ".glass-ghost": {
          background: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "rgba(255, 255, 255, 0.85)",
          "border-radius": "10px",
          transition: "all 0.2s ease",
        },
        ".glass-card": {
          background: "rgba(255, 255, 255, 0.07)",
          "backdrop-filter": "blur(20px)",
          "-webkit-backdrop-filter": "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          "border-radius": "16px",
          cursor: "pointer",
          transition: "all 0.2s ease",
        },
      });
    }),
  ],
};

export default config;
