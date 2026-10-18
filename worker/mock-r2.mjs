// In-memory stand-in for an R2 bucket binding, used by the tests and the local demo.
export const makeBucket = () => {
  const store = new Map(); // key -> { bytes, etag, meta }
  const uploads = new Map(); // uploadId -> { key, meta, parts: Map }
  let n = 0;
  const wrap = (key, o, range) => {
    let bytes = o.bytes;
    let r;
    if (range) {
      const h = range instanceof Headers ? range.get('Range') : null;
      const m = h && /bytes=(\d*)-(\d*)/.exec(h);
      if (m) {
        const start = m[1] === '' ? Math.max(0, bytes.length - Number(m[2])) : Number(m[1]);
        const end = m[1] === '' || m[2] === '' ? bytes.length - 1 : Math.min(Number(m[2]), bytes.length - 1);
        r = { offset: start, length: end - start + 1 };
        bytes = bytes.slice(start, end + 1);
      }
    }
    return {
      key, size: o.bytes.length, etag: o.etag, httpEtag: `"${o.etag}"`, range: r,
      body: new Blob([bytes]).stream(),
      text: async () => new TextDecoder().decode(bytes),
      arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      writeHttpMetadata: (h) => { if (o.meta?.contentType) h.set('content-type', o.meta.contentType); },
    };
  };
  const toBytes = async (v) =>
    typeof v === 'string' ? new TextEncoder().encode(v) : v instanceof Uint8Array ? v : new Uint8Array(v instanceof ArrayBuffer ? v : await new Response(v).arrayBuffer());
  return {
    store,
    async get(key, opts = {}) {
      const o = store.get(key);
      return o ? wrap(key, o, opts.range) : null;
    },
    async put(key, value, opts = {}) {
      const cur = store.get(key);
      const c = opts.onlyIf;
      if (c?.etagMatches && (!cur || cur.etag !== c.etagMatches)) return null;
      if (c?.etagDoesNotMatch === '*' && cur) return null;
      const o = { bytes: await toBytes(value), etag: `e${++n}`, meta: opts.httpMetadata };
      store.set(key, o);
      return { key, etag: o.etag };
    },
    async delete(keys) {
      for (const k of Array.isArray(keys) ? keys : [keys]) store.delete(k);
    },
    async list({ prefix = '', limit = 1000 } = {}) {
      const objects = [...store.keys()].filter((k) => k.startsWith(prefix)).slice(0, limit).map((key) => ({ key }));
      return { objects, truncated: false };
    },
    async createMultipartUpload(key, opts = {}) {
      const uploadId = `u${++n}`;
      uploads.set(uploadId, { key, meta: opts.httpMetadata, parts: new Map() });
      return { key, uploadId };
    },
    resumeMultipartUpload(key, uploadId) {
      const u = uploads.get(uploadId);
      return {
        uploadId,
        async uploadPart(partNumber, data) {
          if (!u) throw new Error('no such upload');
          const bytes = await toBytes(data);
          const etag = `p${++n}`;
          u.parts.set(partNumber, { bytes, etag });
          return { partNumber, etag };
        },
        async complete(parts) {
          if (!u) throw new Error('no such upload');
          const chunks = parts.map((p) => {
            const got = u.parts.get(p.partNumber);
            if (!got || got.etag !== p.etag) throw new Error('bad part');
            return got.bytes;
          });
          const bytes = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
          let off = 0;
          for (const c of chunks) { bytes.set(c, off); off += c.length; }
          const o = { bytes, etag: `e${++n}`, meta: u.meta };
          store.set(key, o);
          uploads.delete(uploadId);
          return { key, size: bytes.length, etag: o.etag };
        },
        async abort() { uploads.delete(uploadId); },
      };
    },
  };
};
