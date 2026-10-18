/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const trim = (s: string | undefined) => (s || '').replace(/\/+$/, '');

/** Staff login and upload API (a Cloudflare Worker). Empty until you deploy it. */
export const STAFF_API_URL = trim(import.meta.env.VITE_STAFF_API_URL);
