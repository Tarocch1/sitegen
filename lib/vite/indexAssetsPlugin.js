const fs = require('fs');
const { config } = require('../config');

function indexAssetsPlugin() {
  const indexJsSuffix = '/template/assets/js/index.js';
  const styleLessSuffix = '/template/assets/style/index.less';
  const mermaidJs = "import './mermaid';";
  const katexCss = "@import 'katex/dist/katex.css';";
  return {
    name: 'index-assets-plugin',
    load: function (id) {
      if (id.endsWith(indexJsSuffix)) {
        let js = fs.readFileSync(id, {
          encoding: 'utf-8',
        });
        if (!config.config.markdown.mermaid) {
          js = js.replace(mermaidJs, '');
        }
        return js;
      }
      if (id.endsWith(styleLessSuffix)) {
        let less = fs.readFileSync(id, {
          encoding: 'utf-8',
        });
        if (!config.config.markdown.katex) {
          less = less.replace(katexCss, '');
        }
        return less;
      }
      return null;
    },
  };
}

module.exports = {
  indexAssetsPlugin,
};
