/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          navy: "#031E40",
          royal: "#00467F",
          cyan: "#0078A8",
          gold: "#D4BC8B",
        },
        borderLight: "#e6e9ef",
        textDark: "#031E40",
        textLight: "#B8C6D6",
      },
    },
  },
  plugins: [],
}
