// Local demo: runs the staff API against an in-memory fake R2 bucket.
// Usage: node worker/demo-server.mjs   (password: demo-only-password)
import http from 'node:http';
import { handleRequest } from './core.js';
import { makeBucket } from './mock-r2.mjs';

const bucket = makeBucket();
const port = Number(process.env.PORT || 8787);
const env = {
  MEDIA: bucket,
  SESSION_SECRET: 'demo-secret-demo-secret-demo-secret-1234',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:4173',
  STAFF_PASSWORD: 'demo-only-password',
};
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = Buffer.concat(chunks);
  const r = await handleRequest(new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }), env);
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(Buffer.from(await r.arrayBuffer()));
}).listen(port, () => console.log(`demo staff API on http://127.0.0.1:${port}`));
