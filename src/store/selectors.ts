import { useMemo } from 'react';
import { byDateDesc, computeDueItems } from '@/domain/derive';
import { planCovers } from '@/domain/featureGate';
import type {
  Dokument,
  DueItem,
  Entry,
  Objekt,
  OwnerWorkspaceId,
  Plan,
  Terminanfrage,
} from '@/domain/types';
import { useLang } from '@/i18n';
import { buildFixtures, todayISO, type Fixtures } from '@/mocks';
import { scenarioEntry } from '@/mocks/scenarios';
import type { DemoState } from './initialState';

/** Fixtures for the current day and language. Rebuilt when either changes, never persisted. */
export function useFixtures(): Fixtures {
  const today = todayISO();
  const lang = useLang();
  return useMemo(() => buildFixtures(today, lang), [today, lang]);
}

/** Entries added during the demo are rebuilt in the current language from their scenario. */
function localized(entry: Entry, fx: Fixtures): Entry {
  return (
    scenarioEntry(
      entry.id,
      entry.date,
      {
        intervalMonths: entry.intervalMonths,
        anlageId: entry.anlageId,
        costCents: entry.costCents,
      },
      fx.lang,
    ) ?? entry
  );
}

export function effectivePlan(s: Pick<DemoState, 'plan'>): Plan {
  return s.plan.activeOwnerWorkspace === 'rheinblick' ? 'pro' : s.plan.familyPlan;
}

export function allEntries(
  s: Pick<DemoState, 'entries'>,
  fx: Fixtures,
  objektId?: string,
): Entry[] {
  const all = [...fx.entries, ...s.entries.added.map((e) => localized(e, fx))];
  return (objektId ? all.filter((e) => e.objektId === objektId) : all).sort(byDateDesc);
}

export function dueItems(
  s: Pick<DemoState, 'entries' | 'termine'>,
  fx: Fixtures,
  objektIds: string[],
): DueItem[] {
  const anlagen = fx.anlagen.filter((a) => objektIds.includes(a.objektId));
  const rules = fx.rules.filter((r) => anlagen.some((a) => a.id === r.anlageId));
  return computeDueItems(allEntries(s, fx), rules, anlagen, s.termine.requests, fx.today);
}

export function visibleObjekte(fx: Fixtures, workspaceId: OwnerWorkspaceId, plan: Plan): Objekt[] {
  return fx.objekte.filter(
    (o) => o.workspaceId === workspaceId && planCovers(plan, o.requiredPlan),
  );
}

export function lockedObjekte(fx: Fixtures, workspaceId: OwnerWorkspaceId, plan: Plan): Objekt[] {
  return fx.objekte.filter(
    (o) => o.workspaceId === workspaceId && !planCovers(plan, o.requiredPlan),
  );
}

/** Appointment requests addressed to a company: the cards of its board column. */
export function boardCards(s: Pick<DemoState, 'termine'>, betriebId: string): Terminanfrage[] {
  return s.termine.requests.filter((r) => r.betriebId === betriebId);
}

/** "Fällig beim Kunden": due items whose latest visit was made by this company. */
export function customerDue(
  s: Pick<DemoState, 'entries' | 'termine'>,
  fx: Fixtures,
  betriebId: string,
): DueItem[] {
  return dueItems(
    s,
    fx,
    fx.objekte.map((o) => o.id),
  ).filter((i) => i.lastEntry.betriebId === betriebId);
}

export interface PortfolioStats {
  overdue: number;
  due30: number;
  due90: number;
  totalCostCents: number;
  perObjekt: Array<{ objekt: Objekt; costCents: number; items: DueItem[] }>;
}

export function portfolioStats(
  s: Pick<DemoState, 'entries' | 'termine'>,
  fx: Fixtures,
  objekte: Objekt[],
): PortfolioStats {
  const items = dueItems(
    s,
    fx,
    objekte.map((o) => o.id),
  );
  const entries = allEntries(s, fx);
  const perObjekt = objekte.map((objekt) => ({
    objekt,
    costCents: entries
      .filter((e) => e.objektId === objekt.id)
      .reduce((sum, e) => sum + e.costCents, 0),
    items: items.filter((i) => i.objektId === objekt.id),
  }));
  return {
    overdue: items.filter((i) => i.status === 'overdue').length,
    due30: items.filter((i) => i.status === 'due30').length,
    due90: items.filter((i) => i.status === 'due90').length,
    totalCostCents: perObjekt.reduce((sum, p) => sum + p.costCents, 0),
    perObjekt,
  };
}

export interface DokumentRef {
  dokument: Dokument;
  entry?: Entry;
  objektId: string;
}

export function allDokumente(entries: Entry[], fx: Fixtures, objektId?: string): DokumentRef[] {
  const fromEntries = entries
    .filter((e) => !objektId || e.objektId === objektId)
    .flatMap((entry) =>
      entry.dokumente.map((dokument) => ({ dokument, entry, objektId: entry.objektId })),
    );
  const standalone = fx.standaloneDocs
    .filter((d) => !objektId || d.objektId === objektId)
    .map((d) => ({ dokument: d as Dokument, objektId: d.objektId }));
  return [...fromEntries, ...standalone].sort((a, b) =>
    a.dokument.date < b.dokument.date ? 1 : -1,
  );
}

export function findDokument(entries: Entry[], fx: Fixtures, id: string): DokumentRef | undefined {
  return allDokumente(entries, fx).find((r) => r.dokument.id === id);
}
