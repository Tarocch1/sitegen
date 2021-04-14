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
  return `<input type="checkbox" disabled ${checked ? 'checked ' : ''}/>`;
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
