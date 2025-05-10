import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-playfair-display)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: '500',
            },
            strong: {
              color: 'inherit',
            },
            code: {
              color: 'inherit',
            },
          },
        },
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg) scale(1) translateZ(0)' },
          '50%': { transform: 'translateY(-30px) rotate(15deg) scale(1.2) translateZ(50px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1) translateZ(0)' },
          '50%': { opacity: '0.8', transform: 'scale(0.95) translateZ(-20px)' },
        },
        wave: {
          '0%': { transform: 'rotate(0deg) translateZ(0)' },
          '25%': { transform: 'rotate(25deg) translateZ(30px)' },
          '50%': { transform: 'rotate(0deg) translateZ(0)' },
          '75%': { transform: 'rotate(-25deg) translateZ(30px)' },
          '100%': { transform: 'rotate(0deg) translateZ(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-2000px 0' },
          '100%': { backgroundPosition: '2000px 0' },
        },
        '3d-float': {
          '0%': { transform: 'translateY(0) rotateX(0) rotateY(0) translateZ(0)' },
          '25%': { transform: 'translateY(-20px) rotateX(10deg) rotateY(10deg) translateZ(50px)' },
          '50%': { transform: 'translateY(0) rotateX(0) rotateY(0) translateZ(0)' },
          '75%': { transform: 'translateY(20px) rotateX(-10deg) rotateY(-10deg) translateZ(50px)' },
          '100%': { transform: 'translateY(0) rotateX(0) rotateY(0) translateZ(0)' },
        },
        'music-pulse': {
          '0%, 100%': { transform: 'scale(1) rotate(0deg) translateZ(0)', opacity: '0.5' },
          '50%': { transform: 'scale(1.3) rotate(180deg) translateZ(100px)', opacity: '0.8' },
        },
        'rotate-3d': {
          '0%': { transform: 'rotateX(0) rotateY(0) rotateZ(0)' },
          '100%': { transform: 'rotateX(360deg) rotateY(360deg) rotateZ(360deg)' },
        },
        'float-3d': {
          '0%, 100%': { transform: 'translateY(0) translateZ(0)' },
          '50%': { transform: 'translateY(-50px) translateZ(100px)' },
        },
        'aurora': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'sparkle': {
          '0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,255,255,0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(255,255,255,0.3)' },
        },
        'starfield': {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '100%': { transform: 'translateY(-100vh) rotate(360deg)' },
        },
        'note-float': {
          '0%': { 
            transform: 'rotate(0deg) scale(0.8) translateZ(0)',
            opacity: '0',
            color: '#FF0000',
            offsetDistance: '0%'
          },
          '20%': { 
            opacity: '1',
            color: '#FF7F00',
            offsetDistance: '20%'
          },
          '40%': {
            color: '#FFFF00',
            offsetDistance: '40%'
          },
          '60%': {
            color: '#00FF00',
            offsetDistance: '60%'
          },
          '80%': { 
            opacity: '1',
            color: '#0000FF',
            offsetDistance: '80%'
          },
          '100%': { 
            transform: 'rotate(360deg) scale(1.2) translateZ(100px)',
            opacity: '0',
            color: '#9400D3',
            offsetDistance: '100%'
          },
        },
        'rainbow-glow': {
          '0%': { filter: 'drop-shadow(0 0 8px #FF0000)' },
          '16.6%': { filter: 'drop-shadow(0 0 8px #FF7F00)' },
          '33.3%': { filter: 'drop-shadow(0 0 8px #FFFF00)' },
          '50%': { filter: 'drop-shadow(0 0 8px #00FF00)' },
          '66.6%': { filter: 'drop-shadow(0 0 8px #0000FF)' },
          '83.3%': { filter: 'drop-shadow(0 0 8px #4B0082)' },
          '100%': { filter: 'drop-shadow(0 0 8px #9400D3)' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        pulse: 'pulse 4s ease-in-out infinite',
        wave: 'wave 3s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        '3d-float': '3d-float 10s ease-in-out infinite',
        'music-pulse': 'music-pulse 6s ease-in-out infinite',
        'rotate-3d': 'rotate-3d 20s linear infinite',
        'float-3d': 'float-3d 8s ease-in-out infinite',
        'aurora': 'aurora 15s ease infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'starfield': 'starfield 20s linear infinite',
        'note-float': 'note-float var(--duration, 15s) linear infinite',
        'rainbow-glow': 'rainbow-glow 3s linear infinite',
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },
      transformStyle: {
        '3d': 'preserve-3d',
      },
      backfaceVisibility: {
        'visible': 'visible',
        'hidden': 'hidden',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'aurora': 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96c93d)',
        'starfield': 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255,255,255,0.1)',
        'glow-lg': '0 0 40px rgba(255,255,255,0.3)',
        'glow-xl': '0 0 60px rgba(255,255,255,0.5)',
      },
      colors: {
        chroma: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // primary
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config; 