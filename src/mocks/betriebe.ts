import type { Betrieb, OwnerWorkspace } from '@/domain/types';
import { pick, type Lang } from '@/i18n';

// All companies, people and addresses are fictitious.
export const betriebe: Betrieb[] = [
  {
    id: 'elektro-stosic',
    name: 'Elektro Stosic',
    gewerke: ['strom', 'sicherheit'],
    hasWorkspace: true,
    initials: 'ES',
    ort: 'Köln-Ehrenfeld',
  },
  {
    id: 'shk-becker',
    name: 'SHK Becker GmbH',
    shortName: 'SHK Becker',
    gewerke: ['heizung', 'wasser'],
    hasWorkspace: true,
    initials: 'SB',
    ort: 'Köln-Nippes',
  },
  {
    id: 'schornsteinfeger-wolf',
    name: 'Schornsteinfeger Wolf',
    gewerke: ['heizung'],
    hasWorkspace: false,
    initials: 'SW',
    ort: 'Köln-Bickendorf',
  },
  {
    id: 'dachdecker-kraemer',
    name: 'Dachdecker Krämer',
    gewerke: ['dach'],
    hasWorkspace: false,
    initials: 'DK',
    ort: 'Köln-Longerich',
  },
];

export const betriebName = (id: string): string => betriebe.find((b) => b.id === id)?.name ?? id;

export function workspaces(lang: Lang): OwnerWorkspace[] {
  return [
    {
      id: 'familie-schneider',
      name: pick(lang)('Familie Schneider', 'Schneider family'),
      initials: 'FS',
      objektIds: ['lindenstrasse-12', 'venloer-8-whg-3'],
    },
    {
      id: 'rheinblick',
      name: 'Rheinblick Hausverwaltung',
      initials: 'RH',
      objektIds: Array.from({ length: 12 }, (_, i) => `rb-${String(i + 1).padStart(2, '0')}`),
    },
  ];
}
