const MarkdownIt = require('markdown-it');
const uslug = require('uslug');
const matter = require('gray-matter');
const { highlight, fenceRule } = require('./highlight');
const { handleExternalLink, renderDetails, renderFigure } = require('./utils');

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
    slugify: s => uslug(s),
    permalinkAttrs: () => ({ 'aria-hidden': true }),
  })
  .use(
    require('markdown-it-for-inline'),
    'handleExternalLink',
    'link_open',
    handleExternalLink,
  )
  .use(require('markdown-it-container'), 'details', {
    validate: function (params) {
      return params.trim().match(/^details\s+(.*)$/);
    },
    render: renderDetails,
  })
  .use(require('markdown-it-container'), 'figure', {
    validate: function (params) {
      return params.trim().match(/^figure\s+(.*)$/);
    },
    render: renderFigure(),
  });

md.renderer.rules.fence = fenceRule;

function parseMarkdown(markdown) {
  const mattered = matter(markdown);
  const html = md.render(mattered.content);
  return {
    matter: mattered.data,
    html,
  };
}

module.exports = {
  parseMarkdown,
};
