const Prism = require('prismjs');
const loadLanguages = require('prismjs/components/');
const classNames = require('classnames');
const { unescapeAll, escapeHtml } = require('markdown-it/lib/common/utils');
const { config } = require('../config');

loadLanguages();

function highlight(code, lang, attrs) {
  if (lang === 'mermaid' && config.config.markdown.mermaid) {
    return `<div class="mermaid">${code}</div>`;
  }
  const options = {
    lineNumbers: config.config.markdown.lineNumbers,
  };
  try {
    const opt = JSON.parse(attrs);
    if (opt.lineNumbers !== undefined) {
      options.lineNumbers = opt.lineNumbers;
    }
  } catch (e) {
    //
  }
  const lines = options.lineNumbers
    ? `<span aria-hidden="true" class="line-numbers-rows">${code
        .split('\n')
        .map(() => '<span></span>')
        .slice(1)
        .join('')}</span>`
    : '';
  if (lang && Prism.languages[lang]) {
    const html = Prism.highlight(code, Prism.languages[lang], lang);
    return `<pre class="${classNames(`language-${lang}`, {
      'line-numbers': options.lineNumbers,
    })}"><code class="language-${lang}">${html}${lines}</code></pre>`;
  }
  return `<pre class="${classNames(`language-${lang}`, {
    'line-numbers': options.lineNumbers,
  })}"><code class="language-${lang}">${escapeHtml(code)}${lines}</code></pre>`;
}

function fenceRule(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  const info = token.info ? unescapeAll(token.info).trim() : '';
  let langName = '';
  let langAttrs = '';
  let highlighted;

  if (info) {
    const arr = info.split(/(\s+)/g);
    langName = arr[0];
    langAttrs = arr.slice(2).join('');
  }

  if (options.highlight) {
    highlighted =
      options.highlight(token.content, langName, langAttrs) ||
      escapeHtml(token.content);
  } else {
    highlighted = escapeHtml(token.content);
  }

  return `${highlighted}\n`;
}

function mermaidPlugin(md) {
  md.renderer.rules.fence = fenceRule;
}

module.exports = {
  highlight,
  mermaidPlugin,
};
