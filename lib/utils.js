const path = require('path');
const ora = require('ora');
const fg = require('fast-glob');
const spawn = require('cross-spawn');
const { config } = require('./config');

function readmeToIndex(name) {
  return name.replace(/readme\.(md|markdown)$/i, 'index.html');
}

function mdToHtml(name) {
  return readmeToIndex(name).replace(/md|markdown$/i, 'html');
}

function getGitLastUpdatedTimeStamp(filePath) {
  let lastUpdated;
  try {
    lastUpdated =
      parseInt(
        spawn
          .sync('git', ['log', '-1', '--format=%at', path.basename(filePath)], {
            cwd: path.dirname(filePath),
          })
          .stdout.toString('utf-8')
      ) * 1000;
  } catch (e) {
    //
  }
  return lastUpdated;
}

function getAllMarkdownFile(rootPath) {
  return fg('**/*.{md,markdown}', {
    cwd: rootPath,
    ignore: ['node_modules', '.git', config.config.publicDir],
    caseSensitiveMatch: false,
  });
}

function Spinner(options) {
  this.start = options.start;
  this.end = options.end;
  this.spinner = ora(this.start).start();
}

Spinner.prototype.succeed = function (clear = false) {
  if (clear) {
    this.spinner.stop();
  } else {
    this.spinner.succeed(this.end);
  }
};

module.exports = {
  readmeToIndex,
  mdToHtml,
  getGitLastUpdatedTimeStamp,
  getAllMarkdownFile,
  Spinner,
};
