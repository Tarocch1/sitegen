const fs = require('fs');
const { promisify } = require('util');
const _ = require('lodash');
const { build } = require('vite');
const Handlebars = require('handlebars');
const { generateViteConfig } = require('./vite');
const { parseMarkdown } = require('./markdown');
const { config, defaultConfig } = require('./config');
const { getGitLastUpdatedTimeStamp, Spinner } = require('./utils');

const fsReadFile = promisify(fs.readFile);

Handlebars.registerHelper('trim', function (options) {
  return new Handlebars.SafeString(options.fn(this).trim());
});

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

async function renderTemplate(mdFilePath, pathName) {
  if (template) {
    const markdown = await fsReadFile(mdFilePath, {
      encoding: 'utf-8',
    });
    const parsed = parseMarkdown(markdown);
    const lastUpdated = getGitLastUpdatedTimeStamp(mdFilePath);
    const links = getLinks(pathName);
    const toc = getToc(parsed);
    const data = {
      siteTitle: config.config.title,
      links,
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
      head:
        parsed.matter.head !== undefined
          ? parsed.matter.head
          : config.config.head,
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

function getLinks(pathName) {
  const links = [];
  config.config.links.forEach(function (link) {
    let external = false,
      active = false;
    if (/^(https?:\/\/|mailto:)/.test(link.url)) {
      external = true;
    } else {
      let url = link.url;
      if (url === '' || url.endsWith('/')) url += 'index.html';
      active = url === pathName;
    }
    links.push({
      ...link,
      external,
      active,
    });
  });
  return links;
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
    tocConfig = tocConfig.map(function (level) {
      return `h${level}`;
    });
    if (tocConfig.length > 0) {
      for (let i = 0; i < parsed.tokens.length; i++) {
        const token = parsed.tokens[i];
        if (
          token.type === 'heading_open' &&
          token.level === 0 &&
          tocConfig.includes(token.tag)
        ) {
          toc.push({
            title: parsed.tokens[i + 1].children
              .filter(function (t) {
                return t.type === 'text' || t.type === 'code_inline';
              })
              .map(function (t) {
                return t.content;
              })
              .join(''),
            id: token.attrGet('id'),
            level: token.tag,
          });
        }
      }
    }
  }
  return toc;
}

module.exports = {
  buildTemplate,
  renderTemplate,
};
