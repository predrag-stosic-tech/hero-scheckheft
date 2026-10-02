import { addDays, addMonths, format, parseISO } from 'date-fns';
import type { Dokument, DokumentTyp, Entry, Rule } from '@/domain/types';
import { dictFor, type Lang } from '@/i18n';

/** ISO date relative to `today`: shifted by whole months, then by days. */
export function rel(today: string, months: number, days = 0): string {
  return format(addDays(addMonths(parseISO(today), months), days), 'yyyy-MM-dd');
}

/**
 * Builds the documents of an entry from a compact spec: P = Protokoll, R = Rechnung,
 * F = Foto, G = Garantie. "PFFR" gives one protocol, two photos and one invoice.
 */
export function docs(
  entryId: string,
  date: string,
  spec: string,
  subject: string,
  lang: Lang,
): Dokument[] {
  const map: Record<string, DokumentTyp> = {
    P: 'protokoll',
    R: 'rechnung',
    F: 'foto',
    G: 'garantie',
  };
  const label = dictFor(lang).dokTyp;
  const counts: Partial<Record<DokumentTyp, number>> = {};
  return spec.split('').map((c) => {
    const typ = map[c];
    const n = (counts[typ] = (counts[typ] ?? 0) + 1);
    const title =
      typ === 'foto' ? `${label.foto} ${n} – ${subject}` : `${label[typ]} – ${subject}`;
    return { id: `${entryId}-${typ}-${n}`, typ, title, date };
  });
}

interface SeriesSpec {
  today: string;
  lang: Lang;
  objektId: string;
  rule: Rule;
  betriebId: string;
  betriebName: string;
  /** Days from today until the next due date that results from the newest entry. */
  dueInDays: number;
  count: number;
  title: string;
  description: string;
  baseCostCents: number;
  docSpec?: string;
}

/**
 * Recurring entries for a rule, newest first. The newest one is dated so that
 * `nextDueDate` lands exactly `dueInDays` from today.
 */
export function series(s: SeriesSpec): Entry[] {
  return Array.from({ length: s.count }, (_, i) => {
    const k = i + 1;
    const date = rel(s.today, -k * s.rule.intervalMonths, s.dueInDays);
    const id = `${s.rule.id}-${k}`;
    return {
      id,
      objektId: s.objektId,
      anlageId: s.rule.anlageId,
      ruleId: s.rule.id,
      betriebId: s.betriebId,
      betriebName: s.betriebName,
      date,
      title: s.title,
      description: s.description,
      // Older visits were a little cheaper: deterministic, no randomness.
      costCents: Math.round((s.baseCostCents * (100 - (k - 1) * 4)) / 100 / 100) * 100,
      origin: 'betrieb' as const,
      dokumente: docs(id, date, s.docSpec ?? (k === 1 ? 'PFR' : 'PR'), s.title, s.lang),
    };
  });
}
