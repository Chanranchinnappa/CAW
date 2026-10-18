// Shared by the website (browser) and the Worker. Uses only Web Crypto.
// The slow, expensive part of checking a password runs in the browser, so the Worker
// (which has a tiny CPU allowance on the free plan) only has to do one cheap SHA-256.

const enc = new TextEncoder();
export const LOGIN_ITERATIONS = 600000;

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

/** Turns username + password into a long login key. The server never sees the password itself. */
export const deriveLoginKey = async (username, password, iterations = LOGIN_ITERATIONS) => {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(`caw-staff-v1:${String(username).trim().toLowerCase()}`), iterations },
    key,
    256
  );
  return toHex(bits);
};

/** What the Worker stores per user: a SHA-256 of the login key. */
export const storedVerifier = async (loginKey) => toHex(await crypto.subtle.digest('SHA-256', enc.encode(loginKey)));
