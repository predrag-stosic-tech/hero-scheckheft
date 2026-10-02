import { Crown, LoaderCircle, Lock, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

export type Illustration = 'cards' | 'graph' | 'portfolio' | 'chat';

/** Original schematic illustration in the style of the ProtocolHero upgrade modal. */
function UpgradeIllustration({ kind }: { kind: Illustration }) {
  const t = useT();
  return (
    <svg
      viewBox="0 0 340 360"
      className="h-full w-full"
      role="img"
      aria-label={t.owner.illustration}
    >
      <rect
        x="10"
        y="10"
        width="320"
        height="340"
        rx="12"
        className="fill-white stroke-line"
        strokeWidth="1.5"
      />
      <circle cx="28" cy="27" r="3" className="fill-tint-strong" />
      <circle cx="40" cy="27" r="3" className="fill-tint-strong" />
      <circle cx="52" cy="27" r="3" className="fill-tint-strong" />
      <rect x="68" y="21" width="120" height="12" rx="6" className="fill-white stroke-line" />
      <line x1="10" y1="42" x2="330" y2="42" className="stroke-line" />
      <line x1="62" y1="42" x2="62" y2="350" className="stroke-line" />
      <rect x="22" y="56" width="28" height="28" rx="8" className="fill-gold-tint stroke-gold" />
      <path d="M36 62l7 8-7 8-7-8z" className="fill-none stroke-gold-ink" strokeWidth="1.6" />
      {[104, 144, 184, 224].map((y) => (
        <rect key={y} x="28" y={y} width="16" height="16" rx="4" className="fill-tint-strong" />
      ))}
      <rect x="78" y="60" width="92" height="7" rx="3.5" className="fill-tint-strong" />
      <rect x="78" y="74" width="70" height="7" rx="3.5" className="fill-tint" />
      <rect x="254" y="58" width="62" height="24" rx="12" className="fill-gold-tint stroke-gold" />

      {kind === 'cards' &&
        [0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${78 + i * 82} 98)`}>
            <rect
              width="74"
              height="74"
              rx="10"
              className="fill-white stroke-line"
              strokeWidth="1.5"
            />
            <rect x="12" y="12" width="22" height="22" rx="7" className="fill-tint" />
            <rect x="12" y="44" width="50" height="6" rx="3" className="fill-tint-strong" />
            <rect x="12" y="56" width="38" height="6" rx="3" className="fill-tint" />
          </g>
        ))}

      {kind === 'graph' && (
        <g>
          {[
            [110, 130, 190, 110],
            [110, 130, 190, 170],
            [190, 110, 280, 130],
            [190, 170, 280, 130],
            [190, 170, 250, 220],
          ].map(([x1, y1, x2, y2], i) => (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="stroke-gold"
              strokeWidth="1.5"
            />
          ))}
          {[
            [110, 130],
            [190, 110],
            [190, 170],
            [280, 130],
            [250, 220],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r="15"
                className={cn('stroke-line', i === 0 ? 'fill-gold-tint stroke-gold' : 'fill-white')}
                strokeWidth="1.5"
              />
              <rect
                x={cx - 6}
                y={cy - 2}
                width="12"
                height="4"
                rx="2"
                className="fill-tint-strong"
              />
            </g>
          ))}
        </g>
      )}

      {kind === 'portfolio' && (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${78 + i * 82} 98)`}>
              <rect
                width="74"
                height="46"
                rx="8"
                className="fill-white stroke-line"
                strokeWidth="1.5"
              />
              <rect x="10" y="10" width="30" height="6" rx="3" className="fill-tint" />
              <rect x="10" y="24" width="20" height="10" rx="3" className="fill-tint-strong" />
            </g>
          ))}
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(78 ${158 + i * 26})`}>
              <rect width="238" height="20" rx="6" className="fill-white stroke-line" />
              <rect x="8" y="7" width="90" height="6" rx="3" className="fill-tint-strong" />
              <rect
                x="186"
                y="5"
                width="44"
                height="10"
                rx="5"
                className={i === 1 ? 'fill-gold-tint' : 'fill-tint'}
              />
            </g>
          ))}
        </g>
      )}

      {kind === 'chat' && (
        <g>
          <rect x="150" y="100" width="166" height="30" rx="12" className="fill-primary" />
          <rect x="162" y="112" width="120" height="6" rx="3" className="fill-white" />
          <rect
            x="78"
            y="144"
            width="200"
            height="62"
            rx="12"
            className="fill-white stroke-line"
            strokeWidth="1.5"
          />
          <rect x="90" y="156" width="150" height="6" rx="3" className="fill-tint-strong" />
          <rect x="90" y="170" width="110" height="6" rx="3" className="fill-tint" />
          <rect
            x="90"
            y="186"
            width="54"
            height="12"
            rx="6"
            className="fill-gold-tint stroke-gold"
          />
          <rect
            x="150"
            y="186"
            width="54"
            height="12"
            rx="6"
            className="fill-gold-tint stroke-gold"
          />
        </g>
      )}

      <g transform="translate(176 282)">
        <rect
          width="142"
          height="54"
          rx="12"
          className="fill-white stroke-gold"
          strokeWidth="1.5"
        />
        <rect x="12" y="11" width="32" height="32" rx="9" className="fill-gold" />
        <path
          d="M22 28h12v8H22zM25 28v-3a3 3 0 0 1 6 0"
          className="fill-none stroke-ink"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <rect x="54" y="18" width="74" height="6" rx="3" className="fill-tint-strong" />
        <rect x="54" y="31" width="58" height="6" rx="3" className="fill-tint" />
      </g>
    </svg>
  );
}

export interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  title: string;
  text: ReactNode;
  availability: string;
  ctaLabel: string;
  loadingText?: string;
  illustration?: Illustration;
  onConfirm: () => Promise<void> | void;
}

/**
 * Upgrade modal in the ProtocolHero pattern: text on the left, illustration on the right,
 * "Nicht jetzt" and a gold upgrade button.
 */
export function UpgradeModal({
  open,
  onOpenChange,
  icon: Icon,
  title,
  text,
  availability,
  ctaLabel,
  loadingText,
  illustration = 'cards',
  onConfirm,
}: UpgradeModalProps) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const confirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <DialogContent className="grid max-w-[768px] overflow-hidden p-0 md:grid-cols-[400px_1fr]">
        <div className="flex min-h-[340px] flex-col p-6 md:min-h-[400px]">
          <div className="flex items-start gap-3 pr-8">
            <span
              className="inline-flex size-[36px] shrink-0 items-center justify-center rounded-full bg-gold-tint text-gold-ink"
              aria-hidden
            >
              <Icon className="size-[18px]" />
            </span>
            <DialogTitle className="text-[16px] font-semibold leading-snug">{title}</DialogTitle>
          </div>
          <DialogDescription asChild>
            <div className="mt-2 text-[15px] leading-relaxed text-muted">{text}</div>
          </DialogDescription>
          <p className="mt-4 flex items-center gap-2 text-[13px] text-muted">
            <Crown className="size-4 text-gold-ink" aria-hidden />
            {availability}
          </p>
          <div className="mt-auto pt-6">
            {loading ? (
              <p
                role="status"
                className="flex h-[36px] items-center justify-center gap-2.5 rounded-control bg-gold-tint text-[14px] font-medium text-gold-ink"
              >
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
                {loadingText ?? t.owner.expanding}
              </p>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <DialogClose asChild>
                  <Button variant="ghost">{t.owner.notNow}</Button>
                </DialogClose>
                <Button variant="gold" onClick={confirm}>
                  <Crown className="size-4" aria-hidden />
                  {ctaLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="hidden border-l border-line bg-gold-tint p-5 md:block">
          <UpgradeIllustration kind={illustration} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Gold "Neu" pill; pulses for a few seconds after an upgrade. */
export function NeuBadge({ pulse }: { pulse?: boolean }) {
  const t = useT();
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full bg-gold px-1.5 text-[10px] font-semibold leading-[16px] text-ink',
        pulse && 'animate-neu',
      )}
    >
      {t.common.neu}
    </span>
  );
}

/** Marks a feature of a higher plan: visible, with a crown, and opens the upgrade modal. */
export function LockedFeature({
  title,
  text,
  planLabel,
  onUnlock,
  icon: Icon,
  compact,
}: {
  title: string;
  text: string;
  planLabel: string;
  onUnlock: () => void;
  icon: LucideIcon;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onUnlock}
      className={cn(
        'flex w-full items-center gap-3 rounded-card border border-dashed border-gold bg-gold-tint text-left hover:border-gold-strong',
        compact ? 'min-h-[56px] px-3.5 py-2.5' : 'p-5',
      )}
    >
      <span
        className="inline-flex size-[36px] shrink-0 items-center justify-center rounded-full bg-white text-gold-ink"
        aria-hidden
      >
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}</span>
        <span className="block text-[13px] text-muted">{text}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[11px] font-semibold text-ink">
        <Lock className="size-3" aria-hidden />
        {planLabel}
      </span>
    </button>
  );
}
