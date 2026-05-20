/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "bg-emerald-600",
    "border-emerald-600",
    "bg-red-500",
    "border-red-500",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

