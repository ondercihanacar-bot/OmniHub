/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#030712', // Ultra dark slate 950+
          surface: '#0f172a', // Slate 900
          card: '#1e293b', // Slate 800
          border: '#334155', // Slate 700
          accent: '#06b6d4', // Cyan 500
          accentGlow: '#0891b2',
          neonEmerald: '#10b981',
          neonBlue: '#3b82f6',
          neonPurple: '#8b5cf6',
          neonAmber: '#f59e0b',
          neonRose: '#f43f5e'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'neon-cyan': '0 0 15px -2px rgba(6, 182, 212, 0.4)',
        'neon-emerald': '0 0 15px -2px rgba(16, 185, 129, 0.4)',
        'neon-blue': '0 0 15px -2px rgba(59, 130, 246, 0.4)',
        'neon-amber': '0 0 15px -2px rgba(245, 158, 11, 0.4)',
        'neon-rose': '0 0 15px -2px rgba(244, 63, 94, 0.4)',
      }
    },
  },
  plugins: [],
};
