import { Link2, Upload } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/pill';
import { groupByGewerk } from '@/domain/derive';
import {
  DOKUMENT_TYPEN,
  GEWERKE,
  type Anlage,
  type Betrieb,
  type DokumentTyp,
  type DueItem,
  type Entry,
  type Gewerk,
  type GewerkStatus,
} from '@/domain/types';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { formatDate, formatDateShort, formatDue, formatEuro, formatEvery } from '@/lib/format';
import { useFixtures, type DokumentRef } from '@/store/selectors';
import { Card, dueToGewerkStatus, GEWERK_ICON, GewerkStatusPill, PillFilter } from './base';
import { DOKUMENT_ICON, useOpenDokument } from './DocumentPreview';

/** Initials of an entry's author: the company's own, or built from the name for uploads. */
function initialsOf(entry: Pick<Entry, 'betriebId' | 'betriebName'>, betriebe: Betrieb[]): string {
  const known = betriebe.find((b) => b.id === entry.betriebId)?.initials;
  if (known) return known;
  return entry.betriebName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const AVATAR_SIZE = {
  sm: 'size-[22px] text-[10px]',
  md: 'size-[28px] text-[11px]',
  lg: 'size-[34px] text-[12px]',
};

/** Round initials badge of a company, as the user avatars in ProtocolHero. */
export function BetriebAvatar({
  initials,
  name,
  size = 'md',
  className,
}: {
  initials: string;
  name?: string;
  size?: keyof typeof AVATAR_SIZE;
  className?: string;
}) {
  return (
    <span
      title={name}
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-tint-strong font-semibold tracking-wide text-ink',
        AVATAR_SIZE[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}

/** "4 Betriebe · 27 Einträge · seit 2022" with the initials of every company involved. */
export function ObjektSummary({
  entries,
  touch,
  className,
}: {
  entries: Entry[];
  touch?: boolean;
  className?: string;
}) {
  const t = useT();
  const { betriebe } = useFixtures();
  if (entries.length === 0) return null;
  const involved = betriebe.filter((b) => entries.some((e) => e.betriebId === b.id));
  const since = Math.min(...entries.map((e) => Number(e.date.slice(0, 4))));
  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <ul aria-label={t.entries.companiesOfObject} className="flex shrink-0 gap-1">
        {involved.map((b) => (
          <li key={b.id}>
            <BetriebAvatar initials={b.initials} name={b.name} size="sm" />
            <span className="sr-only">{b.name}</span>
          </li>
        ))}
      </ul>
      <p className={cn('truncate text-muted', touch ? 'text-[13px]' : 'text-[12px]')}>
        {t.entries.summary(involved.length, entries.length, since)}
      </p>
    </div>
  );
}

interface EntryCardProps {
  entry: Entry;
  anlage?: Anlage;
  touch?: boolean;
  highlight?: boolean;
  showCost?: boolean;
  showDokumente?: boolean;
}

export function EntryCard({
  entry,
  anlage,
  touch,
  highlight,
  showCost = true,
  showDokumente = true,
}: EntryCardProps) {
  const t = useT();
  const openDokument = useOpenDokument();
  const { betriebe } = useFixtures();
  return (
    <article
      data-entry-id={entry.id}
      data-betrieb-id={entry.betriebId}
      className={cn(
        'rounded-card border border-line bg-white p-3.5 shadow-card',
        highlight && 'animate-rise border-gold ring-2 ring-gold-tint',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className={cn('font-semibold', touch ? 'text-[16px]' : 'text-[14px]')}>
            {entry.title}
          </h4>
          <p className={cn('text-muted', touch ? 'text-[14px]' : 'text-[13px]')}>
            {formatDate(entry.date)}
          </p>
        </div>
        {showCost && (
          <p className="shrink-0 font-semibold tabular-nums">{formatEuro(entry.costCents)}</p>
        )}
      </div>
      <p
        className={cn(
          'mt-2 flex min-w-0 items-center gap-2 font-medium',
          touch ? 'text-[15px]' : 'text-[13px]',
        )}
      >
        <BetriebAvatar initials={initialsOf(entry, betriebe)} size={touch ? 'md' : 'sm'} />
        <span className="truncate">{entry.betriebName}</span>
      </p>
      {anlage && (
        <p className={cn('mt-1 text-muted', touch ? 'text-[14px]' : 'text-[13px]')}>
          {anlage.name}
        </p>
      )}
      <p className={cn('mt-2', touch ? 'text-[15px]' : 'text-[13px]')}>{entry.description}</p>
      {showDokumente && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={t.entries.docsOfEntry}>
          {entry.dokumente.map((d) => {
            const Icon = DOKUMENT_ICON[d.typ];
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => openDokument({ dokument: d, entry, objektId: entry.objektId })}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border border-line bg-white font-medium hover:bg-tint',
                    touch ? 'min-h-[48px] px-4 text-[14px]' : 'h-[26px] px-2.5 text-[12px]',
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {t.dokTyp[d.typ]}
                  <span className="sr-only">{t.entries.openDoc(d.title)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-muted">
        {entry.origin === 'betrieb' ? (
          <>
            <Link2 className="size-3.5" aria-hidden />
            {t.entries.fromCompany}
          </>
        ) : (
          <>
            <Upload className="size-3.5" aria-hidden />
            {t.entries.selfAdded}
          </>
        )}
      </p>
    </article>
  );
}

interface TimelineProps {
  entries: Entry[];
  anlagen: Anlage[];
  status: Record<Gewerk, GewerkStatus>;
  touch?: boolean;
  highlightId?: string;
  showCost?: boolean;
  showDokumente?: boolean;
}

/** History grouped by Gewerk, newest entry first within each group. */
export function Timeline({
  entries,
  anlagen,
  status,
  touch,
  highlightId,
  showCost,
  showDokumente,
}: TimelineProps) {
  const t = useT();
  const groups = groupByGewerk(entries, anlagen);
  // The Gewerk with the newest entry comes first, so an incoming entry is at the top.
  const order = [...GEWERKE].sort((a, b) =>
    (groups[b][0]?.date ?? '') > (groups[a][0]?.date ?? '') ? 1 : -1,
  );
  return (
    <div className="space-y-6">
      {order
        .filter((g) => groups[g].length > 0)
        .map((g) => {
          const Icon = GEWERK_ICON[g];
          return (
            <section key={g} aria-labelledby={`gewerk-${g}`} data-gewerk-group={g}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3
                  id={`gewerk-${g}`}
                  className={cn(
                    'flex items-center gap-2 font-semibold',
                    touch ? 'text-[17px]' : 'text-[15px]',
                  )}
                >
                  <Icon className="size-[18px]" aria-hidden />
                  {t.gewerk[g]}
                  <span className="font-normal text-muted">{groups[g].length}</span>
                </h3>
                <GewerkStatusPill status={status[g]} large={touch} />
              </div>
              <ol className="space-y-2.5">
                {groups[g].map((e) => (
                  <li key={e.id}>
                    <EntryCard
                      entry={e}
                      anlage={anlagen.find((a) => a.id === e.anlageId)}
                      touch={touch}
                      highlight={e.id === highlightId}
                      showCost={showCost}
                      showDokumente={showDokumente}
                    />
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
    </div>
  );
}

type CompanyFilter = 'alle' | string;

/** Timeline with a chip row "Alle Betriebe | Elektro Stosic | …" to show one company only. */
export function CompanyHistory(props: TimelineProps & { scrollFilter?: boolean }) {
  const t = useT();
  const { betriebe } = useFixtures();
  const [filter, setFilter] = useState<CompanyFilter>('alle');
  const { entries, scrollFilter, ...rest } = props;
  const involved = betriebe.filter((b) => entries.some((e) => e.betriebId === b.id));
  const active = involved.some((b) => b.id === filter) ? filter : 'alle';
  const shown = active === 'alle' ? entries : entries.filter((e) => e.betriebId === active);
  return (
    <div>
      {involved.length > 1 && (
        <div className="mb-4">
          <PillFilter<CompanyFilter>
            label={t.entries.companyFilter}
            touch={props.touch}
            scroll={scrollFilter}
            value={active}
            onChange={setFilter}
            options={[
              { value: 'alle', label: t.entries.allCompanies },
              ...involved.map((b) => ({
                value: b.id,
                label: b.shortName ?? b.name,
                count: entries.filter((e) => e.betriebId === b.id).length,
              })),
            ]}
          />
        </div>
      )}
      {shown.length === 0 ? (
        <p className="text-[14px] text-muted">{t.entries.noEntriesOfCompany}</p>
      ) : (
        <Timeline entries={shown} {...rest} />
      )}
    </div>
  );
}

interface DueItemCardProps {
  item: DueItem;
  today: string;
  touch?: boolean;
  action?: ReactNode;
  objektLabel?: string;
}

export function DueItemCard({ item, today, touch, action, objektLabel }: DueItemCardProps) {
  const t = useT();
  const Icon = GEWERK_ICON[item.anlage.gewerk];
  return (
    <article
      data-rule-id={item.rule.id}
      className="rounded-card border border-line bg-white p-3.5 shadow-card"
    >
      <div className="flex items-start gap-3">
        <span
          className="inline-flex size-[36px] shrink-0 items-center justify-center rounded-[8px] bg-tint"
          aria-hidden
        >
          <Icon className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className={cn('font-semibold', touch ? 'text-[17px]' : 'text-[14px]')}>
              {item.rule.title}
            </h3>
            <GewerkStatusPill status={dueToGewerkStatus(item.status)} />
          </div>
          <p className={cn(touch ? 'text-[15px]' : 'text-[13px]')}>
            {formatDue(item.dueDate, today)}
            <span className="text-muted">{t.entries.lastBy(item.lastEntry.betriebName)}</span>
          </p>
          <p className="mt-0.5 text-[12px] text-muted">
            {objektLabel ? `${objektLabel} · ` : ''}
            {item.anlage.name} · {formatDateShort(item.dueDate)} ·{' '}
            {formatEvery(item.intervalMonths)} · {t.common.recommendation}
          </p>
        </div>
      </div>
      {action && <div className="mt-3">{action}</div>}
    </article>
  );
}

type DocFilter = DokumentTyp | 'alle';

export function DocumentList({ refs, touch }: { refs: DokumentRef[]; touch?: boolean }) {
  const t = useT();
  const [filter, setFilter] = useState<DocFilter>('alle');
  const openDokument = useOpenDokument();
  const shown = filter === 'alle' ? refs : refs.filter((r) => r.dokument.typ === filter);
  return (
    <div>
      <PillFilter<DocFilter>
        label={t.entries.docFilter}
        touch={touch}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'alle', label: t.common.all, count: refs.length },
          ...DOKUMENT_TYPEN.map((typ) => ({
            value: typ,
            label: t.dokTyp[typ],
            count: refs.filter((r) => r.dokument.typ === typ).length,
          })),
        ]}
      />
      <Card className="mt-3 overflow-hidden">
        {shown.length === 0 ? (
          <p className="p-4 text-[14px] text-muted">{t.entries.noDocsOfType}</p>
        ) : (
          <ul className="divide-y divide-line">
            {shown.map((r) => {
              const Icon = DOKUMENT_ICON[r.dokument.typ];
              return (
                <li key={r.dokument.id}>
                  <button
                    type="button"
                    onClick={() => openDokument(r)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3.5 text-left hover:bg-tint',
                      touch ? 'min-h-[64px] py-2' : 'min-h-[48px] py-1.5',
                    )}
                  >
                    <span
                      className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-[8px] bg-tint"
                      aria-hidden
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block truncate font-medium', touch && 'text-[15px]')}>
                        {r.dokument.title}
                      </span>
                      <span className="block truncate text-[12px] text-muted">
                        {formatDate(r.dokument.date)}
                        {r.entry ? ` · ${r.entry.betriebName}` : ''}
                      </span>
                    </span>
                    <Badge tone="neutral">{t.dokTyp[r.dokument.typ]}</Badge>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
