import { addDays, format, parseISO } from 'date-fns';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { byDateDesc } from '@/domain/derive';
import { FEATURE_PLAN } from '@/domain/featureGate';
import { encodeShareToken } from '@/domain/shareToken';
import type {
  Benachrichtigung,
  BetriebWorkspaceId,
  Entry,
  Feature,
  OwnerWorkspaceId,
  Plan,
  ShareLink,
  SharePayload,
  ShareSection,
} from '@/domain/types';
import { getLang, useLangStore } from '@/i18n';
import { LANG_KEY } from '@/i18n/lang';
import { simulate } from '@/lib/simulate';
import { buildFixtures, todayISO } from '@/mocks';
import { S5_DEFAULTS, scenarioEntry, type ScenarioId } from '@/mocks/scenarios';
import {
  initialState,
  isDemoState,
  PERSIST_KEY,
  PERSIST_VERSION,
  type DemoState,
} from './initialState';

export interface Suggestion {
  title: string;
  anlageId: string;
  date: string;
  costCents: number;
  intervalMonths: number;
  betriebName: string;
}

interface Actions {
  completeEinreichung: (
    id: string,
    opts: { transfer: boolean; intervalMonths?: number },
  ) => Promise<void>;
  triggerScenario: (id: 's1-elektro' | 'shk-incoming') => Promise<void>;
  requestTermin: (ruleId: string) => Promise<void>;
  extractUpload: () => Promise<Suggestion>;
  acceptSuggestion: (edited: Suggestion) => void;
  createShareLink: (objektId: string, sections: ShareSection[], days: number) => Promise<ShareLink>;
  upgrade: (target: 'advanced' | 'pro') => Promise<void>;
  setPlan: (plan: Plan) => void;
  setActiveBetrieb: (id: BetriebWorkspaceId) => void;
  setActiveOwnerWorkspace: (id: OwnerWorkspaceId) => void;
  setPreviewVisible: (visible: boolean) => void;
  markNotificationsRead: (audience: Benachrichtigung['audience']) => void;
  resetDemo: () => void;
}

interface Transient {
  /** Features unlocked by the last upgrade; shown with a "Neu" pulse for a few seconds. */
  neu: Feature[];
}

export type Store = DemoState & Transient & Actions;

const NEU_MS = 6000;
let neuTimer: ReturnType<typeof setTimeout> | undefined;

const stamp = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}`;

/** Notifications store data, not text: the text is built in the UI language when shown. */
function notification(
  kind: Benachrichtigung['kind'],
  audience: Benachrichtigung['audience'],
  data: Pick<Benachrichtigung, 'entryId' | 'betriebName' | 'workspaceId' | 'ruleId'>,
): Benachrichtigung {
  return { id: uid(`n-${kind}`), kind, audience, createdAt: stamp(), read: false, ...data };
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,
      neu: [],

      async completeEinreichung(id, { transfer, intervalMonths }) {
        if (get().einreichungen.completed[id]) return;
        await simulate(900);
        const today = todayISO();
        const einreichung = buildFixtures(today).einreichungen.find((e) => e.id === id);
        if (!einreichung) return;
        // One write after the delay: a reload in between leaves nothing half-finished.
        set((s) => {
          if (s.einreichungen.completed[id]) return s;
          const scenarioId = einreichung.scenarioId;
          const canTransfer =
            transfer && !!scenarioId && !s.demo.activatedScenarios.includes(scenarioId);
          const entry = canTransfer
            ? scenarioEntry(scenarioId, today, { intervalMonths })
            : undefined;
          const betrieb = buildFixtures(today).betriebe.find((b) => b.id === einreichung.betriebId);
          return {
            einreichungen: {
              completed: {
                ...s.einreichungen.completed,
                [id]: { completedAt: stamp(), transferred: !!entry },
              },
            },
            entries: entry ? { added: [...s.entries.added, entry] } : s.entries,
            notifications: entry
              ? [
                  ...s.notifications,
                  notification('neuer_eintrag', 'owner', {
                    betriebName: betrieb?.name,
                    entryId: entry.id,
                  }),
                ]
              : s.notifications,
            demo: entry
              ? { ...s.demo, activatedScenarios: [...s.demo.activatedScenarios, scenarioId!] }
              : s.demo,
          };
        });
      },

      async triggerScenario(id) {
        if (get().demo.activatedScenarios.includes(id)) return;
        if (id === 's1-elektro') {
          await get().completeEinreichung('e-elektro-linden', { transfer: true });
          return;
        }
        await simulate(900);
        const entry = scenarioEntry(id, todayISO());
        if (!entry) return;
        set((s) => {
          if (s.demo.activatedScenarios.includes(id)) return s;
          return {
            entries: { added: [...s.entries.added, entry] },
            notifications: [
              ...s.notifications,
              notification('neuer_eintrag', 'owner', {
                betriebName: entry.betriebName,
                entryId: entry.id,
              }),
            ],
            // The visit answers an open appointment request for the same work.
            termine: {
              requests: s.termine.requests.map((r) =>
                r.ruleId === entry.ruleId && r.status === 'offen'
                  ? { ...r, status: 'erledigt' as const }
                  : r,
              ),
            },
            demo: { ...s.demo, activatedScenarios: [...s.demo.activatedScenarios, id] },
          };
        });
      },

      async requestTermin(ruleId) {
        const isOpen = () =>
          get().termine.requests.some((r) => r.ruleId === ruleId && r.status === 'offen');
        if (isOpen()) return;
        await simulate(700);
        const fx = buildFixtures(todayISO());
        const rule = fx.rules.find((r) => r.id === ruleId);
        const anlage = fx.anlagen.find((a) => a.id === rule?.anlageId);
        if (!rule || !anlage) return;
        set((s) => {
          if (s.termine.requests.some((r) => r.ruleId === ruleId && r.status === 'offen')) return s;
          const last = [...fx.entries, ...s.entries.added]
            .filter((e) => e.ruleId === ruleId)
            .sort(byDateDesc)[0];
          const betrieb = fx.betriebe.find((b) => b.id === last?.betriebId);
          const objekt = fx.objekte.find((o) => o.id === anlage.objektId);
          const notify =
            betrieb?.hasWorkspace === true
              ? [
                  notification('terminanfrage', betrieb.id as BetriebWorkspaceId, {
                    workspaceId: objekt?.workspaceId,
                    ruleId,
                  }),
                ]
              : [];
          return {
            termine: {
              requests: [
                ...s.termine.requests,
                {
                  id: uid('t'),
                  ruleId,
                  anlageId: anlage.id,
                  objektId: anlage.objektId,
                  betriebId: betrieb?.id,
                  requestedAt: stamp(),
                  status: 'offen' as const,
                },
              ],
            },
            notifications: [...s.notifications, ...notify],
          };
        });
      },

      async extractUpload() {
        // Nothing is read from the image: every upload leads to the same prepared suggestion.
        await simulate(1200);
        const date = format(addDays(parseISO(todayISO()), -S5_DEFAULTS.daysAgo), 'yyyy-MM-dd');
        return {
          title: scenarioEntry('s5-upload', date, {}, getLang())!.title,
          anlageId: S5_DEFAULTS.anlageId,
          date,
          costCents: S5_DEFAULTS.costCents,
          intervalMonths: S5_DEFAULTS.intervalMonths,
          betriebName: S5_DEFAULTS.betriebName,
        };
      },

      acceptSuggestion(edited) {
        const id: ScenarioId = 's5-upload';
        set((s) => {
          if (s.demo.activatedScenarios.includes(id)) return s;
          const entry = scenarioEntry(id, edited.date, {
            anlageId: edited.anlageId,
            costCents: edited.costCents,
            intervalMonths: edited.intervalMonths,
          });
          if (!entry) return s;
          return {
            entries: { added: [...s.entries.added, entry] },
            demo: { ...s.demo, activatedScenarios: [...s.demo.activatedScenarios, id] },
          };
        });
      },

      async createShareLink(objektId, sections, days) {
        await simulate(700);
        const createdAt = todayISO();
        const expiresAt = format(addDays(parseISO(createdAt), days), 'yyyy-MM-dd');
        const added: Entry[] = get().entries.added.filter((e) => e.objektId === objektId);
        const payload: SharePayload = {
          v: 1,
          o: objektId,
          s: sections,
          c: createdAt,
          e: expiresAt,
          x: added.map((e) => ({
            k: e.id,
            d: e.date,
            ...(e.intervalMonths !== undefined ? { i: e.intervalMonths } : {}),
            ...(e.origin === 'upload' ? { f: { a: e.anlageId, c: e.costCents } } : {}),
          })),
        };
        const link: ShareLink = {
          token: encodeShareToken(payload),
          objektId,
          sections,
          createdAt,
          expiresAt,
        };
        set((s) => ({ shareLinks: [...s.shareLinks, link] }));
        return link;
      },

      async upgrade(target) {
        await simulate(1200);
        const unlocked = (Object.keys(FEATURE_PLAN) as Feature[]).filter(
          (f) => FEATURE_PLAN[f] === target,
        );
        set((s) => ({
          plan:
            target === 'advanced'
              ? { ...s.plan, familyPlan: 'advanced' }
              : {
                  familyPlan: 'advanced',
                  proReached: true,
                  activeOwnerWorkspace: 'rheinblick',
                },
          neu: unlocked,
        }));
        clearTimeout(neuTimer);
        neuTimer = setTimeout(() => set({ neu: [] }), NEU_MS);
      },

      setPlan(plan) {
        set(() => ({
          plan:
            plan === 'pro'
              ? { familyPlan: 'advanced', proReached: true, activeOwnerWorkspace: 'rheinblick' }
              : { familyPlan: plan, proReached: false, activeOwnerWorkspace: 'familie-schneider' },
          neu: [],
        }));
      },

      setActiveBetrieb(id) {
        set((s) => ({ demo: { ...s.demo, activeBetrieb: id } }));
      },
      setActiveOwnerWorkspace(id) {
        set((s) => ({ plan: { ...s.plan, activeOwnerWorkspace: id } }));
      },
      setPreviewVisible(visible) {
        set((s) => ({ demo: { ...s.demo, previewVisible: visible } }));
      },
      markNotificationsRead(audience) {
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.audience === audience ? { ...n, read: true } : n,
          ),
        }));
      },
      resetDemo() {
        clearTimeout(neuTimer);
        set({ ...initialState, neu: [] });
      },
    }),
    {
      name: PERSIST_KEY,
      version: PERSIST_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s): DemoState => ({
        plan: s.plan,
        entries: s.entries,
        einreichungen: s.einreichungen,
        termine: s.termine,
        shareLinks: s.shareLinks,
        notifications: s.notifications,
        demo: s.demo,
      }),
      // A payload from another version of the prototype is discarded, not migrated.
      migrate: () => initialState,
      merge: (persisted, current) =>
        isDemoState(persisted) ? { ...current, ...persisted } : { ...current, ...initialState },
    },
  ),
);

/**
 * Keeps frames and tabs in step: the phone preview is an iframe of /m and follows every
 * write made in the Betrieb view through the browser's storage event.
 */
export function startStorageSync(): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === PERSIST_KEY || e.key === null) void useStore.persist.rehydrate();
    if (e.key === LANG_KEY || e.key === null) void useLangStore.persist.rehydrate();
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}
