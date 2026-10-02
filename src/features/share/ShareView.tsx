import { BookCheck, FileDown, FileX2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Card, GewerkStatusPill, dueToGewerkStatus } from '@/components/scheckheft/base';
import { DocumentPreviewProvider } from '@/components/scheckheft/DocumentPreview';
import { Timeline } from '@/components/scheckheft/entries';
import { PrototypeChip } from '@/components/shell/PrototypeChip';
import { Button } from '@/components/ui/button';
import { computeDueItems, groupByGewerk, statusByGewerk } from '@/domain/derive';
import { decodeShareToken } from '@/domain/shareToken';
import { GEWERKE, type Entry } from '@/domain/types';
import { useT } from '@/i18n';
import { formatDate, formatEuro, formatEvery } from '@/lib/format';
import { buildFixtures, todayISO } from '@/mocks';
import { scenarioEntry } from '@/mocks/scenarios';

function Unavailable() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-sidebar p-6 text-center">
      <span className="inline-flex size-[56px] items-center justify-center rounded-full bg-tint">
        <FileX2 className="size-6" aria-hidden />
      </span>
      <h1 className="text-[19px] font-semibold">Diese Verkaufsmappe ist nicht mehr verfügbar</h1>
      <p className="max-w-[360px] text-[15px] text-muted">
        Der Link ist abgelaufen oder unvollständig. Bitte frag die Person, die ihn dir geschickt
        hat, nach einem neuen Link.
      </p>
      <PrototypeChip />
    </main>
  );
}

/**
 * Public, read-only Verkaufsmappe. Everything shown is rebuilt from the token and the
 * bundled fixtures, so the link works on a device that has never opened the prototype.
 */
export default function ShareView() {
  const t = useT();
  const { token = '' } = useParams();
  const [params] = useSearchParams();
  const today = todayISO();
  const payload = useMemo(() => decodeShareToken(token), [token]);
  const print = params.get('print') === '1';

  const data = useMemo(() => {
    if (!payload || today > payload.e) return undefined;
    // Fixture dates are anchored to the day the link was created.
    const fx = buildFixtures(payload.c);
    const objekt = fx.objekte.find((o) => o.id === payload.o);
    if (!objekt) return undefined;
    const extra = payload.x
      .map((x) =>
        scenarioEntry(x.k, x.d, {
          intervalMonths: x.i,
          title: x.f?.t,
          anlageId: x.f?.a,
          costCents: x.f?.c,
        }),
      )
      .filter((e): e is Entry => !!e && e.objektId === objekt.id);
    const anlagen = fx.anlagen.filter((a) => a.objektId === objekt.id);
    const rules = fx.rules.filter((r) => anlagen.some((a) => a.id === r.anlageId));
    const entries = [...fx.entries.filter((e) => e.objektId === objekt.id), ...extra];
    const items = computeDueItems(entries, rules, anlagen, [], today);
    const owner = fx.workspaces.find((w) => w.id === objekt.workspaceId);
    return { objekt, anlagen, entries, items, owner };
  }, [payload, today]);

  useEffect(() => {
    document.title = 'Verkaufsmappe · Hero Scheckheft';
    if (!data || !print) return;
    const timer = setTimeout(() => window.print(), 500);
    return () => clearTimeout(timer);
  }, [data, print]);

  if (!payload || !data) return <Unavailable />;

  const { objekt, anlagen, entries, items } = data;
  const has = (section: (typeof payload.s)[number]) => payload.s.includes(section);
  const status = statusByGewerk(items);
  const groups = groupByGewerk(entries, anlagen);
  const years = entries.length
    ? Number(today.slice(0, 4)) -
      Number(
        entries
          .map((e) => e.date)
          .sort()[0]
          .slice(0, 4),
      )
    : 0;
  const total = entries.reduce((sum, e) => sum + e.costCents, 0);

  return (
    <DocumentPreviewProvider>
      <div className="min-h-dvh bg-sidebar">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-2 px-4 py-3">
            <p className="text-[18px] font-medium tracking-tight">
              ProtocolHero <span className="text-muted">· Verkaufsmappe</span>
            </p>
            <div className="flex items-center gap-2">
              <PrototypeChip />
              <Button
                variant="outline"
                size="sm"
                className="no-print"
                onClick={() => window.print()}
              >
                <FileDown className="size-4" aria-hidden />
                Drucken / PDF
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[860px] space-y-4 px-4 py-5">
          <Card className="p-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-tint px-3 py-1 text-[13px] font-semibold text-gold-ink">
              <BookCheck className="size-4" aria-hidden />
              scheckheftgepflegt
            </span>
            <h1 className="mt-3 text-[22px] font-semibold leading-tight">{objekt.title}</h1>
            <p className="text-[15px] text-muted">
              {objekt.address.street}, {objekt.address.zip} {objekt.address.city}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Baujahr', String(objekt.baujahr)],
                ['Anlagen', String(anlagen.length)],
                ['Dokumentierte Arbeiten', String(entries.length)],
                ['Zeitraum', `${Math.max(1, years)} Jahre`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-control border border-line px-3 py-2">
                  <dt className="text-[12px] text-muted">{label}</dt>
                  <dd className="text-[17px] font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[13px] text-muted">
              „scheckheftgepflegt“ heißt hier: Wartungen und Prüfungen sind fortlaufend
              dokumentiert. Es ist keine Aussage über den Zustand des Gebäudes und keine Bestätigung
              von Normen oder Vorschriften.
            </p>
            <p className="mt-2 text-[13px]">
              Nur zur Ansicht · erstellt am {formatDate(payload.c)} ·{' '}
              <span className="font-semibold">gültig bis {formatDate(payload.e)}</span>
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="text-[16px] font-semibold">Anlagen und Stand</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {anlagen.map((a) => {
                const item = items.find((i) => i.anlage.id === a.id);
                return (
                  <li key={a.id} className="rounded-control border border-line px-3 py-2">
                    <p className="flex flex-wrap items-center justify-between gap-2 font-medium">
                      {a.name}
                      {item && <GewerkStatusPill status={dueToGewerkStatus(item.status)} />}
                    </p>
                    <p className="text-[13px] text-muted">
                      {[t.gewerk[a.gewerk], a.detail, a.einbaujahr && `seit ${a.einbaujahr}`]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </li>
                );
              })}
            </ul>
          </Card>

          {has('faelligkeiten') && (
            <Card className="p-5">
              <h2 className="text-[16px] font-semibold">Nächste Termine</h2>
              <ul className="mt-3 divide-y divide-line">
                {items.map((i) => (
                  <li
                    key={i.rule.id}
                    className="flex flex-wrap justify-between gap-x-4 py-2 text-[14px]"
                  >
                    <span className="font-medium">{i.rule.title}</span>
                    <span className="text-muted">
                      {formatDate(i.dueDate)} · {formatEvery(i.intervalMonths)} · Empfehlung
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {has('kosten') && (
            <Card className="p-5">
              <h2 className="text-[16px] font-semibold">Kosten der Instandhaltung</h2>
              <ul className="mt-3 divide-y divide-line">
                {GEWERKE.filter((g) => groups[g].length > 0).map((g) => (
                  <li key={g} className="flex justify-between gap-4 py-2 text-[14px]">
                    <span>{t.gewerk[g]}</span>
                    <span className="tabular-nums">
                      {formatEuro(groups[g].reduce((sum, e) => sum + e.costCents, 0))}
                    </span>
                  </li>
                ))}
                <li className="flex justify-between gap-4 py-2 text-[14px] font-semibold">
                  <span>Gesamt</span>
                  <span className="tabular-nums">{formatEuro(total)}</span>
                </li>
              </ul>
            </Card>
          )}

          {has('historie') && (
            <section aria-labelledby="historie-heading">
              <h2 id="historie-heading" className="mb-3 text-[16px] font-semibold">
                Wartungshistorie
              </h2>
              <Timeline
                entries={entries}
                anlagen={anlagen}
                status={status}
                showCost={has('kosten')}
                showDokumente={has('dokumente')}
              />
            </section>
          )}

          {!has('historie') && has('dokumente') && (
            <Card className="p-5">
              <h2 className="text-[16px] font-semibold">Dokumente</h2>
              <p className="mt-1 text-[14px] text-muted">
                {entries.reduce((n, e) => n + e.dokumente.length, 0)} Dokumente sind hinterlegt.
              </p>
            </Card>
          )}

          <p className="pb-6 text-center text-[12px] text-muted">
            Konzept-Prototyp · fiktive Daten · erstellt mit Hero Scheckheft
          </p>
        </main>
      </div>
    </DocumentPreviewProvider>
  );
}
