const path = require('path');
const { defineConfig } = require('vite');
const { indexAssetsPlugin } = require('./indexAssetsPlugin');
const { config } = require('../config');

function generateViteConfig() {
  const viteConfig = defineConfig({
    mode: process.env.NODE_ENV,
    root: path.resolve(__dirname, '../../template'),
    base:
      process.env.NODE_ENV === 'production' ? config.config.build.base : '/',
    logLevel: 'silent',
    clearScreen: false,
    define: {
      _MERMAID_CONFIG_: config.config.markdown.mermaid,
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    build: {
      assetsDir: config.config.build.assetsDir,
      minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
      write: false,
    },
    plugins: [indexAssetsPlugin()],
  });
  viteConfig.configFile = false;
  return viteConfig;
}

module.exports = {
  generateViteConfig,
};
