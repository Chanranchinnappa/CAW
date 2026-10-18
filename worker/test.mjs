import assert from 'node:assert/strict';
import { handleRequest, signToken, sniff, publicView } from './core.js';
import { makeBucket } from './mock-r2.mjs';

const bucket = makeBucket();

const env = {
  MEDIA: bucket,
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
assert.equal(r.body.manifest.builds[0].status, 'shown'); ok('build created, shown by default');
r = await J(await call('POST', '/api/builds', { token, body: { id, title: '1996 MM540 Rebuild', platform: 'weird', year: 'abc', story: 'Edited' } }));
assert.equal(r.body.manifest.builds.length, 1); assert.equal(r.body.manifest.builds[0].platform, 'other'); assert.equal(r.body.manifest.builds[0].story, 'Edited'); ok('edit keeps one record, bad values normalised');

// photo upload
r = await J(await call('PUT', `/api/media?buildId=${id}&caption=Front%20bumper`, { token, raw: JPEG }));
assert.equal(r.status, 200); assert.match(r.body.media.path, new RegExp(`^media/${id}/[a-z0-9]+-[a-z0-9]{5}\\.jpg$`));
assert.equal(r.body.media.status, 'shown'); assert.ok(bucket.store.has(r.body.media.path)); const photo = r.body.media.path; ok('photo uploaded and indexed');
r = await J(await call('PUT', `/api/media?buildId=${id}`, { token, raw: EXE }));
assert.equal(r.status, 415); ok('non-media file rejected by content, not by name');
r = await J(await call('PUT', `/api/media?buildId=${id}`, { token, raw: MP4 }));
assert.equal(r.status, 415); ok('videos are not accepted in one piece');
r = await J(await call('PUT', `/api/media?buildId=${id}`, { token, raw: new Uint8Array([...JPEG, ...new Uint8Array(10 * 1024 * 1024)]) }));
assert.equal(r.status, 413); ok('oversize photo rejected');
r = await J(await call('PUT', `/api/media?buildId=nope-nope`, { token, raw: JPEG }));
assert.equal(r.status, 404); ok('unknown build rejected');
r = await J(await call('PUT', `/api/media?buildId=../etc`, { token, raw: JPEG }));
assert.equal(r.status, 400); ok('path traversal in buildId rejected');
assert.equal((await call('PUT', `/api/media?buildId=${id}`, { raw: JPEG })).status, 401); ok('upload without login -> 401');

// video in pieces (small piece size is not configurable, so use 2 pieces: one full 8 MB + a tail)
const PART = 8 * 1024 * 1024;
const video = new Uint8Array(PART + 1234); video.set(MP4, 0); video.fill(7, 16);
r = await J(await call('POST', '/api/media/start', { token, body: { buildId: id, contentType: 'video/mp4', size: video.length } }));
assert.equal(r.status, 200); assert.equal(r.body.partSize, PART); const { key: vkey, uploadId } = r.body; assert.match(vkey, /\.mp4$/);
let p1 = await J(await call('PUT', `/api/media/part?key=${vkey}&uploadId=${uploadId}&n=1`, { token, raw: video.slice(0, PART) }));
assert.equal(p1.status, 200);
let p2 = await J(await call('PUT', `/api/media/part?key=${vkey}&uploadId=${uploadId}&n=2`, { token, raw: video.slice(PART) }));
assert.equal(p2.status, 200);
r = await J(await call('POST', '/api/media/complete', { token, body: { buildId: id, key: vkey, uploadId, caption: 'Test drive', parts: [p1.body, p2.body] } }));
assert.equal(r.status, 200); assert.equal(r.body.media.type, 'video'); assert.equal(bucket.store.get(vkey).bytes.length, video.length); ok('video uploaded in pieces and indexed');
r = await J(await call('POST', '/api/media/start', { token, body: { buildId: id, contentType: 'video/mp4', size: 2 * 1024 ** 3 } }));
assert.equal(r.status, 413); ok('video over 1 GB rejected');
r = await J(await call('POST', '/api/media/start', { token, body: { buildId: id, contentType: 'application/x-msdownload', size: 100 } }));
assert.equal(r.status, 415); ok('unknown content type rejected');
r = await J(await call('POST', '/api/media/start', { token, body: { buildId: id, contentType: 'video/mp4', size: 100 } }));
const bad = r.body;
r = await J(await call('PUT', `/api/media/part?key=${bad.key}&uploadId=${bad.uploadId}&n=1`, { token, raw: EXE }));
assert.equal(r.status, 415); ok('disguised file stopped at the first piece');

// public view
let pub = await J(await call('GET', '/api/public/manifest', { origin: 'https://site.example' }));
assert.equal(pub.status, 200); assert.equal(pub.body.builds[0].media.length, 2); assert.equal(pub.body.builds[0].media[0].by, undefined); ok('public list shows shown files, no staff names');
let f = await call('GET', `/${photo}`);
assert.equal(f.status, 200); assert.equal(f.headers.get('content-type'), 'image/jpeg'); ok('shown photo is served publicly');
f = await call('GET', `/${vkey}`, {});
const rangeReq = new Request('https://api.test/' + vkey, { headers: { Range: 'bytes=0-9' } });
f = await handleRequest(rangeReq, env);
assert.equal(f.status, 206); assert.equal(f.headers.get('content-range'), `bytes 0-9/${video.length}`); ok('video supports range requests (seeking)');

// hide / archive / cover
r = await J(await call('POST', '/api/media/update', { token, body: { buildId: id, path: photo, status: 'hidden' } }));
assert.equal(r.status, 200); assert.equal(r.body.manifest.builds[0].media.find((x) => x.path === photo).status, 'hidden');
pub = await J(await call('GET', '/api/public/manifest')); 
assert.equal(pub.body.builds[0].media.length, 1); ok('hide recorded, public list updates at once');
assert.equal((await call('GET', `/${photo}`)).status, 404); ok('hidden photo is not served publicly');
assert.equal((await call('GET', `/${photo}?t=${token}`)).status, 200); ok('staff can still preview a hidden photo');
r = await J(await call('POST', '/api/media/update', { token, body: { buildId: id, path: photo, status: 'archived' } }));
assert.equal(r.body.manifest.builds[0].media.find((x) => x.path === photo).status, 'archived'); ok('archive recorded');
r = await J(await call('POST', '/api/media/update', { token, body: { buildId: id, path: vkey, cover: true, caption: 'New caption' } }));
assert.equal(r.body.manifest.builds[0].media[0].path, vkey); assert.equal(r.body.manifest.builds[0].media[0].caption, 'New caption'); ok('cover and caption');
r = await J(await call('POST', '/api/media/update', { token, body: { buildId: id, path: '../../x', status: 'shown' } }));
assert.equal(r.status, 400); ok('update path traversal rejected');
assert.equal((await call('POST', '/api/media/update', { body: { buildId: id, path: photo, status: 'shown' } })).status, 401); ok('update needs login');

// hide a whole build
r = await J(await call('POST', '/api/builds', { token, body: { id, title: '1996 MM540 Rebuild', platform: 'mm540', year: 2026, story: 'x', status: 'hidden' } }));
pub = await J(await call('GET', '/api/public/manifest'));
assert.equal(pub.body.builds.length, 0); assert.equal((await call('GET', `/${vkey}`)).status, 404); ok('hidden build disappears from the public site');
await call('POST', '/api/builds', { token, body: { id, title: '1996 MM540 Rebuild', platform: 'mm540', year: 2026, story: 'x', status: 'shown' } });

// concurrent photo uploads must all be indexed
const many = await Promise.all([1, 2, 3].map(() => call('PUT', `/api/media?buildId=${id}`, { token, raw: JPEG })));
assert.deepEqual(many.map((x) => x.status), [200, 200, 200]);
const m = JSON.parse(await (await bucket.get('manifest.json')).text());
assert.equal(m.builds[0].media.length, 5); ok('3 simultaneous uploads: none lost from the list');

// delete media
r = await J(await call('DELETE', '/api/media', { token, body: { buildId: id, path: '../../.github/x' } }));
assert.equal(r.status, 400); ok('delete path traversal rejected');
r = await J(await call('DELETE', '/api/media', { token, body: { buildId: id, path: photo } }));
assert.equal(r.status, 200); assert.equal(r.body.manifest.builds[0].media.length, 4); assert.ok(!bucket.store.has(photo)); ok('file deleted from storage and list');

// shared live projects
assert.equal((await J(await call('GET', '/api/public/pipeline'))).body.pipeline, null); ok('no board saved yet');
r = await J(await call('PUT', '/api/pipeline', { token, body: { pipeline: [{ id: 'a', title: 'MM540' }] } }));
assert.equal(r.status, 200);
assert.equal((await J(await call('GET', '/api/public/pipeline'))).body.pipeline[0].id, 'a'); ok('board saved and readable by visitors');
assert.equal((await call('PUT', '/api/pipeline', { body: { pipeline: [] } })).status, 401); ok('board cannot be changed without login');
assert.equal((await J(await call('PUT', '/api/pipeline', { token, body: { pipeline: 'x' } }))).status, 400); ok('bad board data rejected');

// delete build
r = await J(await call('DELETE', '/api/builds', { token, body: { id } }));
assert.equal(r.status, 200); assert.equal(r.body.manifest.builds.length, 0);
assert.deepEqual([...bucket.store.keys()].filter((k) => k.startsWith('media/')), []); ok('build delete removes its files');

// storage not connected
const noR2 = { ...env, MEDIA: undefined };
const nr = await handleRequest(new Request('https://api.test/api/manifest', { headers: { Authorization: 'Bearer ' + token } }), noR2);
assert.equal(nr.status, 503); assert.match((await nr.json()).error, /not set up/); ok('clear message while R2 is not connected');
assert.equal((await handleRequest(new Request('https://api.test/api/public/manifest'), noR2)).status, 200); ok('public site still works without R2');

assert.equal(sniff(new Uint8Array(4)), null); ok('sniff tolerates tiny input');
assert.equal(publicView({ builds: [] }).builds.length, 0);
console.log('\nALL', t, 'CHECKS PASSED');
