import type { Entry } from '@/domain/types';
import { pick, type Lang } from '@/i18n';
import { docs } from './helpers';

// Prepared results that a demo action activates. Dates are passed in, so the same builders
// serve the live demo (today) and the share view (dates from the token).

export type ScenarioId = 's1-elektro' | 'shk-incoming' | 's5-upload';

export interface ScenarioOptions {
  intervalMonths?: number;
  title?: string;
  anlageId?: string;
  costCents?: number;
  imageUrl?: string;
}

/** The prepared upload suggestion belongs to this object. */
export const UPLOAD_OBJEKT_ID = 'lindenstrasse-12';

export const S5_DEFAULTS = {
  title: 'Dachrinnen gereinigt',
  anlageId: 'a-dach',
  ruleId: 'r-dachrinne',
  costCents: 18900,
  intervalMonths: 12,
  betriebName: 'Dachservice Yilmaz',
  /** Invoice date, in days before the upload. */
  daysAgo: 20,
};

export function scenarioEntry(
  id: string,
  date: string,
  opts: ScenarioOptions = {},
  lang: Lang = 'de',
): Entry | undefined {
  const L = pick(lang);
  switch (id as ScenarioId) {
    case 's1-elektro':
      return {
        id: 's1-elektro',
        objektId: 'lindenstrasse-12',
        anlageId: 'a-elektro',
        ruleId: 'r-elektro',
        betriebId: 'elektro-stosic',
        betriebName: 'Elektro Stosic',
        date,
        title: L('Prüfung elektrischer Anlagen', 'Electrical installation inspection'),
        description: L(
          'Wiederkehrende Prüfung der Elektroinstallation inklusive Unterverteilung, Wallbox und PV-Einspeisung. Keine Mängel festgestellt.',
          'Periodic inspection of the electrical installation including sub-distribution board, wallbox and PV feed-in. No defects found.',
        ),
        costCents: 38900,
        origin: 'betrieb',
        intervalMonths: opts.intervalMonths ?? 48,
        dokumente: docs(
          's1-elektro',
          date,
          'PFFFR',
          L('Prüfung elektrischer Anlagen', 'Electrical installation inspection'),
          lang,
        ),
      };
    case 'shk-incoming':
      return {
        id: 'shk-incoming',
        objektId: 'lindenstrasse-12',
        anlageId: 'a-wp',
        ruleId: 'r-wp',
        betriebId: 'shk-becker',
        betriebName: 'SHK Becker GmbH',
        date,
        title: L('Heizungswartung Wärmepumpe', 'Heat pump service'),
        description: L(
          'Jahreswartung durchgeführt: Kältekreis dicht, Filter gereinigt, Regelung auf Sommerbetrieb geprüft.',
          'Annual service done: refrigerant circuit tight, filters cleaned, controls checked for summer mode.',
        ),
        costCents: 24900,
        origin: 'betrieb',
        dokumente: [
          {
            id: 'shk-incoming-protokoll-1',
            typ: 'protokoll',
            title: L('Wartungsbericht – Wärmepumpe', 'Service report – heat pump'),
            date,
          },
          {
            id: 'shk-incoming-rechnung-1',
            typ: 'rechnung',
            title: L('Rechnung – Heizungswartung', 'Invoice – heating service'),
            date,
          },
        ],
      };
    case 's5-upload': {
      const anlageId = opts.anlageId ?? S5_DEFAULTS.anlageId;
      return {
        id: 's5-upload',
        objektId: 'lindenstrasse-12',
        anlageId,
        // The recurring rule only applies while the suggested installation is kept.
        ruleId: anlageId === S5_DEFAULTS.anlageId ? S5_DEFAULTS.ruleId : undefined,
        betriebName: S5_DEFAULTS.betriebName,
        date,
        title: L(S5_DEFAULTS.title, 'Gutters cleaned'),
        description: L('Aus hochgeladener Rechnung übernommen.', 'Taken over from an uploaded invoice.'),
        costCents: opts.costCents ?? S5_DEFAULTS.costCents,
        origin: 'upload',
        intervalMonths: opts.intervalMonths ?? S5_DEFAULTS.intervalMonths,
        dokumente: [
          {
            id: 's5-upload-rechnung-1',
            typ: 'rechnung',
            title: `${L('Rechnung', 'Invoice')} – ${S5_DEFAULTS.betriebName}`,
            date,
            imageUrl: opts.imageUrl,
          },
        ],
      };
    }
    default:
      return undefined;
  }
}
