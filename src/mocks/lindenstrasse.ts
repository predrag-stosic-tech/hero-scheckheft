import type { Anlage, Dokument, Entry, Objekt, Relation, Rule } from '@/domain/types';
import { pick, type Lang } from '@/i18n';
import { betriebName } from './betriebe';
import { docs, rel, series } from './helpers';

const OBJ = 'lindenstrasse-12';

export function lindenObjekt(lang: Lang): Objekt {
  return {
    id: OBJ,
    workspaceId: 'familie-schneider',
    title: pick(lang)('Einfamilienhaus', 'Detached house'),
    address: { street: 'Lindenstraße 12', zip: '50823', city: pick(lang)('Köln', 'Cologne') },
    baujahr: 1998,
    nutzung: 'eigennutzung',
    requiredPlan: 'kostenlos',
  };
}

export function lindenAnlagen(lang: Lang): Anlage[] {
  const L = pick(lang);
  return [
    {
      id: 'a-elektro',
      objektId: OBJ,
      name: L('Elektroinstallation', 'Electrical installation'),
      gewerk: 'strom',
      einbaujahr: 1998,
      detail: L('mit Unterverteilung', 'with sub-distribution board'),
    },
    {
      id: 'a-wp',
      objektId: OBJ,
      name: L('Wärmepumpe', 'Heat pump'),
      gewerk: 'heizung',
      einbaujahr: 2021,
      detail: L('Luft-Wasser, 9 kW', 'air-to-water, 9 kW'),
    },
    {
      id: 'a-pv',
      objektId: OBJ,
      name: L('Photovoltaik', 'Solar PV'),
      gewerk: 'strom',
      einbaujahr: 2022,
      detail: L('9,8 kWp mit Speicher', '9.8 kWp with battery'),
    },
    {
      id: 'a-wallbox',
      objektId: OBJ,
      name: L('Wallbox', 'Wallbox'),
      gewerk: 'strom',
      einbaujahr: 2023,
      detail: '11 kW',
    },
    {
      id: 'a-rwm',
      objektId: OBJ,
      name: L('Rauchwarnmelder', 'Smoke detectors'),
      gewerk: 'sicherheit',
      einbaujahr: 2019,
      detail: L('6 Stück', '6 units'),
    },
    {
      id: 'a-wasser',
      objektId: OBJ,
      name: L('Trinkwasser-Enthärtung', 'Water softener'),
      gewerk: 'wasser',
      einbaujahr: 2020,
    },
    {
      id: 'a-dach',
      objektId: OBJ,
      name: L('Dach', 'Roof'),
      gewerk: 'dach',
      einbaujahr: 1998,
      detail: L('Satteldach, Tonziegel', 'gable roof, clay tiles'),
    },
    {
      id: 'a-kamin',
      objektId: OBJ,
      name: L('Kaminofen mit Schornstein', 'Wood stove with chimney'),
      gewerk: 'heizung',
      einbaujahr: 2005,
    },
  ];
}

// Intervals are recommendations made up for the prototype, not norm or legal requirements.
export function lindenRules(lang: Lang): Rule[] {
  const L = pick(lang);
  return [
    {
      id: 'r-elektro',
      anlageId: 'a-elektro',
      title: L('Prüfung elektrischer Anlagen', 'Electrical installation inspection'),
      intervalMonths: 48,
    },
    { id: 'r-wp', anlageId: 'a-wp', title: L('Heizungswartung', 'Heating service'), intervalMonths: 12 },
    { id: 'r-pv', anlageId: 'a-pv', title: L('Photovoltaik-Check', 'Solar PV check'), intervalMonths: 24 },
    {
      id: 'r-wallbox',
      anlageId: 'a-wallbox',
      title: L('Wallbox-Prüfung', 'Wallbox inspection'),
      intervalMonths: 12,
    },
    {
      id: 'r-rwm',
      anlageId: 'a-rwm',
      title: L('Rauchwarnmelder prüfen', 'Smoke detector check'),
      intervalMonths: 12,
    },
    {
      id: 'r-wasser',
      anlageId: 'a-wasser',
      title: L('Wartung Enthärtungsanlage', 'Water softener service'),
      intervalMonths: 12,
    },
    { id: 'r-dach', anlageId: 'a-dach', title: L('Dachinspektion', 'Roof inspection'), intervalMonths: 24 },
    {
      id: 'r-kamin',
      anlageId: 'a-kamin',
      title: L('Schornstein kehren', 'Chimney sweeping'),
      intervalMonths: 12,
    },
    // No entry yet: becomes a due item once the owner uploads the first invoice (story 5).
    {
      id: 'r-dachrinne',
      anlageId: 'a-dach',
      title: L('Dachrinnen reinigen', 'Gutter cleaning'),
      intervalMonths: 12,
    },
  ];
}

export function lindenEntries(today: string, lang: Lang): Entry[] {
  const L = pick(lang);
  const rules = lindenRules(lang);
  const s = (
    ruleId: string,
    betriebId: string,
    dueInDays: number,
    count: number,
    title: string,
    description: string,
    baseCostCents: number,
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
      baseCostCents,
    });

  const recurring = [
    // Due in 14 days: "Strom" reads "bald fällig" until story 1 is shown.
    ...s(
      'r-elektro',
      'elektro-stosic',
      14,
      1,
      L('Prüfung elektrischer Anlagen', 'Electrical installation inspection'),
      L(
        'Wiederkehrende Prüfung der Elektroinstallation inklusive Unterverteilung. Zwei FI-Schalter getauscht.',
        'Periodic inspection of the electrical installation including the sub-distribution board. Two RCDs replaced.',
      ),
      41200,
    ),
    // Due in 21 days: the item shown in story 2.
    ...s(
      'r-wp',
      'shk-becker',
      21,
      4,
      L('Heizungswartung Wärmepumpe', 'Heat pump service'),
      L(
        'Jahreswartung: Kältekreis, Filter, Kondensatablauf und Regelung geprüft.',
        'Annual service: refrigerant circuit, filters, condensate drain and controls checked.',
      ),
      23900,
    ),
    ...s(
      'r-pv',
      'elektro-stosic',
      200,
      2,
      L('Photovoltaik-Check', 'Solar PV check'),
      L(
        'Sichtprüfung Module, Wechselrichter-Log ausgelesen, Speicher getestet.',
        'Panels inspected, inverter log read out, battery tested.',
      ),
      18900,
    ),
    ...s(
      'r-wallbox',
      'elektro-stosic',
      150,
      2,
      L('Wallbox-Prüfung', 'Wallbox inspection'),
      L(
        'Funktionsprüfung der Ladeeinrichtung und des Fehlerstromschutzes.',
        'Function test of the charger and the residual current protection.',
      ),
      12900,
    ),
    ...s(
      'r-rwm',
      'elektro-stosic',
      64,
      4,
      L('Rauchwarnmelder prüfen', 'Smoke detector check'),
      L(
        'Alle sechs Melder geprüft, Batteriestand in Ordnung.',
        'All six detectors tested, battery level OK.',
      ),
      6900,
    ),
    ...s(
      'r-wasser',
      'shk-becker',
      120,
      4,
      L('Wartung Enthärtungsanlage', 'Water softener service'),
      L(
        'Salz nachgefüllt, Härtegrad eingestellt, Dichtheit geprüft.',
        'Salt refilled, hardness adjusted, checked for leaks.',
      ),
      14900,
    ),
    ...s(
      'r-dach',
      'dachdecker-kraemer',
      300,
      2,
      L('Dachinspektion', 'Roof inspection'),
      L(
        'Ziegel, First und Anschlüsse kontrolliert. Dachrinnen gereinigt.',
        'Tiles, ridge and flashings checked. Gutters cleaned.',
      ),
      28900,
    ),
    ...s(
      'r-kamin',
      'schornsteinfeger-wolf',
      180,
      4,
      L('Schornstein kehren', 'Chimney sweeping'),
      L(
        'Kehrung und Überprüfung des Schornsteins am Kaminofen.',
        'Chimney of the wood stove swept and inspected.',
      ),
      7400,
    ),
  ];

  const single = (
    id: string,
    anlageId: string,
    betriebId: string,
    months: number,
    title: string,
    description: string,
    costCents: number,
    docSpec: string,
  ): Entry => {
    const date = rel(today, -months, 9);
    return {
      id,
      objektId: OBJ,
      anlageId,
      betriebId,
      betriebName: betriebName(betriebId),
      date,
      title,
      description,
      costCents,
      origin: 'betrieb',
      dokumente: docs(id, date, docSpec, title, lang),
    };
  };

  const oneOff = [
    single(
      'x-wallbox-install',
      'a-wallbox',
      'elektro-stosic',
      38,
      L('Installation Wallbox', 'Wallbox installation'),
      L(
        'Wallbox 11 kW montiert, Zuleitung verlegt und in Betrieb genommen.',
        '11 kW wallbox mounted, supply cable laid and commissioned.',
      ),
      189000,
      'PFFRG',
    ),
    single(
      'x-wp-reparatur',
      'a-wp',
      'shk-becker',
      17,
      L('Reparatur Umwälzpumpe', 'Circulation pump repair'),
      L(
        'Umwälzpumpe der Wärmepumpe getauscht, Anlage entlüftet.',
        'Circulation pump of the heat pump replaced, system bled.',
      ),
      46800,
      'PFR',
    ),
    single(
      'x-dach-sturm',
      'a-dach',
      'dachdecker-kraemer',
      20,
      L('Sturmschaden behoben', 'Storm damage repaired'),
      L(
        'Acht Dachziegel ersetzt, Firstklammern nachgesetzt.',
        'Eight roof tiles replaced, ridge clips refitted.',
      ),
      61500,
      'FFR',
    ),
    single(
      'x-pv-speicher',
      'a-pv',
      'elektro-stosic',
      44,
      L('Speicher nachgerüstet', 'Battery retrofitted'),
      L(
        'Batteriespeicher 7,7 kWh installiert und in die Anlage eingebunden.',
        '7.7 kWh battery installed and connected to the system.',
      ),
      642000,
      'PRG',
    ),
  ];

  return [...recurring, ...oneOff];
}

/** Documents that belong to the object but not to a single entry. */
export function lindenStandaloneDocs(
  today: string,
  lang: Lang,
): Array<Dokument & { objektId: string }> {
  return [
    {
      id: 'nk-linden',
      objektId: OBJ,
      typ: 'rechnung',
      title:
        pick(lang)('Nebenkostenabrechnung ', 'Utility cost statement ') + rel(today, -9).slice(0, 4),
      date: rel(today, -5),
    },
  ];
}

// Cross-links shown in the graph in addition to the ones derived from entries.
// `rule:<ruleId>:<typ>` points at that document of the latest entry for the rule, so a link
// stays in place when a newer entry arrives during the demo.
export function lindenRelations(lang: Lang): Relation[] {
  const L = pick(lang);
  return [
    {
      id: 'rel-elektro-wp',
      from: { kind: 'dokument', id: 'rule:r-elektro:protokoll' },
      to: { kind: 'anlage', id: 'a-wp' },
      label: L('prüft Anschluss', 'checks connection'),
    },
    {
      id: 'rel-elektro-nk',
      from: { kind: 'dokument', id: 'rule:r-elektro:rechnung' },
      to: { kind: 'dokument', id: 'nk-linden' },
      label: L('abgerechnet in', 'billed in'),
    },
    {
      id: 'rel-wp-nk',
      from: { kind: 'dokument', id: 'rule:r-wp:rechnung' },
      to: { kind: 'dokument', id: 'nk-linden' },
      label: L('abgerechnet in', 'billed in'),
    },
    {
      id: 'rel-pv-wallbox',
      from: { kind: 'anlage', id: 'a-pv' },
      to: { kind: 'anlage', id: 'a-wallbox' },
      label: L('versorgt', 'supplies'),
    },
  ];
}
