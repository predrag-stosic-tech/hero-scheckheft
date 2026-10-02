import { Award, Camera, ClipboardCheck, FileText, Receipt, type LucideIcon } from 'lucide-react';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/pill';
import type { DokumentTyp } from '@/domain/types';
import { useT } from '@/i18n';
import { formatDate, formatEuro } from '@/lib/format';
import type { DokumentRef } from '@/store/selectors';
import { useFixtures } from '@/store/selectors';

export const DOKUMENT_ICON: Record<DokumentTyp, LucideIcon> = {
  protokoll: ClipboardCheck,
  rechnung: Receipt,
  foto: Camera,
  garantie: Award,
};

const Ctx = createContext<(ref: DokumentRef) => void>(() => undefined);

/** Any component below the provider can open a document with `useOpenDokument()`. */
export const useOpenDokument = () => useContext(Ctx);

function Watermark() {
  const t = useT();
  return (
    <p className="mt-6 border-t border-dashed border-line pt-3 text-center text-[11px] text-muted">
      {t.doc.watermark}
    </p>
  );
}

function PhotoPlaceholder({ title }: { title: string }) {
  // Original schematic illustration; no real photograph is used in the prototype.
  return (
    <svg viewBox="0 0 320 220" role="img" aria-label={title} className="w-full rounded-control">
      <rect width="320" height="220" className="fill-tint" />
      <rect
        x="92"
        y="38"
        width="136"
        height="150"
        rx="6"
        className="fill-white stroke-line"
        strokeWidth="2"
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={104 + (i % 3) * 40}
          y={56 + Math.floor(i / 3) * 62}
          width="30"
          height="44"
          rx="4"
          className="fill-tint-strong stroke-line"
        />
      ))}
      <circle cx="262" cy="58" r="18" className="fill-gold-tint stroke-gold" strokeWidth="2" />
      <path
        d="M254 58l6 6 10-12"
        className="fill-none stroke-gold-ink"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Paper({ dokRef }: { dokRef: DokumentRef }) {
  const t = useT();
  const fx = useFixtures();
  const { dokument, entry, objektId } = dokRef;
  const objekt = fx.objekte.find((o) => o.id === objektId);
  const owner = fx.workspaces.find((w) => w.id === objekt?.workspaceId);
  const anlage = fx.anlagen.find((a) => a.id === entry?.anlageId);
  const address = objekt
    ? `${objekt.address.street}, ${objekt.address.zip} ${objekt.address.city}`
    : '';

  if (dokument.typ === 'foto') {
    return dokument.imageUrl ? (
      <img src={dokument.imageUrl} alt={dokument.title} className="w-full rounded-control" />
    ) : (
      <PhotoPlaceholder title={dokument.title} />
    );
  }

  const head = (
    <div className="flex items-start justify-between gap-4 border-b border-line pb-3">
      <div>
        <p className="text-[15px] font-semibold">{entry?.betriebName ?? owner?.name}</p>
        <p className="text-[12px] text-muted">{t.doc.sampleCompany}</p>
      </div>
      <div className="text-right text-[12px] text-muted">
        <p>{formatDate(dokument.date)}</p>
        <p>
          {t.doc.number}{' '}
          {dokument.id
            .replace(/[^a-z0-9]/gi, '')
            .slice(-8)
            .toUpperCase()}
        </p>
      </div>
    </div>
  );
  const recipient = (
    <p className="mt-3 text-[13px]">
      <span className="text-muted">{t.doc.for}</span>
      {owner?.name}
      <span className="text-muted"> · {address}</span>
    </p>
  );

  if (dokument.typ === 'rechnung') {
    const brutto = entry?.costCents ?? 0;
    const netto = Math.round(brutto / 1.19);
    return (
      <div>
        {head}
        {recipient}
        <h3 className="mt-4 text-[15px] font-semibold">{dokument.title}</h3>
        {entry ? (
          <table className="mt-3 w-full text-[13px]">
            <tbody>
              <tr className="border-b border-line">
                <td className="py-2">
                  {entry.title}
                  {anlage && <span className="text-muted"> · {anlage.name}</span>}
                </td>
                <td className="py-2 text-right tabular-nums">{formatEuro(netto)}</td>
              </tr>
              <tr>
                <td className="py-1.5 text-muted">{t.doc.vat}</td>
                <td className="py-1.5 text-right tabular-nums text-muted">
                  {formatEuro(brutto - netto)}
                </td>
              </tr>
              <tr className="border-t border-line font-semibold">
                <td className="py-2">{t.doc.total}</td>
                <td className="py-2 text-right tabular-nums">{formatEuro(brutto)}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="mt-3 text-[13px] text-muted">{t.doc.statement}</p>
        )}
      </div>
    );
  }

  if (dokument.typ === 'garantie') {
    return (
      <div>
        {head}
        {recipient}
        <h3 className="mt-4 text-[15px] font-semibold">{dokument.title}</h3>
        <p className="mt-3 text-[13px] leading-relaxed">
          {t.doc.warranty(entry?.title ?? '', anlage?.name ?? '')}
        </p>
      </div>
    );
  }

  return (
    <div>
      {head}
      {recipient}
      <h3 className="mt-4 text-[15px] font-semibold">{dokument.title}</h3>
      {anlage && (
        <p className="text-[13px] text-muted">
          {t.doc.reference}
          {anlage.name}
          {anlage.detail ? ` (${anlage.detail})` : ''}
        </p>
      )}
      <p className="mt-3 text-[13px] leading-relaxed">{entry?.description}</p>
      <ul className="mt-3 space-y-1.5 text-[13px]">
        {t.doc.checks.map((line) => (
          <li key={line} className="flex items-center gap-2">
            <ClipboardCheck className="size-4 text-success-icon" aria-hidden />
            {line}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] text-muted">{t.doc.signed(entry?.betriebName ?? '')}</p>
    </div>
  );
}

export function DocumentPreviewProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const [current, setCurrent] = useState<DokumentRef | null>(null);
  const open = useCallback((ref: DokumentRef) => setCurrent(ref), []);
  const Icon = current ? DOKUMENT_ICON[current.dokument.typ] : FileText;
  return (
    <Ctx.Provider value={open}>
      {children}
      <Dialog open={!!current} onOpenChange={(o) => !o && setCurrent(null)}>
        {current && (
          <DialogContent className="max-w-[560px]">
            <div className="mb-4 flex items-center gap-2 pr-10">
              <Badge tone="neutral" icon={<Icon className="size-3" aria-hidden />}>
                {t.dokTyp[current.dokument.typ]}
              </Badge>
              <DialogTitle className="min-w-0 truncate text-[14px] font-medium">
                {current.dokument.title}
              </DialogTitle>
            </div>
            <DialogDescription className="sr-only">{t.doc.previewOf}</DialogDescription>
            <div className="rounded-control border border-line bg-white p-4 sm:p-5">
              <Paper dokRef={current} />
              <Watermark />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Ctx.Provider>
  );
}
