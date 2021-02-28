const path = require('path');
const chalk = require('chalk');
const fse = require('fs-extra');
const dayjs = require('dayjs');
const { config } = require('./config');
const { pathFileMap, findMarkdownFile } = require('./file');
const { Spinner } = require('./utils');
const { generateHtml } = require('./markdown');

dayjs.extend(require('dayjs/plugin/duration'));
dayjs.extend(require('dayjs/plugin/relativeTime'));

let root, dist;

async function buildCommandHandler(rootPath, options) {
  process.env.NODE_ENV = 'production';
  config.initConfig(options.config);
  root = path.join(process.cwd(), rootPath || '');
  dist = path.join(root, config.config.build.dist);

  const startTimeStamp = Date.now();

  await cleanDist();

  await copyInternalFiles();

  await copyPublicFolder();

  await generateAll();

  const stopTimeStamp = Date.now();
  const duration = dayjs.duration(stopTimeStamp - startTimeStamp);
  console.log('Build completed', duration.humanize(true));
}

async function cleanDist() {
  const spinner = new Spinner({
    start: 'Cleaning dist folder ...',
    end: 'Dist folder cleaned',
  });
  await fse.remove(dist);
  await fse.ensureDir(dist);
  spinner.succeed();
}

async function copyInternalFiles() {
  const spinner = new Spinner({
    start: 'Copying internal files ...',
    end: 'Internal files copied',
  });
  for (let i = 0; i < pathFileMap.length; i++) {
    const map = pathFileMap[i];
    const from = require.resolve(map[1]);
    const to = path.join(dist, map[0]);
    await fse.copy(from, to);
  }
  await fse.copy(path.join(__dirname, '..', 'static'), dist);
  spinner.succeed();
}

async function copyPublicFolder() {
  const spinner = new Spinner({
    start: 'Copying public folder ...',
    end: 'Public folder copied',
  });
  const publicFolderPath = path.join(root, config.config.publicFolder);
  if (await fse.pathExists(publicFolderPath)) {
    await fse.copy(publicFolderPath, dist);
  }
  spinner.succeed();
}

async function generateAll() {
  const files = findMarkdownFile(root, '');
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const spinner = new Spinner({
      start: `Compiling ${chalk.blueBright(
        file.filePath,
      )} to ${chalk.blueBright(file.pathname)} ...`,
      end: `Compiled ${chalk.blueBright(file.filePath)} to ${chalk.blueBright(
        file.pathname,
      )}`,
    });
    await fse.outputFile(
      path.join(dist, file.pathname),
      generateHtml(file.filePath),
    );
    spinner.succeed();
  }
}

module.exports = {
  buildCommandHandler,
};
