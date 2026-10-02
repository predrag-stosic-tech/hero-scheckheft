import { Check, Copy, Crown, ExternalLink, FileDown } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { Button, buttonClass } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import {
  SHARE_SECTIONS,
  type ShareLink,
  type ShareSection,
} from '@/domain/types';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { useStore } from '@/store';

const EXPIRY_DAYS = [7, 30, 90];

export const shareUrl = (token: string, print = false): string =>
  `${window.location.origin}/share/${token}${print ? '?print=1' : ''}`;

interface Props {
  objektId: string;
  touch?: boolean;
  /** PDF export is an Advanced feature. When not allowed, the button opens the upgrade modal. */
  pdf?: { allowed: boolean; onLocked: () => void };
}

/** Choose contents and expiry, then receive a link and a QR code for the Verkaufsmappe. */
export function ShareFlow({ objektId, touch, pdf }: Props) {
  const t = useT();
  const createShareLink = useStore((s) => s.createShareLink);
  const [sections, setSections] = useState<ShareSection[]>([...SHARE_SECTIONS]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<ShareLink | null>(null);
  const [copied, setCopied] = useState(false);

  const toggle = (section: ShareSection) =>
    setSections((cur) => {
      if (!cur.includes(section)) return [...cur, section];
      // At least one section stays selected.
      return cur.length > 1 ? cur.filter((x) => x !== section) : cur;
    });

  const create = async () => {
    setLoading(true);
    setLink(await createShareLink(objektId, sections, days));
    setLoading(false);
  };

  if (link) {
    const url = shareUrl(link.token);
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopied(false);
      }
    };
    return (
      <div>
        <p className="flex items-center gap-2 font-semibold">
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-success-bg text-success">
            <Check className="size-4" aria-hidden />
          </span>
          {t.shareFlow.ready}
        </p>
        <p className="mt-1 text-[14px] text-muted">
          {t.shareFlow.viewOnly(formatDate(link.expiresAt))}
        </p>
        <div className="mt-4 flex justify-center rounded-card border border-line bg-white p-4">
          <QRCodeSVG value={url} size={224} level="L" title={t.shareFlow.qrTitle} />
        </div>
        <p
          className="mt-3 truncate rounded-control bg-tint px-3 py-2 text-[12px] text-muted"
          data-testid="share-url"
        >
          {url}
        </p>
        <div className={cn('mt-3 grid gap-2', touch ? 'grid-cols-1' : 'grid-cols-2')}>
          <Button variant="outline" size={touch ? 'touch' : 'md'} onClick={copy}>
            {copied ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
            {copied ? t.shareFlow.copied : t.shareFlow.copy}
          </Button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={buttonClass('primary', touch ? 'touch' : 'md')}
          >
            <ExternalLink className="size-4" aria-hidden />
            {t.shareFlow.open}
          </a>
          {pdf &&
            (pdf.allowed ? (
              <a
                href={shareUrl(link.token, true)}
                target="_blank"
                rel="noreferrer"
                className={buttonClass('outline', 'md', 'col-span-full')}
              >
                <FileDown className="size-4" aria-hidden />
                {t.shareFlow.pdf}
              </a>
            ) : (
              <Button variant="outline" className="col-span-full" onClick={pdf.onLocked}>
                <FileDown className="size-4" aria-hidden />
                {t.shareFlow.pdf}
                <Crown className="size-4 text-gold-ink" aria-hidden />
                <span className="sr-only">{t.shareFlow.pdfLocked}</span>
              </Button>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <fieldset>
        <legend className={cn('font-semibold', touch && 'text-[16px]')}>
          {t.shareFlow.contents}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SHARE_SECTIONS.map((section) => (
            <Pill
              key={section}
              touch={touch}
              active={sections.includes(section)}
              className={cn(!touch && 'h-[32px] px-3.5 text-[13px]')}
              onClick={() => toggle(section)}
            >
              {sections.includes(section) && <Check className="size-4" aria-hidden />}
              {t.shareSection[section]}
            </Pill>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-5">
        <legend className={cn('font-semibold', touch && 'text-[16px]')}>
          {t.shareFlow.expiry}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXPIRY_DAYS.map((d) => (
            <Pill
              key={d}
              touch={touch}
              active={days === d}
              className={cn(!touch && 'h-[32px] px-3.5 text-[13px]')}
              onClick={() => setDays(d)}
            >
              {t.shareFlow.days(d)}
            </Pill>
          ))}
        </div>
      </fieldset>
      <p className="mt-4 text-[13px] text-muted">
        {t.shareFlow.note}
      </p>
      <Button
        className="mt-4 w-full"
        size={touch ? 'touch' : 'md'}
        loading={loading}
        onClick={create}
      >
        {loading ? t.shareFlow.creating : t.shareFlow.create}
      </Button>
    </div>
  );
}
