const katex = require('katex');
const { escapeHtml } = require('markdown-it/lib/common/utils');
const { config } = require('../config');

function isValidDelim(state, pos) {
  const max = state.posMax;
  const prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1;
  const nextChar = pos + 1 <= max ? state.src.charCodeAt(pos + 1) : -1;
  let canOpen = true,
    canClose = true;

  if (nextChar === 0x20 /* " " */ || nextChar === 0x09 /* \t */) {
    canOpen = false;
  }
  if (
    prevChar === 0x20 /* " " */ ||
    prevChar === 0x09 /* \t */ ||
    (nextChar >= 0x30 /* "0" */ && nextChar <= 0x39) /* "9" */
  ) {
    canClose = false;
  }

  return {
    canOpen,
    canClose,
  };
}

function katexInline(state, silent) {
  if (!config.config.markdown.katex) {
    return false;
  }

  if (state.src[state.pos] !== '$') {
    return false;
  }

  let res = isValidDelim(state, state.pos);
  if (!res.canOpen) {
    if (!silent) {
      state.pending += '$';
    }
    state.pos += 1;
    return true;
  }

  const start = state.pos + 1;
  let match = start,
    pos;
  while ((match = state.src.indexOf('$', match)) !== -1) {
    pos = match - 1;
    while (state.src[pos] === '\\') {
      pos -= 1;
    }
    if ((match - pos) % 2 === 1) {
      break;
    }
    match += 1;
  }

  if (match === -1) {
    if (!silent) {
      state.pending += '$';
    }
    state.pos = start;
    return true;
  }

  if (match - start === 0) {
    if (!silent) {
      state.pending += '$$';
    }
    state.pos = start + 1;
    return true;
  }

  res = isValidDelim(state, match);
  if (!res.canClose) {
    if (!silent) {
      state.pending += '$';
    }
    state.pos = start;
    return true;
  }

  if (!silent) {
    const token = state.push('katex_inline', 'katex', 0);
    token.markup = '$';
    token.content = state.src.slice(start, match);
  }

  state.pos = match + 1;
  return true;
}

function katexBlock(state, start, end, silent) {
  if (!config.config.markdown.katex) {
    return false;
  }

  let pos = state.bMarks[start] + state.tShift[start],
    max = state.eMarks[start],
    found = false;

  if (pos + 2 > max || state.src.slice(pos, pos + 2) !== '$$') {
    return false;
  }

  if (silent) {
    return true;
  }

  // pos += 2;
  // let firstLine = state.src.slice(pos, max);
  // if (firstLine.trim().slice(-2) === '$$') {
  //   firstLine = firstLine.trim().slice(0, -2);
  //   found = true;
  // }

  let next /*, lastPos, lastLine */;
  for (next = start; !found; ) {
    next++;

    if (next >= end) {
      break;
    }

    pos = state.bMarks[next] + state.tShift[next];
    max = state.eMarks[next];

    if (pos < max && state.tShift[next] < state.blkIndent) {
      break;
    }

    if (state.src.slice(pos, max).trim().slice(-2) === '$$') {
      // lastPos = state.src.slice(0, max).lastIndexOf('$$');
      // lastLine = state.src.slice(pos, lastPos);
      found = true;
    }
  }

  state.line = next + 1;

  const token = state.push('katex_block', 'katex', 0);
  token.block = true;
  token.content = state.getLines(start + 1, next, state.tShift[start], true);
  // token.content =
  //   (firstLine && firstLine.trim() ? firstLine + '\n' : '') +
  //   state.getLines(start + 1, next, state.tShift[start], true) +
  //   (lastLine && lastLine.trim() ? lastLine : '');
  token.map = [start, state.line];
  token.markup = '$$';
  token.info = firstLine;
  return true;
}

function katexPlugin(md) {
  const inlineRenderer = function (tokens, idx) {
    const token = tokens[idx];
    const latex = token.content;
    try {
      return katex.renderToString(latex, {
        displayMode: false,
        ...config.config.markdown.katex,
      });
    } catch (error) {
      return escapeHtml(latex);
    }
  };

  const blockRenderer = function (tokens, idx, options, env, slf) {
    const token = tokens[idx];
    const latex = token.content;
    try {
      return `<p ${slf.renderAttrs(token)}>${katex.renderToString(latex, {
        displayMode: true,
        ...config.config.markdown.katex,
      })}</p>`;
    } catch (error) {
      return escapeHtml(latex);
    }
  };

  md.inline.ruler.after('escape', 'katex_inline', katexInline);
  md.block.ruler.after('blockquote', 'katex_block', katexBlock, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  });
  md.renderer.rules.katex_inline = inlineRenderer;
  md.renderer.rules.katex_block = blockRenderer;
}

module.exports = {
  katexPlugin,
};
