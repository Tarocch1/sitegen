const dayjs = require('dayjs');

module.exports = {
  title: '', // Title for the site.
  description: '', // Description for the site.
  publicDir: 'public', // Public dir path.
  markdown: {
    lineNumbers: false, // Whether to show line numbers to the left of each code blocks.
    timeFormatter: time => dayjs(time).format('YYYY-MM-DD HH:mm:ss'), // Formatter for the time at the bottom of the page.
  },
  build: {
    distDir: 'dist', // Build dist path.
    assetsDir: 'assets', // Assets dir path.
    base: '/', // Base url for static files.
  },
  dev: {
    host: '0.0.0.0', // Dev server host.
    port: 3000, // Dev server port.
    watch: true, // Whether to watch file change to hot reload page.
  },
};
