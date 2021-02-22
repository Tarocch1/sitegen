const { URL } = require('url');
const http = require('http');
const fs = require('fs');
const path = require('path');
const mfs = require('memfs');
const mime = require('mime-types');
const WebSocket = require('ws');
const { config } = require('./config');
const { findMarkdownFile, startWatch } = require('./file');
const { generateHtml } = require('./markdown');

let root, server, wss;

function devCommandHandler(rootPath, options) {
  config.initConfig(options.config);
  root = path.join(process.cwd(), rootPath || '');

  generateAll(root);

  server = startDevServer();
  wss = new WebSocket.Server({ server });
  wss.on('connection', function (ws) {
    ws.on('message', function (data) {
      if (data.toString() === 'ping') {
        ws.send('pong');
      }
    });
  });

  const watcher = startWatch(root);
  watcher.on('change', generateOne);
}

// 查找并转换所有 markdown 文件
function generateAll() {
  const files = findMarkdownFile(root, '/');
  files.forEach(function (file) {
    console.log(`Compiling ${file.filePath} to ${file.pathname}`);
    mfs.fs.mkdirSync(path.dirname(file.pathname), {
      recursive: true,
    });
    mfs.fs.writeFileSync(file.pathname, generateHtml(file.filePath), {
      encoding: 'utf-8',
    });
  });
}

// 转换某一特定 markdown 文件
function generateOne(filePath) {
  let fileName = path.basename(filePath, path.extname(filePath));
  if (fileName.toLowerCase() === 'readme') {
    fileName = 'index';
  }
  const pathname = `/${path
    .dirname(path.relative(root, filePath))
    .replace(/^\./, '')}/${fileName}.html`.replace(/\/{2}/g, '/');
  console.log(`Compiling ${filePath} to ${pathname}`);
  mfs.fs.mkdirSync(path.dirname(pathname), {
    recursive: true,
  });
  mfs.fs.writeFileSync(pathname, generateHtml(filePath), {
    encoding: 'utf-8',
  });
  wss.clients.forEach(function (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(pathname);
    }
  });
}

// 启动开发服务器
function startDevServer() {
  const server = http.createServer(httpRequestHandler);
  server.listen({
    host: config.config.server.host,
    port: config.config.server.port,
  });
  return server;
}

function httpRequestHandler(req, res) {
  if (req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = url.pathname;
    if (pathname.endsWith('/')) pathname += 'index.html';
    let buf = null;
    if (mfs.fs.existsSync(pathname)) {
      buf = mfs.fs.readFileSync(pathname);
    } else if (
      fs.existsSync(
        path.join(process.cwd(), config.config.publicFolder, pathname),
      )
    ) {
      pathname = path.join(process.cwd(), config.config.publicFolder, pathname);
      buf = fs.readFileSync(pathname);
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
}

module.exports = {
  devCommandHandler,
};
