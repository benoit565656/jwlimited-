import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#141414',
          deep: '#0D0D0E',
          soft: '#1E1E20',
        },
        charcoal: {
          DEFAULT: '#222529', // Manila Wine exact site token
          muted: '#363A40',
          border: '#2C3036',
        },
        wine: {
          DEFAULT: '#9E1B32', // Manila Wine authentic wine red
          dark: '#6E1022',
          light: '#C52946',
          subtle: '#2A1318',
        },
        ivory: {
          DEFAULT: '#F7F3EB',
          warm: '#FAF7F2',
          muted: '#E6DFC9',
        },
        gold: {
          DEFAULT: '#C7A35A', // Restrained luxury campaign gold
          light: '#DEC17B',
          dark: '#A08039',
          glow: 'rgba(199, 163, 90, 0.25)',
        },
        'jw-blue': {
          DEFAULT: '#002B49', // Iconic Johnnie Walker Blue Label sapphire
          deep: '#001628',
          rich: '#003358',
          light: '#0B4D7A',
          glow: 'rgba(0, 43, 73, 0.5)',
        },
        'jw-copper': {
          DEFAULT: '#C87A3D', // Authentic Johnnie Walker dark copper
          dark: '#9E5822',
          light: '#E59B63',
          glow: 'rgba(200, 122, 61, 0.25)',
        },
      },
      fontFamily: {
        headline: ['Oswald', 'Impact', 'sans-serif'],
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      letterSpacing: {
        'jw-tight': '0.04em',
        'jw': '0.14em',
        'jw-wide': '0.22em',
        'jw-widest': '0.28em',
      },
      boxShadow: {
        'gold-subtle': '0 4px 24px -2px rgba(199, 163, 90, 0.15)',
        'wine-glow': '0 4px 30px -4px rgba(158, 27, 50, 0.3)',
        'jw-blue-glow': '0 4px 30px -4px rgba(0, 43, 73, 0.6)',
        'luxury': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [],
};

export default config;
