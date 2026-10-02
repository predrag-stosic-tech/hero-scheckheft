import type { Einreichung } from '@/domain/types';
import { pick, type Lang } from '@/i18n';

export function einreichungen(lang: Lang): Einreichung[] {
  const L = pick(lang);
  return [
    {
      id: 'e-elektro-linden',
      betriebId: 'elektro-stosic',
      title: L(
        'Prüfung elektrischer Anlagen – Lindenstraße 12',
        'Electrical installation inspection – Lindenstraße 12',
      ),
      vorlage: L('Prüfung elektrischer Anlagen', 'Electrical installation inspection'),
      bezugspunkt: { kind: 'objekt', objektId: 'lindenstrasse-12' },
      kunde: L('Familie Schneider', 'the Schneider family'),
      eingereichtVon: 'Milan Stosic',
      scenarioId: 's1-elektro',
      ruleTitle: L('Nächste Prüfung', 'Next inspection'),
      intervalMonths: 48,
      summary: L(
        [
          'Sichtprüfung Zählerschrank und Unterverteilung: ohne Mängel',
          'Schutzleiter- und Isolationsmessung: bestanden',
          'FI-Schutzschalter ausgelöst und geprüft: 6 von 6 in Ordnung',
          'Wallbox und PV-Einspeisung mitgeprüft',
        ],
        [
          'Visual inspection of meter cabinet and sub-distribution board: no defects',
          'Protective conductor and insulation measurement: passed',
          'RCDs tripped and tested: 6 of 6 OK',
          'Wallbox and PV feed-in checked as well',
        ],
      ),
      fotos: 3,
      rechnungCents: 38900,
    },
    {
      id: 'e-rapport-kueche',
      betriebId: 'elektro-stosic',
      title: L('Service-Rapport – Steckdosen Küche', 'Service report – kitchen sockets'),
      vorlage: L('Service-Rapport / Regiebericht', 'Service report / time sheet'),
      bezugspunkt: {
        kind: 'sonstiges',
        label: L('Auftrag 2026-118 · Kunde Öztürk', 'Order 2026-118 · customer Öztürk'),
      },
      kunde: L('Herr Öztürk', 'Mr Öztürk'),
      eingereichtVon: 'Jonas Peters',
      summary: L(
        ['Drei Steckdosen ersetzt', 'Zuleitung Herd geprüft', 'Arbeitszeit 2,5 Stunden'],
        ['Three sockets replaced', 'Cooker supply checked', 'Working time 2.5 hours'],
      ),
      fotos: 2,
      rechnungCents: 21400,
    },
    {
      id: 'e-stromkreis-buero',
      betriebId: 'elektro-stosic',
      title: L('Stromkreis Messung – Büro Ehrenfeld', 'Circuit measurement – Ehrenfeld office'),
      vorlage: L('Stromkreis Messung', 'Circuit measurement'),
      bezugspunkt: {
        kind: 'sonstiges',
        label: L('Auftrag 2026-121 · Agentur Nordlicht', 'Order 2026-121 · Agentur Nordlicht'),
      },
      kunde: 'Agentur Nordlicht',
      eingereichtVon: 'Milan Stosic',
      summary: L(
        ['12 Stromkreise gemessen', 'Ein Leitungsschutzschalter ersetzt'],
        ['12 circuits measured', 'One circuit breaker replaced'],
      ),
      fotos: 1,
    },
    {
      id: 'e-shk-therme',
      betriebId: 'shk-becker',
      title: L(
        'Wartungsbericht Gas-Therme – Aachener Straße 41',
        'Gas boiler service report – Aachener Straße 41',
      ),
      vorlage: L('Wartungsbericht Heizung', 'Heating service report'),
      bezugspunkt: {
        kind: 'sonstiges',
        label: L('Auftrag 4471 · Frau Lindner', 'Order 4471 · Ms Lindner'),
      },
      kunde: L('Frau Lindner', 'Ms Lindner'),
      eingereichtVon: 'Tim Becker',
      summary: L(
        ['Brenner gereinigt', 'Abgasmessung durchgeführt', 'Wasserdruck nachgefüllt'],
        ['Burner cleaned', 'Flue gas measured', 'Water pressure topped up'],
      ),
      fotos: 2,
      rechnungCents: 17900,
    },
    {
      id: 'e-shk-heizkoerper',
      betriebId: 'shk-becker',
      title: L('Service-Rapport – Heizkörper tauschen', 'Service report – replace radiators'),
      vorlage: L('Service-Rapport / Regiebericht', 'Service report / time sheet'),
      bezugspunkt: {
        kind: 'sonstiges',
        label: L('Auftrag 4473 · Praxis Dr. Hahn', 'Order 4473 · Dr Hahn surgery'),
      },
      kunde: L('Praxis Dr. Hahn', 'Dr Hahn surgery'),
      eingereichtVon: 'Carla Becker',
      summary: L(
        ['Zwei Heizkörper ersetzt', 'Thermostatventile erneuert'],
        ['Two radiators replaced', 'Thermostatic valves renewed'],
      ),
      fotos: 1,
      rechnungCents: 89600,
    },
  ];
}
