const fse = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');
const _ = require('lodash');

const defaultConfig = {
  title: '',
  description: '',
  copyright: '',
  publicDir: 'public',
  links: [],
  markdown: {
    timeFormatter: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    toc: [2, 3],
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
    katex: {},
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
  this.config = _.mergeWith(defaultConfig, config, mergeCustomizer);
};

function mergeCustomizer(objValue, srcValue) {
  if (_.isArray(srcValue)) {
    return srcValue;
  }
}

module.exports = {
  config: new Config(),
  defaultConfig,
};
