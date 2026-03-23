/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#111214',
        espresso: '#1c1713',
        olive: '#20241e',
        ivory: '#f5f0e6',
        gold: '#c9a46a',
        bronze: '#8f6a3b',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        luxe: '0 26px 70px rgba(0,0,0,0.45)',
        glow: '0 0 0 1px rgba(201,164,106,0.4), 0 8px 28px rgba(201,164,106,0.22)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(201,164,106,0.22), 0 8px 22px rgba(201,164,106,0.14)' },
          '50%': { boxShadow: '0 0 0 1px rgba(201,164,106,0.42), 0 12px 36px rgba(201,164,106,0.25)' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
