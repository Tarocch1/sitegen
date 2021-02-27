const ora = require('ora');
const chalk = require('chalk');

function readmeToIndex(name) {
  return name.replace(/readme\.(md|markdown)$/i, 'index.html');
}

function mdToHtml(name) {
  return readmeToIndex(name).replace(/md|markdown$/i, 'html');
}

function Spinner(filePath, pathname) {
  this.filePath = filePath;
  this.pathname = pathname;
  this.spinner = ora(
    `Compiling ${chalk.blueBright(filePath)} to ${chalk.blueBright(
      pathname,
    )} ...`,
  ).start();
}

Spinner.prototype.succeed = function (clear = false) {
  if (clear) {
    this.spinner.stop();
  } else {
    this.spinner.succeed(
      `Compiled ${chalk.blueBright(this.filePath)} to ${chalk.blueBright(
        this.pathname,
      )}`,
    );
  }
};

module.exports = {
  readmeToIndex,
  mdToHtml,
  Spinner,
};
