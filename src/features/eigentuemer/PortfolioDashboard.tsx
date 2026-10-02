import {
  Building2,
  CalendarClock,
  Check,
  Clock,
  Coins,
  FolderDown,
  LoaderCircle,
  TriangleAlert,
} from 'lucide-react';
import { lazy, Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Card,
  dueToGewerkStatus,
  GewerkStatusPill,
  PillFilter,
  StatTile,
} from '@/components/scheckheft/base';
import { useOpenDokument } from '@/components/scheckheft/DocumentPreview';
import { NeuBadge } from '@/components/scheckheft/UpgradeModal';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { buildGraph } from '@/domain/graph';
import { GEWERKE, type DueStatus, type Gewerk, type GraphNode } from '@/domain/types';
import { useT, type Dict } from '@/i18n';
import { formatDue, formatEuro } from '@/lib/format';
import { simulate } from '@/lib/simulate';
import { useStore } from '@/store';
import {
  allDokumente,
  allEntries,
  dueItems,
  portfolioStats,
  useFixtures,
  visibleObjekte,
} from '@/store/selectors';

type GewerkFilter = Gewerk | 'alle';
type StatusFilter = DueStatus | 'alle';

const statusOptions = (t: Dict): Array<{ value: StatusFilter; label: string }> => [
  { value: 'alle', label: t.common.all },
  { value: 'overdue', label: t.owner.portfolio.overdue },
  { value: 'due30', label: t.owner.portfolio.due30 },
  { value: 'due90', label: t.owner.portfolio.due90 },
];

function Filters({
  gewerk,
  status,
  onGewerk,
  onStatus,
}: {
  gewerk: GewerkFilter;
  status: StatusFilter;
  onGewerk: (g: GewerkFilter) => void;
  onStatus: (s: StatusFilter) => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <PillFilter<GewerkFilter>
        label={t.owner.portfolio.filterTrade}
        value={gewerk}
        onChange={onGewerk}
        options={[
          { value: 'alle', label: t.owner.portfolio.allTrades },
          ...GEWERKE.map((g) => ({ value: g, label: t.gewerk[g] })),
        ]}
      />
      <PillFilter<StatusFilter>
        label={t.owner.portfolio.filterDue}
        value={status}
        onChange={onStatus}
        options={statusOptions(t)}
      />
    </div>
  );
}

function BulkExport({ count, docs }: { count: number; docs: number }) {
  const t = useT();
  const p = t.owner.portfolio;
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const start = async () => {
    setDone(false);
    setOpen(true);
    await simulate(1400);
    setDone(true);
  };
  return (
    <>
      <Button variant="outline" onClick={start}>
        <FolderDown className="size-4" aria-hidden />
        {p.bulk}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[440px]">
          <DialogTitle className="pr-10 text-[17px] font-semibold">{p.bulk}</DialogTitle>
          <DialogDescription className="text-[14px] text-muted">
            {p.bulkSub}
          </DialogDescription>
          {done ? (
            <div className="mt-4">
              <p className="flex items-center gap-2 font-medium">
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-success-bg text-success">
                  <Check className="size-4" aria-hidden />
                </span>
                {p.bulkReady}
              </p>
              <ul className="mt-3 space-y-1 text-[14px]">
                <li>{p.bulkObjects(count)}</li>
                <li>{p.bulkDocs(docs)}</li>
                <li>{p.bulkDates}</li>
              </ul>
              <p className="mt-3 rounded-control bg-tint p-3 text-[13px] text-muted">
                {p.bulkNote}
              </p>
            </div>
          ) : (
            <p role="status" className="mt-5 flex items-center gap-2.5 text-[14px]">
              <LoaderCircle className="size-5 animate-spin" aria-hidden />
              {p.bulkLoading}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Home of the Pro workspace: portfolio overview with filters, costs and bulk export. */
export default function PortfolioDashboard() {
  const t = useT();
  const pt = t.owner.portfolio;
  const fx = useFixtures();
  const s = useStore();
  const [gewerk, setGewerk] = useState<GewerkFilter>('alle');
  const [status, setStatus] = useState<StatusFilter>('alle');
  const objekte = visibleObjekte(fx, 'rheinblick', 'pro');
  const stats = portfolioStats(s, fx, objekte);
  const matches = (i: { anlage: { gewerk: Gewerk }; status: DueStatus }) =>
    (gewerk === 'alle' || i.anlage.gewerk === gewerk) && (status === 'alle' || i.status === status);
  const rows = stats.perObjekt
    .map((p) => ({ ...p, shown: p.items.filter(matches) }))
    .filter((p) => (gewerk === 'alle' && status === 'alle' ? true : p.shown.length > 0));
  const docs = allDokumente(allEntries(s, fx), fx).filter((r) =>
    rows.some((row) => row.objekt.id === r.objektId),
  ).length;
  const neu = s.neu.includes('dashboard');

  return (
    <div className="space-y-4">
      <PageHeader
        title={pt.title}
        subtitle={pt.subtitle(objekte.length)}
        actions={<BulkExport count={rows.length} docs={docs} />}
      />
      <Card className="p-4">
        <h2 className="mb-2.5 flex items-center gap-2 text-[15px] font-semibold">
          {pt.overview}
          {neu && <NeuBadge pulse />}
        </h2>
        <div className="grid grid-cols-2 gap-2 @2xl:grid-cols-4">
          <StatTile icon={TriangleAlert} label={pt.overdue} value={stats.overdue} tone="danger" />
          <StatTile icon={Clock} label={pt.due30} value={stats.due30} tone="warn" />
          <StatTile
            icon={CalendarClock}
            label={pt.due90}
            value={stats.due90}
            tone="info"
          />
          <StatTile
            icon={Coins}
            label={pt.totalCost}
            value={formatEuro(stats.totalCostCents)}
            tone="gold"
          />
        </div>
      </Card>

      <Filters gewerk={gewerk} status={status} onGewerk={setGewerk} onStatus={setStatus} />

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <p className="p-5 text-[14px] text-muted">{pt.none}</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map(({ objekt, costCents, shown }) => {
              const next = shown[0];
              return (
                <li key={objekt.id}>
                  <Link
                    to={`/eigentuemer/objekte/${objekt.id}`}
                    className="grid items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-tint @3xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)_120px]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-[8px] bg-tint"
                        aria-hidden
                      >
                        <Building2 className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{objekt.address.street}</span>
                        <span className="block truncate text-[13px] text-muted">
                          {objekt.address.zip} {objekt.address.city} · {objekt.title}
                        </span>
                      </span>
                    </span>
                    <span className="flex min-w-0 flex-wrap items-center gap-2 text-[13px]">
                      {next ? (
                        <>
                          <GewerkStatusPill status={dueToGewerkStatus(next.status)} />
                          <span className="truncate">
                            {next.rule.title} · {formatDue(next.dueDate, fx.today)}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted">{pt.noDates}</span>
                      )}
                    </span>
                    <span className="text-[13px] tabular-nums @3xl:text-right">
                      <span className="text-muted @3xl:hidden">{pt.costLabel}</span>
                      {formatEuro(costCents)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

const Graph = lazy(() => import('@/components/scheckheft/Graph'));

/** Cross-object graph of the Pro workspace with filters by Gewerk and due status. */
export function PortfolioGraph() {
  const t = useT();
  const pt = t.owner.portfolio;
  const fx = useFixtures();
  const s = useStore();
  const openDokument = useOpenDokument();
  const [gewerk, setGewerk] = useState<GewerkFilter>('alle');
  const [status, setStatus] = useState<StatusFilter>('alle');
  const objekte = useMemo(() => visibleObjekte(fx, 'rheinblick', 'pro'), [fx]);
  const entries = useMemo(() => allEntries(s, fx), [s, fx]);
  const graph = useMemo(
    () =>
      buildGraph({
        scope: 'portfolio',
        labels: { cost: t.graph.costNode, cares: t.graph.edgeCares, total: t.graph.edgeTotal },
        objekte,
        anlagen: fx.anlagen,
        entries,
        betriebe: fx.betriebe,
        dueItems: dueItems(
          s,
          fx,
          objekte.map((o) => o.id),
        ),
        relations: [],
        standaloneDocs: [],
        filter: {
          gewerk: gewerk === 'alle' ? undefined : gewerk,
          status: status === 'alle' ? undefined : status,
        },
      }),
    [objekte, entries, fx, s, gewerk, status, t],
  );
  const openNode = (node: GraphNode) => {
    const entry = entries.find((e) => e.id === node.entryId);
    if (node.dokument && entry) {
      openDokument({ dokument: node.dokument, entry, objektId: entry.objektId });
    }
  };

  return (
    <div className="space-y-3">
      <PageHeader
        title={pt.graphTitle}
        subtitle={pt.graphSub}
      />
      <Filters gewerk={gewerk} status={status} onGewerk={setGewerk} onStatus={setStatus} />
      <p className="text-[13px] text-muted">
        {pt.graphCounts(
          graph.nodes.filter((n) => n.kind === 'objekt').length,
          graph.nodes.filter((n) => n.kind === 'anlage').length,
          graph.edges.length,
        )}
      </p>
      <Suspense fallback={<p className="p-6 text-[14px] text-muted">{t.graph.loading}</p>}>
        <Graph graph={graph} onOpenDokument={openNode} height={680} compact />
      </Suspense>
    </div>
  );
}
