import { BookCheck, CircleCheck, ListFilter, Plus, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge, Pill } from '@/components/ui/pill';
import type { Terminanfrage } from '@/domain/types';
import { useT } from '@/i18n';
import { formatDate } from '@/lib/format';
import { useStore } from '@/store';
import { boardCards, useFixtures } from '@/store/selectors';
import { BETRIEB_USER } from './BetriebLayout';

function RequestCard({ request }: { request: Terminanfrage }) {
  const t = useT();
  const fx = useFixtures();
  const rule = fx.rules.find((r) => r.id === request.ruleId);
  const objekt = fx.objekte.find((o) => o.id === request.objektId);
  const owner = fx.workspaces.find((w) => w.id === objekt?.workspaceId);
  const anlage = fx.anlagen.find((a) => a.id === request.anlageId);
  return (
    <article
      data-request-rule={request.ruleId}
      className="rounded-control border border-line bg-white p-3 shadow-card"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold">{rule?.title}</h4>
        <Badge tone="gold" icon={<BookCheck className="size-3" aria-hidden />}>
          {t.betrieb.board.badge}
        </Badge>
      </div>
      <p className="mt-1 text-[13px]">{owner?.name}</p>
      <p className="text-[13px] text-muted">
        {objekt?.address.street}, {objekt?.address.zip} {objekt?.address.city}
        {anlage ? ` · ${anlage.name}` : ''}
      </p>
      <p className="mt-2 text-[12px] text-muted">
        {t.betrieb.board.requestedOn(formatDate(request.requestedAt.slice(0, 10)))}
      </p>
    </article>
  );
}

function Column({
  title,
  dot,
  children,
  count,
}: {
  title: string;
  dot: string;
  count: number;
  children: React.ReactNode;
}) {
  const t = useT();
  return (
    <section aria-label={title} className="w-[288px] shrink-0">
      <h3 className="flex items-center gap-2 px-1 pb-2 text-[14px] font-semibold">
        <span className={`size-2.5 rounded-full ${dot}`} aria-hidden />
        {title}
        <span className="font-normal text-muted">{count}</span>
      </h3>
      <div className="min-h-[360px] space-y-2 rounded-card bg-sidebar p-2">
        {count === 0 ? (
          <p className="py-8 text-center text-[12px] text-muted">{t.betrieb.board.noCards}</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

/** Board of the active company. Owner requests land in "Anfragen aus dem Scheckheft". */
export default function Board() {
  const t = useT();
  const b = t.betrieb.board;
  const s = useStore();
  const betriebId = s.demo.activeBetrieb;
  const cards = boardCards(s, betriebId);
  const open = cards.filter((c) => c.status === 'offen');
  const done = cards.filter((c) => c.status === 'erledigt');
  const user = BETRIEB_USER[betriebId];

  return (
    <div>
      <h1 className="sr-only">{b.title}</h1>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-1.5">
          <Pill count={cards.length}>{t.common.all}</Pill>
          <Pill count={0}>
            <span className="text-[9px] font-semibold">{user.initials}</span>
            {user.name}
          </Pill>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-muted">
          <span className="hidden items-center gap-1.5 sm:flex">
            <ListFilter className="size-4" aria-hidden />
            {t.common.filter}
          </span>
          <SlidersHorizontal className="hidden size-4 sm:block" aria-hidden />
        </div>
      </div>
      <Pill active>{b.standard}</Pill>
      <div className="mt-2.5 rounded-card border border-line p-3">
        <Pill active>{b.boardName}</Pill>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
          <Column title={b.colRequests} dot="bg-gold" count={open.length}>
            {open.map((r) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </Column>
          <Column title={b.colPlanning} dot="bg-tint-strong" count={0}>
            {null}
          </Column>
          <Column title={b.colDone} dot="bg-success-icon" count={done.length}>
            {done.map((r) => (
              <div key={r.id} className="space-y-1">
                <RequestCard request={r} />
                <p className="flex items-center gap-1.5 px-1 text-[12px] text-success">
                  <CircleCheck className="size-3.5" aria-hidden />
                  {b.doneNote}
                </p>
              </div>
            ))}
          </Column>
          <div className="hidden w-[288px] shrink-0 lg:block">
            <Button variant="outline" className="w-full border-dashed text-muted" disabled>
              <Plus className="size-4" aria-hidden />
              {b.addColumn}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
