/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        // keep legacy surface scale for components not yet migrated
        surface: {
          50:  '#e8e8f2',
          100: '#c8c8e0',
          200: '#9090c0',
          300: '#6060a0',
          400: '#404080',
          500: '#252550',
          600: '#1a1a38',
          700: '#131328',
          800: '#0e0e1c',
          900: '#080810',
          950: '#040408',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'scan-line':   { '0%': { transform: 'translateY(0%)' }, '100%': { transform: 'translateY(100%)' } },
        'pulse-glow':  { '0%, 100%': { boxShadow: '0 0 8px rgba(6,182,212,0.4)' }, '50%': { boxShadow: '0 0 20px rgba(6,182,212,0.8)' } },
        'fade-in':     { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in':    { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-up':         { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in-right':   { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-in-bottom':  { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
      },
      animation: {
        'accordion-down':   'accordion-down 0.2s ease-out',
        'accordion-up':     'accordion-up 0.2s ease-out',
        'scan-line':        'scan-line 2s linear infinite',
        'pulse-glow':       'pulse-glow 2s ease-in-out infinite',
        'fade-in':          'fade-in 0.2s ease-out',
        'slide-in':         'slide-in 0.25s ease-out',
        'slide-up':         'slide-up 0.3s ease-out',
        'slide-in-right':   'slide-in-right 0.28s ease-out',
        'slide-in-bottom':  'slide-in-bottom 0.28s ease-out',
      },
    },
  },
  plugins: [],
}
