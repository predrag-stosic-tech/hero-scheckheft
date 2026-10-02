import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { dueToGewerkStatus, GewerkStatusPill } from '@/components/scheckheft/base';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { dateLocale, useLang, useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { formatDateShort, formatDue } from '@/lib/format';
import { useStore } from '@/store';
import { dueItems, effectivePlan, useFixtures, visibleObjekte } from '@/store/selectors';

const CHIP: Record<string, string> = {
  overdue: 'bg-danger-bg text-danger-text',
  due30: 'bg-warn-bg text-warn',
  due90: 'bg-tint text-ink',
  ok: 'bg-tint text-ink',
};

/** Maintenance calendar: recommended dates derived from the entries in the Scheckheft. */
export default function Kalender() {
  const t = useT();
  const lang = useLang();
  const k = t.owner.kalender;
  const fx = useFixtures();
  const s = useStore();
  const plan = effectivePlan(s);
  const objekte = visibleObjekte(fx, s.plan.activeOwnerWorkspace, plan);
  const items = dueItems(
    s,
    fx,
    objekte.map((o) => o.id),
  );
  const [month, setMonth] = useState(() => startOfMonth(parseISO(fx.today)));

  const first = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const last = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let d = first; d <= last; d = addDays(d, 1)) days.push(d);
  const iso = (d: Date) => format(d, 'yyyy-MM-dd');
  const upcoming = items.filter((i) => i.dueDate >= fx.today).slice(0, 8);
  const overdue = items.filter((i) => i.status === 'overdue');
  const street = (objektId: string) => objekte.find((o) => o.id === objektId)?.address.street;

  return (
    <div>
      <h1 className="sr-only">Kalender</h1>
      <div className="flex flex-wrap items-center gap-1.5 pb-2">
        <Pill active>Wartungstermine</Pill>
        <Pill count={items.length}>Alle</Pill>
      </div>
      <div className="grid gap-0 overflow-hidden rounded-card border border-line @5xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2 border-b border-line px-2 py-1.5">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-[28px]"
                aria-label={k.prev}
                onClick={() => setMonth(addMonths(month, -1))}
              >
                <ChevronLeft className="size-4" aria-hidden />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-[28px]"
                aria-label={k.next}
                onClick={() => setMonth(addMonths(month, 1))}
              >
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
            <p className="text-[13px] font-medium" aria-live="polite">
              {format(month, t.fmt.monthYear, { locale: dateLocale(lang) })}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMonth(startOfMonth(parseISO(fx.today)))}
            >
              {k.today}
            </Button>
          </div>
          <div className="grid grid-cols-7 border-b border-line text-center text-[11px] text-muted">
            {k.weekdays.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((d) => {
              const key = iso(d);
              const due = items.filter((i) => i.dueDate === key);
              const isToday = key === fx.today;
              return (
                <div
                  key={key}
                  className={cn(
                    'min-h-[72px] min-w-0 border-b border-r border-line p-1 md:min-h-[104px] md:p-1.5',
                    !isSameMonth(d, month) && 'bg-sidebar',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex size-[22px] items-center justify-center rounded-full text-[12px] font-medium',
                      isToday && 'bg-primary text-white',
                    )}
                  >
                    {format(d, 'd')}
                  </span>
                  <ul className="mt-0.5 space-y-0.5">
                    {due.map((i) => (
                      <li
                        key={i.rule.id}
                        title={`${i.rule.title} · Empfehlung`}
                        className={cn(
                          'truncate rounded-[4px] px-1 py-0.5 text-[10px] font-medium md:text-[11px]',
                          CHIP[i.status],
                        )}
                      >
                        {i.rule.title}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
        <aside
          className="border-t border-line p-3 @5xl:border-l @5xl:border-t-0"
          aria-label={k.upcomingLabel}
        >
          <h2 className="flex items-center gap-2 text-[13px] font-semibold">
            <Bell className="size-4" aria-hidden />
            {k.upcoming}
            <span className="font-normal text-muted">
              {k.counts(upcoming.length, overdue.length)}
            </span>
          </h2>
          <ul className="mt-2 space-y-2">
            {[...overdue, ...upcoming].map((i) => (
              <li key={i.rule.id}>
                <button
                  type="button"
                  onClick={() => setMonth(startOfMonth(parseISO(i.dueDate)))}
                  className="w-full rounded-control border border-line p-2.5 text-left hover:bg-tint"
                >
                  <span className="flex flex-wrap items-center gap-1.5 text-[13px] font-medium">
                    {i.rule.title}
                    <GewerkStatusPill status={dueToGewerkStatus(i.status)} />
                  </span>
                  <span className="block text-[12px] text-muted">
                    {formatDateShort(i.dueDate)} · {formatDue(i.dueDate, fx.today)} · Empfehlung
                  </span>
                  {objekte.length > 1 && (
                    <span className="block truncate text-[12px] text-muted">
                      {street(i.objektId)}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
