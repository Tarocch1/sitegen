const path = require('path');
const dayjs = require('dayjs');
const chalk = require('chalk');
const fse = require('fs-extra');
const { config } = require('./config');
const { buildTemplate, renderTemplate } = require('./template');
const { mdToHtml, getAllMarkdownFile, Spinner } = require('./utils');

dayjs.extend(require('dayjs/plugin/duration'));
dayjs.extend(require('dayjs/plugin/relativeTime'));

async function buildCommandHandler(root, options) {
  const startTimeStamp = Date.now();
  process.env.NODE_ENV = 'production';

  config.initConfig(options.config);

  const rootPath = path.join(process.cwd(), root || '');
  const publicPath = path.join(rootPath, config.config.publicDir);
  const distPath = path.join(rootPath, config.config.build.distDir);

  await cleanDistDir(distPath);

  await copyPublicDir(publicPath, distPath);

  const template = await buildTemplate();
  await copyAssetsDir(distPath, template.assets);

  await renderAllMarkdownFile(rootPath, distPath);

  const stopTimeStamp = Date.now();
  const duration = dayjs.duration(stopTimeStamp - startTimeStamp);
  console.log(`Build completed ${duration.humanize(true)}.`);
}

async function cleanDistDir(distPath) {
  const spinner = new Spinner({
    start: 'Cleaning dist dir...',
    end: 'Dist dir cleaned.',
  });
  await fse.remove(distPath);
  await fse.ensureDir(distPath);
  spinner.succeed();
}

async function copyPublicDir(publicPath, distPath) {
  if (await fse.pathExists(publicPath)) {
    const spinner = new Spinner({
      start: 'Copying public dir...',
      end: 'Public dir copied.',
    });
    await fse.copy(publicPath, distPath);
    spinner.succeed();
  }
}

async function copyAssetsDir(distPath, assets) {
  if (assets.length > 0) {
    const spinner = new Spinner({
      start: 'Copying assets...',
      end: 'Assets copied.',
    });
    for (const asset of assets) {
      const content = asset[asset.type === 'chunk' ? 'code' : 'source'];
      await fse.outputFile(path.join(distPath, asset.fileName), content, {
        encoding: 'utf-8',
      });
    }
    spinner.succeed();
  }
}

async function renderAllMarkdownFile(rootPath, distPath) {
  const mdFiles = await getAllMarkdownFile(rootPath);
  for (const mdFile of mdFiles) {
    const pathName = mdToHtml(mdFile);
    const spinner = new Spinner({
      start: `Rendering ${chalk.blueBright(mdFile)} to ${chalk.blueBright(
        pathName
      )}...`,
      end: `Rendered ${chalk.blueBright(mdFile)} to ${chalk.blueBright(
        pathName
      )}.`,
    });
    const mdFilePath = path.join(rootPath, mdFile);
    const html = await renderTemplate(mdFilePath, pathName);
    await fse.outputFile(path.join(distPath, pathName), html, {
      encoding: 'utf-8',
    });
    spinner.succeed();
  }
}

module.exports = {
  buildCommandHandler,
};
