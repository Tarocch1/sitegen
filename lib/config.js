const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const _ = require('lodash');

const defaultConfig = {
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

function Config() {
  this.config = defaultConfig;
}

Config.prototype.initConfig = function (configFilePath) {
  const fullPath = path.join(process.cwd(), configFilePath);
  let config = {};
  if (fs.existsSync(fullPath)) {
    config = require(fullPath);
  }
  this.config = _.merge(defaultConfig, config);
};

module.exports = {
  config: new Config(),
};
