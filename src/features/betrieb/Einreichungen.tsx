import {
  ArrowLeft,
  BookCheck,
  Camera,
  Check,
  CircleCheck,
  Inbox,
  MapPin,
  Receipt,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Card, EmptyState, PillFilter } from '@/components/scheckheft/base';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button, buttonClass } from '@/components/ui/button';
import { Badge } from '@/components/ui/pill';
import type { Einreichung } from '@/domain/types';
import { useT, type Dict } from '@/i18n';
import { formatEuro } from '@/lib/format';
import { useStore } from '@/store';
import { useFixtures } from '@/store/selectors';
import { ClosingDialog } from './ClosingDialog';

type Filter = 'alle' | 'offen' | 'abgeschlossen';

function bezugLabel(t: Dict, e: Einreichung, objektName: (id: string) => string): string {
  return e.bezugspunkt.kind === 'objekt'
    ? t.betrieb.list.objektRef(objektName(e.bezugspunkt.objektId))
    : e.bezugspunkt.label;
}

export function Einreichungen() {
  const t = useT();
  const l = t.betrieb.list;
  const fx = useFixtures();
  const betriebId = useStore((s) => s.demo.activeBetrieb);
  const completed = useStore((s) => s.einreichungen.completed);
  const [filter, setFilter] = useState<Filter>('alle');
  const mine = fx.einreichungen.filter((e) => e.betriebId === betriebId);
  const isDone = (e: Einreichung) => !!completed[e.id];
  const shown = mine.filter((e) =>
    filter === 'alle' ? true : filter === 'offen' ? !isDone(e) : isDone(e),
  );
  const objektName = (id: string) => fx.objekte.find((o) => o.id === id)?.address.street ?? id;
  const TH = 'px-3 py-2.5 text-left text-[14px] font-medium';
  const TD = 'px-3 py-2.5 align-middle text-[13px]';

  return (
    <div>
      <PageHeader title={l.title} toolbar searchPlaceholder={l.search} />
      <PillFilter<Filter>
        label={l.filterLabel}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'alle', label: l.standard, count: mine.length },
          { value: 'offen', label: l.open, count: mine.filter((e) => !isDone(e)).length },
          { value: 'abgeschlossen', label: l.completed, count: mine.filter(isDone).length },
        ]}
      />
      {/* Table as in the ProtocolHero Einreichungen list; columns drop out on narrow screens. */}
      <div className="mt-2.5 overflow-hidden rounded-card border border-line">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className={TH}>
                {l.colName}
              </th>
              <th scope="col" className={`${TH} hidden @3xl:table-cell`}>
                {l.colReference}
              </th>
              <th scope="col" className={TH}>
                {l.colStatus}
              </th>
              <th scope="col" className={`${TH} hidden @4xl:table-cell`}>
                {l.colCreator}
              </th>
              <th scope="col" className={`${TH} hidden @5xl:table-cell`}>
                {l.colActivity}
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-[13px] text-muted">
                  {l.none}
                </td>
              </tr>
            ) : (
              shown.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0 hover:bg-sidebar">
                  <td className={TD}>
                    <Link
                      to={`/betrieb/einreichungen/${e.id}`}
                      className="flex min-h-[36px] items-center gap-2.5 font-medium"
                    >
                      <Inbox className="size-4 shrink-0 text-muted" aria-hidden />
                      <span>
                        {e.title}
                        <span className="block font-normal text-muted @3xl:hidden">
                          {bezugLabel(t, e, objektName)}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className={`${TD} hidden text-muted @3xl:table-cell`}>
                    {bezugLabel(t, e, objektName)}
                  </td>
                  <td className={TD}>
                    {isDone(e) ? (
                      <Badge tone="success">{l.completed}</Badge>
                    ) : (
                      <Badge tone="info">{l.open}</Badge>
                    )}
                  </td>
                  <td className={`${TD} hidden @4xl:table-cell`}>{e.eingereichtVon}</td>
                  <td className={`${TD} hidden text-muted @5xl:table-cell`}>
                    {isDone(e) ? l.justCompleted : l.submittedToday}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] text-muted">
        {l.paging(shown.length ? 1 : 0, shown.length, shown.length)}
      </p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 border-b border-line py-2 last:border-0">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="text-[14px] font-medium">{children}</dd>
    </div>
  );
}

export function EinreichungDetail() {
  const t = useT();
  const d = t.betrieb.detail;
  const { id } = useParams();
  const fx = useFixtures();
  const state = useStore((s) => (id ? s.einreichungen.completed[id] : undefined));
  const [open, setOpen] = useState(false);
  const e = fx.einreichungen.find((x) => x.id === id);

  if (!e) {
    return (
      <div className="pt-8">
        <EmptyState
          icon={Inbox}
          title={d.notFoundTitle}
          text={d.notFoundText}
          action={
            <Link to="/betrieb/einreichungen" className={buttonClass('primary')}>
              {d.toList}
            </Link>
          }
        />
      </div>
    );
  }

  const objekt =
    e.bezugspunkt.kind === 'objekt'
      ? fx.objekte.find((o) => o.id === (e.bezugspunkt as { objektId: string }).objektId)
      : undefined;

  return (
    <div className="max-w-[980px]">
      <Link
        to="/betrieb/einreichungen"
        className="inline-flex min-h-[32px] items-center gap-1.5 text-[13px] text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {d.back}
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 pt-1">
        <div className="min-w-0">
          <h1 className="text-[18px] font-semibold">{e.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-muted">
            {state ? (
              <Badge tone="success" icon={<CircleCheck className="size-3" aria-hidden />}>
                {d.completed}
              </Badge>
            ) : (
              <Badge tone="info">{d.open}</Badge>
            )}
            {d.template(e.vorlage)}
          </p>
        </div>
        {!state && (
          <Button onClick={() => setOpen(true)}>
            <Check className="size-4" aria-hidden />
            {d.complete}
          </Button>
        )}
      </div>

      {state && (
        <Card className="mb-4 flex items-start gap-3 border-gold bg-gold-tint p-4">
          <BookCheck className="mt-0.5 size-5 shrink-0 text-gold-ink" aria-hidden />
          <div>
            <p className="font-semibold">
              {state.transferred ? d.transferredTitle(e.kunde) : d.notTransferredTitle}
            </p>
            <p className="text-[13px] text-muted">
              {state.transferred ? d.transferredText : d.notTransferredText}
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-4 @3xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-[15px] font-semibold">{d.protocol}</h2>
            <ul className="mt-3 space-y-2">
              {e.summary.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[14px]">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-success-icon" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold">
              <Camera className="size-4" aria-hidden />
              {d.photos} <span className="font-normal text-muted">{e.fotos}</span>
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: e.fotos }, (_, i) => (
                <li
                  key={i}
                  className="flex h-[72px] w-[104px] items-center justify-center rounded-control border border-line bg-tint text-muted"
                >
                  <Camera className="size-5" aria-hidden />
                  <span className="sr-only">{d.photo(i + 1)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-[15px] font-semibold">{d.details}</h2>
            <dl className="mt-2">
              <Row label={d.reference}>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" aria-hidden />
                  {objekt ? `${objekt.title}, ${objekt.address.street}` : bezugLabel(t, e, () => '')}
                </span>
              </Row>
              <Row label={d.customer}>{e.kunde}</Row>
              <Row label={d.submittedBy}>{e.eingereichtVon}</Row>
            </dl>
          </Card>
          {e.rechnungCents !== undefined && (
            <Card className="p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                <Receipt className="size-4" aria-hidden />
                {d.invoice}
              </h2>
              <p className="mt-2 text-[20px] font-semibold tabular-nums">
                {formatEuro(e.rechnungCents)}
              </p>
              <p className="text-[13px] text-muted">{d.invoiceNote}</p>
            </Card>
          )}
        </div>
      </div>

      {!state && <ClosingDialog einreichung={e} open={open} onOpenChange={setOpen} />}
    </div>
  );
}
