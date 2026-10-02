import type { Anlage, Dokument, Entry, Objekt, Relation, Rule } from '@/domain/types';
import { pick, type Lang } from '@/i18n';
import { betriebName } from './betriebe';
import { rel, series } from './helpers';

const OBJ = 'venloer-8-whg-3';

export function venloerObjekt(lang: Lang): Objekt {
  const L = pick(lang);
  return {
    id: OBJ,
    workspaceId: 'familie-schneider',
    title: L('ETW Venloer Straße 8, Wohnung 3', 'Flat Venloer Straße 8, unit 3'),
    address: {
      street: L('Venloer Straße 8, Wohnung 3', 'Venloer Straße 8, unit 3'),
      zip: '50672',
      city: L('Köln', 'Cologne'),
    },
    baujahr: 1974,
    nutzung: 'vermietet',
    requiredPlan: 'advanced',
  };
}

export function venloerAnlagen(lang: Lang): Anlage[] {
  const L = pick(lang);
  return [
    {
      id: 'v-therme',
      objektId: OBJ,
      name: L('Gas-Etagenheizung', 'Gas boiler'),
      gewerk: 'heizung',
      einbaujahr: 2014,
    },
    {
      id: 'v-elektro',
      objektId: OBJ,
      name: L('Elektroinstallation', 'Electrical installation'),
      gewerk: 'strom',
      einbaujahr: 2009,
    },
    {
      id: 'v-rwm',
      objektId: OBJ,
      name: L('Rauchwarnmelder', 'Smoke detectors'),
      gewerk: 'sicherheit',
      einbaujahr: 2020,
      detail: L('3 Stück', '3 units'),
    },
    {
      id: 'v-wasser',
      objektId: OBJ,
      name: L('Warmwasserbereitung', 'Hot water system'),
      gewerk: 'wasser',
      einbaujahr: 2014,
    },
  ];
}

export function venloerRules(lang: Lang): Rule[] {
  const L = pick(lang);
  return [
    {
      id: 'rv-therme',
      anlageId: 'v-therme',
      title: L('Heizungswartung', 'Heating service'),
      intervalMonths: 12,
    },
    {
      id: 'rv-elektro',
      anlageId: 'v-elektro',
      title: L('Prüfung elektrischer Anlagen', 'Electrical installation inspection'),
      intervalMonths: 48,
    },
    {
      id: 'rv-rwm',
      anlageId: 'v-rwm',
      title: L('Rauchwarnmelder prüfen', 'Smoke detector check'),
      intervalMonths: 12,
    },
    {
      id: 'rv-wasser',
      anlageId: 'v-wasser',
      title: L('Trinkwasser-Check', 'Drinking water check'),
      intervalMonths: 36,
    },
  ];
}

export function venloerEntries(today: string, lang: Lang): Entry[] {
  const L = pick(lang);
  const rules = venloerRules(lang);
  const s = (
    ruleId: string,
    betriebId: string,
    dueInDays: number,
    count: number,
    title: string,
    description: string,
    cost: number,
  ) =>
    series({
      today,
      lang,
      objektId: OBJ,
      rule: rules.find((r) => r.id === ruleId)!,
      betriebId,
      betriebName: betriebName(betriebId),
      dueInDays,
      count,
      title,
      description,
      baseCostCents: cost,
    });
  return [
    ...s(
      'rv-therme',
      'shk-becker',
      45,
      3,
      L('Wartung Gas-Etagenheizung', 'Gas boiler service'),
      L(
        'Brenner gereinigt, Abgaswerte gemessen, Ausdehnungsgefäß geprüft.',
        'Burner cleaned, flue gas measured, expansion vessel checked.',
      ),
      16900,
    ),
    ...s(
      'rv-elektro',
      'elektro-stosic',
      400,
      1,
      L('Prüfung elektrischer Anlagen', 'Electrical installation inspection'),
      L(
        'Prüfung der Wohnungsinstallation vor Neuvermietung.',
        'Inspection of the flat installation before re-letting.',
      ),
      29800,
    ),
    ...s(
      'rv-rwm',
      'elektro-stosic',
      210,
      3,
      L('Rauchwarnmelder prüfen', 'Smoke detector check'),
      L('Drei Melder geprüft und gereinigt.', 'Three detectors tested and cleaned.'),
      4900,
    ),
    ...s(
      'rv-wasser',
      'shk-becker',
      500,
      1,
      L('Trinkwasser-Check', 'Drinking water check'),
      L(
        'Probenahme und Sichtprüfung der Warmwasserbereitung.',
        'Water sample taken and hot water system inspected.',
      ),
      21900,
    ),
  ];
}

export function venloerStandaloneDocs(
  today: string,
  lang: Lang,
): Array<Dokument & { objektId: string }> {
  return [
    {
      id: 'nk-venloer',
      objektId: OBJ,
      typ: 'rechnung',
      title:
        pick(lang)('Nebenkostenabrechnung ', 'Utility cost statement ') + rel(today, -9).slice(0, 4),
      date: rel(today, -4),
    },
  ];
}

export function venloerRelations(lang: Lang): Relation[] {
  const L = pick(lang);
  return [
    {
      id: 'rel-v-therme-nk',
      from: { kind: 'dokument', id: 'rule:rv-therme:rechnung' },
      to: { kind: 'dokument', id: 'nk-venloer' },
      label: L('umgelegt in', 'passed on in'),
    },
    {
      id: 'rel-v-rwm-nk',
      from: { kind: 'dokument', id: 'rule:rv-rwm:rechnung' },
      to: { kind: 'dokument', id: 'nk-venloer' },
      label: L('umgelegt in', 'passed on in'),
    },
    {
      id: 'rel-v-therme-wasser',
      from: { kind: 'anlage', id: 'v-therme' },
      to: { kind: 'anlage', id: 'v-wasser' },
      label: L('versorgt', 'supplies'),
    },
  ];
}
