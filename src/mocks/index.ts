import { format } from 'date-fns';
import type {
  Anlage,
  Betrieb,
  Dokument,
  Einreichung,
  Entry,
  Objekt,
  OwnerWorkspace,
  Relation,
  Rule,
} from '@/domain/types';
import type { Lang } from '@/i18n';
import { betriebe, workspaces } from './betriebe';
import { einreichungen } from './einreichungen';
import {
  lindenAnlagen,
  lindenEntries,
  lindenObjekt,
  lindenRelations,
  lindenRules,
  lindenStandaloneDocs,
} from './lindenstrasse';
import { rheinblickData } from './rheinblick';
import {
  venloerAnlagen,
  venloerEntries,
  venloerObjekt,
  venloerRelations,
  venloerRules,
  venloerStandaloneDocs,
} from './venloer';

export interface Fixtures {
  today: string;
  lang: Lang;
  betriebe: Betrieb[];
  workspaces: OwnerWorkspace[];
  objekte: Objekt[];
  anlagen: Anlage[];
  rules: Rule[];
  entries: Entry[];
  einreichungen: Einreichung[];
  relations: Relation[];
  standaloneDocs: Array<Dokument & { objektId: string }>;
}

const cache = new Map<string, Fixtures>();

/**
 * All read-only demo data, with every date relative to `today` so that statements like
 * "fällig in 21 Tagen" stay true on whatever day the prototype is shown. Texts follow `lang`.
 */
export function buildFixtures(today: string, lang: Lang = 'de'): Fixtures {
  const key = `${today}:${lang}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const rb = rheinblickData(today, lang);
  const fixtures: Fixtures = {
    today,
    lang,
    betriebe,
    workspaces: workspaces(lang),
    objekte: [lindenObjekt(lang), venloerObjekt(lang), ...rb.objekte],
    anlagen: [...lindenAnlagen(lang), ...venloerAnlagen(lang), ...rb.anlagen],
    rules: [...lindenRules(lang), ...venloerRules(lang), ...rb.rules],
    entries: [...lindenEntries(today, lang), ...venloerEntries(today, lang), ...rb.entries],
    einreichungen: einreichungen(lang),
    relations: [...lindenRelations(lang), ...venloerRelations(lang)],
    standaloneDocs: [...lindenStandaloneDocs(today, lang), ...venloerStandaloneDocs(today, lang)],
  };
  cache.set(key, fixtures);
  return fixtures;
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
