import { ListFilter, Search, SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { useT } from '@/i18n';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  searchPlaceholder?: string;
  /** Shows the "Filter" and "Darstellung" labels of the ProtocolHero toolbars (not interactive). */
  toolbar?: boolean;
}

/** Title row of a page: title on the left, search and buttons on the right. */
export function PageHeader({
  title,
  subtitle,
  actions,
  searchPlaceholder,
  toolbar,
}: PageHeaderProps) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 pt-1">
      <div className="min-w-0">
        <h1 className="text-[16px] font-medium">{title}</h1>
        {subtitle && <p className="text-[13px] text-muted">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {toolbar && (
          <span className="hidden items-center gap-5 pr-2 text-[14px] lg:flex" aria-hidden>
            <span className="flex items-center gap-2">
              <ListFilter className="size-4" />
              {t.common.filter}
            </span>
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" />
              {t.common.view}
            </span>
          </span>
        )}
        {searchPlaceholder && (
          <label className="hidden h-[36px] w-[200px] items-center gap-2 rounded-control border border-line px-2.5 text-muted lg:flex">
            <Search className="size-4" aria-hidden />
            <span className="sr-only">{searchPlaceholder}</span>
            <input
              type="search"
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-muted"
            />
          </label>
        )}
        {actions}
      </div>
    </div>
  );
}
