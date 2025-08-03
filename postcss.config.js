const { join } = require('path');

module.exports = {
  plugins: {
    '@tailwindcss/postcss': {
      config: join(__dirname, 'tw.config.js'),
    },
    'autoprefixer': {},
  },
};
