import {
  Bell,
  BellOff,
  BookCheck,
  Check,
  ChevronRight,
  CircleCheck,
  Inbox,
  MessageSquareDot,
  Sun,
} from 'lucide-react';
import { Link } from 'react-router';
import { Card, StatTile } from '@/components/scheckheft/base';
import { buttonClass } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/controls';
import { Badge } from '@/components/ui/pill';
import { useT, type Dict } from '@/i18n';
import { formatWeekdayDate } from '@/lib/format';
import { notificationText } from '@/lib/notifications';
import { useStore } from '@/store';
import { boardCards, customerDue, useFixtures } from '@/store/selectors';
import { BETRIEB_USER } from './BetriebLayout';

function greeting(t: Dict): string {
  const h = new Date().getHours();
  return h < 11 ? t.betrieb.home.morning : h < 18 ? t.betrieb.home.day : t.betrieb.home.evening;
}

export default function Startseite() {
  const t = useT();
  const h = t.betrieb.home;
  const fx = useFixtures();
  const s = useStore();
  const betriebId = s.demo.activeBetrieb;
  const user = BETRIEB_USER[betriebId];
  const mine = fx.einreichungen.filter((e) => e.betriebId === betriebId);
  const open = mine.filter((e) => !s.einreichungen.completed[e.id]);
  const done = mine.length - open.length;
  const requests = boardCards(s, betriebId).filter((r) => r.status === 'offen');
  const dueSoon = customerDue(s, fx, betriebId).filter(
    (i) => i.status === 'overdue' || i.status === 'due30',
  );
  const notifications = s.notifications.filter((n) => n.audience === betriebId).reverse();
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <div className="space-y-4 pt-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex size-[34px] items-center justify-center rounded-full bg-tint text-[11px] font-semibold"
            aria-hidden
          >
            {user.initials}
          </span>
          <div>
            <p className="text-[12px] text-muted">{formatWeekdayDate(fx.today)}</p>
            <h1 className="flex items-center gap-1.5 text-[18px] font-semibold">
              {greeting(t)}, {user.name}
              <Sun className="size-4 text-gold" aria-hidden />
            </h1>
            <p className="text-[13px] text-muted">{h.ready}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/betrieb/einreichungen" className={buttonClass('primary', 'sm')}>
            <Inbox className="size-4" aria-hidden />
            {t.betrieb.nav.einreichungen}
          </Link>
          <Link to="/betrieb/scheckheft" className={buttonClass('outline', 'sm')}>
            <BookCheck className="size-4" aria-hidden />
            {t.betrieb.nav.scheckheft}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 @5xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <Card className="p-4">
            <h2 className="mb-2.5 text-[15px] font-semibold">{h.overview}</h2>
            <div className="grid grid-cols-2 gap-2 @2xl:grid-cols-4">
              <StatTile icon={Inbox} label={h.statOpen} value={open.length} tone="info" />
              <StatTile
                icon={MessageSquareDot}
                label={h.statRequests}
                value={requests.length}
                tone="gold"
              />
              <StatTile
                icon={BookCheck}
                label={h.statDue}
                value={dueSoon.length}
                tone="warn"
              />
              <StatTile icon={CircleCheck} label={h.statDone} value={done} tone="success" />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-semibold">{h.today}</h2>
                <p className="text-[14px] text-muted">{h.todaySub}</p>
              </div>
              <Link to="/betrieb/einreichungen" className={buttonClass('link', 'sm')}>
                {h.showAll}
              </Link>
            </div>
            {open.length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-control border border-dashed border-line p-4">
                <Check className="size-5" aria-hidden />
                <div>
                  <p className="font-medium">{h.nothingUrgent}</p>
                  <p className="text-[13px] text-muted">{h.nothingUrgentSub}</p>
                </div>
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {open.map((e) => (
                  <li key={e.id}>
                    <Link
                      to={`/betrieb/einreichungen/${e.id}`}
                      className="flex min-h-[56px] items-center gap-3 rounded-control border border-line px-3.5 py-2 hover:bg-tint"
                    >
                      <span
                        className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-[8px] bg-tint"
                        aria-hidden
                      >
                        <Inbox className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{e.title}</span>
                        <span className="block truncate text-[13px] text-muted">
                          {e.kunde} · {h.submittedBy(e.eingereichtVon)}
                        </span>
                      </span>
                      {e.bezugspunkt.kind === 'objekt' && (
                        <Badge tone="gold" className="hidden sm:inline-flex">
                          {h.badgeScheckheft}
                        </Badge>
                      )}
                      <Badge tone="info">{h.open}</Badge>
                      <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-[17px] font-semibold">
            <Bell className="size-[18px]" aria-hidden />
            {h.notifications}
          </h2>
          <p className="text-[14px] text-muted">{h.notificationsSub}</p>
          <Tabs defaultValue="offen" className="mt-3">
            <TabsList>
              <TabsTrigger value="offen">{h.unresolved}</TabsTrigger>
              <TabsTrigger value="erledigt">{h.resolved}</TabsTrigger>
            </TabsList>
            {(
              [
                ['offen', unread],
                ['erledigt', read],
              ] as const
            ).map(([value, list]) => (
              <TabsContent key={value} value={value} className="mt-3">
                {list.length === 0 ? (
                  <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-control border border-dashed border-line text-muted">
                    <BellOff className="size-5" aria-hidden />
                    <p className="text-[14px]">{h.noNotifications}</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {list.map((n) => (
                      <li key={n.id} className="rounded-control border border-line p-3">
                        <p className="text-[13px] font-medium">{notificationText(n, t, fx)}</p>
                        <Link
                          to="/betrieb/board"
                          className="mt-1 inline-flex text-[13px] underline underline-offset-4"
                        >
                          {h.viewInBoard}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            ))}
          </Tabs>
          {unread.length > 0 && (
            <button
              type="button"
              className={buttonClass('ghost', 'sm', 'mt-2')}
              onClick={() => s.markNotificationsRead(betriebId)}
            >
              {h.markAllDone}
            </button>
          )}
        </Card>
      </div>
    </div>
  );
}
