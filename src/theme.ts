/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';

export type SiteTheme = 'dark' | 'light';
const KEY = 'caw_theme';

const readTheme = (): SiteTheme =>
  typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light'
    ? 'light'
    : 'dark';

/** Site-wide theme. The attribute on <html> is the source of truth (set before paint in index.html). */
export const useSiteTheme = (): [SiteTheme, (t: SiteTheme) => void] => {
  const [theme, setThemeState] = useState<SiteTheme>(readTheme);

  useEffect(() => {
    const sync = () => setThemeState(readTheme());
    window.addEventListener('caw-theme', sync);
    return () => window.removeEventListener('caw-theme', sync);
  }, []);

  const setTheme = useCallback((t: SiteTheme) => {
    document.documentElement.setAttribute('data-theme', t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      // storage unavailable
    }
    window.dispatchEvent(new Event('caw-theme'));
  }, []);

  return [theme, setTheme];
};
