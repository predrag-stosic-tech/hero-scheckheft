import { FlaskConical } from 'lucide-react';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

/** Shown on every surface: all data in the prototype is fictitious. */
export function PrototypeChip({ className }: { className?: string }) {
  const t = useT();
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-0.5 text-[11px] font-medium text-muted',
        className,
      )}
    >
      <FlaskConical className="size-3 shrink-0" aria-hidden />
      <span className="truncate">{t.common.prototype}</span>
    </span>
  );
}
