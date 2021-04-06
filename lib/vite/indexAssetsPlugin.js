const fs = require('fs');
const { config } = require('../config');

function indexAssetsPlugin() {
  const indexHtmlSuffix = '/template/index.html';
  const mermaidScript =
    '<script type="module" src="./assets/js/mermaid.js"></script>';
  const katexCss = '<link rel="stylesheet" href="katex/dist/katex.css" />';
  return {
    name: 'index-assets-plugin',
    load: function (id) {
      if (id.endsWith(indexHtmlSuffix)) {
        let html = fs.readFileSync(id, {
          encoding: 'utf-8',
        });
        if (!config.config.markdown.mermaid) {
          html = html.replace(mermaidScript, '');
        }
        if (!config.config.markdown.katex) {
          html = html.replace(katexCss, '');
        }
        return html;
      }
      return null;
    },
  };
}

module.exports = {
  indexAssetsPlugin,
};
