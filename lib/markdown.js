const fs = require('fs');
const path = require('path');
const Prism = require('prismjs');
const Handlebars = require('handlebars');
const MarkdownIt = require('markdown-it');
const uslug = require('uslug');
const matter = require('gray-matter');
const spawn = require('cross-spawn');
const { config } = require('./config');

const loadLanguages = require('prismjs/components/');
loadLanguages();

const templateStr = fs.readFileSync(
  path.join(__dirname, '../template/index.html'),
  {
    encoding: 'utf-8',
  },
);
const template = Handlebars.compile(templateStr);

const md = new MarkdownIt({
  html: true,
  xhtmlOut: false,
  breaks: true,
  langPrefix: 'language-',
  linkify: false,
  typographer: false,
  highlight,
})
  .use(require('markdown-it-sub'))
  .use(require('markdown-it-sup'))
  .use(require('markdown-it-footnote'))
  .use(require('markdown-it-abbr'))
  .use(require('markdown-it-emoji'))
  .use(require('markdown-it-ins'))
  .use(require('markdown-it-mark'))
  .use(require('markdown-it-anchor'), {
    permalink: true,
    permalinkSymbol: '#',
    permalinkSpace: false,
    permalinkBefore: true,
    slugify: s => uslug(s),
    permalinkAttrs: () => ({ 'aria-hidden': true }),
  })
  .use(
    require('markdown-it-for-inline'),
    'handleExternalLink',
    'link_open',
    handleExternalLink,
  );

function generateHtml(filePath) {
  const markdown = fs.readFileSync(filePath, {
    encoding: 'utf-8',
  });
  const mattered = matter(markdown);
  const lastUpdated = getGitLastUpdatedTimeStamp(filePath);
  const html = md.render(mattered.content);
  const data = {
    title: mattered.data.title || config.config.title,
    description: mattered.data.description || config.config.description,
    time:
      mattered.data.time !== undefined
        ? mattered.data.time
        : lastUpdated
        ? config.config.markdown.timeFormatter(lastUpdated)
        : '',
    html,
  };
  return template(data);
}

function highlight(code, lang) {
  const lines = config.config.markdown.lineNumbers
    ? `<span aria-hidden="true" class="line-numbers-rows">${code
        .split('\n')
        .map(() => '<span></span>')
        .slice(1)
        .join('')}</span>`
    : '';
  if (lang && Prism.languages[lang]) {
    const html = Prism.highlight(code, Prism.languages[lang], lang);
    return `<pre class="${
      config.config.markdown.lineNumbers ? 'line-numbers' : ''
    } language-${lang}"><code class="language-${lang}">${html}${lines}</code></pre>`;
  }
  return `<pre class="${
    config.config.markdown.lineNumbers ? 'line-numbers' : ''
  } language-${lang}"><code class="language-${lang}">${md.utils.escapeHtml(
    code,
  )}${lines}</code></pre>`;
}

function handleExternalLink(tokens, idx) {
  const token = tokens[idx];
  const href = token.attrGet('href');
  if (href && (/^https?:\/\//.test(href) || /^mailto:/.test(href))) {
    token.attrSet('target', '_blank');
    token.attrSet('rel', 'noopener noreferrer');
  }
}

function getGitLastUpdatedTimeStamp(filePath) {
  let lastUpdated;
  try {
    lastUpdated =
      parseInt(
        spawn
          .sync('git', ['log', '-1', '--format=%at', path.basename(filePath)], {
            cwd: path.dirname(filePath),
          })
          .stdout.toString('utf-8'),
      ) * 1000;
  } catch (e) {
    //
  }
  return lastUpdated;
}

module.exports = {
  generateHtml,
};
