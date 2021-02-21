const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const defaultConfig = {
  title: '',
  description: '',
  publicFolder: 'public',
  base: '',
  server: {
    host: '0.0.0.0',
    port: 80,
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
