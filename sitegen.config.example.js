const dayjs = require('dayjs');

module.exports = {
  title: '',
  description: '',
  publicFolder: 'public',
  markdown: {
    lineNumbers: false,
    timeFormatter: time => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
  },
  build: {
    dist: 'dist',
    base: '',
  },
  dev: {
    host: '0.0.0.0',
    port: 3000,
    watch: true,
  },
};
