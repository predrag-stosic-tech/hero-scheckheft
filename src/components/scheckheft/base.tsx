import {
  CircleCheck,
  Clock,
  Droplets,
  Flame,
  House,
  ShieldCheck,
  TriangleAlert,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Badge, Pill } from '@/components/ui/pill';
import type { DueStatus, Gewerk, GewerkStatus } from '@/domain/types';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

/** White bordered card with 12 px radius: the basic surface of the ProtocolHero app. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-card border border-line bg-white shadow-card', className)}
      {...props}
    />
  );
}

export function CardTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-3">
      <h2 className="text-[16px] font-semibold">{children}</h2>
      {sub && <p className="text-[13px] text-muted">{sub}</p>}
    </div>
  );
}

interface PillFilterProps<T extends string> {
  label: string;
  options: Array<{ value: T; label: string; count?: number }>;
  value: T;
  onChange: (value: T) => void;
  touch?: boolean;
  /** One row that scrolls sideways instead of wrapping, for long lists on the phone. */
  scroll?: boolean;
}

export function PillFilter<T extends string>({
  label,
  options,
  value,
  onChange,
  touch,
  scroll,
}: PillFilterProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'flex items-center gap-1.5',
        scroll
          ? '-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'flex-wrap',
      )}
    >
      {options.map((o) => (
        <Pill
          key={o.value}
          active={o.value === value}
          count={o.count}
          touch={touch}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </Pill>
      ))}
    </div>
  );
}

type Tone = 'info' | 'danger' | 'success' | 'warn' | 'neutral' | 'gold';
const TILE_TONE: Record<Tone, string> = {
  info: 'bg-info-bg text-info',
  danger: 'bg-danger-bg text-danger-text',
  success: 'bg-success-bg text-success-icon',
  warn: 'bg-warn-bg text-warn',
  neutral: 'bg-tint text-ink',
  gold: 'bg-gold-tint text-gold-ink',
};

/** Stat tile as in "Tagesüberblick": tinted icon, small label, large number. */
export function StatTile({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="flex items-center gap-3 rounded-control border border-line bg-white px-3 py-2">
      <span
        className={cn(
          'inline-flex size-[30px] items-center justify-center rounded-[8px]',
          TILE_TONE[tone],
        )}
        aria-hidden
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] leading-tight">{label}</p>
        <p className="text-[18px] font-semibold leading-tight tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <Card className="mx-auto flex max-w-[580px] flex-col items-center px-8 py-12 text-center">
      <span
        className="inline-flex size-[56px] items-center justify-center rounded-full bg-tint"
        aria-hidden
      >
        <Icon className="size-6" />
      </span>
      <h2 className="mt-8 text-[18px] font-medium">{title}</h2>
      <p className="mt-6 max-w-[360px] text-[16px] leading-relaxed text-muted">{text}</p>
      {action && <div className="mt-8">{action}</div>}
    </Card>
  );
}

export const GEWERK_ICON: Record<Gewerk, LucideIcon> = {
  strom: Zap,
  heizung: Flame,
  wasser: Droplets,
  sicherheit: ShieldCheck,
  dach: House,
};

const STATUS: Record<GewerkStatus, { tone: 'success' | 'warn' | 'danger'; icon: LucideIcon }> = {
  in_ordnung: { tone: 'success', icon: CircleCheck },
  bald_faellig: { tone: 'warn', icon: Clock },
  ueberfaellig: { tone: 'danger', icon: TriangleAlert },
};

/** Status is always given as text and icon, never by colour alone. */
export function GewerkStatusPill({ status, large }: { status: GewerkStatus; large?: boolean }) {
  const t = useT();
  const { tone, icon: Icon } = STATUS[status];
  return (
    <Badge
      tone={tone}
      className={cn(large && 'px-2.5 py-1 text-[13px]')}
      icon={<Icon className={large ? 'size-4' : 'size-3'} aria-hidden />}
    >
      {t.status[status]}
    </Badge>
  );
}

const DUE: Record<DueStatus, GewerkStatus> = {
  overdue: 'ueberfaellig',
  due30: 'bald_faellig',
  due90: 'in_ordnung',
  ok: 'in_ordnung',
};
export const dueToGewerkStatus = (status: DueStatus): GewerkStatus => DUE[status];

export function GewerkTile({
  gewerk,
  status,
  large,
}: {
  gewerk: Gewerk;
  status: GewerkStatus;
  large?: boolean;
}) {
  const t = useT();
  const Icon = GEWERK_ICON[gewerk];
  return (
    <div
      data-gewerk={gewerk}
      data-status={status}
      className={cn(
        'flex items-center justify-between gap-2 rounded-control border border-line bg-white',
        large ? 'min-h-[52px] px-3.5' : 'px-3 py-2',
      )}
    >
      <span className={cn('flex items-center gap-2 font-medium', large && 'text-[16px]')}>
        <Icon className={large ? 'size-5' : 'size-4'} aria-hidden />
        {t.gewerk[gewerk]}
      </span>
      <GewerkStatusPill status={status} large={large} />
    </div>
  );
}
