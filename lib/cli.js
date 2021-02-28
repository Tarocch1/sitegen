const { program } = require('commander');
const { version } = require('../package.json');
const { devCommandHandler } = require('./dev');
const { buildCommandHandler } = require('./build');

function init() {
  program.version(version);

  program
    .command('dev [path]')
    .description('Open local dev server.')
    .option('-c, --config [path]', 'config file path', './sitegen.config.js')
    .action(devCommandHandler);

  program
    .command('build [path]')
    .description('Build all files to dist folder.')
    .option('-c, --config [path]', 'config file path', './sitegen.config.js')
    .action(buildCommandHandler);

  program.parse(process.argv);
}

module.exports = {
  init,
};
