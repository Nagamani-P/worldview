/** Tailwind design tokens for World View.
 *  Palette: a classroom globe. Each continent has its own candy colour,
 *  the UI stays navy + sky so the countries do the talking. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#1F2A44', soft: '#4A5675' },
        sky: { day: '#D6EEFF', mist: '#F3FAFF' },
        night: { DEFAULT: '#0C1433', deep: '#070C22', card: '#18224A', line: '#2A3868' },
        ocean: '#3B7DD8',
        sun: { DEFAULT: '#FFC93C', dark: '#F2B400' },
        africa: '#F6B23E',
        asia: '#F2685E',
        europe: '#7B6CF6',
        namerica: '#3CC48A',
        samerica: '#FF8FB1',
        oceania: '#2EC4D6',
      },
      fontFamily: {
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      // Type scale for 7-year-olds: 18px body, ~1.25 ratio
      fontSize: {
        sm: ['1rem', '1.5rem'],
        base: ['1.125rem', '1.75rem'],
        lg: ['1.375rem', '1.9rem'],
        xl: ['1.75rem', '2.2rem'],
        '2xl': ['2.25rem', '2.6rem'],
        '3xl': ['3rem', '3.2rem'],
      },
      borderRadius: { blob: '2rem' },
      boxShadow: {
        pop: '0 6px 0 0 rgba(31,42,68,0.18)',
        float: '0 24px 60px -20px rgba(12,20,51,0.45)',
      },
      keyframes: {
        fade: { from: { opacity: 0 }, to: { opacity: 1 } },
        rise: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'none' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(40px)' }, to: { opacity: 1, transform: 'none' } },
        stamp: { '0%': { transform: 'scale(1.8) rotate(-20deg)', opacity: 0 }, '60%': { transform: 'scale(0.92) rotate(-8deg)', opacity: 1 }, '100%': { transform: 'scale(1) rotate(-8deg)' } },
      },
      animation: {
        fade: 'fade .25s ease-out both',
        rise: 'rise .35s ease-out both',
        slideIn: 'slideIn .35s cubic-bezier(.2,.8,.2,1) both',
        stamp: 'stamp .5s cubic-bezier(.2,.8,.2,1) both',
      },
    },
  },
  plugins: [],
}
