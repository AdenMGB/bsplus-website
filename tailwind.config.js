/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "San Francisco", "sans-serif"],
        display: ["Motiva Sans", "Arial", "sans-serif"],
      },
      colors: {
        zinc: {
          925: "#111112",
        },
      },
    },
  },
  plugins: [],
};
