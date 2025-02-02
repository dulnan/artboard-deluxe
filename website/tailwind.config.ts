import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const spacing: Record<string, string> = {
  0: '0',
  1: '1px',
  2: '2px',
  3: '3px',
  4: '4px',
  8: '8px',
  12: '12px',
  16: '16px',
  20: '20px',
  24: '24px',
  28: '28px',
  32: '32px',
  36: '36px',
  40: '40px',
  44: '44px',
  48: '48px',
  52: '52px',
  60: '60px',
  64: '64px',
  80: '80px',
  96: '96px',
  112: '112px',
  128: '128px',
  144: '144px',
  170: '170px',
  header: 'var(--header-height)',
  section: 'var(--section-padding)',
  window: 'var(--window-padding)',
}

const fontSize: Record<string, [string, string]> = {
  base: ['16px', '24px'],
  lg: ['21px', '28px'],
  xl: ['28px', '28px'],
  '2xl': ['42px', '48px'],
  '3xl': ['40px', '44px'],
  '4xl': ['60px', '64px'],
  '5xl': ['120px', '128px'],
}

const config: Config = {
  content: [
    './app.vue',
    './assets/css/*.css',
    './components/**/*.{vue,ts,js}',
    './error.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"NeueBit"', 'serif'],
        serif: ['"Mondwest"', 'sans-serif'],
        alliance: ['"Alliance & Data"', 'serif'],
        mono: ['"Pixel Code"', 'monospace'],
        ms: ['"MS Sans Serif"', 'sans-serif'],
      },
      colors: {
        silver: 'silver',
        orange: '#c53609',
        blue: '#053573',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
      },
    },
    spacing,
    fontSize,
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      const gridAreaUtilities: Record<string, Record<string, string>> = {}

      // Generate classes for letters a to z
      for (let i = 97; i <= 122; i++) {
        const letter = String.fromCharCode(i)
        gridAreaUtilities[`.grid-area-${letter}`] = {
          'grid-area': letter.toUpperCase(),
        }
      }

      // Add the generated utilities
      addUtilities(gridAreaUtilities)
    }),
  ],
}

export default config
