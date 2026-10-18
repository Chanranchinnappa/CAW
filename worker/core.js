/**
 * CAW staff API: login for two staff accounts, and photo/video uploads that are
 * committed to a public GitHub Pages repo. Runs on a Cloudflare Worker (free plan).
 *
 * Secrets:  STAFF_USERS (JSON of username -> password hash), SESSION_SECRET, GITHUB_TOKEN
 * Vars:     GITHUB_REPO ("owner/repo"), GITHUB_BRANCH, ALLOWED_ORIGINS (comma separated)
 */

import { storedVerifier } from './loginKey.js';

const enc = new TextEncoder();
const dec = new TextDecoder();

export const LIMITS = {
  image: 5 * 1024 * 1024, // the site compresses photos to ~200 KB before upload
  video: 10 * 1024 * 1024, // keeps Worker CPU and memory low; about 15-20 s of phone video
  sessionMs: 12 * 60 * 60 * 1000,
  maxMediaPerBuild: 40,
  loginFailures: 5,
  loginBlockMs: 15 * 60 * 1000,
};

export const PLATFORMS = ['mm540', 'commander', 'major-mdi', 'bolero', 'safari', 'gypsy', 'other'];

/* ---------------- encoding helpers ---------------- */
export const toBase64 = (bytes) => {
  if (typeof bytes.toBase64 === 'function') return bytes.toBase64(); // native, much cheaper on the Worker CPU budget
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const b64url = (bytes) => toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s) => fromBase64(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));

const safeEqual = (a, b) => {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
};

/* ---------------- passwords & sessions ---------------- */
const verifyLogin = async (loginKey, stored) => {
  const got = enc.encode(await storedVerifier(String(loginKey ?? '')));
  return safeEqual(got, enc.encode(String(stored || '')));
};

const hmacKey = (secret, usage) =>
  crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usage);

export const signToken = async (secret, user) => {
  const payload = b64url(enc.encode(JSON.stringify({ u: user, exp: Date.now() + LIMITS.sessionMs })));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret, ['sign']), enc.encode(payload));
  return `${payload}.${b64url(new Uint8Array(sig))}`;
};

const readToken = async (secret, token) => {
  const [payload, sig] = String(token || '').split('.');
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret, ['verify']), fromB64url(sig), enc.encode(payload));
    if (!ok) return null;
    const data = JSON.parse(dec.decode(fromB64url(payload)));
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
};

/* Best-effort throttle: lives in the Worker instance's memory, so it slows guessing but is not a hard lock. */
const failures = new Map();
const blocked = (ip) => {
  const f = failures.get(ip);
  return !!f && f.until > Date.now();
};
const noteFailure = (ip) => {
  const f = failures.get(ip) || { n: 0, until: 0 };
  f.n += 1;
  if (f.n >= LIMITS.loginFailures) {
    f.until = Date.now() + LIMITS.loginBlockMs;
    f.n = 0;
  }
  failures.set(ip, f);
};

/* ---------------- file sniffing: never trust the client's content type ---------------- */
export const sniff = (b) => {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { kind: 'image', ext: 'jpg' };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { kind: 'image', ext: 'png' };
  if (dec.decode(b.subarray(0, 4)) === 'RIFF' && dec.decode(b.subarray(8, 12)) === 'WEBP') return { kind: 'image', ext: 'webp' };
  if (dec.decode(b.subarray(4, 8)) === 'ftyp') return { kind: 'video', ext: 'mp4' };
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return { kind: 'video', ext: 'webm' };
  return null;
};

/* ---------------- GitHub contents API ---------------- */
const branchOf = (env) => env.GITHUB_BRANCH || 'main';
const ghFetch = (env, method, path, body) =>
  fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}${method === 'GET' ? `?ref=${encodeURIComponent(branchOf(env))}` : ''}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'caw-staff-api',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: body ? JSON.stringify({ ...body, branch: branchOf(env) }) : undefined,
    }
  );

const MANIFEST_PATH = 'media/manifest.json';

const getManifest = async (env) => {
  const res = await ghFetch(env, 'GET', MANIFEST_PATH);
  if (res.status === 404) return { data: { builds: [] }, sha: undefined };
  if (!res.ok) throw new Error(`GitHub ${res.status} reading manifest`);
  const j = await res.json();
  return { data: JSON.parse(dec.decode(fromBase64(j.content.replace(/\n/g, '')))), sha: j.sha };
};

/** Read-modify-write the manifest, retrying if someone else changed it in between. */
const mutateManifest = async (env, mutate, message) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, sha } = await getManifest(env);
    const next = mutate(structuredClone(data));
    next.updatedAt = new Date().toISOString();
    const res = await ghFetch(env, 'PUT', MANIFEST_PATH, {
      message,
      content: toBase64(enc.encode(JSON.stringify(next, null, 2))),
      sha,
    });
    if (res.ok) return next;
    if (res.status !== 409 && res.status !== 422) throw new Error(`GitHub ${res.status} writing manifest`);
  }
  throw new Error('Manifest is busy, try again');
};

const deleteRepoFile = async (env, path, message) => {
  const cur = await ghFetch(env, 'GET', path);
  if (cur.status === 404) return;
  if (!cur.ok) throw new Error(`GitHub ${cur.status} reading ${path}`);
  const { sha } = await cur.json();
  const res = await ghFetch(env, 'DELETE', path, { message, sha });
  if (!res.ok) throw new Error(`GitHub ${res.status} deleting ${path}`);
};

/* ---------------- HTTP plumbing ---------------- */
const corsFor = (request, env) => {
  const origin = request.headers.get('Origin');
  const allowed = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const h = {
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization,Content-Type',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
  if (origin && allowed.includes(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
};

const json = (data, status, cors) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors },
  });

const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

const rand = (n) => b64url(crypto.getRandomValues(new Uint8Array(n))).replace(/[-_]/g, 'x').toLowerCase().slice(0, n);

/* ---------------- main handler ---------------- */
export const handleRequest = async (request, env) => {
  const cors = corsFor(request, env);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  const url = new URL(request.url);
  const route = url.pathname.replace(/\/+$/, '');
  const ip = request.headers.get('CF-Connecting-IP') || 'local';

  if (!env.SESSION_SECRET || !env.STAFF_USERS) {
    return json({ error: 'The staff API is not configured yet.' }, 503, cors);
  }

  try {
    /* ----- login ----- */
    if (route === '/api/login' && request.method === 'POST') {
      if (blocked(ip)) return json({ error: 'Too many wrong attempts. Try again in 15 minutes.' }, 429, cors);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Send username and key.' }, 400, cors); }
      const username = clean(body.username, 40).toLowerCase();
      const users = JSON.parse(env.STAFF_USERS);
      const stored = Object.prototype.hasOwnProperty.call(users, username) ? users[username] : null;
      // Always do one comparison so a wrong username takes as long as a wrong password
      const ok = await verifyLogin(body.key, stored || 'no-such-user');
      if (!stored || !ok) {
        noteFailure(ip);
        return json({ error: 'Wrong username or password.' }, 401, cors);
      }
      failures.delete(ip);
      return json({ token: await signToken(env.SESSION_SECRET, username), user: username }, 200, cors);
    }

    /* ----- everything below needs a valid session ----- */
    const bearer = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const session = await readToken(env.SESSION_SECRET, bearer);
    if (!session) return json({ error: 'Please sign in again.' }, 401, cors);

    if (route === '/api/session' && request.method === 'GET') {
      return json({ user: session.u }, 200, cors);
    }

    // Login works without photo storage. Everything below needs it.
    if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
      return json({ error: 'Photo and video storage is not set up yet.' }, 503, cors);
    }

    if (route === '/api/manifest' && request.method === 'GET') {
      return json((await getManifest(env)).data, 200, cors);
    }

    /* ----- create or edit a completed build ----- */
    if (route === '/api/builds' && request.method === 'POST') {
      const b = await request.json();
      const title = clean(b.title, 80);
      if (title.length < 3) return json({ error: 'Give the build a title (3+ characters).' }, 400, cors);
      const platform = PLATFORMS.includes(b.platform) ? b.platform : 'other';
      const year = Number.isInteger(b.year) && b.year >= 1950 && b.year <= 2100 ? b.year : null;
      const story = clean(b.story, 600);
      const id = /^[a-z0-9-]{3,60}$/.test(b.id || '') ? b.id : `${slug(title) || 'build'}-${rand(4)}`;
      const manifest = await mutateManifest(
        env,
        (m) => {
          const existing = m.builds.find((x) => x.id === id);
          if (existing) Object.assign(existing, { title, platform, year, story });
          else m.builds.unshift({ id, title, platform, year, story, createdAt: new Date().toISOString(), media: [] });
          return m;
        },
        `Build record: ${title}`
      );
      return json({ id, manifest }, 200, cors);
    }

    /* ----- upload one photo or video (raw body) ----- */
    if (route === '/api/media' && request.method === 'PUT') {
      const buildId = url.searchParams.get('buildId') || '';
      if (!/^[a-z0-9-]{3,60}$/.test(buildId)) return json({ error: 'Pick a build first.' }, 400, cors);
      const declared = parseInt(request.headers.get('Content-Length') || '0', 10);
      if (declared > LIMITS.video + 1024) return json({ error: 'File too large.' }, 413, cors);
      const bytes = new Uint8Array(await request.arrayBuffer());
      const kind = sniff(bytes);
      if (!kind) return json({ error: 'Use a JPG, PNG, WebP photo or an MP4/WebM video.' }, 415, cors);
      if (bytes.length > LIMITS[kind.kind]) {
        return json({ error: `${kind.kind === 'video' ? 'Videos' : 'Photos'} must be under ${LIMITS[kind.kind] / 1048576} MB.` }, 413, cors);
      }
      const { data } = await getManifest(env);
      const build = data.builds.find((x) => x.id === buildId);
      if (!build) return json({ error: 'That build does not exist.' }, 404, cors);
      if (build.media.length >= LIMITS.maxMediaPerBuild) {
        return json({ error: `A build can hold ${LIMITS.maxMediaPerBuild} files. Remove some first.` }, 409, cors);
      }

      const path = `media/${buildId}/${Date.now().toString(36)}-${rand(5)}.${kind.ext}`;
      const put = await ghFetch(env, 'PUT', path, { message: `Add ${kind.kind} to ${buildId}`, content: toBase64(bytes) });
      if (!put.ok) return json({ error: `Could not save the file (GitHub ${put.status}).` }, 502, cors);

      const item = {
        path,
        type: kind.kind,
        caption: clean(url.searchParams.get('caption'), 120),
        addedAt: new Date().toISOString(),
        by: session.u,
      };
      try {
        const manifest = await mutateManifest(
          env,
          (m) => {
            const target = m.builds.find((x) => x.id === buildId);
            if (!target) throw new Error('Build was removed during upload');
            target.media.push(item);
            return m;
          },
          `Index ${path}`
        );
        return json({ media: item, manifest }, 200, cors);
      } catch (e) {
        await deleteRepoFile(env, path, `Undo failed upload ${path}`).catch(() => {});
        throw e;
      }
    }

    /* ----- remove one file ----- */
    if (route === '/api/media' && request.method === 'DELETE') {
      const { buildId, path } = await request.json();
      if (!/^media\/[a-z0-9-]{3,60}\/[a-z0-9.-]+$/.test(path || '') || !String(path).startsWith(`media/${buildId}/`)) {
        return json({ error: 'Bad file path.' }, 400, cors);
      }
      await deleteRepoFile(env, path, `Remove ${path}`);
      const manifest = await mutateManifest(
        env,
        (m) => {
          const target = m.builds.find((x) => x.id === buildId);
          if (target) target.media = target.media.filter((f) => f.path !== path);
          return m;
        },
        `Unindex ${path}`
      );
      return json({ manifest }, 200, cors);
    }

    /* ----- remove a whole build (only when it has few files, to stay inside Worker limits) ----- */
    if (route === '/api/builds' && request.method === 'DELETE') {
      const { id } = await request.json();
      const { data } = await getManifest(env);
      const build = data.builds.find((x) => x.id === id);
      if (!build) return json({ error: 'That build does not exist.' }, 404, cors);
      if (build.media.length > 15) return json({ error: 'Remove some photos first (15 or fewer), then delete the build.' }, 409, cors);
      for (const f of build.media) await deleteRepoFile(env, f.path, `Remove ${f.path}`);
      const manifest = await mutateManifest(env, (m) => ({ ...m, builds: m.builds.filter((x) => x.id !== id) }), `Remove build ${id}`);
      return json({ manifest }, 200, cors);
    }

    return json({ error: 'Not found.' }, 404, cors);
  } catch (e) {
    return json({ error: 'Something went wrong on our side. Try again.', detail: String(e.message || e) }, 500, cors);
  }
};
