import { LANGS, useLangStore, useT } from '@/i18n';
import { cn } from '@/lib/cn';

/** DE | EN switch in the style of ProtocolHero's own language toggle. */
export function LanguageSwitch({ touch, className }: { touch?: boolean; className?: string }) {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={cn('no-print inline-flex shrink-0 rounded-control bg-tint p-0.5', className)}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          aria-label={t.common.languageName[l]}
          onClick={() => setLang(l)}
          className={cn(
            'inline-flex items-center justify-center rounded-[6px] font-medium uppercase',
            touch ? 'min-h-[44px] min-w-[48px] text-[14px]' : 'h-[24px] min-w-[34px] text-[12px]',
            lang === l ? 'bg-white text-ink shadow-card' : 'text-muted hover:text-ink',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
