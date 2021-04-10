const fs = require('fs');
const { promisify } = require('util');
const _ = require('lodash');
const { build } = require('vite');
const cheerio = require('cheerio');
const Handlebars = require('handlebars');
const { generateViteConfig } = require('./vite');
const { parseMarkdown } = require('./markdown');
const { config, defaultConfig } = require('./config');
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
    const toc = getToc(parsed);
    const data = {
      siteTitle: config.config.title,
      title:
        parsed.matter.title !== undefined
          ? parsed.matter.title
          : config.config.title,
      description:
        parsed.matter.description !== undefined
          ? parsed.matter.description
          : config.config.description,
      copyright:
        parsed.matter.copyright !== undefined
          ? parsed.matter.copyright
          : config.config.copyright,
      time:
        parsed.matter.time !== undefined
          ? parsed.matter.time
          : lastUpdated
          ? config.config.markdown.timeFormatter(lastUpdated)
          : '',
      toc,
      html: parsed.html,
      base:
        process.env.NODE_ENV === 'production' ? config.config.build.base : '/',
      hot: process.env.NODE_ENV === 'development' && config.config.dev.watch,
    };
    return template(data);
  }
  return '';
}

function getToc(parsed) {
  const toc = [];
  let tocConfig =
    parsed.matter.toc !== undefined
      ? parsed.matter.toc
      : config.config.markdown.toc;
  if (tocConfig) {
    if (!_.isArray(tocConfig)) {
      tocConfig = defaultConfig.markdown.toc;
    }
    if (tocConfig.length > 0) {
      const $ = cheerio.load(`<body>${parsed.html}</body>`);
      $(
        tocConfig
          .map(function (level) {
            return `body > h${level}`;
          })
          .join(', ')
      ).each(function (i, e) {
        toc.push({
          title: e.children[0].data,
          id: e.attribs.id,
          level: e.name,
        });
      });
    }
  }
  return toc;
}

module.exports = {
  buildTemplate,
  renderTemplate,
};
