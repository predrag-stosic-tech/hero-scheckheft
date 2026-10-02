import { describe, expect, it } from 'vitest';
import { computeDueItems } from './derive';
import { buildGraph, neighbours, nodeId } from './graph';
import type { Anlage, Betrieb, Entry, Objekt, Relation, Rule } from './types';

const objekt: Objekt = {
  id: 'o1',
  workspaceId: 'familie-schneider',
  title: 'Haus',
  address: { street: 'Teststraße 1', zip: '50000', city: 'Köln' },
  baujahr: 2000,
  nutzung: 'eigennutzung',
  requiredPlan: 'kostenlos',
};
const anlagen: Anlage[] = [
  { id: 'a1', objektId: 'o1', name: 'Wärmepumpe', gewerk: 'heizung' },
  { id: 'a2', objektId: 'o1', name: 'Elektroinstallation', gewerk: 'strom' },
];
const rules: Rule[] = [
  { id: 'r1', anlageId: 'a1', title: 'Heizungswartung', intervalMonths: 12 },
  { id: 'r2', anlageId: 'a2', title: 'Prüfung', intervalMonths: 48 },
];
const betriebe: Betrieb[] = [
  { id: 'b1', name: 'SHK', gewerke: ['heizung'], hasWorkspace: true, initials: 'S', ort: 'Köln' },
];
const entry = (
  id: string,
  anlageId: string,
  ruleId: string,
  date: string,
  cost: number,
): Entry => ({
  id,
  objektId: 'o1',
  anlageId,
  ruleId,
  betriebId: 'b1',
  betriebName: 'SHK',
  date,
  title: 'Wartung',
  description: '',
  costCents: cost,
  origin: 'betrieb',
  dokumente: [
    { id: `${id}-p`, typ: 'protokoll', title: 'Protokoll', date },
    { id: `${id}-r`, typ: 'rechnung', title: 'Rechnung', date },
    { id: `${id}-f`, typ: 'foto', title: 'Foto', date },
  ],
});
const entries = [
  entry('e1', 'a1', 'r1', '2025-10-10', 10000),
  entry('e0', 'a1', 'r1', '2024-10-10', 9000),
  entry('e2', 'a2', 'r2', '2026-01-10', 30000),
];
const relations: Relation[] = [
  {
    id: 'x',
    from: { kind: 'dokument', id: 'e2-p' },
    to: { kind: 'anlage', id: 'a1' },
    label: 'prüft',
  },
];
const today = '2026-09-30';
const dueItems = computeDueItems(entries, rules, anlagen, [], today);
const base = {
  objekte: [objekt],
  anlagen,
  entries,
  betriebe,
  dueItems,
  relations,
  standaloneDocs: [],
};

describe('buildGraph', () => {
  it('builds an object graph from the latest entry per installation', () => {
    const g = buildGraph({ scope: 'objekt', ...base });
    // 2 installations, 1 company, 2 cost nodes, 2 documents each (photos are left out).
    expect(g.nodes).toHaveLength(9);
    expect(g.nodes.find((n) => n.id === nodeId('kosten', 'a1'))?.value).toBe(19000);
    expect(g.nodes.some((n) => n.id === nodeId('dokument', 'e0-p'))).toBe(false);
    // 2 company links, 2 cost links, 4 document links, 1 explicit relation.
    expect(g.edges).toHaveLength(9);
  });

  it('filters by Gewerk and drops relations to hidden nodes', () => {
    const g = buildGraph({ scope: 'objekt', ...base, filter: { gewerk: 'heizung' } });
    expect(g.nodes.filter((n) => n.kind === 'anlage').map((n) => n.label)).toEqual(['Wärmepumpe']);
    expect(g.edges.some((e) => e.label === 'prüft')).toBe(false);
  });

  it('filters by due status', () => {
    // Heating was due on 2026-10-10: within 30 days of today.
    const g = buildGraph({ scope: 'objekt', ...base, filter: { status: 'due30' } });
    expect(g.nodes.filter((n) => n.kind === 'anlage')).toHaveLength(1);
  });

  it('adds object nodes in the portfolio scope', () => {
    const g = buildGraph({ scope: 'portfolio', ...base });
    expect(g.nodes.filter((n) => n.kind === 'objekt')).toHaveLength(1);
    expect(g.nodes.find((n) => n.id === nodeId('kosten', 'o1'))?.value).toBe(49000);
    expect(g.nodes.filter((n) => n.kind === 'dokument')).toHaveLength(2);
  });

  it('resolves rule-based relations to the latest entry of the rule', () => {
    const g = buildGraph({
      scope: 'objekt',
      ...base,
      relations: [
        {
          id: 'y',
          from: { kind: 'dokument', id: 'rule:r1:rechnung' },
          to: { kind: 'dokument', id: 'nk' },
          label: 'abgerechnet in',
        },
      ],
      standaloneDocs: [{ id: 'nk', objektId: 'o1', typ: 'rechnung', title: 'NK', date: today }],
    });
    expect(g.edges.find((e) => e.label === 'abgerechnet in')).toMatchObject({
      source: nodeId('dokument', 'e1-r'),
      target: nodeId('dokument', 'nk'),
    });
  });

  it('finds direct neighbours', () => {
    const g = buildGraph({ scope: 'objekt', ...base });
    const n = neighbours(g, nodeId('anlage', 'a1'));
    expect(n.has(nodeId('betrieb', 'b1'))).toBe(true);
    expect(n.has(nodeId('dokument', 'e2-p'))).toBe(true);
    expect(n.has(nodeId('anlage', 'a2'))).toBe(false);
  });
});
