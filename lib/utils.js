function readmeToIndex(name) {
  return name.replace(/readme\.(md|markdown)$/i, 'index.html');
}

function mdToHtml(name) {
  return readmeToIndex(name).replace(/md|markdown$/i, 'html');
}

module.exports = {
  readmeToIndex,
  mdToHtml,
};
