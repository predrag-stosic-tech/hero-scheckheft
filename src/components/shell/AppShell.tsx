import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  Crown,
  Menu,
  PanelLeft,
  Shapes,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router';
import { Dialog, SheetContent } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/controls';
import { CrownBadge } from '@/components/ui/pill';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { LanguageSwitch } from './LanguageSwitch';
import { PrototypeChip } from './PrototypeChip';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  to?: string;
  end?: boolean;
  children?: NavItem[];
  /** Locked items open the upgrade modal instead of navigating. */
  onLockedClick?: () => void;
  lockedLabel?: string;
  badge?: ReactNode;
}

export interface WorkspaceOption {
  id: string;
  name: string;
  sub: string;
  initials: string;
  active: boolean;
  onSelect: () => void;
}

export interface PlanCardProps {
  title: string;
  usageLabel: string;
  usageValue: string;
  progress: number;
  footnote: ReactNode;
  onUpgrade?: () => void;
  upgradeLabel?: string;
}

interface AppShellProps {
  nav: NavItem[];
  workspaces: WorkspaceOption[];
  workspaceGroupLabel: string;
  planCard: PlanCardProps;
  user: { name: string; initials: string };
  children: ReactNode;
}

function Avatar({ initials, round }: { initials: string; round?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex size-[30px] shrink-0 items-center justify-center bg-primary text-[12px] font-semibold text-white',
        round ? 'rounded-full bg-tint text-ink' : 'rounded-[8px]',
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function WorkspaceSwitcher({
  options,
  groupLabel,
}: {
  options: WorkspaceOption[];
  groupLabel: string;
}) {
  const t = useT();
  const active = options.find((o) => o.active) ?? options[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex w-full items-center gap-2.5 rounded-control px-1.5 py-1.5 text-left hover:bg-tint"
        aria-label={t.common.switchWorkspace(active.name)}
      >
        <Avatar initials={active.initials} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold leading-tight">
            {active.name}
          </span>
          <span className="block truncate text-[12px] leading-tight text-muted">{active.sub}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{groupLabel}</DropdownMenuLabel>
        {options.map((o) => (
          <DropdownMenuItem key={o.id} onSelect={o.onSelect} className="py-1.5">
            <Avatar initials={o.initials} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{o.name}</span>
              <span className="block text-[12px] text-muted">{o.sub}</span>
            </span>
            {o.active && (
              <span className="size-2 rounded-full bg-success-icon" aria-label={t.common.active} />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PlanCard({
  title,
  usageLabel,
  usageValue,
  progress,
  footnote,
  onUpgrade,
  upgradeLabel,
}: PlanCardProps) {
  const t = useT();
  return (
    <section
      aria-label={t.common.yourPlan}
      className="rounded-card border border-line bg-white p-2.5 shadow-card"
    >
      <p className="text-[12px] font-semibold">{title}</p>
      <p className="mt-1.5 flex items-center justify-between gap-1 whitespace-nowrap text-[10.5px] text-muted">
        <span>{usageLabel}</span>
        <span className="font-semibold text-ink">{usageValue}</span>
      </p>
      <div className="mt-1.5 h-1 rounded-full bg-tint-strong" aria-hidden>
        <div
          className="h-1 rounded-full bg-primary"
          style={{ width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-muted">{footnote}</p>
      {onUpgrade && (
        <button
          type="button"
          onClick={onUpgrade}
          className="mt-2 inline-flex h-[24px] w-full items-center justify-center gap-1.5 rounded-[6px] bg-gold text-[12px] font-semibold text-white hover:bg-gold-strong"
        >
          <Crown className="size-3.5" aria-hidden />
          {upgradeLabel ?? t.common.upgrade}
        </button>
      )}
    </section>
  );
}

const ITEM =
  'flex h-[32px] w-full items-center gap-2.5 rounded-control px-2 text-left text-[14px] text-ink hover:bg-tint';

function NavEntry({
  item,
  onNavigate,
  sub,
}: {
  item: NavItem;
  onNavigate?: () => void;
  sub?: boolean;
}) {
  const t = useT();
  const Icon = item.icon;
  const inner = (
    <>
      <Icon className={cn('shrink-0', sub ? 'size-[15px]' : 'size-4')} aria-hidden />
      <span className="min-w-0 flex-1 truncate" title={item.label}>
        {item.label}
      </span>
      {item.badge}
    </>
  );
  if (item.onLockedClick) {
    return (
      <button type="button" className={ITEM} onClick={item.onLockedClick}>
        {inner}
        <CrownBadge label={item.lockedLabel ?? t.common.higherPlan} />
      </button>
    );
  }
  return (
    <NavLink
      to={item.to ?? '#'}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) => cn(ITEM, isActive && 'bg-tint font-medium')}
    >
      {inner}
    </NavLink>
  );
}

function NavGroup({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const [open, setOpen] = useState(true);
  const Icon = item.icon;
  return (
    <li>
      <button type="button" className={ITEM} aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="flex-1 truncate">{item.label}</span>
        <ChevronDown
          className={cn('size-4 text-muted transition-transform', !open && '-rotate-90')}
          aria-hidden
        />
      </button>
      {open && (
        <ul className="ml-[15px] mt-0.5 space-y-0.5 border-l border-line pl-2">
          {item.children!.map((child) => (
            <li key={child.label}>
              <NavEntry item={child} onNavigate={onNavigate} sub />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function SidebarContent({
  nav,
  workspaces,
  workspaceGroupLabel,
  planCard,
  user,
  onNavigate,
}: Omit<AppShellProps, 'children'> & { onNavigate?: () => void }) {
  const t = useT();
  const base = nav[0]?.to?.split('/')[1] ?? 'betrieb';
  const more: NavItem[] = [
    { label: t.common.templates, icon: Shapes, to: `/${base}/vorlagen` },
    { label: t.common.trash, icon: Trash2, to: `/${base}/papierkorb` },
  ];
  return (
    <div className="flex h-full flex-col gap-2 bg-sidebar p-2.5">
      <div className="flex items-center justify-between px-1.5 pt-1.5">
        <span className="text-[20px] font-medium tracking-tight">ProtocolHero</span>
        <PanelLeft className="size-4 text-ink" aria-hidden />
      </div>
      <WorkspaceSwitcher options={workspaces} groupLabel={workspaceGroupLabel} />
      <nav aria-label={t.common.mainNav} className="min-h-0 flex-1 overflow-y-auto">
        <ul className="space-y-0.5">
          {nav.map((item) =>
            item.children ? (
              <NavGroup key={item.label} item={item} onNavigate={onNavigate} />
            ) : (
              <li key={item.label}>
                <NavEntry item={item} onNavigate={onNavigate} />
              </li>
            ),
          )}
        </ul>
      </nav>
      <div>
        <p className="flex items-center gap-1.5 px-2 pb-1 text-[12px] text-muted">
          <ChevronDown className="size-3.5" aria-hidden />
          {t.common.more}
        </p>
        <ul className="space-y-0.5 text-muted">
          {more.map((item) => (
            <li key={item.label}>
              <NavEntry item={item} onNavigate={onNavigate} />
            </li>
          ))}
          <li>
            <NavLink to={`/${base}/hilfe`} onClick={onNavigate} className={ITEM}>
              <CircleHelp className="size-4 shrink-0" aria-hidden />
              <span className="flex-1">{t.common.help}</span>
              <ChevronRight className="size-4 text-muted" aria-hidden />
            </NavLink>
          </li>
        </ul>
      </div>
      <PlanCard {...planCard} />
      <div className="flex items-center gap-2.5 px-1.5 py-1">
        <span className="relative">
          <Avatar initials={user.initials} round />
          <span
            className="absolute -bottom-0.5 right-0 size-2.5 rounded-full border-2 border-sidebar bg-success-icon"
            aria-hidden
          />
        </span>
        <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{user.name}</span>
        <ChevronsUpDown className="size-4 text-muted" aria-hidden />
      </div>
    </div>
  );
}

/**
 * The ProtocolHero application frame: left sidebar with workspace switcher, navigation,
 * "Mehr" section, plan card and user row; white content area on the right.
 */
export function AppShell({ children, ...sidebar }: AppShellProps) {
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="flex h-dvh min-w-0 flex-1 bg-white">
      <aside className="hidden w-[190px] shrink-0 border-r border-line md:block">
        <SidebarContent {...sidebar} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[36px] shrink-0 items-center justify-between gap-2 px-3 md:px-6">
          <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
            <DialogPrimitive.Trigger
              className="inline-flex size-[36px] items-center justify-center rounded-control hover:bg-tint md:hidden"
              aria-label={t.common.openNav}
            >
              <Menu className="size-5" aria-hidden />
            </DialogPrimitive.Trigger>
            <SheetContent side="left" aria-describedby={undefined}>
              <DialogPrimitive.Title className="sr-only">{t.common.navigation}</DialogPrimitive.Title>
              <SidebarContent {...sidebar} onNavigate={() => setMenuOpen(false)} />
            </SheetContent>
          </Dialog>
          <span className="md:hidden" />
          <span className="hidden md:block" />
          <div className="flex items-center gap-2">
            <PrototypeChip />
            <LanguageSwitch />
          </div>
        </header>
        <main className="@container min-h-0 flex-1 overflow-y-auto px-3 pb-24 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
