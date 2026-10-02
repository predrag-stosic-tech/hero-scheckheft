import { dueStatus, effectiveInterval, gewerkStatus, nextDueDate } from './due';
import {
  GEWERKE,
  type Anlage,
  type DueItem,
  type Entry,
  type Gewerk,
  type GewerkStatus,
  type Rule,
  type Terminanfrage,
} from './types';

export const byDateDesc = (a: Entry, b: Entry): number =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : 0;

/**
 * One due item per rule that has at least one entry. Everything the owner sees about
 * "what is due when" comes from here, so a single new entry updates history, status
 * and calendar together.
 */
export function computeDueItems(
  entries: Entry[],
  rules: Rule[],
  anlagen: Anlage[],
  requests: Terminanfrage[],
  today: string,
): DueItem[] {
  const items: DueItem[] = [];
  for (const rule of rules) {
    const anlage = anlagen.find((a) => a.id === rule.anlageId);
    if (!anlage) continue;
    const lastEntry = entries.filter((e) => e.ruleId === rule.id).sort(byDateDesc)[0];
    const dueDate = nextDueDate(rule, lastEntry);
    if (!lastEntry || !dueDate) continue;
    items.push({
      rule,
      anlage,
      objektId: anlage.objektId,
      dueDate,
      status: dueStatus(dueDate, today),
      intervalMonths: effectiveInterval(rule, lastEntry),
      lastEntry,
      requested: requests.some((r) => r.ruleId === rule.id && r.status === 'offen'),
    });
  }
  return items.sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
}

export function statusByGewerk(items: DueItem[]): Record<Gewerk, GewerkStatus> {
  const result = {} as Record<Gewerk, GewerkStatus>;
  for (const g of GEWERKE) result[g] = gewerkStatus(items.filter((i) => i.anlage.gewerk === g));
  return result;
}

export function groupByGewerk(entries: Entry[], anlagen: Anlage[]): Record<Gewerk, Entry[]> {
  const result = {} as Record<Gewerk, Entry[]>;
  for (const g of GEWERKE) result[g] = [];
  for (const e of [...entries].sort(byDateDesc)) {
    const gewerk = anlagen.find((a) => a.id === e.anlageId)?.gewerk;
    if (gewerk) result[gewerk].push(e);
  }
  return result;
}
