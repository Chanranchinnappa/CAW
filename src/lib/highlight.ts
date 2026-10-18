/** Search results ask the page to scroll to a spot and flash it. Sections listen and handle their own part. */
export interface HighlightDetail {
  section: string;
  /** Which item inside the section: a service number or a build id. */
  key?: string;
  /** Set by a section that scrolled and flashed for itself. */
  handled?: boolean;
}

export const HIGHLIGHT_EVENT = 'caw-highlight';
/** How long the page takes to scroll there before the flash should start. */
export const FLASH_DELAY_MS = 1100;
/** Matches the length of the flash animation in index.css. */
export const FLASH_MS = 2600;

export function scrollToY(y: number, duration = 1.1) {
  const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o: { duration: number }) => void } }).__lenis;
  if (lenis) lenis.scrollTo(Math.max(0, y), { duration });
  else window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}

export function scrollToEl(el: HTMLElement, offset = 96, duration = 1.1) {
  scrollToY(el.getBoundingClientRect().top + window.scrollY - offset, duration);
}

export function requestHighlight(detail: HighlightDetail): HighlightDetail {
  window.dispatchEvent(new CustomEvent<HighlightDetail>(HIGHLIGHT_EVENT, { detail }));
  return detail;
}

/** Flash any element for a moment, after the scroll has landed. */
export function flashElement(el: HTMLElement, delayMs = FLASH_DELAY_MS) {
  el.style.setProperty('--flash-delay', `${delayMs}ms`);
  el.classList.remove('caw-flash');
  void el.offsetWidth;
  el.classList.add('caw-flash');
  window.setTimeout(() => el.classList.remove('caw-flash'), delayMs + FLASH_MS + 200);
}
