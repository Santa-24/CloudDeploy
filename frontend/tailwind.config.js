/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F5F0E7',
          light: '#FAF7F2',
          dark: '#E8E1D5',
        },
        ink: {
          DEFAULT: '#1D1C19',
          pure: '#0F0E0D',
          muted: '#3D3B35',
          faint: '#6E6A61',
        },
        vermilion: {
          DEFAULT: '#C65336',
          hover: '#B0472D',
          light: '#F7EBE8',
        },
        lime: {
          DEFAULT: '#D7EE73',
          hover: '#C8E25C',
          light: '#F4FBE0',
        },
        stone: {
          DEFAULT: '#A7A095',
          light: '#D3CEC5',
          faint: '#EFECE6',
        },
        status: {
          success: '#2E7D32',
          successBg: '#E8F5E9',
          failed: '#C62828',
          failedBg: '#FFEBEE',
          warning: '#E65100',
          warningBg: '#FFF3E0',
          queued: '#5D4037',
          queuedBg: '#EFEBE9',
          validating: '#00838F',
          validatingBg: '#E0F7FA',
          publishing: '#E65100',
          publishingBg: '#FFF3E0'
        }
      },
      fontFamily: {
        editorial: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'none': '0',
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px',
      },
      boxShadow: {
        'editorial': '4px 4px 0px 0px #1D1C19',
        'editorial-sm': '2px 2px 0px 0px #1D1C19',
        'editorial-vermilion': '4px 4px 0px 0px #C65336',
        'editorial-lime': '4px 4px 0px 0px #D7EE73',
        'editorial-soft': '0 4px 20px -2px rgba(29, 28, 25, 0.08)',
      }
    },
  },
  plugins: [],
}
