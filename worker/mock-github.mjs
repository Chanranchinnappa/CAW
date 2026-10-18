// In-memory stand-in for the GitHub contents API, used by the tests and the local demo.
export const makeGithub = () => {
  const files = new Map(); // path -> {content(base64), sha}
  let n = 0;
  const fetchImpl = async (input, init = {}) => {
    const u = new URL(typeof input === 'string' ? input : input.url);
    if (u.hostname !== 'api.github.com') throw new Error('unexpected host ' + u.hostname);
    const path = decodeURIComponent(u.pathname.replace(/^\/repos\/[^/]+\/[^/]+\/contents\//, ''));
    const method = init.method || 'GET';
    const body = init.body ? JSON.parse(init.body) : {};
    const R = (s, o) => new Response(JSON.stringify(o ?? {}), { status: s });
    if (method === 'GET') {
      const f = files.get(path);
      return f ? R(200, { content: f.content, sha: f.sha }) : R(404, { message: 'Not Found' });
    }
    if (method === 'PUT') {
      const f = files.get(path);
      if (f && body.sha !== f.sha) return R(409, { message: 'sha mismatch' });
      if (!f && body.sha) return R(422, { message: 'sha given for new file' });
      files.set(path, { content: body.content, sha: 'sha' + ++n });
      return R(200, { content: { path } });
    }
    if (method === 'DELETE') {
      const f = files.get(path);
      if (!f || f.sha !== body.sha) return R(409, {});
      files.delete(path);
      return R(200, {});
    }
    return R(405);
  };
  return { files, fetchImpl };
};
