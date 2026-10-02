import type { Feature, Plan } from './types';

const RANK: Record<Plan, number> = { kostenlos: 0, advanced: 1, pro: 2 };

/** Lowest plan that includes each gated feature. Ungated features are in every plan. */
export const FEATURE_PLAN: Record<Feature, Plan> = {
  multi_object: 'advanced',
  object_graph: 'advanced',
  pdf_export: 'advanced',
  portfolio: 'pro',
  dashboard: 'pro',
  portfolio_graph: 'pro',
  filters: 'pro',
  chat: 'pro',
  bulk_export: 'pro',
};

export function planCovers(plan: Plan, required: Plan): boolean {
  return RANK[plan] >= RANK[required];
}

export function featureGate(plan: Plan, feature: Feature): boolean {
  return planCovers(plan, FEATURE_PLAN[feature]);
}
