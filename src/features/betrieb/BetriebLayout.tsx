import { addDays, format, parseISO } from 'date-fns';
import {
  BookCheck,
  CalendarDays,
  ChartNoAxesGantt,
  Database,
  Hash,
  House,
  Inbox,
  LayoutGrid,
  LayoutPanelTop,
  MessageSquare,
  SquareCheckBig,
} from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router';
import { toast } from 'sonner';
import { DocumentPreviewProvider } from '@/components/scheckheft/DocumentPreview';
import { NeuBadge, UpgradeModal } from '@/components/scheckheft/UpgradeModal';
import { AppShell, type NavItem } from '@/components/shell/AppShell';
import type { BetriebWorkspaceId } from '@/domain/types';
import { useT } from '@/i18n';
import { formatDayMonthShort } from '@/lib/format';
import { useIncomingToasts, useMediaQuery } from '@/lib/hooks';
import { useStore } from '@/store';
import { useFixtures } from '@/store/selectors';
import { PhonePreview, PREVIEW_MIN_WIDTH } from '../demo/PhonePreview';

export const BETRIEB_USER: Record<BetriebWorkspaceId, { name: string; initials: string }> = {
  'elektro-stosic': { name: 'Milan Stosic', initials: 'MS' },
  'shk-becker': { name: 'Tim Becker', initials: 'TB' },
};

export default function BetriebLayout() {
  const fx = useFixtures();
  const activeBetrieb = useStore((s) => s.demo.activeBetrieb);
  const previewVisible = useStore((s) => s.demo.previewVisible);
  const completed = useStore((s) => s.einreichungen.completed);
  const setActiveBetrieb = useStore((s) => s.setActiveBetrieb);
  const wide = useMediaQuery(`(min-width: ${PREVIEW_MIN_WIDTH}px)`);
  const [heroOpen, setHeroOpen] = useState(false);
  const t = useT();
  const n = t.betrieb.nav;

  // Appointment requests from owners arrive as a toast in the company's view.
  useIncomingToasts(activeBetrieb);

  const nav: NavItem[] = [
    { label: n.startseite, icon: House, to: '/betrieb', end: true },
    { label: n.einreichungen, icon: Inbox, to: '/betrieb/einreichungen' },
    {
      label: n.aufgaben,
      icon: SquareCheckBig,
      children: [
        { label: n.kalender, icon: CalendarDays, to: '/betrieb/kalender' },
        {
          label: n.einsatzplanung,
          icon: ChartNoAxesGantt,
          onLockedClick: () => setHeroOpen(true),
          lockedLabel: t.betrieb.heroLocked,
        },
        { label: n.board, icon: LayoutGrid, to: '/betrieb/board' },
      ],
    },
    {
      label: n.chat,
      icon: MessageSquare,
      children: [{ label: n.allgemein, icon: Hash, to: '/betrieb/chat' }],
    },
    { label: n.protokolle, icon: LayoutPanelTop, to: '/betrieb/protokolle' },
    { label: n.datenbanken, icon: Database, to: '/betrieb/datenbanken' },
    { label: n.scheckheft, icon: BookCheck, to: '/betrieb/scheckheft', badge: <NeuBadge /> },
  ];

  const used = fx.einreichungen.filter(
    (e) => e.betriebId === activeBetrieb && completed[e.id],
  ).length;
  const renewal = formatDayMonthShort(format(addDays(parseISO(fx.today), 29), 'yyyy-MM-dd'));

  return (
    <DocumentPreviewProvider>
      <div className="flex h-dvh">
        <AppShell
          nav={nav}
          workspaceGroupLabel={t.betrieb.workspaces}
          workspaces={fx.betriebe
            .filter((b) => b.hasWorkspace)
            .map((b) => ({
              id: b.id,
              name: b.name,
              sub: t.betrieb.planSub,
              initials: b.initials,
              active: b.id === activeBetrieb,
              onSelect: () => setActiveBetrieb(b.id as BetriebWorkspaceId),
            }))}
          planCard={{
            title: t.betrieb.freePlan,
            usageLabel: t.betrieb.usedSubmissions,
            usageValue: `${used}/10`,
            progress: used / 10,
            footnote: (
              <>
                {t.betrieb.renewal} <span className="font-semibold text-ink">{renewal}</span>
              </>
            ),
            onUpgrade: () => setHeroOpen(true),
          }}
          user={BETRIEB_USER[activeBetrieb]}
        >
          <Outlet />
        </AppShell>
        {wide && previewVisible && <PhonePreview />}
      </div>
      <UpgradeModal
        open={heroOpen}
        onOpenChange={setHeroOpen}
        icon={ChartNoAxesGantt}
        title={t.betrieb.hero.title}
        text={t.betrieb.hero.text}
        availability={t.betrieb.hero.availability}
        ctaLabel={t.betrieb.hero.cta}
        loadingText={t.betrieb.hero.loading}
        onConfirm={() => {
          toast(t.betrieb.hero.notInDemo);
        }}
      />
    </DocumentPreviewProvider>
  );
}
