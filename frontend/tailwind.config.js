/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0f1d15",
          900: "#152a1e",
          800: "#1c3524",
          700: "#24422e",
        },
        forest: {
          DEFAULT: "#1e3d2b",
          light: "#2d5a3d",
          dark: "#14291c",
        },
        mint: {
          DEFAULT: "#4ade9a",
          light: "#7ef0bd",
        },
        cream: {
          DEFAULT: "#f5f3ee",
          dark: "#eeece4",
        },
        clash: {
          red: "#dc4c4c",
          amber: "#e0a12e",
          blue: "#3b7dd8",
          green: "#3f9a5c",
        },
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 29, 21, 0.06), 0 1px 3px rgba(15, 29, 21, 0.08)",
        pop: "0 8px 24px rgba(15, 29, 21, 0.12)",
      },
      borderRadius: {
        lg: "10px",
        xl: "14px",
      },
    },
  },
  plugins: [],
};
