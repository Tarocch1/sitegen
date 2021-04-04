const fse = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');
const _ = require('lodash');

const defaultConfig = {
  title: '',
  description: '',
  publicDir: 'public',
  markdown: {
    lineNumbers: false,
    timeFormatter: time => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    mermaid: {
      startOnLoad: true,
      class: {
        useMaxWidth: false,
      },
      er: {
        useMaxWidth: false,
      },
      flowchart: {
        useMaxWidth: false,
      },
      gantt: {
        useMaxWidth: false,
      },
      git: {
        useMaxWidth: false,
      },
      journey: {
        useMaxWidth: false,
      },
      pie: {
        useMaxWidth: false,
      },
      sequence: {
        useMaxWidth: false,
      },
      state: {
        useMaxWidth: false,
      },
    },
  },
  build: {
    distDir: 'dist',
    assetsDir: 'assets',
    base: '/',
  },
  dev: {
    host: '0.0.0.0',
    port: 3000,
    watch: true,
    open: true,
  },
};

function Config() {
  this.config = defaultConfig;
}

Config.prototype.initConfig = function (configFilePath) {
  const fullPath = path.join(process.cwd(), configFilePath);
  let config = {};
  if (fse.pathExistsSync(fullPath)) {
    config = require(fullPath);
  }
  this.config = _.merge(defaultConfig, config);
};

module.exports = {
  config: new Config(),
};
