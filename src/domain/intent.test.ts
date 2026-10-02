import { describe, expect, it } from 'vitest';
import { matchIntent, normalize } from './intent';
import type { Intent } from './types';

const intents: Intent[] = [
  {
    id: 'heizung',
    question: 'Wann war die letzte Heizungswartung?',
    keywords: ['heizungswartung', 'heizung', 'wartung', 'letzte'],
    answer: 'a',
    sourceDokumentIds: [],
  },
  {
    id: 'ueberfaellig',
    question: 'Was ist überfällig?',
    keywords: ['ueberfaellig', 'faellig'],
    answer: 'b',
    sourceDokumentIds: [],
  },
  {
    id: 'kosten',
    question: 'Was hat die Instandhaltung in den letzten 12 Monaten gekostet?',
    keywords: ['kosten', 'gekostet'],
    answer: 'c',
    sourceDokumentIds: [],
  },
];

describe('normalize', () => {
  it('folds umlauts, case and punctuation', () => {
    expect(normalize('  Überfällig?! ')).toBe('ueberfaellig');
    expect(normalize('Straße')).toBe('strasse');
  });
});

describe('matchIntent', () => {
  it.each(intents.map((i) => [i.question, i.id]))('matches the prepared question %s', (q, id) => {
    expect(matchIntent(q, intents)?.id).toBe(id);
  });
  it('matches case and umlaut variants', () => {
    expect(matchIntent('WANN WAR DIE HEIZUNG DRAN', intents)?.id).toBe('heizung');
    expect(matchIntent('was ist ueberfaellig', intents)?.id).toBe('ueberfaellig');
    expect(matchIntent('Was ist überfällig', intents)?.id).toBe('ueberfaellig');
  });
  it('prefers the intent with more keyword hits', () => {
    expect(matchIntent('Kosten: Was hat die Wartung gekostet?', intents)?.id).toBe('kosten');
  });
  it('returns undefined without a keyword hit', () => {
    expect(matchIntent('Wie wird das Wetter morgen?', intents)).toBeUndefined();
    expect(matchIntent('   ', intents)).toBeUndefined();
  });
});
