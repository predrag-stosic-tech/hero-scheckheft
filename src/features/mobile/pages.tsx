import { CalendarCheck, Check, FilePlus2, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GewerkTile } from '@/components/scheckheft/base';
import { CompanyHistory, DocumentList, DueItemCard } from '@/components/scheckheft/entries';
import { Button } from '@/components/ui/button';
import { GEWERKE, type DueItem } from '@/domain/types';
import { allDokumente, useFixtures } from '@/store/selectors';
import { UPLOAD_OBJEKT_ID } from '@/mocks/scenarios';
import { useT } from '@/i18n';
import { useMobile } from './MobileLayout';
import { ShareSheet, TerminSheet, UploadSheet } from './sheets';

const H2 = 'text-[17px] font-semibold';

export function Uebersicht() {
  const t = useT();
  const m = t.mobile;
  const { objekt, anlagen, items, status, today } = useMobile();
  const [terminItem, setTerminItem] = useState<DueItem | null>(null);
  const [terminOpen, setTerminOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const soon = items.filter((i) => i.status !== 'ok');
  const next = (soon.length > 0 ? soon : items).slice(0, 3);

  return (
    <div className="space-y-6">
      <section aria-labelledby="next-heading">
        <h2 id="next-heading" className={H2}>
          {m.nextUp}
        </h2>
        {next.length === 0 ? (
          <p className="mt-2 rounded-card border border-line bg-white p-4 text-[15px]">
            {m.allDone}
          </p>
        ) : (
          <ul className="mt-2 space-y-3">
            {next.map((item) => (
              <li key={item.rule.id}>
                <DueItemCard
                  item={item}
                  today={today}
                  touch
                  action={
                    item.requested ? (
                      <p className="flex min-h-[52px] items-center justify-center gap-2 rounded-control bg-success-bg text-[16px] font-medium text-success">
                        <Check className="size-5" aria-hidden />
                        {m.requested}
                      </p>
                    ) : (
                      <Button
                        size="touch"
                        className="w-full"
                        onClick={() => {
                          setTerminItem(item);
                          setTerminOpen(true);
                        }}
                      >
                        <CalendarCheck className="size-5" aria-hidden />
                        {m.request}
                        <span className="sr-only">{m.requestFor(item.rule.title)}</span>
                      </Button>
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="status-heading">
        <h2 id="status-heading" className={H2}>
          {m.homeStatus}
        </h2>
        <ul className="mt-2 space-y-2">
          {GEWERKE.map((g) => (
            <li key={g}>
              <GewerkTile gewerk={g} status={status[g]} large />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[13px] text-muted">
          {m.homeMeta(objekt.title, objekt.baujahr, anlagen.length)}
        </p>
      </section>

      <section aria-label={m.moreActions} className="space-y-2">
        <Button
          variant="outline"
          size="touch"
          className="w-full"
          onClick={() => setShareOpen(true)}
        >
          <Share2 className="size-5" aria-hidden />
          {m.share}
        </Button>
        {objekt.id === UPLOAD_OBJEKT_ID && (
          <Button
            variant="outline"
            size="touch"
            className="w-full"
            onClick={() => setUploadOpen(true)}
          >
            <FilePlus2 className="size-5" aria-hidden />
            {t.mobile.addDocument}
          </Button>
        )}
      </section>

      <TerminSheet
        item={terminItem}
        objekt={objekt}
        today={today}
        open={terminOpen}
        onOpenChange={setTerminOpen}
      />
      <ShareSheet objekt={objekt} open={shareOpen} onOpenChange={setShareOpen} />
      <UploadSheet anlagen={anlagen} today={today} open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}

export function Historie() {
  const t = useT();
  const { entries, anlagen, status, highlightId } = useMobile();

  useEffect(() => {
    if (!highlightId) return;
    const el = document.querySelector(`[data-entry-id="${highlightId}"]`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [highlightId, entries.length]);

  return (
    <div>
      <h2 className={H2}>{t.mobile.historyTitle}</h2>
      <p className="mb-4 text-[14px] text-muted">{t.mobile.historySub(entries.length)}</p>
      <CompanyHistory
        entries={entries}
        anlagen={anlagen}
        status={status}
        touch
        scrollFilter
        highlightId={highlightId}
      />
    </div>
  );
}

export function Dokumente() {
  const t = useT();
  const { objekt, entries, anlagen, today } = useMobile();
  const fx = useFixtures();
  const [uploadOpen, setUploadOpen] = useState(false);
  const refs = allDokumente(entries, fx, objekt.id);

  return (
    <div>
      <h2 className={H2}>{t.mobile.docsTitle}</h2>
      <p className="mb-3 text-[14px] text-muted">{t.mobile.docsSub(refs.length)}</p>
      <DocumentList refs={refs} touch />
      {objekt.id === UPLOAD_OBJEKT_ID && (
        <Button size="touch" className="mt-4 w-full" onClick={() => setUploadOpen(true)}>
          <FilePlus2 className="size-5" aria-hidden />
          {t.mobile.addDocument}
        </Button>
      )}
      <UploadSheet anlagen={anlagen} today={today} open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
