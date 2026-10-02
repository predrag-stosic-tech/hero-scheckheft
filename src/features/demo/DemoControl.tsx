import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Building2, Monitor, RotateCcw, Smartphone, Wrench, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/controls';
import { Pill } from '@/components/ui/pill';
import { LanguageSwitch } from '@/components/shell/LanguageSwitch';
import type { Plan } from '@/domain/types';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { isEmbedded, useMediaQuery } from '@/lib/hooks';
import { useStore } from '@/store';
import { effectivePlan } from '@/store/selectors';
import { PREVIEW_MIN_WIDTH, PREVIEW_PANEL_WIDTH } from './PhonePreview';

/** Original glyph for the floating button and the app icons. Not the ProtocolHero logo. */
export function Glyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M8.5 20V5h5.25a4.5 4.5 0 0 1 0 9H8.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16.5" cy="18.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

const SECTION = 'text-[11px] font-medium uppercase tracking-wide text-muted';

/**
 * "Demo-Steuerung": lets the presenter switch perspective, trigger incoming entries,
 * set the plan and reset the demo. It is a demo aid and not part of the product UI.
 */
export function DemoControl() {
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const wide = useMediaQuery(`(min-width: ${PREVIEW_MIN_WIDTH}px)`);
  const s = useStore();
  const t = useT();
  const d = t.demo;

  if (pathname.startsWith('/share') || isEmbedded()) return null;

  const onBetrieb = pathname.startsWith('/betrieb');
  const onMobile = pathname.startsWith('/m');
  const previewShown = onBetrieb && wide && s.demo.previewVisible;
  const plan = effectivePlan(s);
  const activated = s.demo.activatedScenarios;

  const go = (to: string) => {
    navigate(to);
    setOpen(false);
  };
  const trigger = async (id: 's1-elektro' | 'shk-incoming') => {
    setBusy(id);
    await s.triggerScenario(id);
    setBusy(null);
    toast.success(d.triggered, {
      description: d.triggeredText,
    });
  };

  const views = [
    {
      label: d.viewElektro,
      icon: Zap,
      active: onBetrieb && s.demo.activeBetrieb === 'elektro-stosic',
      run: () => {
        s.setActiveBetrieb('elektro-stosic');
        go('/betrieb');
      },
    },
    {
      label: d.viewShk,
      icon: Wrench,
      active: onBetrieb && s.demo.activeBetrieb === 'shk-becker',
      run: () => {
        s.setActiveBetrieb('shk-becker');
        go('/betrieb');
      },
    },
    {
      label: d.viewOwnerWeb,
      icon: Monitor,
      active: pathname.startsWith('/eigentuemer'),
      run: () => go('/eigentuemer'),
    },
    { label: d.viewOwnerMobile, icon: Smartphone, active: onMobile, run: () => go('/m') },
  ];

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setConfirmReset(false);
      }}
    >
      <DialogPrimitive.Trigger
        aria-label={d.open}
        className={cn(
          'no-print fixed z-40 inline-flex items-center justify-center rounded-full bg-primary text-white shadow-pop hover:bg-ink',
          // On the phone surface the button is smaller and sits above the bottom tabs.
          onMobile ? 'bottom-[72px] right-3 size-[48px]' : 'bottom-5 right-5 size-[52px]',
        )}
        style={previewShown ? { right: PREVIEW_PANEL_WIDTH + 20 } : undefined}
      >
        <Glyph className="size-7" />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed bottom-4 right-4 z-50 max-h-[calc(100dvh-32px)] w-[min(360px,calc(100vw-32px))] overflow-y-auto rounded-card border border-line bg-white p-4 shadow-pop"
        >
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="text-[15px] font-semibold">
              {d.title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="inline-flex size-[36px] items-center justify-center rounded-full hover:bg-tint"
              aria-label={t.common.close}
            >
              <X className="size-4" aria-hidden />
            </DialogPrimitive.Close>
          </div>
          <p className="text-[12px] text-muted">{d.subtitle}</p>

          <p className={cn(SECTION, 'mt-4')}>{d.switchView}</p>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {views.map(({ label, icon: Icon, active, run }) => (
              <button
                key={label}
                type="button"
                onClick={run}
                aria-pressed={active}
                className={cn(
                  'flex min-h-[48px] items-center gap-2 rounded-control border px-2.5 text-left text-[13px] font-medium',
                  active ? 'border-primary bg-primary text-white' : 'border-line hover:bg-tint',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {label}
              </button>
            ))}
          </div>

          <p className={cn(SECTION, 'mt-4')}>{d.events}</p>
          <div className="mt-1.5 space-y-1.5">
            <Button
              variant="outline"
              className="h-auto min-h-[44px] w-full justify-start whitespace-normal py-1.5 text-left"
              loading={busy === 's1-elektro'}
              disabled={activated.includes('s1-elektro')}
              onClick={() => trigger('s1-elektro')}
            >
              <Building2 className="size-4 shrink-0" aria-hidden />
              <span>
                {d.triggerS1}
                {activated.includes('s1-elektro') && (
                  <span className="block text-[12px] text-muted">{d.alreadyTriggered}</span>
                )}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto min-h-[44px] w-full justify-start whitespace-normal py-1.5 text-left"
              loading={busy === 'shk-incoming'}
              disabled={activated.includes('shk-incoming')}
              onClick={() => trigger('shk-incoming')}
            >
              <Wrench className="size-4 shrink-0" aria-hidden />
              <span>
                {d.triggerShk}
                {activated.includes('shk-incoming') && (
                  <span className="block text-[12px] text-muted">{d.alreadyTriggered}</span>
                )}
              </span>
            </Button>
          </div>

          <p className={cn(SECTION, 'mt-4')}>{d.setPlan}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {(['kostenlos', 'advanced', 'pro'] as Plan[]).map((p) => (
              <Pill
                key={p}
                active={plan === p}
                className="h-[32px] px-3.5 text-[13px]"
                onClick={() => {
                  s.setPlan(p);
                  if (!pathname.startsWith('/m')) go('/eigentuemer');
                }}
              >
                {t.plan[p]}
              </Pill>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className={SECTION}>{t.common.language}</p>
            <LanguageSwitch />
          </div>

          <label className="mt-4 flex min-h-[40px] items-center justify-between gap-3 text-[13px]">
            <span>
              {d.preview}
              <span className="block text-[12px] text-muted">{d.previewHint}</span>
            </span>
            <Switch
              checked={s.demo.previewVisible}
              onCheckedChange={s.setPreviewVisible}
              aria-label={d.previewToggle}
            />
          </label>

          <div className="mt-4 border-t border-line pt-3">
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <span className="flex-1 text-[13px]">{d.resetQuestion}</span>
                <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
                  {t.common.cancel}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    s.resetDemo();
                    setConfirmReset(false);
                    toast(d.resetDone);
                    go(onMobile ? '/m' : '/betrieb');
                  }}
                >
                  {d.reset}
                </Button>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setConfirmReset(true)}>
                <RotateCcw className="size-4" aria-hidden />
                {d.resetButton}
              </Button>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
