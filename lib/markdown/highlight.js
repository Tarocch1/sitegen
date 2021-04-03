const Prism = require('prismjs');
const loadLanguages = require('prismjs/components/');
const MarkdownIt = require('markdown-it');
const { config } = require('../config');

loadLanguages();

const md = new MarkdownIt();

function highlight(code, lang, attrs) {
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
    return `<pre class="${
      options.lineNumbers ? 'line-numbers' : ''
    } language-${lang}"><code class="language-${lang}">${html}${lines}</code></pre>`;
  }
  return `<pre class="${
    options.lineNumbers ? 'line-numbers' : ''
  } language-${lang}"><code class="language-${lang}">${md.utils.escapeHtml(
    code,
  )}${lines}</code></pre>`;
}

module.exports = {
  highlight,
};
