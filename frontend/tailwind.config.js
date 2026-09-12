/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: "#080c14",
          panel: "#0f1624",
          card: "#131b2c",
          border: "#1d293d",
          hover: "#1a253a",
          text: "#e2e8f0",
          muted: "#94a3b8",
          dim: "#64748b",
          cyan: "#06b6d4",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          blue: "#3b82f6",
          purple: "#a855f7"
        }
      }
    },
  },
  plugins: [],
};
