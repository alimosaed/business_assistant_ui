import type { Config } from 'tailwindcss';
import type { DefaultColors } from 'tailwindcss/types/generated/colors';

const themeDark = (colors: DefaultColors) => ({
  50: '#0a0a0a',
  100: '#111111',
  200: '#1c1c1c',
});

const themeLight = (colors: DefaultColors) => ({
  50: '#fcfcf9',
  100: '#f3f3ee',
  200: '#e8e8e3',
});

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      borderColor: ({ colors }) => {
        return {
          light: themeLight(colors),
          dark: themeDark(colors),
        };
      },
      colors: ({ colors }) => {
        const colorsDark = themeDark(colors);
        const colorsLight = themeLight(colors);

        return {
          dark: {
            primary: colorsDark[50],
            secondary: colorsDark[100],
            ...colorsDark,
            blue: {
              500: '#0A84FF',
            },
            green: {
              500: '#104F46', // Dark mode green
            },
            purple: {
              500: '#3B235A', // Dark mode purple
            },
          },
          light: {
            primary: colorsLight[50],
            secondary: colorsLight[100],
            ...colorsLight,
            green: {
              500: '#D1FAE5', // Light mode green
            },
            purple: {
              500: '#E9D5FF', // Light mode purple
            },
          },
          blue: {
            500: '#007AFF', // Apple's standard blue
          },
        };
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
