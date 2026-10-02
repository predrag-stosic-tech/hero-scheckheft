import { BookCheck, Info } from 'lucide-react';
import { useState } from 'react';
import { Card, EmptyState, PillFilter } from '@/components/scheckheft/base';
import { DueItemCard } from '@/components/scheckheft/entries';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge } from '@/components/ui/pill';
import type { DueItem } from '@/domain/types';
import { useT } from '@/i18n';
import { useStore } from '@/store';
import { customerDue, useFixtures } from '@/store/selectors';

type Filter = 'alle' | 'bald' | 'spaeter';

/** "Fällig beim Kunden": customer objects of the company with their upcoming due dates. */
export default function KundenScheckheft() {
  const t = useT();
  const k = t.betrieb.kunden;
  const fx = useFixtures();
  const s = useStore();
  const [filter, setFilter] = useState<Filter>('alle');
  const items = customerDue(s, fx, s.demo.activeBetrieb);
  const soon = (i: DueItem) => i.status === 'overdue' || i.status === 'due30';
  const shown = items.filter((i) =>
    filter === 'alle' ? true : filter === 'bald' ? soon(i) : !soon(i),
  );
  const objektIds = [...new Set(shown.map((i) => i.objektId))];

  return (
    <div>
      <PageHeader
        title={k.title}
        subtitle={k.subtitle}
      />
      <p className="mb-3 flex items-start gap-2 text-[13px] text-muted">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        {k.ownEntriesOnly}
      </p>
      <PillFilter<Filter>
        label={k.filterLabel}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'alle', label: t.common.all, count: items.length },
          { value: 'bald', label: k.soon, count: items.filter(soon).length },
          { value: 'spaeter', label: k.later, count: items.filter((i) => !soon(i)).length },
        ]}
      />
      {objektIds.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={BookCheck}
            title={k.emptyTitle}
            text={k.emptyText}
          />
        </div>
      ) : (
        <div className="mt-3 grid gap-3 @5xl:grid-cols-2">
          {objektIds.map((id) => {
            const objekt = fx.objekte.find((o) => o.id === id)!;
            const owner = fx.workspaces.find((w) => w.id === objekt.workspaceId);
            const list = shown.filter((i) => i.objektId === id);
            return (
              <Card key={id} className="p-4" data-objekt={id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">
                      {objekt.address.street}, {objekt.address.zip} {objekt.address.city}
                    </h2>
                    <p className="text-[13px] text-muted">
                      {owner?.name} · {objekt.title}
                    </p>
                  </div>
                  <Badge tone="neutral">
                    {k.dates(list.length)}
                  </Badge>
                </div>
                <ul className="mt-3 space-y-2">
                  {list.map((item) => (
                    <li key={item.rule.id}>
                      <DueItemCard item={item} today={fx.today} />
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
