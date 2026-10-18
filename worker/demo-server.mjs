// Local demo: runs the staff API against an in-memory fake GitHub, and serves the "published" files.
// Usage: node worker/demo-server.mjs   (password: demo-only-password)
import http from 'node:http';
import { handleRequest } from './core.js';
import { makeGithub } from './mock-github.mjs';

const gh = makeGithub();
globalThis.fetch = gh.fetchImpl;
const port = Number(process.env.PORT || 8787);
const env = {
  GITHUB_REPO: 'demo/CAW-media', GITHUB_BRANCH: 'main', GITHUB_TOKEN: 'demo',
  SESSION_SECRET: 'demo-secret-demo-secret-demo-secret-1234',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:4173',
  STAFF_PASSWORD: 'demo-only-password',
};
const mime = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', mp4: 'video/mp4', webm: 'video/webm', json: 'application/json' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  if (url.pathname.startsWith('/pages/')) {
    const f = gh.files.get(url.pathname.slice(7));
    if (!f) { res.writeHead(404, { 'Access-Control-Allow-Origin': '*' }); return res.end(); }
    res.writeHead(200, { 'Content-Type': mime[url.pathname.split('.').pop()] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
    return res.end(Buffer.from(f.content, 'base64'));
  }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = Buffer.concat(chunks);
  const r = await handleRequest(new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }), env);
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(Buffer.from(await r.arrayBuffer()));
}).listen(port, () => console.log(`demo staff API on http://127.0.0.1:${port}`));
