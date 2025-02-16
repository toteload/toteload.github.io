/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './astro.config.mjs'],
  theme: {
    extend: {
      colors: {
        blue: '#0041DB',
      },
    },
  },
  plugins: [],
};
