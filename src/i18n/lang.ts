import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Lang = 'de' | 'en';
export const LANGS: Lang[] = ['de', 'en'];
export const LANG_KEY = 'hero-scheckheft-lang';

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

/**
 * The UI language lives in its own small store so "Demo zurücksetzen" keeps it, and so
 * formatting and fixtures can read it without depending on the demo store.
 */
export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'de',
      setLang: (lang) => set({ lang }),
    }),
    {
      name: LANG_KEY,
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const lang = (persisted as Partial<LangState> | undefined)?.lang;
        return { ...current, lang: lang === 'en' ? 'en' : 'de' };
      },
    },
  ),
);

export const getLang = (): Lang => useLangStore.getState().lang;
export const useLang = (): Lang => useLangStore((s) => s.lang);

/** Picks the German or English variant of a text. Used by the fixtures. */
export const pick =
  (lang: Lang) =>
  <T>(de: T, en: T): T =>
    lang === 'en' ? en : de;
