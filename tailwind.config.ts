import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        card: '#161616',
        muted: '#8a8a8a',
        line: '#ffffff14',
        tier: { blue: '#1045e7', green: '#01b87b', orange: '#fc9808', purple: '#a036fa', red: '#ff1555' },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter Tight', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: { card: '28px' },
      transitionTimingFunction: { expo: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    },
  },
  plugins: [],
};
export default config;
