import { useCallback, useEffect, useRef, useState } from 'react';

export type DictationLang = 'en-IN' | 'hi-IN' | 'kn-IN' | 'ml-IN';

export const DICTATION_LANGS: { code: DictationLang; label: string; name: string }[] = [
  { code: 'en-IN', label: 'English', name: 'English' },
  { code: 'hi-IN', label: 'हिन्दी', name: 'Hindi' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ', name: 'Kannada' },
  { code: 'ml-IN', label: 'മലയാളം', name: 'Malayalam' },
];

const LANG_KEY = 'caw_dictation_lang';

const norm = (s: string) => s.trim().replace(/\s+/g, ' ');

/**
 * The speech engine reports every result so far, again and again, as it refines its guess.
 * Some phones also repeat a phrase as a new result. Turn the list into one clean string.
 */
export function joinResults(texts: string[]): string {
  const out: string[] = [];
  for (const raw of texts) {
    const t = norm(raw);
    if (!t) continue;
    const last = out[out.length - 1];
    if (last === undefined) out.push(t);
    else if (t === last || last.startsWith(t)) continue; // same phrase again, or an older shorter guess
    else if (t.startsWith(last)) out[out.length - 1] = t; // a longer version of the last phrase
    else out.push(t);
  }
  return out.join(' ');
}

function friendly(error: string, langName: string): string {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone is blocked. Allow the microphone for this site in the browser, then try again.';
    case 'audio-capture':
      return 'No microphone found on this device.';
    case 'network':
      return 'Voice typing needs an internet connection.';
    case 'language-not-supported':
      return `This browser cannot do ${langName} voice typing. Try Chrome.`;
    default:
      return 'Voice typing stopped. Tap the microphone to start again.';
  }
}

interface Options {
  /** Current text, so new speech is added after it. */
  value: string;
  onChange: (text: string) => void;
}

export function useDictation({ value, onChange }: Options) {
  const Ctor: any = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : undefined;
  const supported = !!Ctor;

  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLangState] = useState<DictationLang>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY) as DictationLang | null;
      if (saved && DICTATION_LANGS.some((l) => l.code === saved)) return saved;
    } catch {
      // ignore
    }
    return 'en-IN';
  });

  const recRef = useRef<any>(null);
  const wantRef = useRef(false);
  const baseRef = useRef('');
  const sessionRef = useRef('');
  const langRef = useRef(lang);
  const valueRef = useRef(value);
  const changeRef = useRef(onChange);
  valueRef.current = value;
  changeRef.current = onChange;
  langRef.current = lang;

  const compose = () => {
    const base = baseRef.current.trimEnd();
    const s = sessionRef.current;
    return s ? (base ? `${base} ${s}` : s) : baseRef.current;
  };

  const begin = useCallback(() => {
    if (!Ctor || !wantRef.current) return;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = langRef.current;
    sessionRef.current = '';

    rec.onresult = (event: any) => {
      const texts: string[] = [];
      for (let i = 0; i < event.results.length; i++) texts.push(event.results[i][0].transcript);
      sessionRef.current = joinResults(texts);
      changeRef.current(compose());
    };

    rec.onerror = (e: any) => {
      const code = String(e?.error || '');
      if (code === 'no-speech' || code === 'aborted') return; // quiet moment, or we restarted it ourselves
      wantRef.current = false;
      const name = DICTATION_LANGS.find((l) => l.code === langRef.current)?.name || '';
      setError(friendly(code, name));
      setListening(false);
    };

    rec.onend = () => {
      // The browser ends a session after a pause. Keep what was said and carry on while the mic is switched on.
      baseRef.current = compose();
      sessionRef.current = '';
      recRef.current = null;
      if (wantRef.current) {
        window.setTimeout(begin, 150);
      } else {
        setListening(false);
      }
    };

    recRef.current = rec;
    try {
      rec.start();
    } catch {
      recRef.current = null;
      wantRef.current = false;
      setListening(false);
    }
  }, [Ctor]);

  const start = useCallback(() => {
    if (!Ctor) return;
    setError('');
    baseRef.current = valueRef.current;
    wantRef.current = true;
    setListening(true);
    begin();
  }, [Ctor, begin]);

  const stop = useCallback(() => {
    wantRef.current = false;
    setListening(false);
    try {
      recRef.current?.stop();
    } catch {
      // ignore
    }
  }, []);

  /** Typing or pasting while listening: carry on from the edited text. */
  const edit = useCallback((text: string) => {
    changeRef.current(text);
    if (wantRef.current) {
      baseRef.current = text;
      sessionRef.current = '';
      try {
        recRef.current?.abort();
      } catch {
        // ignore
      }
    }
  }, []);

  const setLang = useCallback((l: DictationLang) => {
    setLangState(l);
    langRef.current = l;
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      // ignore
    }
    if (wantRef.current) {
      // Restart in the new language, keeping what has been said so far.
      baseRef.current = compose();
      sessionRef.current = '';
      try {
        recRef.current?.abort();
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(
    () => () => {
      wantRef.current = false;
      try {
        recRef.current?.abort();
      } catch {
        // ignore
      }
    },
    [],
  );

  return { supported, listening, error, lang, setLang, start, stop, edit };
}
