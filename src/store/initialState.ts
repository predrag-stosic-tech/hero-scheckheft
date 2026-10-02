import type {
  Benachrichtigung,
  BetriebWorkspaceId,
  Entry,
  OwnerWorkspaceId,
  ShareLink,
  Terminanfrage,
} from '@/domain/types';

export const PERSIST_KEY = 'hero-scheckheft';
// Version 2: notifications store data instead of German text.
export const PERSIST_VERSION = 2;

/** Everything that happened during the demo. Fixtures are never stored here. */
export interface DemoState {
  plan: {
    familyPlan: 'kostenlos' | 'advanced';
    proReached: boolean;
    activeOwnerWorkspace: OwnerWorkspaceId;
  };
  entries: { added: Entry[] };
  einreichungen: { completed: Record<string, { completedAt: string; transferred: boolean }> };
  termine: { requests: Terminanfrage[] };
  shareLinks: ShareLink[];
  notifications: Benachrichtigung[];
  demo: {
    activeBetrieb: BetriebWorkspaceId;
    previewVisible: boolean;
    activatedScenarios: string[];
  };
}

export const initialState: DemoState = {
  plan: { familyPlan: 'kostenlos', proReached: false, activeOwnerWorkspace: 'familie-schneider' },
  entries: { added: [] },
  einreichungen: { completed: {} },
  termine: { requests: [] },
  shareLinks: [],
  notifications: [],
  demo: { activeBetrieb: 'elektro-stosic', previewVisible: true, activatedScenarios: [] },
};

/** Guards against an unreadable or foreign payload under our storage key. */
export function isDemoState(value: unknown): value is DemoState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const obj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null;
  return (
    obj(v.plan) &&
    obj(v.entries) &&
    Array.isArray((v.entries as Record<string, unknown>).added) &&
    obj(v.einreichungen) &&
    obj((v.einreichungen as Record<string, unknown>).completed) &&
    obj(v.termine) &&
    Array.isArray((v.termine as Record<string, unknown>).requests) &&
    Array.isArray(v.shareLinks) &&
    Array.isArray(v.notifications) &&
    obj(v.demo) &&
    Array.isArray((v.demo as Record<string, unknown>).activatedScenarios)
  );
}
