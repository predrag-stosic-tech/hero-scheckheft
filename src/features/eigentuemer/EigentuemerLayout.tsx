import {
  BookCheck,
  Building2,
  CalendarDays,
  Database,
  FileDown,
  FolderDown,
  House,
  LayoutDashboard,
  LayoutPanelTop,
  MessagesSquare,
  Waypoints,
  type LucideIcon,
} from 'lucide-react';
import { createContext, useContext, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { DocumentPreviewProvider } from '@/components/scheckheft/DocumentPreview';
import { NeuBadge, UpgradeModal, type Illustration } from '@/components/scheckheft/UpgradeModal';
import { AppShell, type NavItem } from '@/components/shell/AppShell';
import { FEATURE_PLAN, featureGate } from '@/domain/featureGate';
import type { Feature } from '@/domain/types';
import { useT, type Dict } from '@/i18n';
import { useIncomingToasts } from '@/lib/hooks';
import { useStore } from '@/store';
import { effectivePlan, useFixtures, visibleObjekte } from '@/store/selectors';

interface Copy {
  icon: LucideIcon;
  /** Which text of `t.owner.upgrade` to show. */
  text: keyof Dict['owner']['upgrade'];
  illustration: Illustration;
}

const COPY: Record<Feature, Copy> = {
  multi_object: { icon: Building2, text: 'multi_object', illustration: 'cards' },
  object_graph: { icon: Waypoints, text: 'object_graph', illustration: 'graph' },
  pdf_export: { icon: FileDown, text: 'pdf_export', illustration: 'cards' },
  portfolio: { icon: LayoutDashboard, text: 'portfolio', illustration: 'portfolio' },
  dashboard: { icon: LayoutDashboard, text: 'portfolio', illustration: 'portfolio' },
  portfolio_graph: { icon: Waypoints, text: 'portfolio_graph', illustration: 'graph' },
  filters: { icon: Waypoints, text: 'portfolio_graph', illustration: 'graph' },
  chat: { icon: MessagesSquare, text: 'chat', illustration: 'chat' },
  bulk_export: { icon: FolderDown, text: 'bulk_export', illustration: 'portfolio' },
};

const UpgradeCtx = createContext<(feature: Feature) => void>(() => undefined);
/** Opens the upgrade modal for a locked feature. */
export const useUpgrade = () => useContext(UpgradeCtx);

export default function EigentuemerLayout() {
  const t = useT();
  const o = t.owner;
  const fx = useFixtures();
  const s = useStore();
  const navigate = useNavigate();
  const [feature, setFeature] = useState<Feature | null>(null);
  const [shown, setShown] = useState<Feature>('multi_object');

  useIncomingToasts('owner');

  const plan = effectivePlan(s);
  const workspaceId = s.plan.activeOwnerWorkspace;
  const workspace = fx.workspaces.find((w) => w.id === workspaceId)!;
  const objekte = visibleObjekte(fx, workspaceId, plan);
  const isNeu = (f: Feature) => s.neu.includes(f);

  const request = (f: Feature) => {
    setShown(f);
    setFeature(f);
  };

  const gated = (item: NavItem, f: Feature): NavItem =>
    featureGate(plan, f)
      ? { ...item, badge: isNeu(f) ? <NeuBadge pulse /> : undefined }
      : {
          ...item,
          to: undefined,
          onLockedClick: () => request(f),
          lockedLabel: t.common.availableFrom(t.plan[FEATURE_PLAN[f]]),
        };

  const nav: NavItem[] = [
    { label: o.nav.startseite, icon: House, to: '/eigentuemer', end: true },
    {
      label: o.nav.scheckheft,
      icon: BookCheck,
      children: [
        { label: o.nav.kalender, icon: CalendarDays, to: '/eigentuemer/kalender' },
        gated({ label: o.nav.graph, icon: Waypoints, to: '/eigentuemer/graph' }, 'portfolio_graph'),
        gated(
          { label: o.nav.frag, icon: MessagesSquare, to: '/eigentuemer/frag' },
          'chat',
        ),
      ],
    },
    { label: o.nav.protokolle, icon: LayoutPanelTop, to: '/eigentuemer/protokolle' },
    { label: o.nav.datenbanken, icon: Database, to: '/eigentuemer/datenbanken' },
  ];

  const target = FEATURE_PLAN[shown] === 'pro' ? 'pro' : 'advanced';
  const copy = COPY[shown];
  const limit = plan === 'kostenlos' ? 1 : plan === 'advanced' ? 5 : objekte.length;

  const workspaces = [
    {
      id: 'familie-schneider',
      name: fx.workspaces[0].name,
      sub: t.plan[s.plan.familyPlan],
      initials: 'FS',
      active: workspaceId === 'familie-schneider',
      onSelect: () => {
        s.setActiveOwnerWorkspace('familie-schneider');
        navigate('/eigentuemer');
      },
    },
    // The Pro workspace is listed once Pro has been reached.
    ...(s.plan.proReached
      ? [
          {
            id: 'rheinblick',
            name: 'Rheinblick Hausverwaltung',
            sub: 'Pro',
            initials: 'RH',
            active: workspaceId === 'rheinblick',
            onSelect: () => {
              s.setActiveOwnerWorkspace('rheinblick');
              navigate('/eigentuemer');
            },
          },
        ]
      : []),
  ];

  return (
    <UpgradeCtx.Provider value={request}>
      <DocumentPreviewProvider>
        <div className="flex h-dvh">
          <AppShell
            nav={nav}
            workspaceGroupLabel={o.workspaces}
            workspaces={workspaces}
            planCard={{
              title: o.planTitle(t.plan[plan], plan === 'kostenlos'),
              usageLabel: o.usage,
              usageValue: plan === 'pro' ? `${objekte.length}` : `${objekte.length}/${limit}`,
              progress: objekte.length / limit,
              footnote:
                plan === 'kostenlos'
                  ? o.footFree
                  : plan === 'advanced'
                    ? o.footAdvanced
                    : o.footPro,
              onUpgrade:
                plan === 'pro'
                  ? undefined
                  : () => request(plan === 'kostenlos' ? 'multi_object' : 'portfolio'),
            }}
            user={
              workspaceId === 'rheinblick'
                ? { name: 'Jana Oberheim', initials: 'JO' }
                : { name: 'Anna Schneider', initials: 'AS' }
            }
          >
            <Outlet context={{ workspace }} />
          </AppShell>
        </div>
        <UpgradeModal
          open={feature !== null}
          onOpenChange={(o) => !o && setFeature(null)}
          icon={copy.icon}
          title={o.upgrade[copy.text].title}
          text={o.upgrade[copy.text].text}
          illustration={copy.illustration}
          availability={target === 'pro' ? o.availPro : o.availAdvanced}
          ctaLabel={o.cta(t.plan[target])}
          onConfirm={async () => {
            await s.upgrade(target);
            // Pro is shown in the Rheinblick workspace; its home is the portfolio.
            if (target === 'pro') navigate('/eigentuemer');
          }}
        />
      </DocumentPreviewProvider>
    </UpgradeCtx.Provider>
  );
}
