const fs = require('fs');
const { config } = require('../config');

function mermaidPlugin() {
  const indexHtmlSuffix = '/template/index.html';
  const mermaidScript =
    '<script type="module" src="./assets/js/mermaid.js"></script>';
  return {
    name: 'mermaid-plugin',
    load: function (id) {
      if (id.endsWith(indexHtmlSuffix)) {
        const html = fs.readFileSync(id, {
          encoding: 'utf-8',
        });
        if (config.config.markdown.mermaid) {
          return html;
        }
        return html.replace(mermaidScript, '');
      }
      return null;
    },
  };
}

module.exports = {
  mermaidPlugin,
};
