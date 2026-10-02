import { CalendarCheck, Camera, Check, FileText, LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ShareFlow } from '@/components/scheckheft/ShareFlow';
import { SuggestionCard } from '@/components/scheckheft/SuggestionCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogTitle, SheetContent } from '@/components/ui/dialog';
import type { Anlage, DueItem, Objekt } from '@/domain/types';
import { useT } from '@/i18n';
import { formatDue } from '@/lib/format';
import { useStore, type Suggestion } from '@/store';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Confirmation sheet for "Termin anfragen". Two taps, no typing. */
export function TerminSheet({
  item,
  objekt,
  today,
  open,
  onOpenChange,
}: SheetProps & { item: DueItem | null; objekt: Objekt; today: string }) {
  const t = useT();
  const tm = t.mobile.termin;
  const requestTermin = useStore((s) => s.requestTermin);
  const [phase, setPhase] = useState<'confirm' | 'loading' | 'done'>('confirm');
  // Keep showing the item while the sheet closes or after the due item changed.
  const shown = useRef<DueItem | null>(item);
  if (item) shown.current = item;
  const it = shown.current;

  useEffect(() => {
    if (open) setPhase('confirm');
  }, [open]);

  if (!it) return null;
  const betrieb = it.lastEntry.betriebName;

  const send = async () => {
    setPhase('loading');
    await requestTermin(it.rule.id);
    setPhase('done');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => phase !== 'loading' && onOpenChange(o)}>
      <SheetContent>
        {phase === 'done' ? (
          <div className="py-2 text-center">
            <span className="mx-auto inline-flex size-[56px] items-center justify-center rounded-full bg-success-bg text-success">
              <Check className="size-7" aria-hidden />
            </span>
            <DialogTitle className="mt-3 text-[19px] font-semibold">{tm.sentTitle}</DialogTitle>
            <DialogDescription className="mt-1 text-[15px] text-muted">
              {tm.sentText(betrieb)}
            </DialogDescription>
            <Button size="touch" className="mt-5 w-full" onClick={() => onOpenChange(false)}>
              {t.common.done}
            </Button>
          </div>
        ) : (
          <>
            <DialogTitle className="pr-12 text-[19px] font-semibold">{tm.title}</DialogTitle>
            <DialogDescription className="text-[15px] text-muted">
              {tm.sub}
            </DialogDescription>
            <dl className="mt-4 divide-y divide-line rounded-card border border-line px-3.5">
              {[
                [tm.what, it.rule.title],
                [tm.when, `${formatDue(it.dueDate, today)} · ${t.common.recommendation}`],
                [tm.where, `${objekt.address.street}, ${objekt.address.city}`],
                [tm.company, betrieb],
              ].map(([label, text]) => (
                <div key={label} className="flex justify-between gap-4 py-3 text-[15px]">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right font-medium">{text}</dd>
                </div>
              ))}
            </dl>
            <Button
              size="touch"
              className="mt-5 w-full"
              loading={phase === 'loading'}
              onClick={send}
            >
              <CalendarCheck className="size-5" aria-hidden />
              {tm.send}
            </Button>
          </>
        )}
      </SheetContent>
    </Dialog>
  );
}

export function ShareSheet({ objekt, open, onOpenChange }: SheetProps & { objekt: Objekt }) {
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <DialogTitle className="pr-12 text-[19px] font-semibold">
          {t.mobile.shareSheet.title}
        </DialogTitle>
        <DialogDescription className="mb-4 text-[15px] text-muted">
          {t.mobile.shareSheet.sub}
        </DialogDescription>
        {/* Remount on open so every share starts with the preselected choices. */}
        {open && <ShareFlow objektId={objekt.id} touch />}
      </SheetContent>
    </Dialog>
  );
}

/** Add a document from a company that does not use ProtocolHero. */
export function UploadSheet({
  anlagen,
  today,
  open,
  onOpenChange,
}: SheetProps & { anlagen: Anlage[]; today: string }) {
  const t = useT();
  const u = t.mobile.upload;
  const extractUpload = useStore((s) => s.extractUpload);
  const acceptSuggestion = useStore((s) => s.acceptSuggestion);
  const already = useStore((s) => s.demo.activatedScenarios.includes('s5-upload'));
  const [phase, setPhase] = useState<'pick' | 'reading' | 'suggest'>('pick');
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [imageUrl, setImageUrl] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPhase('pick');
      setSuggestion(null);
      setImageUrl(undefined);
    }
  }, [open]);

  useEffect(() => () => void (imageUrl && URL.revokeObjectURL(imageUrl)), [imageUrl]);

  const read = async (file?: File) => {
    // The photo is only shown as the source thumbnail. Nothing is read from it.
    if (file) setImageUrl(URL.createObjectURL(file));
    setPhase('reading');
    setSuggestion(await extractUpload());
    setPhase('suggest');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => phase !== 'reading' && onOpenChange(o)}>
      <SheetContent>
        {phase === 'suggest' && suggestion ? (
          <>
            <DialogTitle className="sr-only">{u.check}</DialogTitle>
            <DialogDescription className="sr-only">
              {u.recognized}
            </DialogDescription>
            <SuggestionCard
              suggestion={suggestion}
              anlagen={anlagen}
              today={today}
              imageUrl={imageUrl}
              onDismiss={() => onOpenChange(false)}
              onAccept={(edited) => {
                acceptSuggestion(edited);
                onOpenChange(false);
                toast.success(u.added, {
                  description: u.addedText,
                });
              }}
            />
          </>
        ) : (
          <>
            <DialogTitle className="pr-12 text-[19px] font-semibold">
              {u.title}
            </DialogTitle>
            <DialogDescription className="text-[15px] text-muted">
              {u.sub}
            </DialogDescription>
            {phase === 'reading' ? (
              <p
                role="status"
                className="mt-6 flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-card border border-line text-[15px]"
              >
                <LoaderCircle className="size-7 animate-spin" aria-hidden />
                {u.reading}
              </p>
            ) : already ? (
              <p className="mt-5 rounded-card border border-line p-4 text-[15px]">
                {u.already}
              </p>
            ) : (
              <div className="mt-5 space-y-2">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  aria-label={u.choosePhoto}
                  tabIndex={-1}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void read(file);
                  }}
                />
                <Button size="touch" className="w-full" onClick={() => fileInput.current?.click()}>
                  <Camera className="size-5" aria-hidden />
                  {u.takePhoto}
                </Button>
                <Button variant="outline" size="touch" className="w-full" onClick={() => read()}>
                  <FileText className="size-5" aria-hidden />
                  {u.sample}
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Dialog>
  );
}
