import assert from 'node:assert/strict';
import { handleRequest, signToken, sniff } from './core.js';
import { makeGithub } from './mock-github.mjs';

const gh = makeGithub();
globalThis.fetch = gh.fetchImpl;

const env = {
  GITHUB_REPO: 'o/r', GITHUB_BRANCH: 'main', GITHUB_TOKEN: 't',
  SESSION_SECRET: 'x'.repeat(40),
  ALLOWED_ORIGINS: 'https://site.example,http://localhost:3000',
  STAFF_PASSWORD: 'demo-only-password',
};
const call = (method, path, { body, token, raw, origin = 'https://site.example', ip = '1.1.1.1' } = {}) =>
  handleRequest(new Request('https://api.test' + path, {
    method,
    headers: { Origin: origin, 'CF-Connecting-IP': ip, ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: raw ?? (body ? JSON.stringify(body) : undefined),
  }), env);
const J = async (r) => ({ status: r.status, body: await r.json().catch(() => null), headers: r.headers });

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 16, 74, 70, 73, 70, 0, 1, 1, 1, 2, 3, 4]);
const MP4 = new Uint8Array([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0, 0, 2, 0]);
const EXE = new Uint8Array([0x4d, 0x5a, 0x90, 0, 3, 0, 0, 0, 4, 0, 0, 0, 0xff, 0xff]);

let t = 0;
const ok = (name) => console.log('ok', ++t, name);

// config & CORS
assert.equal((await call('OPTIONS', '/api/login')).status, 204);
assert.equal((await call('OPTIONS', '/api/login')).headers.get('Access-Control-Allow-Origin'), 'https://site.example'); ok('CORS allowed origin');
assert.equal((await call('OPTIONS', '/api/login', { origin: 'https://evil.example' })).headers.get('Access-Control-Allow-Origin'), null); ok('CORS blocks other origins');
assert.equal((await handleRequest(new Request('https://api.test/api/login'), {})).status, 503); ok('503 when not configured');

// login
let r = await J(await call('POST', '/api/login', { body: { password: 'wrong' } }));
assert.equal(r.status, 401); ok('wrong password rejected');
r = await J(await call('POST', '/api/login', { body: {} }));
assert.equal(r.status, 401); ok('missing password rejected');
r = await J(await call('POST', '/api/login', { body: { password: { $ne: 1 } } }));
assert.equal(r.status, 401); ok('non-string password rejected');
r = await J(await call('POST', '/api/login', { body: { password: 'demo-only-password' } }));
assert.equal(r.status, 200); const token = r.body.token; assert.ok(token); ok('right password logs in');

// throttle
for (let i = 0; i < 5; i++) await call('POST', '/api/login', { body: { password: 'bad' }, ip: '9.9.9.9' });
r = await J(await call('POST', '/api/login', { body: { password: 'demo-only-password' }, ip: '9.9.9.9' }));
assert.equal(r.status, 429); ok('5 failures block that IP, even with the right password');

// auth required
assert.equal((await call('GET', '/api/manifest')).status, 401); ok('no token -> 401');
assert.equal((await call('GET', '/api/manifest', { token: token.slice(0, -3) + 'abc' })).status, 401); ok('tampered token -> 401');
const expired = await (async () => { const real = Date.now; Date.now = () => real() - 13 * 3600 * 1000; const tk = await signToken(env.SESSION_SECRET, 'staff'); Date.now = real; return tk; })();
assert.equal((await call('GET', '/api/session', { token: expired })).status, 401); ok('expired token -> 401');
assert.equal((await J(await call('GET', '/api/session', { token }))).body.user, 'staff'); ok('session returns user');

// builds
r = await J(await call('POST', '/api/builds', { token, body: { title: 'x' } }));
assert.equal(r.status, 400); ok('short title rejected');
r = await J(await call('POST', '/api/builds', { token, body: { title: '1996 MM540 Rebuild', platform: 'mm540', year: 2026, story: 'Di Turbo swap' } }));
assert.equal(r.status, 200); const id = r.body.id; assert.match(id, /^1996-mm540-rebuild-[a-z0-9]{4}$/);
assert.equal(r.body.manifest.builds[0].platform, 'mm540'); ok('build created');
r = await J(await call('POST', '/api/builds', { token, body: { id, title: '1996 MM540 Rebuild', platform: 'weird', year: 'abc', story: 'Edited' } }));
assert.equal(r.body.manifest.builds.length, 1); assert.equal(r.body.manifest.builds[0].platform, 'other'); assert.equal(r.body.manifest.builds[0].story, 'Edited'); ok('edit keeps one record, bad values normalised');

// upload
r = await J(await call('PUT', `/api/media?buildId=${id}&caption=Front%20bumper`, { token, raw: JPEG }));
assert.equal(r.status, 200); assert.match(r.body.media.path, new RegExp(`^media/${id}/[a-z0-9]+-[a-z0-9]{5}\\.jpg$`));
assert.equal(r.body.media.by, 'staff'); assert.equal(r.body.media.caption, 'Front bumper');
assert.ok(gh.files.has(r.body.media.path)); const firstPath = r.body.media.path; ok('photo uploaded and indexed');
r = await J(await call('PUT', `/api/media?buildId=${id}`, { token, raw: MP4 }));
assert.equal(r.status, 200); assert.equal(r.body.media.type, 'video'); ok('video uploaded');
r = await J(await call('PUT', `/api/media?buildId=${id}`, { token, raw: EXE }));
assert.equal(r.status, 415); ok('non-media file rejected by content, not by name');
r = await J(await call('PUT', `/api/media?buildId=${id}`, { token, raw: new Uint8Array([...JPEG, ...new Uint8Array(5 * 1024 * 1024)]) }));
assert.equal(r.status, 413); ok('oversize photo rejected');
r = await J(await call('PUT', `/api/media?buildId=${id}`, { token, raw: new Uint8Array([...MP4, ...new Uint8Array(10 * 1024 * 1024)]) }));
assert.equal(r.status, 413); ok('oversize video rejected');
r = await J(await call('PUT', `/api/media?buildId=nope-nope`, { token, raw: JPEG }));
assert.equal(r.status, 404); ok('unknown build rejected');
r = await J(await call('PUT', `/api/media?buildId=../etc`, { token, raw: JPEG }));
assert.equal(r.status, 400); ok('path traversal in buildId rejected');
assert.equal((await call('PUT', `/api/media?buildId=${id}`, { raw: JPEG })).status, 401); ok('upload without login -> 401');

// concurrent uploads must all be indexed (manifest retry on conflict)
const many = await Promise.all([1, 2, 3].map(() => call('PUT', `/api/media?buildId=${id}`, { token, raw: JPEG })));
assert.deepEqual(many.map((x) => x.status), [200, 200, 200]);
const m = JSON.parse(Buffer.from(gh.files.get('media/manifest.json').content, 'base64').toString());
assert.equal(m.builds[0].media.length, 5); ok('3 simultaneous uploads: none lost from manifest');

// delete media
r = await J(await call('DELETE', '/api/media', { token, body: { buildId: id, path: '../../.github/x' } }));
assert.equal(r.status, 400); ok('delete path traversal rejected');
r = await J(await call('DELETE', '/api/media', { token, body: { buildId: id, path: firstPath } }));
assert.equal(r.status, 200); assert.equal(r.body.manifest.builds[0].media.length, 4); assert.ok(!gh.files.has(firstPath)); ok('file removed from repo and manifest');

// delete build
r = await J(await call('DELETE', '/api/builds', { token, body: { id } }));
assert.equal(r.status, 200); assert.equal(r.body.manifest.builds.length, 0);
assert.deepEqual([...gh.files.keys()], ['media/manifest.json']); ok('build delete removes its files');

assert.equal(sniff(new Uint8Array(4)), null); ok('sniff tolerates tiny input');
console.log('\nALL', t, 'CHECKS PASSED');
