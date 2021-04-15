/**
 * Baseed on the markdown-it-task-lists library, which is used under the ISC License below:
 *
 * Copyright (c) 2016, Revin Guillen
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

function taskListPlugin(md) {
  md.core.ruler.after('inline', 'task-list', function (state) {
    const tokens = state.tokens;
    for (let i = 2; i < tokens.length; i++) {
      if (isTaskListToken(tokens, i)) {
        taskListify(tokens[i], state.Token);
      }
    }
  });
  md.renderer.rules.task_list = taskListRenderer;
}

function taskListify(token, TokenConstructor) {
  const taskListToken = new TokenConstructor('task_list', '', 0);
  taskListToken.content = token.content.slice(0, 4);
  token.children.unshift(taskListToken);
  token.children[1].content = token.children[1].content.slice(4);
  token.content = token.content.slice(4);
}

function taskListRenderer(tokens, idx) {
  const token = tokens[idx];
  const checked = /\[x\]/i.test(token.content);
  return `<span class="iconfont checkbox">${
    checked ? '&#xe666;' : '&#xe667;'
  }</span>`;
}

function isTaskListToken(tokens, idx) {
  return (
    isInlineToken(tokens[idx]) &&
    isParagraphToken(tokens[idx - 1]) &&
    isListItemToken(tokens[idx - 2]) &&
    startsWithTaskListMarkdown(tokens[idx])
  );
}

function isInlineToken(token) {
  return token.type === 'inline';
}
function isParagraphToken(token) {
  return token.type === 'paragraph_open';
}
function isListItemToken(token) {
  return token.type === 'list_item_open';
}
function startsWithTaskListMarkdown(token) {
  return /^\[[ x]\] /i.test(token.content);
}

module.exports = {
  taskListPlugin,
};
