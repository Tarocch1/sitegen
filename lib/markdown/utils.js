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
    return `<details><summary>${md.utils.escapeHtml(m[1])}</summary>\n`;
  } else {
    return '</details>\n';
  }
}

function renderFigure() {
  let figcaption = '';
  return function (tokens, idx) {
    const m = tokens[idx].info.trim().match(/^figure\s+(.*)$/);
    if (m) figcaption = md.utils.escapeHtml(m[1]);
    if (tokens[idx].nesting === 1) {
      return '<figure>';
    } else {
      return `<figcaption>${figcaption}</figcaption></figure>\n`;
    }
  };
}

module.exports = {
  handleExternalLink,
  renderDetails,
  renderFigure,
};
