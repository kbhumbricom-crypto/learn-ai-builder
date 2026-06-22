/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#FF5A1F',
          soft: '#FF8A3D',
          deep: '#B72500',
        },
        amber: '#FFAE00',
        cream: {
          DEFAULT: '#F5EFE6',
          soft: '#FAF5EC',
        },
        ink: {
          DEFAULT: '#1A1410',
          2: '#2A2018',
        },
        muted: '#6B5D4F',
        dark: {
          DEFAULT: '#000000',
          2: '#0a0a0a',
          soft: '#121212',
        },
        bg: '#000000',
        surface: {
          DEFAULT: '#0a0a0a',
          hover: '#121212',
        },
        border: 'rgba(226, 232, 240, 0.1)',
        text: {
          DEFAULT: '#cbd5e1',
          muted: '#94a3b8',
        },
        accent: {
          DEFAULT: '#FF8A3D',
          hover: '#FF5A1F',
        }
      },
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Clash Grotesk', 'system-ui', 'sans-serif'],
        serif: ['DM Serif Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        glow: '0 10px 32px rgba(255, 90, 31, 0.45)',
      }
    },
  },
  plugins: [],
}
