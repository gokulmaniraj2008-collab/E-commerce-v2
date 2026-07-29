import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F1B2B',      // deep navy - header/footer/text
        paper: '#F7F7F5',    // page background
        card: '#FFFFFF',
        accent: '#D9822B',   // amber - primary CTA
        accent2: '#1E6F5C',  // teal-green - secondary/success
        line: '#E3E1DA',
        danger: '#B3492B',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
      },
    },
  },
  plugins: [],
};

export default config;
