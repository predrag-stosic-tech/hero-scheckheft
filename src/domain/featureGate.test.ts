import { describe, expect, it } from 'vitest';
import { featureGate } from './featureGate';
import type { Feature, Plan } from './types';

const table: Array<[Feature, boolean, boolean, boolean]> = [
  ['multi_object', false, true, true],
  ['object_graph', false, true, true],
  ['pdf_export', false, true, true],
  ['portfolio', false, false, true],
  ['dashboard', false, false, true],
  ['portfolio_graph', false, false, true],
  ['filters', false, false, true],
  ['chat', false, false, true],
  ['bulk_export', false, false, true],
];
const plans: Plan[] = ['kostenlos', 'advanced', 'pro'];

describe('featureGate', () => {
  for (const [feature, ...expected] of table) {
    plans.forEach((plan, i) => {
      it(`${feature} on ${plan} → ${expected[i]}`, () => {
        expect(featureGate(plan, feature)).toBe(expected[i]);
      });
    });
  }
});
