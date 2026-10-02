import { Bell, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useOutletContext } from 'react-router';
import { DocumentPreviewProvider } from '@/components/scheckheft/DocumentPreview';
import { MobileShell } from '@/components/shell/MobileShell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/controls';
import { statusByGewerk } from '@/domain/derive';
import type { Anlage, DueItem, Entry, Gewerk, GewerkStatus, Objekt } from '@/domain/types';
import { useT } from '@/i18n';
import { useIncomingToasts } from '@/lib/hooks';
import { useStore } from '@/store';
import { allEntries, dueItems, useFixtures, visibleObjekte } from '@/store/selectors';
import { ObjektSummary } from '@/components/scheckheft/entries';
import { NotificationSheet } from './NotificationSheet';

export interface MobileCtx {
  objekt: Objekt;
  anlagen: Anlage[];
  entries: Entry[];
  items: DueItem[];
  status: Record<Gewerk, GewerkStatus>;
  today: string;
  highlightId?: string;
}

export const useMobile = () => useOutletContext<MobileCtx>();

/** Owner experience on the phone. Always shows the workspace "Familie Schneider". */
export default function MobileLayout() {
  const t = useT();
  const fx = useFixtures();
  const s = useStore();
  const navigate = useNavigate();
  const [objektId, setObjektId] = useState('lindenstrasse-12');
  const [highlightId, setHighlightId] = useState<string>();
  const [bellOpen, setBellOpen] = useState(false);

  const objekte = visibleObjekte(fx, 'familie-schneider', s.plan.familyPlan);
  const objekt = objekte.find((o) => o.id === objektId) ?? objekte[0];
  const anlagen = fx.anlagen.filter((a) => a.objektId === objekt.id);
  const entries = allEntries(s, fx, objekt.id);
  const items = dueItems(s, fx, [objekt.id]);
  const unread = s.notifications.filter((n) => n.audience === 'owner' && !n.read).length;

  // A new entry from a company: announce it and bring it into view in the Historie.
  useIncomingToasts('owner', (n) => {
    if (n.kind !== 'neuer_eintrag' || !n.entryId) return;
    setObjektId('lindenstrasse-12');
    setHighlightId(n.entryId);
    navigate('/m/historie' + window.location.search);
  });

  useEffect(() => {
    if (!highlightId) return;
    const timer = setTimeout(() => setHighlightId(undefined), 8000);
    return () => clearTimeout(timer);
  }, [highlightId]);

  const ctx: MobileCtx = {
    objekt,
    anlagen,
    entries,
    items,
    status: statusByGewerk(items),
    today: fx.today,
    highlightId,
  };

  const title =
    objekte.length > 1 ? (
      <DropdownMenu>
        <h1 className="sr-only">{objekt.title}</h1>
        <DropdownMenuTrigger className="-ml-1 inline-flex min-h-[48px] items-center gap-1.5 rounded-control px-1 text-left">
          {objekt.title}
          <ChevronDown className="size-5 shrink-0" aria-hidden />
          <span className="sr-only">{t.mobile.switchObject}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {objekte.map((o) => (
            <DropdownMenuItem
              key={o.id}
              className="min-h-[48px] text-[15px]"
              onSelect={() => setObjektId(o.id)}
            >
              {o.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <h1>{objekt.title}</h1>
    );

  return (
    <DocumentPreviewProvider>
      <MobileShell
        title={title}
        subtitle={`${objekt.address.street}, ${objekt.address.zip} ${objekt.address.city}`}
        meta={<ObjektSummary entries={entries} touch />}
        headerAction={
          <button
            type="button"
            onClick={() => setBellOpen(true)}
            className="relative inline-flex size-[48px] items-center justify-center rounded-full hover:bg-tint"
            aria-label={unread ? t.mobile.notificationsNew(unread) : t.mobile.notifications}
          >
            <Bell className="size-[22px]" aria-hidden />
            {unread > 0 && (
              <span className="absolute right-2 top-2 inline-flex min-w-[18px] items-center justify-center rounded-full bg-danger-text px-1 text-[11px] font-semibold text-white">
                {unread}
              </span>
            )}
          </button>
        }
      >
        <Outlet context={ctx} />
      </MobileShell>
      <NotificationSheet
        open={bellOpen}
        onOpenChange={setBellOpen}
        items={items}
        today={fx.today}
      />
    </DocumentPreviewProvider>
  );
}
