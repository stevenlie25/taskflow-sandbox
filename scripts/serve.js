import http from 'node:http';
import { readFile } from 'node:fs/promises';
const files = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/styles.css': ['styles.css', 'text/css'], '/app.js': ['app.js', 'text/javascript'], '/state.js': ['state.js', 'text/javascript'] };
http.createServer(async (req, res) => {
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) { res.writeHead(404).end('Tidak ditemukan'); return; }
  try { res.writeHead(200, { 'Content-Type': `${file[1]}; charset=utf-8` }); res.end(await readFile(file[0])); }
  catch { res.writeHead(500).end('Gagal membuka aplikasi'); }
}).listen(5173, '127.0.0.1', () => console.log('TaskFlow: http://localhost:5173'));
