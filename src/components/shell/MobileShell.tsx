import { FileText, History, House, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { useT, type Dict } from '@/i18n';
import { cn } from '@/lib/cn';
import { isEmbedded } from '@/lib/hooks';
import { LanguageSwitch } from './LanguageSwitch';
import { PrototypeChip } from './PrototypeChip';

const TABS: Array<{
  to: string;
  label: (t: Dict) => string;
  icon: LucideIcon;
  end?: boolean;
}> = [
  { to: '/m', label: (t) => t.mobile.tabOverview, icon: House, end: true },
  { to: '/m/historie', label: (t) => t.mobile.tabHistory, icon: History },
  { to: '/m/dokumente', label: (t) => t.mobile.tabDocuments, icon: FileText },
];

/** Keeps the embed flag of the phone preview when switching tabs. */
function withSearch(to: string): string {
  return to + window.location.search;
}

export function BottomTabs({ embedded }: { embedded?: boolean }) {
  const t = useT();
  return (
    <nav
      aria-label={t.mobile.tabs}
      className={cn(
        'no-print shrink-0 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]',
        // Room for the rounded corners of the preview frame, like a home indicator area.
        embedded && 'pb-2',
      )}
    >
      <ul className="grid grid-cols-3">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={withSearch(to)}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[60px] flex-col items-center justify-center gap-1 text-[12px] font-medium',
                  isActive ? 'text-ink' : 'text-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'inline-flex h-[28px] w-[52px] items-center justify-center rounded-full',
                      isActive && 'bg-tint-strong',
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  {label(t)}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface MobileShellProps {
  title: ReactNode;
  subtitle: string;
  /** Extra line under the address, such as the companies and entries of the object. */
  meta?: ReactNode;
  headerAction?: ReactNode;
  children: ReactNode;
}

/** Owner experience on the phone: header, scrolling content and three bottom tabs. */
export function MobileShell({ title, subtitle, meta, headerAction, children }: MobileShellProps) {
  const embedded = isEmbedded();
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[560px] flex-col overflow-hidden bg-white">
      <header className="shrink-0 border-b border-line px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))]">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <PrototypeChip className="min-w-0 shrink" />
          <div className="flex shrink-0 items-center gap-1">
            <LanguageSwitch touch />
            {headerAction}
          </div>
        </div>
        <div className="mt-2 min-w-0">
          <div className="text-[19px] font-semibold leading-tight">{title}</div>
          <p className="truncate text-[14px] text-muted">{subtitle}</p>
          {meta && <div className="mt-1.5">{meta}</div>}
        </div>
      </header>
      <main
        className={cn(
          'min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-sidebar px-4 pb-8 pt-4',
          // The phone preview mimics a real phone: no desktop scrollbar inside the frame.
          embedded ? '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : '[scrollbar-width:thin]',
        )}
      >
        {children}
      </main>
      <BottomTabs embedded={embedded} />
    </div>
  );
}
