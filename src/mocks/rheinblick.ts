import type { Anlage, Entry, Gewerk, Objekt, Rule } from '@/domain/types';
import { pick, type Lang } from '@/i18n';
import { betriebName } from './betriebe';
import { docs, rel, series } from './helpers';

// Portfolio of the fictitious "Rheinblick Hausverwaltung" (Pro plan). Generated
// deterministically so the dashboard always shows overdue, due-in-30 and due-in-90 items.

const ADDRESSES: Array<[string, string, number, number]> = [
  ['Rheinuferstraße 14', '50668', 1962, 8],
  ['Neusser Straße 221', '50733', 1955, 12],
  ['Subbelrather Straße 87', '50823', 1971, 6],
  ['Zülpicher Straße 303', '50937', 1984, 10],
  ['Bonner Straße 56', '50677', 1928, 7],
  ['Aachener Straße 412', '50933', 1996, 16],
  ['Siegburger Straße 39', '50679', 1966, 9],
  ['Berrenrather Straße 148', '50937', 1978, 11],
  ['Amsterdamer Straße 72', '50735', 2004, 14],
  ['Luxemburger Straße 190', '50937', 1959, 8],
  ['Deutz-Mülheimer Straße 25', '51063', 2011, 20],
  ['Kalker Hauptstraße 133', '51103', 1989, 9],
];

interface Template {
  key: string;
  name: [string, string];
  gewerk: Gewerk;
  ruleTitle: [string, string];
  interval: number;
  betriebId: string;
  entryTitle: [string, string];
  description: [string, string];
  cost: number;
}

const TEMPLATES: Template[] = [
  {
    key: 'heizung',
    name: ['Heizungsanlage', 'Heating system'],
    gewerk: 'heizung',
    ruleTitle: ['Heizungswartung', 'Heating service'],
    interval: 12,
    betriebId: 'shk-becker',
    entryTitle: ['Heizungswartung', 'Heating service'],
    description: [
      'Jahreswartung der Zentralheizung, Brenner und Regelung geprüft.',
      'Annual service of the central heating, burner and controls checked.',
    ],
    cost: 38900,
  },
  {
    key: 'elektro',
    name: ['Elektroinstallation', 'Electrical installation'],
    gewerk: 'strom',
    ruleTitle: ['Prüfung elektrischer Anlagen', 'Electrical installation inspection'],
    interval: 48,
    betriebId: 'elektro-stosic',
    entryTitle: ['Prüfung elektrischer Anlagen', 'Electrical installation inspection'],
    description: [
      'Prüfung der Allgemeinstromanlage und der Unterverteilungen.',
      'Inspection of the common-area installation and the distribution boards.',
    ],
    cost: 64900,
  },
  {
    key: 'rwm',
    name: ['Rauchwarnmelder', 'Smoke detectors'],
    gewerk: 'sicherheit',
    ruleTitle: ['Rauchwarnmelder prüfen', 'Smoke detector check'],
    interval: 12,
    betriebId: 'elektro-stosic',
    entryTitle: ['Rauchwarnmelder prüfen', 'Smoke detector check'],
    description: [
      'Melder in allen Wohnungen und im Treppenhaus geprüft.',
      'Detectors in all flats and in the stairwell tested.',
    ],
    cost: 21900,
  },
  {
    key: 'wasser',
    name: ['Trinkwasseranlage', 'Drinking water system'],
    gewerk: 'wasser',
    ruleTitle: ['Trinkwasser-Check', 'Drinking water check'],
    interval: 36,
    betriebId: 'shk-becker',
    entryTitle: ['Trinkwasser-Check', 'Drinking water check'],
    description: [
      'Probenahme an drei Entnahmestellen, Speicher geprüft.',
      'Samples taken at three outlets, storage tank checked.',
    ],
    cost: 42900,
  },
  {
    key: 'dach',
    name: ['Dach', 'Roof'],
    gewerk: 'dach',
    ruleTitle: ['Dachinspektion', 'Roof inspection'],
    interval: 24,
    betriebId: 'dachdecker-kraemer',
    entryTitle: ['Dachinspektion', 'Roof inspection'],
    description: [
      'Dachfläche, Anschlüsse und Entwässerung kontrolliert.',
      'Roof surface, flashings and drainage checked.',
    ],
    cost: 52900,
  },
];

// Which three or four installations each object has, by template index.
const LAYOUT: number[][] = [
  [0, 1, 2],
  [0, 2, 4],
  [0, 1, 3],
  [0, 2, 3, 4],
  [0, 1, 2],
  [0, 2, 4],
  [0, 1, 3],
  [0, 2, 3],
  [0, 1, 2, 4],
  [0, 2, 4],
  [0, 1, 3],
  [0, 2, 3],
];

// Days until the next due date, per object and installation. Negative = overdue.
const DUE_IN: number[][] = [
  [40, -20, 200],
  [12, 150, 320],
  [75, 410, -6],
  [180, 25, 260, 95],
  [-38, 300, 110],
  [230, 60, 18],
  [140, 520, 85],
  [8, 270, 330],
  [210, 190, 45, 130],
  [290, -12, 170],
  [100, 365, 240],
  [55, 22, 150],
];

export function rheinblickData(
  today: string,
  lang: Lang,
): {
  objekte: Objekt[];
  anlagen: Anlage[];
  rules: Rule[];
  entries: Entry[];
} {
  const objekte: Objekt[] = [];
  const anlagen: Anlage[] = [];
  const rules: Rule[] = [];
  const entries: Entry[] = [];
  const L = pick(lang);
  const tr = (pair: [string, string]) => L(pair[0], pair[1]);

  ADDRESSES.forEach(([street, zip, baujahr, units], i) => {
    const objektId = `rb-${String(i + 1).padStart(2, '0')}`;
    objekte.push({
      id: objektId,
      workspaceId: 'rheinblick',
      title: L(`Mehrfamilienhaus, ${units} Wohnungen`, `Apartment building, ${units} flats`),
      address: { street, zip, city: L('Köln', 'Cologne') },
      baujahr,
      nutzung: 'vermietet',
      requiredPlan: 'pro',
    });
    LAYOUT[i].forEach((t, j) => {
      const tpl = TEMPLATES[t];
      const anlageId = `${objektId}-${tpl.key}`;
      const rule: Rule = {
        id: `${objektId}-r-${tpl.key}`,
        anlageId,
        title: tr(tpl.ruleTitle),
        intervalMonths: tpl.interval,
      };
      anlagen.push({
        id: anlageId,
        objektId,
        name: tr(tpl.name),
        gewerk: tpl.gewerk,
        einbaujahr: Math.min(2022, baujahr + 30 + ((i * 7 + j * 5) % 25)),
      });
      rules.push(rule);
      entries.push(
        ...series({
          today,
          lang,
          objektId,
          rule,
          betriebId: tpl.betriebId,
          betriebName: betriebName(tpl.betriebId),
          dueInDays: DUE_IN[i][j],
          count: tpl.interval <= 12 ? 2 : 1,
          title: tr(tpl.entryTitle),
          description: tr(tpl.description),
          // Larger buildings cost more; deterministic.
          baseCostCents: tpl.cost + units * 900,
          docSpec: 'PR',
        }),
      );
    });
  });

  // Heating replacement with a guarantee document in the first object (used by the chat).
  const date = rel(today, -30, 3);
  entries.push({
    id: 'rb-01-heizung-tausch',
    objektId: 'rb-01',
    anlageId: 'rb-01-heizung',
    betriebId: 'shk-becker',
    betriebName: betriebName('shk-becker'),
    date,
    title: L('Erneuerung Heizkessel', 'Boiler replacement'),
    description: L(
      'Gas-Brennwertkessel erneuert, hydraulischer Abgleich durchgeführt.',
      'Gas condensing boiler replaced, hydraulic balancing carried out.',
    ),
    costCents: 1_864_000,
    origin: 'betrieb',
    dokumente: docs(
      'rb-01-heizung-tausch',
      date,
      'PRG',
      L('Erneuerung Heizkessel', 'Boiler replacement'),
      lang,
    ),
  });

  return { objekte, anlagen, rules, entries };
}
