const { URL } = require('url');
const http = require('http');
const fs = require('fs');
const path = require('path');
const util = require('util');
const mfs = require('memfs');
const mime = require('mime-types');
const WebSocket = require('ws');
const chalk = require('chalk');
const { config } = require('./config');
const { pathFileMap, findMarkdownFile, startWatch } = require('./file');
const { generateHtml } = require('./markdown');
const { mdToHtml, Spinner } = require('./utils');

let root, server, wss, watcher;

const mfsMkdirAsync = util.promisify(mfs.fs.mkdir);
const mfsWriteFileAsync = util.promisify(mfs.fs.writeFile);

async function devCommandHandler(rootPath, options) {
  process.env.NODE_ENV = 'development';
  config.initConfig(options.config);
  root = path.join(process.cwd(), rootPath || '');

  await generateAll();

  startDevServer();

  if (config.config.dev.watch) {
    watcher = startWatch(root);
    watcher.on('change', generateOne);
  }

  console.clear();
  console.log(
    `${chalk.gray('>')} sitegen dev server listening at ${chalk.cyanBright(
      `http://localhost:${config.config.dev.port}`,
    )}`,
  );
}

// 查找并转换所有 markdown 文件
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
    await mfsMkdirAsync(path.dirname(file.pathname), { recursive: true });
    await mfsWriteFileAsync(file.pathname, generateHtml(file.filePath), {
      encoding: 'utf-8',
    });
    spinner.succeed();
  }
}

// 转换某一特定 markdown 文件
async function generateOne(filePath) {
  const pathname = mdToHtml(
    `/${path.relative(root, filePath).replace(/^\./, '')}`,
  );
  const spinner = new Spinner({
    start: `Compiling ${chalk.blueBright(filePath)} to ${chalk.blueBright(
      pathname,
    )} ...`,
    end: `Compiled ${chalk.blueBright(filePath)} to ${chalk.blueBright(
      pathname,
    )}`,
  });
  await mfsMkdirAsync(path.dirname(pathname), { recursive: true });
  await mfsWriteFileAsync(pathname, generateHtml(filePath), {
    encoding: 'utf-8',
  });
  wss.clients.forEach(function (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(pathname);
    }
  });
  spinner.succeed(true);
}

// 启动开发服务器
function startDevServer() {
  server = http.createServer(httpRequestHandler);
  server.listen({
    host: config.config.dev.host,
    port: config.config.dev.port,
  });

  wss = new WebSocket.Server({ server });
  wss.on('connection', function (ws) {
    ws.on('message', function (data) {
      if (data.toString() === 'ping') {
        ws.send('pong');
      }
    });
  });
}

function httpRequestHandler(req, res) {
  if (req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = url.pathname;
    if (pathname.endsWith('/')) pathname += 'index.html';
    let buf = null;
    if (mfs.fs.existsSync(pathname) && mfs.fs.statSync(pathname).isFile()) {
      buf = mfs.fs.readFileSync(pathname);
    } else {
      const publicFolderPath = path.join(
        root,
        config.config.publicFolder,
        pathname,
      );
      const staticFolderPath = path.join(__dirname, '../static', pathname);
      let map;
      if (
        fs.existsSync(publicFolderPath) &&
        fs.statSync(publicFolderPath).isFile()
      ) {
        pathname = publicFolderPath;
      } else if (
        fs.existsSync(staticFolderPath) &&
        fs.statSync(staticFolderPath).isFile()
      ) {
        pathname = staticFolderPath;
      } else if ((map = pathFileMap.find(map => map[0] === pathname))) {
        pathname = require.resolve(map[1]);
      } else {
        res.statusCode = 404;
        res.end();
        return;
      }
      buf = fs.readFileSync(pathname);
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
}

module.exports = {
  devCommandHandler,
};
