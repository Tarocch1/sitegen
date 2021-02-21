const fs = require('fs');
const path = require('path');

const exclude = [/node_modules/];

function findMarkdownFile(dirPath, pathname) {
  if (exclude.some(reg => reg.test(dirPath))) return [];
  const result = [];
  const files = fs.readdirSync(dirPath, {
    encoding: 'utf-8',
    withFileTypes: true,
  });
  files.forEach(function (file) {
    if (file.isFile()) {
      if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
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

module.exports = {
  findMarkdownFile,
};
