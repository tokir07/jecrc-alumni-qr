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
          primary: {
            DEFAULT: '#E31827',
            hover: '#C81020',
            light: '#FEE2E2',
            subtle: '#FEF2F2',
          },
          bg: '#FAFAFB',
          surface: '#FFFFFF',
          text: {
            main: '#172033',
            muted: '#64748B',
            light: '#94A3B8',
          },
          border: {
            DEFAULT: '#E5E7EB',
            light: '#F1F5F9',
          },
          success: '#16845B',
          warning: '#D98A22',
          error: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
