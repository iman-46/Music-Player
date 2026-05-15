import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      animation: {
        equalizer: "equalizer 0.9s ease-in-out infinite",
      },
      colors: {
        background: "#0a0f14",
        foreground: "#f5faff",
        muted: "#9ab4c4",
        panel: "rgba(18, 24, 32, 0.72)",
        primary: "#38bdf8",
      },
      keyframes: {
        equalizer: {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
