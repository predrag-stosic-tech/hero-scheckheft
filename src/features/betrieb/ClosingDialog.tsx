import { addMonths, format, parseISO } from 'date-fns';
import { BookCheck, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/controls';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { validateIntervalMonths } from '@/domain/due';
import type { Einreichung } from '@/domain/types';
import { useT } from '@/i18n';
import { formatInterval, formatMonthYear } from '@/lib/format';
import { useStore } from '@/store';
import { useFixtures } from '@/store/selectors';

interface Props {
  einreichung: Einreichung;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Closing dialog of an Einreichung. The transfer into the customer's Scheckheft is on by
 * default when the Bezugspunkt is an object; the interval is a suggestion and can be edited.
 */
export function ClosingDialog({ einreichung, open, onOpenChange }: Props) {
  const t = useT();
  const c = t.betrieb.closing;
  const fx = useFixtures();
  const navigate = useNavigate();
  const completeEinreichung = useStore((s) => s.completeEinreichung);
  const isObjekt = einreichung.bezugspunkt.kind === 'objekt';
  const canTransfer = isObjekt && !!einreichung.scenarioId;

  const [transfer, setTransfer] = useState(canTransfer);
  const [months, setMonths] = useState(einreichung.intervalMonths ?? 12);
  const [editing, setEditing] = useState(false);
  const [unit, setUnit] = useState<'jahre' | 'monate'>(months % 12 === 0 ? 'jahre' : 'monate');
  const [draft, setDraft] = useState(String(months % 12 === 0 ? months / 12 : months));
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const commit = (value: string, u: 'jahre' | 'monate') => {
    const n = Number(value.replace(',', '.'));
    const valid = validateIntervalMonths(u === 'jahre' ? n * 12 : n);
    if (valid === undefined) {
      // Invalid input is not accepted; the previous value stays.
      setError(true);
      setDraft(String(months % 12 === 0 && u === 'jahre' ? months / 12 : months));
      if (!(months % 12 === 0 && u === 'jahre')) setUnit('monate');
      return;
    }
    setError(false);
    setMonths(valid);
  };

  const confirm = async () => {
    setLoading(true);
    await completeEinreichung(einreichung.id, {
      transfer: transfer && canTransfer,
      intervalMonths: months,
    });
    setLoading(false);
    onOpenChange(false);
    if (transfer && canTransfer) {
      toast.success(c.toastDone, {
        description: c.toastDoneText(einreichung.kunde),
        action: { label: c.viewInScheckheft, onClick: () => navigate('/m/historie') },
      });
    } else {
      toast.success(c.toastDone);
    }
  };

  const nextDate = formatMonthYear(format(addMonths(parseISO(fx.today), months), 'yyyy-MM-dd'));

  return (
    <Dialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <DialogContent className="max-w-[520px]">
        <DialogTitle className="pr-10 text-[17px] font-semibold">{c.title}</DialogTitle>
        <DialogDescription className="mt-1 text-[14px] text-muted">
          {einreichung.title}
        </DialogDescription>

        <div className="mt-5 rounded-card border border-line p-4">
          <div className="flex items-start gap-3">
            <span
              className="inline-flex size-[36px] shrink-0 items-center justify-center rounded-full bg-gold-tint text-gold-ink"
              aria-hidden
            >
              <BookCheck className="size-[18px]" />
            </span>
            <label htmlFor="transfer" className="min-w-0 flex-1">
              <span className="block font-semibold">{c.transfer}</span>
              <span className="block text-[13px] text-muted">
                {canTransfer ? c.transferText(einreichung.kunde) : c.transferDisabled}
              </span>
            </label>
            <Switch
              id="transfer"
              checked={transfer && canTransfer}
              disabled={!canTransfer}
              onCheckedChange={setTransfer}
            />
          </div>

          {transfer && canTransfer && (
            <div className="mt-4 border-t border-line pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[14px]">
                  <span className="font-medium">
                    {c.nextIn(einreichung.ruleTitle ?? '', formatInterval(months))}
                  </span>
                  <span className="text-muted"> · {t.common.recommendation}</span>
                </p>
                {!editing && (
                  <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                    <Pencil className="size-3.5" aria-hidden />
                    {c.change}
                  </Button>
                )}
              </div>
              <p className="text-[13px] text-muted">{c.reminder(nextDate)}</p>
              {editing && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label htmlFor="interval" className="text-[13px]">
                    {c.interval}
                  </label>
                  <input
                    id="interval"
                    inputMode="numeric"
                    value={draft}
                    aria-invalid={error}
                    aria-describedby={error ? 'interval-error' : undefined}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => commit(draft, unit)}
                    className="h-[36px] w-[72px] rounded-control border border-line px-2.5 text-[14px] tabular-nums"
                  />
                  <select
                    aria-label={c.unit}
                    value={unit}
                    onChange={(e) => {
                      const u = e.target.value as 'jahre' | 'monate';
                      setUnit(u);
                      commit(draft, u);
                    }}
                    className="h-[36px] rounded-control border border-line bg-white px-2 text-[14px]"
                  >
                    <option value="jahre">{c.years}</option>
                    <option value="monate">{c.months}</option>
                  </select>
                  {error && (
                    <p
                      id="interval-error"
                      role="alert"
                      className="w-full text-[13px] text-danger-text"
                    >
                      {c.invalid}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t.common.cancel}
          </Button>
          <Button onClick={confirm} loading={loading} data-testid="confirm-close">
            {transfer && canTransfer ? c.confirmTransfer : c.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
