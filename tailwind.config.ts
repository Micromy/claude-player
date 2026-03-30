import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1a1a1a',
          50: '#2a2a2a',
          100: '#333333',
          200: '#3d3d3d',
          300: '#4a4a4a'
        }
      }
    }
  },
  plugins: []
}

export default config
