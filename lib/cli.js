const { program } = require('commander');
const { version } = require('../package.json');
const { devCommandHandler } = require('./dev');

function init() {
  program.version(version);

  program
    .command('dev [path]')
    .description('Open local dev server.')
    .option('-c, --config [path]', 'config file path', './sitegen.config.js')
    .action(devCommandHandler);

  program.parse(process.argv);
}

module.exports = {
  init,
};
