const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { mdToHtml } = require('./utils');

const exclude = [/node_modules/, /\.git/];

const pathFileMap = [
  ['/assets/css/prism.css', 'node_modules/prismjs/themes/prism.css'],
  [
    '/assets/css/prism-line-numbers.css',
    'node_modules/prismjs/plugins/line-numbers/prism-line-numbers.css',
  ],
  ['/assets/css/normalize.css', 'node_modules/normalize.css/normalize.css'],
];

function findMarkdownFile(dirPath, pathname) {
  if (exclude.some(reg => reg.test(dirPath))) return [];
  const result = [];
  const files = fs.readdirSync(dirPath, {
    encoding: 'utf-8',
    withFileTypes: true,
  });
  files.forEach(function (file) {
    if (file.isFile()) {
      if (
        file.name.toLowerCase().endsWith('.md') ||
        file.name.toLowerCase().endsWith('.markdown')
      ) {
        let filePath = path.join(dirPath, file.name);
        if (exclude.some(reg => reg.test(filePath))) return;
        result.push({
          filePath,
          pathname: `${pathname}/${mdToHtml(file.name)}`,
        });
      }
    }
    if (file.isDirectory()) {
      result.push(
        ...findMarkdownFile(
          path.join(dirPath, file.name),
          `${pathname}/${file.name}`,
        ),
      );
    }
  });
  return result;
}

function startWatch(root) {
  const watcher = chokidar.watch(root, {
    ignored: function (path) {
      if (!fs.existsSync(path)) {
        return true;
      }
      const stats = fs.statSync(path);
      return (
        exclude.some(reg => reg.test(path)) ||
        (stats.isFile() &&
          !path.toLowerCase().endsWith('.md') &&
          !path.toLowerCase().endsWith('.markdown'))
      );
    },
    alwaysStat: true,
  });
  return watcher;
}

module.exports = {
  pathFileMap,
  findMarkdownFile,
  startWatch,
};
