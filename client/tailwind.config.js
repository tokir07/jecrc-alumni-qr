/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jecrc: {
          navy: {
            DEFAULT: '#101A32',
            light: '#1B2A50',
            dark: '#0B1224',
          },
          purple: {
            DEFAULT: '#493078',
            light: '#62429E',
            dark: '#342256',
          },
          gold: {
            DEFAULT: '#D9AD56',
            light: '#E5C174',
            dark: '#B88F3B',
          },
          ivory: {
            DEFAULT: '#FFF9EE',
            warm: '#FDF4DF',
            dark: '#F5E6C8',
          },
          success: '#16845B',
          warning: '#D98A22',
          error: '#D94A4A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Cinzel', 'Merriweather', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(217, 173, 86, 0.35)',
        'card-elevated': '0 10px 30px -5px rgba(16, 26, 50, 0.08), 0 4px 6px -2px rgba(16, 26, 50, 0.04)',
      },
    },
  },
  plugins: [],
}
