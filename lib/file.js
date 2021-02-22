const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const exclude = [/node_modules/, /\.git/];

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
        let fileName = path.basename(file.name, path.extname(file.name));
        if (fileName.toLowerCase() === 'readme') {
          fileName = 'index';
        }
        result.push({
          filePath,
          pathname: `${pathname}${fileName}.html`,
        });
      }
    }
    if (file.isDirectory()) {
      result.push(
        ...findMarkdownFile(
          path.join(dirPath, file.name),
          `${pathname}${file.name}/`,
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
  findMarkdownFile,
  startWatch,
};
