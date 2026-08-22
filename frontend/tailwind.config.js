/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Specified 8-color system:
        // Sky / Slate blues: #384959, #6A89A7, #88BDF2, #BDDDFC
        // Olive / Herbal greens: #3D4127, #636B2F, #BAC095, #D4DE95
        palette: {
          slateDark: '#384959',
          slateSteel: '#6A89A7',
          skyBlue: '#88BDF2',
          skyIce: '#BDDDFC',
          oliveDark: '#3D4127',
          oliveRich: '#636B2F',
          oliveSage: '#BAC095',
          oliveLime: '#D4DE95',
        },
        skyTheme: {
          950: '#141c24',
          900: '#222e3b',
          800: '#384959', // #384959 (Deep Slate)
          700: '#4e657c',
          600: '#6A89A7', // #6A89A7 (Steel Blue)
          500: '#88BDF2', // #88BDF2 (Sky Blue)
          400: '#a3cdfa',
          300: '#BDDDFC', // #BDDDFC (Ice Sky Light)
          200: '#d7eafd',
          100: '#eef6fe',
        },
        oliveTheme: {
          950: '#191b10',
          900: '#282b19',
          800: '#3D4127', // #3D4127 (Dark Olive)
          700: '#4f5626',
          600: '#636B2F', // #636B2F (Rich Olive)
          500: '#8c9644',
          400: '#BAC095', // #BAC095 (Sage Light Olive)
          300: '#D4DE95', // #D4DE95 (Pale Lime Chartreuse)
          200: '#e4ebba',
          100: '#f3f7de',
        },
        // Backwards compatibility mappings for smooth rendering
        forest: {
          950: '#191b10',
          900: '#282b19',
          850: '#32361f',
          800: '#3D4127',
          700: '#636B2F',
          600: '#8c9644',
        },
        olive: {
          950: '#191b10',
          900: '#282b19',
          850: '#32361f',
          800: '#3D4127',
          700: '#636B2F',
          600: '#8c9644',
          400: '#BAC095',
          300: '#D4DE95',
          200: '#e4ebba',
          100: '#f3f7de',
        },
        harvest: {
          950: '#141c24',
          900: '#222e3b',
          800: '#384959',
          700: '#4e657c',
          600: '#6A89A7',
          500: '#88BDF2',
          400: '#a3cdfa',
          300: '#BDDDFC',
          200: '#d7eafd',
          100: '#eef6fe',
        },
        taupe: {
          950: '#191b10',
          900: '#282b19',
          800: '#3D4127',
          700: '#636B2F',
          600: '#6A89A7',
          500: '#BAC095',
          400: '#D4DE95',
          300: '#BDDDFC',
        },
        stone: {
          950: '#141c24',
          900: '#222e3b',
          800: '#384959',
          700: '#4e657c',
          600: '#6A89A7',
          500: '#BAC095',
          400: '#D4DE95',
          300: '#BDDDFC',
          200: '#eaf1fa',
          100: '#f5f9fd',
        },
        crop: {
          groundnut: '#D4DE95',
          rice: '#636B2F',
          maize: '#88BDF2',
          arecanut: '#6A89A7',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Noto Sans Kannada', 'system-ui', 'sans-serif'],
        brand: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
      boxShadow: {
        'glow-olive': '0 0 22px -2px rgba(99, 107, 47, 0.55)',
        'glow-sky': '0 0 22px -2px rgba(136, 189, 242, 0.55)',
        'glow-lime': '0 0 22px -2px rgba(212, 222, 149, 0.55)',
        'glow-slate': '0 0 22px -2px rgba(106, 137, 167, 0.5)',
        'glow-gold': '0 0 22px -2px rgba(212, 222, 149, 0.5)',
        'glow-dark-olive': '0 0 22px -2px rgba(61, 65, 39, 0.7)',
        'glow-harvest': '0 0 22px -2px rgba(136, 189, 242, 0.5)',
        'glow-taupe': '0 0 20px -3px rgba(106, 137, 167, 0.4)',
        'glow-stone': '0 0 20px -3px rgba(189, 221, 252, 0.3)',
      },
    },
  },
  plugins: [],
}
