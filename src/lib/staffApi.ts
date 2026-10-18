/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { STAFF_API_URL } from '../config';
import { MediaManifest } from './media';
import { deriveLoginKey } from '../../worker/loginKey.js';

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

export const login = async (username: string, password: string): Promise<string> => {
  // The slow password stretching happens here in the browser; the server only checks the result.
  const key = await deriveLoginKey(username, password);
  const r = await call<{ token: string; user: string }>('/api/login', jsonInit('POST', { username, key }));
  setToken(r.token);
  return r.user;
};

export const fetchStaffManifest = () => call<MediaManifest>('/api/manifest');

export const saveBuild = (b: { id?: string; title: string; platform: string; year: number | null; story: string }) =>
  call<{ id: string; manifest: MediaManifest }>('/api/builds', jsonInit('POST', b));

export const removeBuild = (id: string) => call<{ manifest: MediaManifest }>('/api/builds', jsonInit('DELETE', { id }));

export const removeMedia = (buildId: string, path: string) =>
  call<{ manifest: MediaManifest }>('/api/media', jsonInit('DELETE', { buildId, path }));

/** Uploads one file with progress. XHR is used because fetch cannot report upload progress. */
export const uploadMedia = (
  buildId: string,
  blob: Blob,
  caption: string,
  onProgress: (fraction: number) => void
): Promise<{ manifest: MediaManifest }> =>
  new Promise((resolve, reject) => {
    if (!STAFF_API_URL) return reject(new ApiError('Staff sign-in is not set up on this site yet.', 503));
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `${STAFF_API_URL}/api/media?buildId=${encodeURIComponent(buildId)}&caption=${encodeURIComponent(caption)}`);
    xhr.setRequestHeader('Authorization', `Bearer ${getToken() ?? ''}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onerror = () => reject(new ApiError('Upload failed. Check your connection and try again.', 0));
    xhr.onload = () => {
      let body: { error?: string; manifest?: MediaManifest } | null = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // non-JSON error page
      }
      if (xhr.status >= 200 && xhr.status < 300 && body?.manifest) resolve({ manifest: body.manifest });
      else {
        if (xhr.status === 401) setToken(null);
        reject(new ApiError(body?.error || `Upload failed (${xhr.status}).`, xhr.status));
      }
    };
    xhr.send(blob);
  });
