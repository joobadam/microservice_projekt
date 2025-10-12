/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave-1': 'wave1 8s ease-in-out infinite',
        'wave-2': 'wave2 10s ease-in-out infinite',
        'wave-3': 'wave3 12s ease-in-out infinite',
        'float-1': 'float1 6s ease-in-out infinite',
        'float-2': 'float2 8s ease-in-out infinite',
        'float-3': 'float3 7s ease-in-out infinite',
        'float-4': 'float4 9s ease-in-out infinite',
        'float-5': 'float5 5s ease-in-out infinite',
        'float-6': 'float6 11s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        wave1: {
          '0%, 100%': { d: 'path("M0,400 C150,300 350,500 600,400 C850,300 1050,500 1200,400 L1200,800 L0,800 Z")' },
          '50%': { d: 'path("M0,400 C150,500 350,300 600,400 C850,500 1050,300 1200,400 L1200,800 L0,800 Z")' },
        },
        wave2: {
          '0%, 100%': { d: 'path("M0,500 C200,400 400,600 600,500 C800,400 1000,600 1200,500 L1200,800 L0,800 Z")' },
          '50%': { d: 'path("M0,500 C200,600 400,400 600,500 C800,600 1000,400 1200,500 L1200,800 L0,800 Z")' },
        },
        wave3: {
          '0%, 100%': { d: 'path("M0,600 C250,500 450,700 600,600 C750,500 950,700 1200,600 L1200,800 L0,800 Z")' },
          '50%': { d: 'path("M0,600 C250,700 450,500 600,600 C750,700 950,500 1200,600 L1200,800 L0,800 Z")' },
        },
        float1: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-20px) translateX(10px)' },
        },
        float2: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-15px) translateX(-5px)' },
        },
        float3: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-25px) translateX(8px)' },
        },
        float4: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-18px) translateX(-12px)' },
        },
        float5: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-22px) translateX(6px)' },
        },
        float6: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-16px) translateX(-8px)' },
        },
      }
    },
  },
  plugins: [],
}
