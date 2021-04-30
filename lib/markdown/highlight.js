const Prism = require('prismjs');
const loadLanguages = require('prismjs/components/');
const { unescapeAll, escapeHtml } = require('markdown-it/lib/common/utils');
const { attrsAddClass } = require('./utils');
const { config } = require('../config');

loadLanguages();

function highlight(code, lang, attrs, token) {
  if (lang === 'mermaid' && config.config.markdown.mermaid) {
    attrs = attrsAddClass(attrs, 'mermaid');
    return `<div ${attrs}>${code}</div>`;
  }
  const className = token ? token.attrGet('class') : '';
  const lineNumbersEnabled = className && className.includes('line-numbers');
  const lines = lineNumbersEnabled
    ? `<span aria-hidden="true" class="line-numbers-rows">${code
        .split('\n')
        .map(() => '<span></span>')
        .slice(1)
        .join('')}</span>`
    : '';
  attrs = attrsAddClass(attrs, `language-${lang}`);
  let html = '';
  if (lang && Prism.languages[lang]) {
    html = Prism.highlight(code, Prism.languages[lang], lang);
  } else {
    html = escapeHtml(code);
  }
  return `<pre ${attrs}><code class="language-${lang}">${html}${lines}</code></pre>`;
}

function fenceRule(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  const info = token.info ? unescapeAll(token.info).trim() : '';
  let lang = '';
  let attrs = slf.renderAttrs(token);
  let highlighted = '';

  if (info) {
    const arr = info.split(/(\s+)/g);
    lang = arr[0];
  }

  if (options.highlight) {
    highlighted = options.highlight(token.content, lang, attrs, token);
  } else {
    highlighted = escapeHtml(token.content);
  }

  return `${highlighted}\n`;
}

function highlightPlugin(md) {
  md.renderer.rules.fence = fenceRule;
}

module.exports = {
  highlight,
  highlightPlugin,
};
