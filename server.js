const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8101;
const STATIC_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Health check endpoint
  if (req.url === '/flume/health' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'flume' }));
    return;
  }

  // 处理 /flume/ 路径前缀
  let url = req.url;
  if (url.startsWith('/flume/')) {
    url = url.substring(6); // 移除 /flume 前缀
  }
  if (url === '/flume') {
    url = '/';
  }

  // 默认 index.html
  if (url === '/' || url === '') {
    url = '/index.html';
  }

  const filePath = path.join(STATIC_DIR, url);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // 文件不存在，返回 index.html（支持前端路由）
        fs.readFile(path.join(STATIC_DIR, 'index.html'), (err, indexData) => {
          if (err) {
            res.writeHead(500);
            res.end('Server Error');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexData);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Flume server running on port ${PORT}`);
  console.log(`Static directory: ${STATIC_DIR}`);
});
