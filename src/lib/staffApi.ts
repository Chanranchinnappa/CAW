/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { STAFF_API_URL } from '../config';
import { MediaManifest, MediaStatus } from './media';

const TOKEN_KEY = 'caw_staff_token';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const staffApiConfigured = () => !!STAFF_API_URL;

export const getToken = (): string | null => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
const setToken = (t: string | null) => {
  try {
    if (t) sessionStorage.setItem(TOKEN_KEY, t);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable: the session just won't survive a refresh
  }
};

export const signOut = () => setToken(null);

const fail = (status: number, body: { error?: string } | null): never => {
  if (status === 401 && getToken()) setToken(null);
  throw new ApiError(body?.error || `Request failed (${status}).`, status);
};

const call = async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
  if (!STAFF_API_URL) throw new ApiError('Staff sign-in is not set up on this site yet.', 503);
  let res: Response;
  try {
    res = await fetch(`${STAFF_API_URL}${path}`, {
      ...init,
      headers: { ...(init.headers || {}), ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    });
  } catch {
    throw new ApiError('Cannot reach the staff service. Check your connection and try again.', 0);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) fail(res.status, body);
  return body as T;
};

const jsonInit = (method: string, data: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

export const login = async (password: string): Promise<string> => {
  const r = await call<{ token: string; user: string }>('/api/login', jsonInit('POST', { password }));
  setToken(r.token);
  return r.user;
};

export const fetchStaffManifest = () => call<MediaManifest>('/api/manifest');

export const saveBuild = (b: { id?: string; title: string; platform: string; year: number | null; story: string; status?: MediaStatus }) =>
  call<{ id: string; manifest: MediaManifest }>('/api/builds', jsonInit('POST', b));

export const removeBuild = (id: string) => call<{ manifest: MediaManifest }>('/api/builds', jsonInit('DELETE', { id }));

export const removeMedia = (buildId: string, path: string) =>
  call<{ manifest: MediaManifest }>('/api/media', jsonInit('DELETE', { buildId, path }));

/** Show, hide or archive a file; change its caption; or make it the cover. */
export const updateMedia = (
  buildId: string,
  path: string,
  change: { status?: MediaStatus; caption?: string; cover?: boolean }
) => call<{ manifest: MediaManifest }>('/api/media/update', jsonInit('POST', { buildId, path, ...change }));

/** The live projects board is shared between devices. */
export const fetchPipeline = async (): Promise<unknown[] | null> => {
  if (!STAFF_API_URL) return null;
  try {
    const res = await fetch(`${STAFF_API_URL}/api/public/pipeline`);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data?.pipeline) ? data.pipeline : null;
  } catch {
    return null;
  }
};

export const savePipeline = (pipeline: unknown[]) => call<{ ok: boolean }>('/api/pipeline', jsonInit('PUT', { pipeline }));

const sendPiece = (
  method: string,
  path: string,
  body: Blob,
  onProgress: (loaded: number) => void
): Promise<Record<string, unknown>> =>
  new Promise((resolve, reject) => {
    if (!STAFF_API_URL) return reject(new ApiError('Staff sign-in is not set up on this site yet.', 503));
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${STAFF_API_URL}${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${getToken() ?? ''}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded);
    xhr.onerror = () => reject(new ApiError('Upload failed. Check your connection and try again.', 0));
    xhr.onload = () => {
      let data: Record<string, unknown> | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // non-JSON error page
      }
      if (xhr.status >= 200 && xhr.status < 300 && data) resolve(data);
      else {
        if (xhr.status === 401) setToken(null);
        reject(new ApiError((data?.error as string) || `Upload failed (${xhr.status}).`, xhr.status));
      }
    };
    xhr.send(body);
  });

const PIECE_RETRIES = 3;

/**
 * Uploads one photo or video with progress. Photos go in one request; videos are cut into pieces
 * (so big, high quality videos work) and each piece is retried if the connection blips.
 */
export const uploadMedia = async (
  buildId: string,
  blob: Blob,
  caption: string,
  onProgress: (fraction: number) => void
): Promise<{ manifest: MediaManifest }> => {
  if (blob.type.startsWith('image/')) {
    const r = await sendPiece(
      'PUT',
      `/api/media?buildId=${encodeURIComponent(buildId)}&caption=${encodeURIComponent(caption)}`,
      blob,
      (l) => onProgress(l / blob.size)
    );
    return { manifest: r.manifest as MediaManifest };
  }

  const start = await call<{ key: string; uploadId: string; partSize: number }>(
    '/api/media/start',
    jsonInit('POST', { buildId, contentType: blob.type, size: blob.size })
  );
  const parts: { partNumber: number; etag: string }[] = [];
  let done = 0;
  try {
    const count = Math.ceil(blob.size / start.partSize);
    for (let n = 1; n <= count; n++) {
      const piece = blob.slice((n - 1) * start.partSize, n * start.partSize);
      let lastError: unknown;
      for (let attempt = 0; attempt < PIECE_RETRIES; attempt++) {
        try {
          const r = await sendPiece(
            'PUT',
            `/api/media/part?key=${encodeURIComponent(start.key)}&uploadId=${encodeURIComponent(start.uploadId)}&n=${n}`,
            piece,
            (l) => onProgress((done + l) / blob.size)
          );
          parts.push({ partNumber: r.partNumber as number, etag: r.etag as string });
          lastError = undefined;
          break;
        } catch (e) {
          lastError = e;
          if (e instanceof ApiError && e.status !== 0 && e.status < 500) throw e;
        }
      }
      if (lastError) throw lastError;
      done += piece.size;
      onProgress(done / blob.size);
    }
    const r = await call<{ manifest: MediaManifest }>(
      '/api/media/complete',
      jsonInit('POST', { buildId, key: start.key, uploadId: start.uploadId, caption, parts })
    );
    return { manifest: r.manifest };
  } catch (e) {
    call('/api/media/abort', jsonInit('POST', { key: start.key, uploadId: start.uploadId })).catch(() => {});
    throw e;
  }
};
