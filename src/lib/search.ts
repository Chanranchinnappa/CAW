import { SERVICES } from '../components/ServicesSection';
import { SHOWCASE_BUILDS, WORKSHOP_INFO } from '../data/cawData';

export interface SearchItem {
  id: string;
  title: string;
  kind: 'Service' | 'Build' | 'Vehicle' | 'Brand' | 'Visit';
  detail: string;
  /** Section on the page to jump to. */
  target: string;
  /** The item inside the section to flash: a service number or a build id. */
  key?: string;
  /** Extra words people might type. */
  words: string;
}

const BRANDS = ['Mahindra', 'Maruti Suzuki', 'Tata', 'Toyota', 'Hyundai', 'Honda', 'Force', 'Willys', 'Ashok Leyland', 'Kirloskar', 'Skoda', 'Volkswagen', 'Mercedes Benz'];

const VEHICLES: { title: string; words: string }[] = [
  { title: 'Jeeps', words: 'jeep mm540 mm550 commander major cj willys 4x4' },
  { title: 'Gypsys', words: 'gypsy maruti suzuki gypsy 4x4' },
  { title: 'Utility pickups', words: 'pickup pick up bolero camper truck utility' },
  { title: 'Cars', words: 'car hatchback sedan maruti 800 alto zen wagon r omni' },
];

export const SEARCH_ITEMS: SearchItem[] = [
  ...SERVICES.map((s, i) => ({
    id: `svc-${i}`,
    title: s.title,
    kind: 'Service' as const,
    detail: s.tagline,
    target: 'services',
    key: String(i),
    words: `${s.description} ${s.option}`,
  })),
  ...SHOWCASE_BUILDS.map((b) => ({
    id: `bld-${b.id}`,
    title: b.title,
    kind: 'Build' as const,
    detail: `${b.category}, ${b.clientRegion}, ${b.year}`,
    target: 'showcase',
    key: b.id,
    words: `${b.engine} ${b.platform} ${b.story}`,
  })),
  ...VEHICLES.map((v, i) => ({
    id: `veh-${i}`,
    title: `We work on ${v.title.toLowerCase()}`,
    kind: 'Vehicle' as const,
    detail: 'See the services we offer',
    target: 'services',
    words: v.words,
  })),
  ...BRANDS.map((b) => ({
    id: `brand-${b}`,
    title: b,
    kind: 'Brand' as const,
    detail: 'Makes we work on',
    target: 'brands',
    words: `${b} vehicle make`,
  })),
  {
    id: 'visit-contact',
    title: 'Phone, WhatsApp and directions',
    kind: 'Visit',
    detail: `${WORKSHOP_INFO.contact.phoneFormatted}, ${WORKSHOP_INFO.contact.hours}`,
    target: 'workshop-facility',
    words: 'contact call phone number numbers mobile telephone tel whatsapp email address location map directions route hours open opening timing timings time visit where find ponnampet matturu kodagu coorg',
  },
];

const STOP = new Set(['the', 'a', 'an', 'of', 'for', 'and', 'in', 'on', 'to', 'my', 'your', 'do', 'you', 'we', 'can', 'is', 'are', 'how', 'what', 'near', 'me', 'i', 'need', 'want', 'with']);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** One edit apart (insert, delete or swap), enough to forgive a typo. */
function near(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1) || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
  const [s, l] = a.length < b.length ? [a, b] : [b, a];
  return s.slice(i) === l.slice(i + 1);
}

const INDEX = SEARCH_ITEMS.map((it) => ({
  it,
  title: norm(it.title),
  words: norm(`${it.words} ${it.detail}`),
  wordList: norm(`${it.title} ${it.words}`).split(' '),
}));

export function search(query: string, limit = 8): SearchItem[] {
  const q = norm(query);
  if (!q) return [];
  const tokens = q.split(' ').filter((t) => !STOP.has(t));
  if (!tokens.length) return [];
  const scored: { it: SearchItem; score: number }[] = [];
  for (const row of INDEX) {
    let score = 0;
    let ok = true;
    for (const t of tokens) {
      let s = 0;
      if (row.title.startsWith(t) || row.title.includes(` ${t}`)) s = 6;
      else if (row.title.includes(t)) s = 4;
      else if (row.words.includes(t)) s = 2;
      else if (t.length >= 4 && row.wordList.some((w) => w.length >= 4 && near(t, w))) s = 1;
      if (!s) {
        ok = false;
        break;
      }
      score += s;
    }
    if (ok) scored.push({ it: row.it, score });
  }
  // Ties go to services, vehicles and contact details ahead of sample builds.
  const rank = (k: SearchItem['kind']) => (k === 'Build' ? 1 : 0);
  return scored.sort((a, b) => b.score - a.score || rank(a.it.kind) - rank(b.it.kind)).slice(0, limit).map((x) => x.it);
}
