const fs = require('fs');
const http = require('http');
const { URL } = require('url');
const path = require('path');
const { promisify } = require('util');
const chalk = require('chalk');
const WebSocket = require('ws');
const mfs = require('memfs');
const mime = require('mime-types');
const open = require('open');
const chokidar = require('chokidar');
const { buildTemplate, renderTemplate } = require('./template');
const { config } = require('./config');
const { mdToHtml, getAllMarkdownFile, Spinner } = require('./utils');

const mfsMkdirAsync = promisify(mfs.fs.mkdir);
const mfsWriteFileAsync = promisify(mfs.fs.writeFile);
const mfsUnlinkAsync = promisify(mfs.fs.unlink);

async function devCommandHandler(root, options) {
  process.env.NODE_ENV = 'development';

  config.initConfig(options.config);

  const rootPath = path.join(process.cwd(), root || '');
  const publicPath = path.join(rootPath, config.config.publicDir);

  const template = await buildTemplate();
  await copyAssetsDir(template.assets);

  await renderAllMarkdownFile(rootPath);

  const { server, wss } = startDevServer(httpRequestHandlerFactory(publicPath));

  if (config.config.dev.watch) {
    const watcher = startWatch(rootPath, publicPath);
    watcher.on('add', renderMarkdownFileFactory(rootPath, wss));
    watcher.on('change', renderMarkdownFileFactory(rootPath, wss));
    watcher.on('unlink', removeMarkdownFileFactory(rootPath, wss));
  }

  console.clear();
  console.log(
    `${chalk.gray('>')} sitegen dev server listening at ${chalk.cyanBright(
      `http://localhost:${config.config.dev.port}`,
    )}`,
  );

  if (config.config.dev.open) {
    open(`http://localhost:${config.config.dev.port}`);
  }
}

async function copyAssetsDir(assets) {
  if (assets.length > 0) {
    const spinner = new Spinner({
      start: 'Copying assets...',
      end: 'Assets copied.',
    });
    for (const asset of assets) {
      const content = asset[asset.type === 'chunk' ? 'code' : 'source'];
      await mfsMkdirAsync(path.dirname(`/${asset.fileName}`), {
        recursive: true,
      });
      await mfsWriteFileAsync(`/${asset.fileName}`, content, {
        encoding: 'utf-8',
      });
    }
    spinner.succeed();
  }
}

async function renderAllMarkdownFile(rootPath) {
  const mdFiles = await getAllMarkdownFile(rootPath);
  for (const mdFile of mdFiles) {
    const pathName = mdToHtml(mdFile);
    const spinner = new Spinner({
      start: `Rendering ${chalk.blueBright(mdFile)} to ${chalk.blueBright(
        pathName,
      )}...`,
      end: `Rendered ${chalk.blueBright(mdFile)} to ${chalk.blueBright(
        pathName,
      )}.`,
    });
    const mdFilePath = path.join(rootPath, mdFile);
    const html = await renderTemplate(mdFilePath);
    await mfsMkdirAsync(path.dirname(`/${pathName}`), { recursive: true });
    await mfsWriteFileAsync(`/${pathName}`, html, {
      encoding: 'utf-8',
    });
    spinner.succeed();
  }
}

function renderMarkdownFileFactory(rootPath, wss) {
  return async function (mdFilePath) {
    const mdFile = path.relative(rootPath, mdFilePath);
    const pathName = mdToHtml(mdFile);
    const spinner = new Spinner({
      start: `Rendering ${chalk.blueBright(mdFile)} to ${chalk.blueBright(
        pathName,
      )}...`,
      end: `Rendered ${chalk.blueBright(mdFile)} to ${chalk.blueBright(
        pathName,
      )}.`,
    });
    const html = await renderTemplate(mdFilePath);
    await mfsMkdirAsync(path.dirname(`/${pathName}`), { recursive: true });
    await mfsWriteFileAsync(`/${pathName}`, html, {
      encoding: 'utf-8',
    });
    wss.clients.forEach(function (client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`/${pathName}`);
      }
    });
    spinner.succeed(true);
  };
}

function startDevServer(httpRequestHandler) {
  const server = http.createServer(httpRequestHandler);
  server.listen({
    host: config.config.dev.host,
    port: config.config.dev.port,
  });

  const wss = new WebSocket.Server({ server });
  wss.on('connection', function (ws) {
    ws.on('message', function (data) {
      if (data.toString() === 'ping') {
        ws.send('pong');
      }
    });
  });

  return { server, wss };
}

function httpRequestHandlerFactory(publicPath) {
  return function (req, res) {
    if (req.method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      let pathname = url.pathname;
      if (pathname.endsWith('/')) pathname += 'index.html';
      let buf = null;
      if (mfs.fs.existsSync(pathname) && mfs.fs.statSync(pathname).isFile()) {
        buf = mfs.fs.readFileSync(pathname);
      } else if (
        fs.existsSync(path.join(publicPath, pathname)) &&
        fs.statSync(path.join(publicPath, pathname)).isFile()
      ) {
        buf = fs.readFileSync(path.join(publicPath, pathname));
      } else {
        res.statusCode = 404;
        res.end();
        return;
      }
      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(buf),
        'Content-Type': mime.lookup(pathname) || 'application/octet-stream',
      });
      res.end(buf);
    } else {
      res.statusCode = 405;
      res.end();
    }
  };
}

function startWatch(rootPath, publicPath) {
  const exclude = [/node_modules/, /\/\.git/];
  const watcher = chokidar.watch(rootPath, {
    ignored: function (path) {
      if (!fs.existsSync(path)) {
        return false;
      }
      const stats = fs.statSync(path);
      return (
        exclude.some(reg => reg.test(path)) ||
        (stats.isFile() && !/\.(md|markdown)$/i.test(path)) ||
        path.startsWith(publicPath)
      );
    },
    ignoreInitial: true,
    alwaysStat: true,
  });
  return watcher;
}

function removeMarkdownFileFactory(rootPath, wss) {
  return async function (mdFilePath) {
    const mdFile = path.relative(rootPath, mdFilePath);
    const pathName = mdToHtml(mdFile);
    await mfsUnlinkAsync(`/${pathName}`);
    wss.clients.forEach(function (client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`/${pathName}`);
      }
    });
  };
}

module.exports = {
  devCommandHandler,
};
