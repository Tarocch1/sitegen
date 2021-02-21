const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { config } = require('./config');

const templateStr = fs.readFileSync(
  path.join(__dirname, '../template/index.html'),
  {
    encoding: 'utf-8',
  },
);
const template = Handlebars.compile(templateStr);

function generateHtml(filepath) {
  const markdown = fs.readFileSync(filepath);
  // TODO 处理 markdown
  const data = {
    title: config.config.title,
    description: config.config.description,
    html: markdown,
  };
  return template(data);
}

module.exports = {
  generateHtml,
};
