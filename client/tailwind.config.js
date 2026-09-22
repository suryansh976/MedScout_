/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#005cb8",
          container: "#0b5fff",
          fixed: "#dbe1ff",
          dark: "#0049cc"
        },
        secondary: {
          DEFAULT: "#006a6a",
          container: "#e0f7f7",
          fixed: "#8cf3f3"
        },
        surface: {
          DEFAULT: "#f9f9ff",
          dim: "#cddbf5",
          bright: "#ffffff",
          "container-lowest": "#ffffff",
          "container-low": "#f0f3ff",
          container: "#e6eeff",
          "container-high": "#dde9ff",
          "container-highest": "#d5e3fd"
        },
        "on-surface": {
          DEFAULT: "#0e1c2f",
          variant: "#424656"
        },
        tertiary: {
          DEFAULT: "#485768",
          container: "#606f82"
        },
        outline: {
          DEFAULT: "#737687",
          variant: "#c3c5d9"
        },
        success: {
          DEFAULT: "#16845b",
          light: "#e6f4ea"
        },
        warning: {
          DEFAULT: "#b7791f",
          light: "#fef3c7"
        },
        danger: {
          DEFAULT: "#ba1a1a",
          light: "#fee2e2"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Manrope", "sans-serif"],
        headline: ["Manrope", "sans-serif"]
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem'
      },
      boxShadow: {
        'glass': '0 4px 24px 0 rgba(18, 32, 51, 0.06)',
        'glass-hover': '0 8px 32px 0 rgba(18, 32, 51, 0.12)',
        'tray': '0 -4px 30px 0 rgba(18, 32, 51, 0.10)'
      }
    },
  },
  plugins: [],
}
