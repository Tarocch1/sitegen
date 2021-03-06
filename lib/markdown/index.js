const MarkdownIt = require('markdown-it');
const matter = require('gray-matter');
const { highlight, highlightPlugin } = require('./highlight');
const { taskListPlugin } = require('./taskList');
const { katexPlugin } = require('./katex');
const {
  handleExternalLink,
  renderDetails,
  renderFigure,
  renderInfo,
  slugify,
} = require('./utils');

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
  .use(require('markdown-it-deflist'))
  .use(require('markdown-it-ins'))
  .use(require('markdown-it-mark'))
  .use(require('markdown-it-attrs'))
  .use(require('markdown-it-anchor'), {
    permalink: true,
    slugify,
    permalinkSymbol: '¶',
    permalinkSpace: false,
    permalinkAttrs: () => ({ 'aria-hidden': true }),
  })
  .use(
    require('markdown-it-for-inline'),
    'handleExternalLink',
    'link_open',
    handleExternalLink
  )
  .use(require('markdown-it-container'), 'details', {
    validate: function (params) {
      return /^details\s+(.*)$/.test(params.trim());
    },
    render: renderDetails,
  })
  .use(require('markdown-it-container'), 'figure', {
    validate: function (params) {
      return /^figure\s+(.*)$/.test(params.trim());
    },
    render: renderFigure(),
  })
  .use(require('markdown-it-container'), 'info', {
    validate: function (params) {
      return /^(info|warning|success|danger|tips)/.test(params.trim());
    },
    render: renderInfo,
  })
  .use(highlightPlugin)
  .use(taskListPlugin)
  .use(katexPlugin);

function parseMarkdown(markdown) {
  const mattered = matter(markdown);
  const html = md.render(mattered.content);
  const tokens = md.parse(mattered.content, {});
  return {
    matter: mattered.data,
    html,
    tokens,
  };
}

module.exports = {
  parseMarkdown,
};
