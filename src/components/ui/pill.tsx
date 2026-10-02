import { Crown } from 'lucide-react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  count?: number;
  touch?: boolean;
}

/** Filter pill as in the ProtocolHero toolbars: active black, inactive grey tint. */
export function Pill({ active, count, touch, className, children, ...props }: PillProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-full font-medium transition-colors',
        touch ? 'min-h-[48px] px-5 text-[15px]' : 'h-[26px] px-3 text-[12px]',
        active ? 'bg-primary text-white' : 'bg-tint text-ink hover:bg-tint-strong',
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className={cn('tabular-nums', active ? 'text-white' : 'text-muted')}>{count}</span>
      )}
    </button>
  );
}

type Tone = 'success' | 'warn' | 'danger' | 'neutral' | 'gold' | 'info';

const TONE: Record<Tone, string> = {
  success: 'bg-success-bg text-success',
  warn: 'bg-warn-bg text-warn',
  danger: 'bg-danger-bg text-danger-text',
  neutral: 'bg-tint text-ink',
  gold: 'bg-gold text-ink',
  info: 'bg-info-bg text-info',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: ReactNode;
}

export function Badge({ tone = 'neutral', icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-4',
        TONE[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}

/** Small gold crown pill that marks a feature of a higher plan, as in the sidebar. */
export function CrownBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex h-[16px] w-[24px] shrink-0 items-center justify-center rounded-full bg-gold text-white"
      title={label}
    >
      <Crown className="size-[11px]" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}
