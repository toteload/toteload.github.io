export default {
  plugins: ['prettier-plugin-astro'],
  tabWidth: 2,
  singleQuote: true,
  overrides: [
    {
      files: ['*.astro'],
      options: {
        parser: 'astro',
      },
    },
  ],
};
