/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { STAFF_API_URL } from '../config';

export type MediaStatus = 'shown' | 'hidden' | 'archived';

export interface MediaItem {
  path: string;
  type: 'image' | 'video';
  caption?: string;
  /** shown on the website, hidden from it, or archived. Missing means shown. */
  status?: MediaStatus;
  addedAt: string;
  by?: string;
}

export interface MediaBuild {
  id: string;
  title: string;
  platform: string;
  year: number | null;
  story: string;
  status?: MediaStatus;
  createdAt: string;
  media: MediaItem[];
}

export interface MediaManifest {
  updatedAt?: string;
  builds: MediaBuild[];
}

/** Address of a stored file. Staff previews pass their session token so hidden files can still be seen. */
export const mediaUrl = (path: string, staffToken?: string | null) =>
  `${STAFF_API_URL}/${path}${staffToken ? `?t=${encodeURIComponent(staffToken)}` : ''}`;

/** Reads the public list (shown builds and files only). Returns null when storage is not set up or not reachable. */
export const fetchManifest = async (): Promise<MediaManifest | null> => {
  if (!STAFF_API_URL) return null;
  try {
    const res = await fetch(`${STAFF_API_URL}/api/public/manifest`);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data?.builds) ? (data as MediaManifest) : null;
  } catch {
    return null;
  }
};

export const useMediaManifest = (): MediaManifest | null => {
  const [manifest, setManifest] = useState<MediaManifest | null>(null);
  useEffect(() => {
    let live = true;
    fetchManifest().then((m) => live && setManifest(m));
    return () => {
      live = false;
    };
  }, []);
  return manifest;
};

/**
 * Shrinks a phone photo to a web-sized WebP (about 150-300 KB) before upload.
 * Videos and anything that cannot be decoded are returned unchanged.
 */
export const prepareFile = async (file: File): Promise<Blob> => {
  if (!file.type.startsWith('image/')) return file;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.82));
    if (blob && blob.type === 'image/webp' && (blob.size < file.size || file.size > 5 * 1024 * 1024)) return blob;
    return file;
  } catch {
    return file;
  }
};
