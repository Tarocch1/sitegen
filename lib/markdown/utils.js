const { escapeHtml } = require('markdown-it/lib/common/utils');

function handleExternalLink(tokens, idx) {
  const token = tokens[idx];
  const href = token.attrGet('href');
  if (href && /^(https?:\/\/|mailto:)/.test(href)) {
    token.attrSet('target', '_blank');
    token.attrSet('rel', 'noopener noreferrer');
  }
}

function renderDetails(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  const m = token.info.trim().match(/^details\s+(.*)$/);
  if (token.nesting === 1) {
    const attrs = slf.renderAttrs(token);
    return `<details ${attrs}><summary>${escapeHtml(m[1])}</summary><div>\n`;
  } else {
    return '</div></details>\n';
  }
}

function renderFigure() {
  let figcaption = '';
  return function (tokens, idx, options, env, slf) {
    const token = tokens[idx];
    const m = token.info.trim().match(/^figure\s+(.*)$/);
    if (m) figcaption = escapeHtml(m[1]);
    if (token.nesting === 1) {
      const attrs = slf.renderAttrs(token);
      return `<figure ${attrs}>`;
    } else {
      return `<figcaption>${figcaption}</figcaption></figure>\n`;
    }
  };
}

function renderInfo(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  const type = token.info.trim();
  if (token.nesting === 1) {
    let attrs = slf.renderAttrs(token);
    attrs = attrsAddClass(attrs, type);
    return `<div ${attrs}>\n`;
  } else {
    return '</div>\n';
  }
}

/**
 * Copied from https://github.com/vuejs/vuepress/blob/38e98634af117f83b6a32c8ff42488d91b66f663/packages/%40vuepress/shared-utils/src/slugify.ts
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2018-present, Yuxi (Evan) You
 */

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
    .replace(/^(\d)/, '_$1')
    .toLowerCase();
}

function attrsAddClass(attrs, className) {
  if (attrs.includes('class="')) {
    return attrs.replace('class="', `class="${className} `);
  }
  return `class="${className}" ${attrs}`;
}

module.exports = {
  handleExternalLink,
  renderDetails,
  renderFigure,
  renderInfo,
  slugify,
  attrsAddClass,
};
