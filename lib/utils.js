const ora = require('ora');

function readmeToIndex(name) {
  return name.replace(/readme\.(md|markdown)$/i, 'index.html');
}

function mdToHtml(name) {
  return readmeToIndex(name).replace(/md|markdown$/i, 'html');
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
  Spinner,
};
