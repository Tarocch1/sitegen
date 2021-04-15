const { program } = require('commander');
const { devCommandHandler } = require('./dev');
const { buildCommandHandler } = require('./build');
const { version } = require('../package.json');

program.version(version);

program
  .command('start [root]')
  .description('start local dev server')
  .option('-c, --config [path]', 'config file path', './sitegen.config.js')
  .action(devCommandHandler);

program
  .command('build [root]')
  .description('build all files to dist folder')
  .option('-c, --config [path]', 'config file path', './sitegen.config.js')
  .action(buildCommandHandler);

program.parse(process.argv);
