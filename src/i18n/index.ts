import { de as deLocale, enGB } from 'date-fns/locale';
import { de, type Dict } from './de';
import { en } from './en';
import { getLang, useLang, type Lang } from './lang';

export { getLang, LANGS, pick, useLang, useLangStore, type Lang } from './lang';
export type { Dict };

const DICTS: Record<Lang, Dict> = { de, en };

export const dictFor = (lang: Lang): Dict => DICTS[lang];

/** UI texts of the current language. Re-renders the component when the language changes. */
export function useT(): Dict {
  return DICTS[useLang()];
}

/** UI texts outside React (store actions, formatting). */
export function getT(): Dict {
  return DICTS[getLang()];
}

export const dateLocale = (lang: Lang = getLang()) => (lang === 'en' ? enGB : deLocale);
