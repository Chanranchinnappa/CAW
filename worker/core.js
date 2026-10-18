/**
 * CAW staff API: one shared staff password; photos and videos kept in a Cloudflare R2 bucket
 * (binding MEDIA); the live projects board shared between devices. Runs on a Cloudflare Worker.
 *
 * Secrets:  STAFF_PASSWORD (the one staff password), SESSION_SECRET
 * Bindings: MEDIA (R2 bucket, needed for photos, videos and the shared live projects board)
 * Vars:     ALLOWED_ORIGINS (comma separated)
 */

const enc = new TextEncoder();
const dec = new TextDecoder();

export const LIMITS = {
  image: 10 * 1024 * 1024, // the site shrinks photos to a few hundred KB before upload
  video: 1024 * 1024 * 1024, // 1 GB per video, sent in 8 MB pieces
  partSize: 8 * 1024 * 1024,
  pipelineBytes: 200 * 1024,
  sessionMs: 12 * 60 * 60 * 1000,
  maxMediaPerBuild: 60,
  loginFailures: 5,
  loginBlockMs: 15 * 60 * 1000,
};

export const STATUSES = ['shown', 'hidden', 'archived'];

export const PLATFORMS = ['mm540', 'commander', 'major-mdi', 'bolero', 'safari', 'gypsy', 'thar', 'gurkha', 'innova', 'qualis', 'sumo', 'other'];

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
const sha256 = async (text) => new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(String(text ?? ''))));
/** Compares digests, so the check takes the same time wherever a wrong guess differs. */
const verifyPassword = async (given, expected) => safeEqual(await sha256(given), await sha256(expected));

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
  if (dec.decode(b.subarray(4, 8)) === 'ftyp') return { kind: 'video', ext: dec.decode(b.subarray(8, 12)) === 'qt  ' ? 'mov' : 'mp4' };
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return { kind: 'video', ext: 'webm' };
  return null;
};

/* ---------------- R2 storage ---------------- */
const MANIFEST_KEY = 'manifest.json';
const PIPELINE_KEY = 'pipeline.json';
const KEY_RE = /^media\/[a-z0-9-]{3,60}\/[a-z0-9]+-[a-z0-9]{5}\.(jpg|png|webp|mp4|webm|mov)$/;
const EXT_BY_TYPE = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
};
const kindOfExt = (ext) => (['mp4', 'webm', 'mov'].includes(ext) ? 'video' : 'image');
const shownStatus = (x) => !x.status || x.status === 'shown';

const getManifest = async (env) => {
  const obj = await env.MEDIA.get(MANIFEST_KEY);
  if (!obj) return { data: { builds: [] }, etag: null };
  return { data: JSON.parse(await obj.text()), etag: obj.etag };
};

let publicCache = { at: 0, data: null };

/** Read-modify-write the manifest. The write only lands if nobody else changed it in between; otherwise retry. */
const mutateManifest = async (env, mutate) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, etag } = await getManifest(env);
    const next = mutate(structuredClone(data));
    next.updatedAt = new Date().toISOString();
    const put = await env.MEDIA.put(MANIFEST_KEY, JSON.stringify(next), {
      httpMetadata: { contentType: 'application/json' },
      onlyIf: etag ? { etagMatches: etag } : { etagDoesNotMatch: '*' },
    });
    if (put) {
      publicCache = { at: 0, data: null };
      return next;
    }
  }
  throw new Error('The list is busy, try again');
};

/** What visitors may see: shown builds, shown files only. */
export const publicView = (m) => ({
  updatedAt: m.updatedAt,
  builds: (m.builds || [])
    .filter(shownStatus)
    .map((b) => ({
      id: b.id, title: b.title, platform: b.platform, year: b.year, story: b.story, createdAt: b.createdAt,
      media: (b.media || []).filter(shownStatus).map((f) => ({ path: f.path, type: f.type, caption: f.caption, addedAt: f.addedAt })),
    }))
    .filter((b) => b.media.length > 0),
});

const publicManifest = async (env) => {
  if (publicCache.data && Date.now() - publicCache.at < 15000) return publicCache.data;
  const data = publicView((await getManifest(env)).data);
  publicCache = { at: Date.now(), data };
  return data;
};

const isPubliclyShown = (pm, key) => pm.builds.some((b) => b.media.some((f) => f.path === key));

const serveMedia = async (request, env, key, headers, isStaff) => {
  const obj = await env.MEDIA.get(key, { range: request.headers });
  if (!obj) return new Response('Not found', { status: 404, headers });
  const h = new Headers(headers);
  obj.writeHttpMetadata(h);
  h.set('etag', obj.httpEtag);
  h.set('Accept-Ranges', 'bytes');
  h.set('Cache-Control', isStaff ? 'private, no-store' : 'public, max-age=600');
  h.set('Access-Control-Allow-Origin', '*');
  h.set('Cross-Origin-Resource-Policy', 'cross-origin');
  let status = 200;
  if (obj.range && request.headers.has('Range')) {
    const offset = obj.range.offset ?? 0;
    const length = obj.range.length ?? obj.size - offset;
    h.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${obj.size}`);
    h.set('Content-Length', String(length));
    status = 206;
  } else {
    h.set('Content-Length', String(obj.size));
  }
  return new Response(request.method === 'HEAD' ? null : obj.body, { status, headers: h });
};

const deletePrefix = async (env, prefix) => {
  let cursor;
  do {
    const list = await env.MEDIA.list({ prefix, cursor, limit: 500 });
    const keys = list.objects.map((o) => o.key);
    if (keys.length) await env.MEDIA.delete(keys);
    cursor = list.truncated ? list.cursor : undefined;
  } while (cursor);
};

const normalizeStatus = (s, fallback = 'shown') => (STATUSES.includes(s) ? s : fallback);

/** Adds an uploaded file to a build, or removes the file again if that fails. */
const indexUpload = async (env, buildId, item) => {
  try {
    return await mutateManifest(env, (m) => {
      const target = m.builds.find((x) => x.id === buildId);
      if (!target) throw new Error('Build was removed during upload');
      if (target.media.length >= LIMITS.maxMediaPerBuild) throw new Error('Too many files in this build');
      target.media.push(item);
      return m;
    });
  } catch (e) {
    await env.MEDIA.delete(item.path).catch(() => {});
    throw e;
  }
};

const newItem = (key, kind, caption, by) => ({
  path: key, type: kind, caption: clean(caption, 120), status: 'shown', addedAt: new Date().toISOString(), by,
});

const bodyJson = async (request) => {
  try {
    return (await request.json()) || {};
  } catch {
    return {};
  }
};

/* ---------------- HTTP plumbing ---------------- */
const corsFor = (request, env) => {
  const origin = request.headers.get('Origin');
  const allowed = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const h = {
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,DELETE,OPTIONS',
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

  if (!env.SESSION_SECRET || !env.STAFF_PASSWORD) {
    return json({ error: 'The staff API is not configured yet.' }, 503, cors);
  }

  try {
    /* ----- login ----- */
    if (route === '/api/login' && request.method === 'POST') {
      if (blocked(ip)) return json({ error: 'Too many wrong attempts. Try again in 15 minutes.' }, 429, cors);
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Send the password.' }, 400, cors); }
      const given = typeof body.password === 'string' ? body.password.slice(0, 200) : '';
      if (!given || !(await verifyPassword(given, env.STAFF_PASSWORD))) {
        noteFailure(ip);
        return json({ error: 'Wrong password.' }, 401, cors);
      }
      failures.delete(ip);
      return json({ token: await signToken(env.SESSION_SECRET, 'staff'), user: 'staff' }, 200, cors);
    }

    /* ----- public: what visitors see ----- */
    if (route === '/api/public/manifest' && request.method === 'GET') {
      const data = env.MEDIA ? await publicManifest(env) : { builds: [] };
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30', ...cors },
      });
    }
    if (route === '/api/public/pipeline' && request.method === 'GET') {
      let pipeline = null;
      if (env.MEDIA) {
        const obj = await env.MEDIA.get(PIPELINE_KEY);
        if (obj) pipeline = JSON.parse(await obj.text()).pipeline ?? null;
      }
      return new Response(JSON.stringify({ pipeline }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=15', ...cors },
      });
    }

    const bearer = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const queryToken = url.searchParams.get('t') || '';

    if ((request.method === 'GET' || request.method === 'HEAD') && route.startsWith('/media/')) {
      const key = route.slice(1);
      if (!env.MEDIA || !KEY_RE.test(key)) return new Response('Not found', { status: 404, headers: cors });
      const staff = queryToken ? await readToken(env.SESSION_SECRET, queryToken) : null;
      if (!staff && !isPubliclyShown(await publicManifest(env), key)) {
        return new Response('Not found', { status: 404, headers: cors });
      }
      return serveMedia(request, env, key, {}, !!staff);
    }

    /* ----- everything below needs a valid session ----- */
    const session = await readToken(env.SESSION_SECRET, bearer);
    if (!session) return json({ error: 'Please sign in again.' }, 401, cors);

    if (route === '/api/session' && request.method === 'GET') {
      return json({ user: session.u }, 200, cors);
    }

    // Login works without storage. Everything below needs the R2 bucket.
    if (!env.MEDIA) {
      return json({ error: 'Photo and video storage is not set up yet.' }, 503, cors);
    }

    /* ----- live projects board shared between devices ----- */
    if (route === '/api/pipeline' && request.method === 'PUT') {
      const text = await request.text();
      if (text.length > LIMITS.pipelineBytes) return json({ error: 'The board is too large.' }, 413, cors);
      let data;
      try { data = JSON.parse(text); } catch { return json({ error: 'Bad data.' }, 400, cors); }
      if (!Array.isArray(data.pipeline) || data.pipeline.length > 50) return json({ error: 'Bad data.' }, 400, cors);
      await env.MEDIA.put(PIPELINE_KEY, JSON.stringify({ pipeline: data.pipeline, updatedAt: new Date().toISOString() }), {
        httpMetadata: { contentType: 'application/json' },
      });
      return json({ ok: true }, 200, cors);
    }

    if (route === '/api/manifest' && request.method === 'GET') {
      return json((await getManifest(env)).data, 200, cors);
    }

    /* ----- create or edit a finished build ----- */
    if (route === '/api/builds' && request.method === 'POST') {
      const b = await bodyJson(request);
      const title = clean(b.title, 80);
      if (title.length < 3) return json({ error: 'Give the build a title (3+ characters).' }, 400, cors);
      const platform = PLATFORMS.includes(b.platform) ? b.platform : 'other';
      const year = Number.isInteger(b.year) && b.year >= 1950 && b.year <= 2100 ? b.year : null;
      const story = clean(b.story, 600);
      const id = /^[a-z0-9-]{3,60}$/.test(b.id || '') ? b.id : `${slug(title) || 'build'}-${rand(4)}`;
      const manifest = await mutateManifest(env, (m) => {
        const existing = m.builds.find((x) => x.id === id);
        if (existing) {
          Object.assign(existing, { title, platform, year, story });
          if (b.status !== undefined) existing.status = normalizeStatus(b.status, existing.status || 'shown');
        } else {
          m.builds.unshift({ id, title, platform, year, story, status: normalizeStatus(b.status), createdAt: new Date().toISOString(), media: [] });
        }
        return m;
      });
      return json({ id, manifest }, 200, cors);
    }

    /* ----- upload one photo (raw body) ----- */
    if (route === '/api/media' && request.method === 'PUT') {
      const buildId = url.searchParams.get('buildId') || '';
      if (!/^[a-z0-9-]{3,60}$/.test(buildId)) return json({ error: 'Pick a build first.' }, 400, cors);
      const declared = parseInt(request.headers.get('Content-Length') || '0', 10);
      if (declared > LIMITS.image + 1024) return json({ error: `Photos must be under ${LIMITS.image / 1048576} MB.` }, 413, cors);
      const bytes = new Uint8Array(await request.arrayBuffer());
      const kind = sniff(bytes);
      if (!kind || kind.kind !== 'image') return json({ error: 'Use a JPG, PNG or WebP photo here. Videos are sent in pieces.' }, 415, cors);
      if (bytes.length > LIMITS.image) return json({ error: `Photos must be under ${LIMITS.image / 1048576} MB.` }, 413, cors);
      const { data } = await getManifest(env);
      const build = data.builds.find((x) => x.id === buildId);
      if (!build) return json({ error: 'That build does not exist.' }, 404, cors);
      if (build.media.length >= LIMITS.maxMediaPerBuild) {
        return json({ error: `A build can hold ${LIMITS.maxMediaPerBuild} files. Remove some first.` }, 409, cors);
      }
      const key = `media/${buildId}/${Date.now().toString(36)}-${rand(5)}.${kind.ext}`;
      await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: `image/${kind.ext === 'jpg' ? 'jpeg' : kind.ext}` } });
      const item = newItem(key, 'image', url.searchParams.get('caption'), session.u);
      const manifest = await indexUpload(env, buildId, item);
      return json({ media: item, manifest }, 200, cors);
    }

    /* ----- upload a video in pieces ----- */
    if (route === '/api/media/start' && request.method === 'POST') {
      const b = await bodyJson(request);
      const ext = EXT_BY_TYPE[b.contentType];
      if (!/^[a-z0-9-]{3,60}$/.test(b.buildId || '')) return json({ error: 'Pick a build first.' }, 400, cors);
      if (!ext) return json({ error: 'Use a JPG, PNG, WebP photo or an MP4, MOV or WebM video.' }, 415, cors);
      const kind = kindOfExt(ext);
      if (!Number.isFinite(b.size) || b.size <= 0 || b.size > LIMITS[kind]) {
        return json({ error: `${kind === 'video' ? 'Videos' : 'Photos'} must be under ${Math.round(LIMITS[kind] / 1048576)} MB.` }, 413, cors);
      }
      const { data } = await getManifest(env);
      const build = data.builds.find((x) => x.id === b.buildId);
      if (!build) return json({ error: 'That build does not exist.' }, 404, cors);
      if (build.media.length >= LIMITS.maxMediaPerBuild) {
        return json({ error: `A build can hold ${LIMITS.maxMediaPerBuild} files. Remove some first.` }, 409, cors);
      }
      const key = `media/${b.buildId}/${Date.now().toString(36)}-${rand(5)}.${ext}`;
      const mp = await env.MEDIA.createMultipartUpload(key, { httpMetadata: { contentType: b.contentType } });
      return json({ key, uploadId: mp.uploadId, partSize: LIMITS.partSize }, 200, cors);
    }

    if (route === '/api/media/part' && request.method === 'PUT') {
      const key = url.searchParams.get('key') || '';
      const uploadId = url.searchParams.get('uploadId') || '';
      const n = parseInt(url.searchParams.get('n') || '0', 10);
      if (!KEY_RE.test(key) || !uploadId || !(n >= 1 && n <= 10000)) return json({ error: 'Bad upload piece.' }, 400, cors);
      const declared = parseInt(request.headers.get('Content-Length') || '0', 10);
      if (declared > LIMITS.partSize + 1024) return json({ error: 'Piece too large.' }, 413, cors);
      const bytes = new Uint8Array(await request.arrayBuffer());
      if (bytes.length > LIMITS.partSize) return json({ error: 'Piece too large.' }, 413, cors);
      const mp = env.MEDIA.resumeMultipartUpload(key, uploadId);
      if (n === 1) {
        const kind = sniff(bytes);
        if (!kind || kind.kind !== kindOfExt(key.split('.').pop())) {
          await mp.abort().catch(() => {});
          return json({ error: 'That file is not a photo or video this site can use.' }, 415, cors);
        }
      }
      const part = await mp.uploadPart(n, bytes);
      return json({ partNumber: part.partNumber, etag: part.etag }, 200, cors);
    }

    if (route === '/api/media/complete' && request.method === 'POST') {
      const b = await bodyJson(request);
      const { key, uploadId, buildId } = b;
      if (!KEY_RE.test(key || '') || !uploadId || !String(key).startsWith(`media/${buildId}/`) || !Array.isArray(b.parts) || !b.parts.length) {
        return json({ error: 'Bad upload.' }, 400, cors);
      }
      const parts = b.parts.map((p) => ({ partNumber: p.partNumber, etag: p.etag }));
      const mp = env.MEDIA.resumeMultipartUpload(key, uploadId);
      const obj = await mp.complete(parts);
      const ext = key.split('.').pop();
      if (obj.size > LIMITS[kindOfExt(ext)]) {
        await env.MEDIA.delete(key);
        return json({ error: 'That file is too large.' }, 413, cors);
      }
      const item = newItem(key, kindOfExt(ext), b.caption, session.u);
      const manifest = await indexUpload(env, buildId, item);
      return json({ media: item, manifest }, 200, cors);
    }

    if (route === '/api/media/abort' && request.method === 'POST') {
      const b = await bodyJson(request);
      if (KEY_RE.test(b.key || '') && b.uploadId) await env.MEDIA.resumeMultipartUpload(b.key, b.uploadId).abort().catch(() => {});
      return json({ ok: true }, 200, cors);
    }

    /* ----- show, hide, archive, caption, cover ----- */
    if (route === '/api/media/update' && request.method === 'POST') {
      const b = await bodyJson(request);
      if (!KEY_RE.test(b.path || '') || !String(b.path).startsWith(`media/${b.buildId}/`)) return json({ error: 'Bad file path.' }, 400, cors);
      const manifest = await mutateManifest(env, (m) => {
        const target = m.builds.find((x) => x.id === b.buildId);
        const f = target && target.media.find((x) => x.path === b.path);
        if (!f) throw new Error('File not found');
        if (b.status !== undefined) f.status = normalizeStatus(b.status, f.status || 'shown');
        if (b.caption !== undefined) f.caption = clean(b.caption, 120);
        if (b.cover === true) target.media = [f, ...target.media.filter((x) => x !== f)];
        return m;
      });
      return json({ manifest }, 200, cors);
    }

    /* ----- delete one file for good ----- */
    if (route === '/api/media' && request.method === 'DELETE') {
      const { buildId, path } = await bodyJson(request);
      if (!KEY_RE.test(path || '') || !String(path).startsWith(`media/${buildId}/`)) return json({ error: 'Bad file path.' }, 400, cors);
      await env.MEDIA.delete(path);
      const manifest = await mutateManifest(env, (m) => {
        const target = m.builds.find((x) => x.id === buildId);
        if (target) target.media = target.media.filter((f) => f.path !== path);
        return m;
      });
      return json({ manifest }, 200, cors);
    }

    /* ----- delete a whole build and all its files ----- */
    if (route === '/api/builds' && request.method === 'DELETE') {
      const { id } = await bodyJson(request);
      if (!/^[a-z0-9-]{3,60}$/.test(id || '')) return json({ error: 'Bad build.' }, 400, cors);
      const { data } = await getManifest(env);
      if (!data.builds.find((x) => x.id === id)) return json({ error: 'That build does not exist.' }, 404, cors);
      await deletePrefix(env, `media/${id}/`);
      const manifest = await mutateManifest(env, (m) => ({ ...m, builds: m.builds.filter((x) => x.id !== id) }));
      return json({ manifest }, 200, cors);
    }

    return json({ error: 'Not found.' }, 404, cors);
  } catch (e) {
    return json({ error: 'Something went wrong on our side. Try again.', detail: String(e.message || e) }, 500, cors);
  }
};
