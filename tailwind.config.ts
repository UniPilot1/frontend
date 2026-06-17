import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0edff",
          100: "#e0d9ff",
          200: "#c4b8ff",
          400: "#9b7fff",
          500: "#7c63ff",
          600: "#6a50f0",
          700: "#5540d0",
          800: "#3d2fa0",
          900: "#271e6e",
        },
        surface: {
          0:   "#07070f",
          1:   "#0a0a14",
          2:   "#0d0d1e",
          3:   "#111128",
          4:   "#16162f",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      animation: {
        "fade-in":    "fadeIn 0.4s ease forwards",
        "slide-up":   "slideUp 0.4s ease forwards",
        "bar-grow":   "barGrow 0.8s ease forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { from: { opacity: "0" },                  to: { opacity: "1" } },
        slideUp:   { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        barGrow:   { from: { width: "0%" },                   to: { width: "var(--bar-w)" } },
        pulseSoft: { "0%,100%": { opacity: "1" },             "50%": { opacity: "0.6" } },
      },
    },
  },
  plugins: [],
};
export default config;
