const dayjs = require('dayjs');

module.exports = {
  title: '',
  description: '',
  publicFolder: 'public',
  base: '',
  watch: true,
  markdown: {
    lineNumbers: false,
    timeFormatter: time => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
};
