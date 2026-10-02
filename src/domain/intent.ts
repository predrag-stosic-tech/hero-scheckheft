import type { Intent } from './types';

/** Lower-case, fold umlauts and strip punctuation so "Heizungs-Wartung?" matches "heizungswartung". */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Scripted matching for the prototype chat: the intent with the most keyword hits wins.
 * No keyword hit means no answer. Nothing is generated.
 */
export function matchIntent(question: string, intents: Intent[]): Intent | undefined {
  const q = normalize(question);
  if (!q) return undefined;
  let best: Intent | undefined;
  let bestScore = 0;
  for (const intent of intents) {
    if (normalize(intent.question) === q) return intent;
    const score = intent.keywords.filter((k) => q.includes(normalize(k))).length;
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }
  return best;
}
