import { ArrowLeft, Building2, CalendarCheck, Check, Crown, FilePlus2, Share2 } from 'lucide-react';
import { lazy, Suspense, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Card, EmptyState, GewerkTile } from '@/components/scheckheft/base';
import { useOpenDokument } from '@/components/scheckheft/DocumentPreview';
import {
  CompanyHistory,
  DocumentList,
  DueItemCard,
  ObjektSummary,
} from '@/components/scheckheft/entries';
import { ShareFlow } from '@/components/scheckheft/ShareFlow';
import { NeuBadge } from '@/components/scheckheft/UpgradeModal';
import { Button, buttonClass } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/controls';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/pill';
import { statusByGewerk } from '@/domain/derive';
import { featureGate, planCovers } from '@/domain/featureGate';
import { buildGraph } from '@/domain/graph';
import { GEWERKE, type DueItem, type GraphNode } from '@/domain/types';
import { useT } from '@/i18n';
import { useStore } from '@/store';
import { allDokumente, allEntries, dueItems, effectivePlan, useFixtures } from '@/store/selectors';
import { UPLOAD_OBJEKT_ID } from '@/mocks/scenarios';
import { TerminSheet, UploadSheet } from '../mobile/sheets';
import { useUpgrade } from './EigentuemerLayout';

const Graph = lazy(() => import('@/components/scheckheft/Graph'));

type Tab = 'uebersicht' | 'historie' | 'dokumente' | 'graph';

export default function ObjektDetail() {
  const { objektId } = useParams();
  const [params, setParams] = useSearchParams();
  const fx = useFixtures();
  const s = useStore();
  const upgrade = useUpgrade();
  const t = useT();
  const ob = t.owner.objekt;
  const openDokument = useOpenDokument();
  const [shareOpen, setShareOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [terminItem, setTerminItem] = useState<DueItem | null>(null);
  const [terminOpen, setTerminOpen] = useState(false);

  const plan = effectivePlan(s);
  const objekt = fx.objekte.find(
    (o) => o.id === objektId && o.workspaceId === s.plan.activeOwnerWorkspace,
  );
  const graphAllowed = featureGate(plan, 'object_graph');
  const requested = params.get('tab') as Tab | null;
  const tab: Tab = requested && (requested !== 'graph' || graphAllowed) ? requested : 'uebersicht';

  const entries = useMemo(() => (objekt ? allEntries(s, fx, objekt.id) : []), [s, fx, objekt]);
  const anlagen = useMemo(() => fx.anlagen.filter((a) => a.objektId === objekt?.id), [fx, objekt]);
  const items = useMemo(() => (objekt ? dueItems(s, fx, [objekt.id]) : []), [s, fx, objekt]);
  const graph = useMemo(
    () =>
      objekt && graphAllowed
        ? buildGraph({
            scope: 'objekt',
            labels: { cost: t.graph.costNode, cares: t.graph.edgeCares, total: t.graph.edgeTotal },
            objekte: [objekt],
            anlagen,
            entries,
            betriebe: fx.betriebe,
            dueItems: items,
            relations: fx.relations,
            standaloneDocs: fx.standaloneDocs,
          })
        : { nodes: [], edges: [] },
    [objekt, graphAllowed, anlagen, entries, items, fx, t],
  );

  if (!objekt || !planCovers(plan, objekt.requiredPlan)) {
    return (
      <div className="pt-10">
        <EmptyState
          icon={Building2}
          title={ob.notInPlanTitle}
          text={ob.notInPlanText}
          action={
            <Link to="/eigentuemer" className={buttonClass('primary')}>
              {ob.toHome}
            </Link>
          }
        />
      </div>
    );
  }

  const status = statusByGewerk(items);
  const refs = allDokumente(entries, fx, objekt.id);
  const openNode = (node: GraphNode) => {
    if (!node.dokument) return;
    openDokument({
      dokument: node.dokument,
      entry: entries.find((e) => e.id === node.entryId),
      objektId: objekt.id,
    });
  };
  const selectTab = (value: string) => {
    if (value === 'graph' && !graphAllowed) {
      upgrade('object_graph');
      return;
    }
    setParams(value === 'uebersicht' ? {} : { tab: value }, { replace: true });
  };

  return (
    <div>
      <Link
        to="/eigentuemer"
        className="inline-flex min-h-[32px] items-center gap-1.5 text-[13px] text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {ob.back}
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 pt-1">
        <div className="min-w-0">
          <h1 className="text-[18px] font-semibold">{objekt.title}</h1>
          <p className="text-[13px] text-muted">
            {objekt.address.street}, {objekt.address.zip} {objekt.address.city} ·{' '}
            {t.owner.home.built(objekt.baujahr)} ·{' '}
            {objekt.nutzung === 'vermietet' ? t.owner.home.rented : t.owner.home.ownUse}
          </p>
          <ObjektSummary entries={entries} className="mt-2" />
        </div>
        <div className="flex flex-wrap gap-2">
          {objekt.id === UPLOAD_OBJEKT_ID && (
            <Button variant="outline" onClick={() => setUploadOpen(true)}>
              <FilePlus2 className="size-4" aria-hidden />
              {ob.addDocument}
            </Button>
          )}
          <Button onClick={() => setShareOpen(true)}>
            <Share2 className="size-4" aria-hidden />
            {ob.share}
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={selectTab}>
        <TabsList className="max-w-[560px]">
          <TabsTrigger value="uebersicht">{ob.tabOverview}</TabsTrigger>
          <TabsTrigger value="historie">{ob.tabHistory}</TabsTrigger>
          <TabsTrigger value="dokumente">{ob.tabDocuments}</TabsTrigger>
          <TabsTrigger value="graph">
            {ob.tabGraph}
            {graphAllowed ? (
              s.neu.includes('object_graph') && <NeuBadge pulse />
            ) : (
              <>
                <Crown className="size-3.5 text-gold-ink" aria-hidden />
                <span className="sr-only">{t.common.availableFrom(t.plan.advanced)}</span>
              </>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="uebersicht" className="mt-4">
          <div className="grid gap-4 @5xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <section aria-labelledby="due-heading">
                <h2 id="due-heading" className="mb-2 text-[15px] font-semibold">
                  {ob.dates}
                </h2>
                <ul className="grid gap-3 @3xl:grid-cols-2">
                  {items.map((item) => (
                    <li key={item.rule.id}>
                      <DueItemCard
                        item={item}
                        today={fx.today}
                        action={
                          item.requested ? (
                            <Badge tone="success" icon={<Check className="size-3" aria-hidden />}>
                              {t.owner.home.requested}
                            </Badge>
                          ) : item.status !== 'ok' ? (
                            <Button
                              size="sm"
                              onClick={() => {
                                setTerminItem(item);
                                setTerminOpen(true);
                              }}
                            >
                              <CalendarCheck className="size-4" aria-hidden />
                              {t.owner.home.request}
                            </Button>
                          ) : undefined
                        }
                      />
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            <div className="space-y-4">
              <Card className="p-4">
                <h2 className="mb-2 text-[15px] font-semibold">{ob.statusByTrade}</h2>
                <ul className="space-y-2">
                  {GEWERKE.map((g) => (
                    <li key={g}>
                      <GewerkTile gewerk={g} status={status[g]} />
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-4">
                <h2 className="mb-2 text-[15px] font-semibold">{ob.installations}</h2>
                <ul className="divide-y divide-line">
                  {anlagen.map((a) => (
                    <li key={a.id} className="py-2">
                      <p className="font-medium">{a.name}</p>
                      <p className="text-[13px] text-muted">
                        {[a.detail, a.einbaujahr && ob.since(a.einbaujahr)]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="historie" className="mt-4 max-w-[860px]">
          <CompanyHistory entries={entries} anlagen={anlagen} status={status} />
        </TabsContent>

        <TabsContent value="dokumente" className="mt-4 max-w-[860px]">
          <DocumentList refs={refs} />
        </TabsContent>

        <TabsContent value="graph" className="mt-4">
          {graphAllowed && (
            <Suspense fallback={<p className="p-6 text-[14px] text-muted">{ob.graphLoading}</p>}>
              <Graph graph={graph} onOpenDokument={openNode} />
            </Suspense>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-[460px]">
          <DialogTitle className="pr-10 text-[17px] font-semibold">
            {ob.share}
          </DialogTitle>
          <DialogDescription className="mb-4 text-[14px] text-muted">
            {ob.shareText}
          </DialogDescription>
          {shareOpen && (
            <ShareFlow
              objektId={objekt.id}
              pdf={{
                allowed: featureGate(plan, 'pdf_export'),
                onLocked: () => {
                  setShareOpen(false);
                  upgrade('pdf_export');
                },
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <UploadSheet
        anlagen={anlagen}
        today={fx.today}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />
      <TerminSheet
        item={terminItem}
        objekt={objekt}
        today={fx.today}
        open={terminOpen}
        onOpenChange={setTerminOpen}
      />
    </div>
  );
}
