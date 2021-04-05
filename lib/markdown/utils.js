const { escapeHtml } = require('markdown-it/lib/common/utils');

function handleExternalLink(tokens, idx) {
  const token = tokens[idx];
  const href = token.attrGet('href');
  if (href && (/^https?:\/\//.test(href) || /^mailto:/.test(href))) {
    token.attrSet('target', '_blank');
    token.attrSet('rel', 'noopener noreferrer');
  }
}

function renderDetails(tokens, idx) {
  const m = tokens[idx].info.trim().match(/^details\s+(.*)$/);
  if (tokens[idx].nesting === 1) {
    return `<details><summary>${escapeHtml(m[1])}</summary>\n`;
  } else {
    return '</details>\n';
  }
}

function renderFigure() {
  let figcaption = '';
  return function (tokens, idx) {
    const m = tokens[idx].info.trim().match(/^figure\s+(.*)$/);
    if (m) figcaption = escapeHtml(m[1]);
    if (tokens[idx].nesting === 1) {
      return '<figure>';
    } else {
      return `<figcaption>${figcaption}</figcaption></figure>\n`;
    }
  };
}

const rControl = /[\u0000-\u001f]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’–—<>,.?/]+/g;
const rCombining = /[\u0300-\u036F]/g;

function slugify(str) {
  return str
    .normalize('NFKD')
    .replace(rCombining, '')
    .replace(rControl, '')
    .replace(rSpecial, '-')
    .replace(/\-{2,}/g, '-')
    .replace(/^\-+|\-+$/g, '')
    .toLowerCase();
}

module.exports = {
  handleExternalLink,
  renderDetails,
  renderFigure,
  slugify,
};
