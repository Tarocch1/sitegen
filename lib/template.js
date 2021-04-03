const fs = require('fs');
const { promisify } = require('util');
const { build } = require('vite');
const Handlebars = require('handlebars');
const { generateViteConfig } = require('./vite');
const { parseMarkdown } = require('./markdown');
const { config } = require('./config');
const { getGitLastUpdatedTimeStamp, Spinner } = require('./utils');

const fsReadFile = promisify(fs.readFile);

let template = null;

async function buildTemplate() {
  const spinner = new Spinner({
    start: 'Building template file...',
    end: 'Template file built.',
  });
  const res = await build(generateViteConfig());
  const assets = [];
  let indexHtml = '';
  res.output.forEach(function (output) {
    if (output.fileName.startsWith(config.config.build.assetsDir)) {
      assets.push(output);
    } else if (output.fileName === 'index.html') {
      indexHtml = output.source;
    }
  });
  template = Handlebars.compile(indexHtml);
  spinner.succeed();
  return {
    assets,
    indexHtml,
  };
}

async function renderTemplate(mdFilePath) {
  if (template) {
    const markdown = await fsReadFile(mdFilePath, {
      encoding: 'utf-8',
    });
    const parsed = parseMarkdown(markdown);
    const lastUpdated = getGitLastUpdatedTimeStamp(mdFilePath);
    const data = {
      title: parsed.matter.title || config.config.title,
      description: parsed.matter.description || config.config.description,
      time:
        parsed.matter.time !== undefined
          ? parsed.matter.time
          : lastUpdated
          ? config.config.markdown.timeFormatter(lastUpdated)
          : '',
      html: parsed.html,
      base:
        process.env.NODE_ENV === 'production' ? config.config.build.base : '/',
      hot: process.env.NODE_ENV === 'development' && config.config.dev.watch,
    };
    return template(data);
  }
  return '';
}

module.exports = {
  buildTemplate,
  renderTemplate,
};
