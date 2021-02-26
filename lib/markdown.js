const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const MarkdownIt = require('markdown-it');
const { config } = require('./config');
const { connect } = require('net');

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
})
  .use(require('markdown-it-sub'))
  .use(require('markdown-it-sup'))
  .use(require('markdown-it-footnote'))
  .use(require('markdown-it-abbr'))
  .use(require('markdown-it-emoji'))
  .use(require('markdown-it-ins'))
  .use(require('markdown-it-mark'))
  .use(require('markdown-it-anchor'), { permalink: true })
  .use(
    require('markdown-it-for-inline'),
    'handleExternalLink',
    'link_open',
    handleExternalLink,
  );

function generateHtml(filepath) {
  const markdown = fs.readFileSync(filepath, {
    encoding: 'utf-8',
  });
  const html = md.render(markdown);
  const data = {
    title: config.config.title,
    description: config.config.description,
    html,
  };
  return template(data);
}

function handleExternalLink(tokens, idx) {
  const token = tokens[idx];
  const href = token.attrGet('href');
  if (href && /https?:\/\//.test(href)) {
    token.attrSet('target', '_blank');
    token.attrSet('rel', 'noopener noreferrer');
  }
}

module.exports = {
  generateHtml,
};
