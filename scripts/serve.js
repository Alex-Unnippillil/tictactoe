#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const args = process.argv.slice(2);
const options = {
  port: 4173,
  host: '127.0.0.1',
  basePath: '/tictactoe',
  root: path.resolve(__dirname, '..', 'site'),
};

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--port' || arg === '-p') {
    options.port = Number(args[i + 1]);
    i += 1;
  } else if (arg === '--host') {
    options.host = args[i + 1];
    i += 1;
  } else if (arg === '--base') {
    options.basePath = args[i + 1].replace(/\/$/, '');
    i += 1;
  } else if (arg === '--root') {
    options.root = path.resolve(process.cwd(), args[i + 1]);
    i += 1;
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const resolveFilePath = (requestPath) => {
  const normalised = requestPath.replace(/\\/g, '/');
  const { basePath, root } = options;

  if (normalised === '/' || normalised === '') {
    return { redirect: `${basePath}/` };
  }

  if (!normalised.startsWith(basePath + '/') && normalised !== basePath) {
    return null;
  }

  const relative = normalised === basePath ? '/index.html' : normalised.slice(basePath.length);
  const candidate = path.join(root, decodeURIComponent(relative));

  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    const withIndex = path.join(candidate, 'index.html');
    if (fs.existsSync(withIndex)) {
      return { filePath: withIndex };
    }
  }

  return { filePath: candidate };
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url || '/');
  const resolution = resolveFilePath(parsedUrl.pathname || '/');

  if (!resolution) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Not Found');
    return;
  }

  if (resolution.redirect) {
    res.statusCode = 302;
    res.setHeader('Location', resolution.redirect);
    res.end();
    return;
  }

  const { filePath } = resolution;
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.statusCode = error.code === 'ENOENT' ? 404 : 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(error.code === 'ENOENT' ? 'Not Found' : 'Internal Server Error');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.end(data);
  });
});

server.listen(options.port, options.host, () => {
  console.log(`Serving ${options.root} at http://${options.host}:${options.port}${options.basePath}/`);
});
