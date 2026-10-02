import {
  Bell,
  BellOff,
  Building2,
  CalendarCheck,
  Check,
  ChevronRight,
  LayoutDashboard,
  MessagesSquare,
  Waypoints,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Card, GewerkStatusPill } from '@/components/scheckheft/base';
import { DueItemCard, ObjektSummary } from '@/components/scheckheft/entries';
import { LockedFeature, NeuBadge } from '@/components/scheckheft/UpgradeModal';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/pill';
import { gewerkStatus } from '@/domain/due';
import { featureGate } from '@/domain/featureGate';
import type { DueItem } from '@/domain/types';
import { useT } from '@/i18n';
import { formatDue } from '@/lib/format';
import { notificationText } from '@/lib/notifications';
import { useStore } from '@/store';
import {
  allEntries,
  dueItems,
  effectivePlan,
  lockedObjekte,
  useFixtures,
  visibleObjekte,
} from '@/store/selectors';
import { TerminSheet } from '../mobile/sheets';
import { useUpgrade } from './EigentuemerLayout';
import PortfolioDashboard from './PortfolioDashboard';

export default function ScheckheftHome() {
  const fx = useFixtures();
  const s = useStore();
  const upgrade = useUpgrade();
  const t = useT();
  const h = t.owner.home;
  const [terminItem, setTerminItem] = useState<DueItem | null>(null);
  const [terminOpen, setTerminOpen] = useState(false);

  if (s.plan.activeOwnerWorkspace === 'rheinblick') return <PortfolioDashboard />;

  const plan = effectivePlan(s);
  const objekte = visibleObjekte(fx, 'familie-schneider', plan);
  const locked = lockedObjekte(fx, 'familie-schneider', plan);
  const items = dueItems(
    s,
    fx,
    objekte.map((o) => o.id),
  );
  const next = items.filter((i) => i.status !== 'ok').slice(0, 4);
  const notifications = s.notifications.filter((n) => n.audience === 'owner').reverse();
  const graphOpen = featureGate(plan, 'object_graph');
  const terminObjekt = objekte.find((o) => o.id === terminItem?.objektId) ?? objekte[0];

  return (
    <div className="space-y-4">
      <PageHeader
        title={h.title}
        subtitle={h.subtitle}
      />

      <div className="grid gap-4 @5xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <section aria-labelledby="objekte-heading">
            <h2 id="objekte-heading" className="mb-2 text-[15px] font-semibold">
              {h.yourObjects}
            </h2>
            <div className="grid gap-3 @3xl:grid-cols-2">
              {objekte.map((o) => {
                const own = items.filter((i) => i.objektId === o.id);
                const nextItem = own[0];
                return (
                  <Link
                    key={o.id}
                    to={`/eigentuemer/objekte/${o.id}`}
                    data-objekt={o.id}
                    className="block rounded-card border border-line bg-white p-4 shadow-card hover:bg-sidebar"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 font-semibold">
                          <Building2 className="size-4 shrink-0" aria-hidden />
                          {o.title}
                          {o.requiredPlan === 'advanced' && s.neu.includes('multi_object') && (
                            <NeuBadge pulse />
                          )}
                        </p>
                        <p className="text-[13px] text-muted">
                          {o.address.street}, {o.address.zip} {o.address.city} · {h.built(o.baujahr)}
                          {o.nutzung === 'vermietet' ? ` · ${h.rented}` : ''}
                        </p>
                        <ObjektSummary entries={allEntries(s, fx, o.id)} className="mt-2" />
                      </div>
                      <GewerkStatusPill status={gewerkStatus(own)} />
                    </div>
                    {nextItem && (
                      <p className="mt-3 text-[13px]">
                        <span className="text-muted">{h.next}</span>
                        {nextItem.rule.title} · {formatDue(nextItem.dueDate, fx.today)}
                      </p>
                    )}
                    <p className="mt-2 flex items-center gap-1 text-[13px] font-medium">
                      {h.open}
                      <ChevronRight className="size-4" aria-hidden />
                    </p>
                  </Link>
                );
              })}
              {locked.map((o) => (
                <LockedFeature
                  key={o.id}
                  icon={Building2}
                  title={h.addObject}
                  text={h.example(o.title)}
                  planLabel={t.plan.advanced}
                  onUnlock={() => upgrade('multi_object')}
                />
              ))}
            </div>
          </section>

          <section aria-labelledby="next-heading">
            <h2 id="next-heading" className="mb-2 text-[15px] font-semibold">
              {h.nextDue}
            </h2>
            {next.length === 0 ? (
              <Card className="flex items-center gap-3 p-4">
                <Check className="size-5" aria-hidden />
                <p>In den nächsten 90 Tagen steht nichts an.</p>
              </Card>
            ) : (
              <ul className="grid gap-3 @3xl:grid-cols-2">
                {next.map((item) => (
                  <li key={item.rule.id}>
                    <DueItemCard
                      item={item}
                      today={fx.today}
                      objektLabel={
                        objekte.length > 1
                          ? objekte.find((o) => o.id === item.objektId)?.address.street
                          : undefined
                      }
                      action={
                        item.requested ? (
                          <Badge tone="success" icon={<Check className="size-3" aria-hidden />}>
                            {h.requested}
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              setTerminItem(item);
                              setTerminOpen(true);
                            }}
                          >
                            <CalendarCheck className="size-4" aria-hidden />
                            {h.request}
                          </Button>
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="mehr-heading">
            <h2 id="mehr-heading" className="mb-2 text-[15px] font-semibold">
              {h.more}
            </h2>
            <div className="grid gap-3 @4xl:grid-cols-3">
              {graphOpen ? (
                <Link
                  to={`/eigentuemer/objekte/${objekte[0].id}?tab=graph`}
                  className="flex items-center gap-3 rounded-card border border-line bg-white p-4 shadow-card hover:bg-sidebar"
                >
                  <Waypoints className="size-5 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-semibold">
                      {h.graphCard}
                      {s.neu.includes('object_graph') && <NeuBadge pulse />}
                    </span>
                    <span className="block text-[13px] text-muted">{h.graphCardSub}</span>
                  </span>
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <LockedFeature
                  compact
                  icon={Waypoints}
                  title={h.graphCard}
                  text={h.graphCardSub}
                  planLabel={t.plan.advanced}
                  onUnlock={() => upgrade('object_graph')}
                />
              )}
              <LockedFeature
                compact
                icon={LayoutDashboard}
                title={h.portfolioCard}
                text={h.portfolioCardSub}
                planLabel={t.plan.pro}
                onUnlock={() => upgrade('portfolio')}
              />
              <LockedFeature
                compact
                icon={MessagesSquare}
                title={h.chatCard}
                text={h.chatCardSub}
                planLabel={t.plan.pro}
                onUnlock={() => upgrade('chat')}
              />
            </div>
          </section>
        </div>

        <Card className="h-fit p-5">
          <h2 className="flex items-center gap-2 text-[17px] font-semibold">
            <Bell className="size-[18px]" aria-hidden />
            {h.notifications}
          </h2>
          <p className="text-[14px] text-muted">{h.notificationsSub}</p>
          {notifications.length === 0 && next.length === 0 ? (
            <div className="mt-3 flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-control border border-dashed border-line text-muted">
              <BellOff className="size-5" aria-hidden />
              <p className="text-[14px]">{t.betrieb.home.noNotifications}</p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="rounded-control border border-line p-3 text-[13px] font-medium"
                >
                  {notificationText(n, t, fx)}
                </li>
              ))}
              {next
                .filter((i) => i.status !== 'due90')
                .map((i) => (
                  <li
                    key={i.rule.id}
                    className="rounded-control border border-line p-3 text-[13px]"
                  >
                    {t.notification.reminder(i.rule.title, formatDue(i.dueDate, fx.today))}
                    <span className="block text-[12px] text-muted">{t.common.recommendation}</span>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>

      <TerminSheet
        item={terminItem}
        objekt={terminObjekt}
        today={fx.today}
        open={terminOpen}
        onOpenChange={setTerminOpen}
      />
    </div>
  );
}
