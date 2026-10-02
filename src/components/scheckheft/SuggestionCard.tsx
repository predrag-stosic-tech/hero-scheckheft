import { FileText, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { validateIntervalMonths } from '@/domain/due';
import { GEWERKE, type Anlage, type Gewerk } from '@/domain/types';
import { useLang, useT } from '@/i18n';
import { formatDate, formatEuro, formatEvery } from '@/lib/format';
import type { Suggestion } from '@/store';

interface Props {
  suggestion: Suggestion;
  anlagen: Anlage[];
  today: string;
  imageUrl?: string;
  onAccept: (edited: Suggestion) => void;
  onDismiss: () => void;
}

const FIELD = 'h-[48px] w-full rounded-control border border-line bg-white px-3 text-[15px]';

/**
 * Result of the simulated document recognition. Always presented as a suggestion together
 * with its source document; nothing is added until the owner accepts it.
 */
export function SuggestionCard({
  suggestion,
  anlagen,
  today,
  imageUrl,
  onAccept,
  onDismiss,
}: Props) {
  const t = useT();
  const lang = useLang();
  const [value, setValue] = useState(suggestion);
  const [edit, setEdit] = useState(false);
  const [cost, setCost] = useState(() => {
    const text = (suggestion.costCents / 100).toFixed(2);
    return lang === 'de' ? text.replace('.', ',') : text;
  });
  const [interval, setIntervalText] = useState(String(suggestion.intervalMonths));
  const anlage = anlagen.find((a) => a.id === value.anlageId) ?? anlagen[0];
  const gewerk = anlage.gewerk;

  const costCents = (() => {
    // German uses a decimal comma, English a decimal point.
    const n = Number(
      lang === 'de' ? cost.replace(/\./g, '').replace(',', '.') : cost.replace(/,/g, ''),
    );
    return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
  })();
  const months = validateIntervalMonths(interval);
  const dateOk = value.date <= today;
  const valid = costCents !== undefined && months !== undefined && dateOk;

  const setGewerk = (g: Gewerk) => {
    const first = anlagen.find((a) => a.gewerk === g);
    if (first) setValue((v) => ({ ...v, anlageId: first.id }));
  };

  return (
    <section aria-label={t.suggestion.label}>
      <p className="flex items-center gap-2 text-[17px] font-semibold">
        <Sparkles className="size-5 text-gold-ink" aria-hidden />
        {t.suggestion.heading}
      </p>
      <p className="text-[14px] text-muted">
        {t.suggestion.sub}
      </p>

      <div className="mt-3 flex items-center gap-3 rounded-card border border-line bg-white p-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={t.suggestion.photoAlt}
            className="size-[56px] rounded-[8px] object-cover"
          />
        ) : (
          <span
            className="inline-flex size-[56px] shrink-0 items-center justify-center rounded-[8px] bg-tint"
            aria-hidden
          >
            <FileText className="size-6" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[12px] text-muted">{t.suggestion.source}</p>
          <p className="truncate font-medium">{t.suggestion.sourceTitle(value.betriebName)}</p>
        </div>
      </div>

      {!edit ? (
        <dl className="mt-3 divide-y divide-line rounded-card border border-line bg-white px-3.5">
          {[
            [t.suggestion.trade, t.gewerk[gewerk]],
            [t.suggestion.installation, anlage.name],
            [t.suggestion.work, value.title],
            [t.suggestion.date, formatDate(value.date)],
            [t.suggestion.cost, formatEuro(value.costCents)],
            [
              t.suggestion.next,
              `${formatEvery(value.intervalMonths)} · ${t.common.recommendation}`,
            ],
          ].map(([label, text]) => (
            <div key={label} className="flex justify-between gap-4 py-2.5 text-[15px]">
              <dt className="text-muted">{label}</dt>
              <dd className="text-right font-medium">{text}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="mt-3 space-y-4 rounded-card border border-line bg-white p-3.5">
          <fieldset>
            <legend className="text-[13px] text-muted">{t.suggestion.trade}</legend>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {GEWERKE.filter((g) => anlagen.some((a) => a.gewerk === g)).map((g) => (
                <Pill key={g} touch active={g === gewerk} onClick={() => setGewerk(g)}>
                  {t.gewerk[g]}
                </Pill>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-[13px] text-muted">{t.suggestion.installation}</legend>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {anlagen
                .filter((a) => a.gewerk === gewerk)
                .map((a) => (
                  <Pill
                    key={a.id}
                    touch
                    active={a.id === anlage.id}
                    onClick={() => setValue((v) => ({ ...v, anlageId: a.id }))}
                  >
                    {a.name}
                  </Pill>
                ))}
            </div>
          </fieldset>
          <label className="block text-[13px] text-muted">
            {t.suggestion.date}
            <input
              type="date"
              max={today}
              value={value.date}
              aria-invalid={!dateOk}
              onChange={(e) => e.target.value && setValue((v) => ({ ...v, date: e.target.value }))}
              className={`${FIELD} mt-1 text-ink`}
            />
          </label>
          <label className="block text-[13px] text-muted">
            {t.suggestion.costField}
            <input
              inputMode="decimal"
              value={cost}
              aria-invalid={costCents === undefined}
              onChange={(e) => {
                setCost(e.target.value);
              }}
              className={`${FIELD} mt-1 text-ink`}
            />
          </label>
          <label className="block text-[13px] text-muted">
            {t.suggestion.intervalField}
            <input
              inputMode="numeric"
              value={interval}
              aria-invalid={months === undefined}
              onChange={(e) => setIntervalText(e.target.value)}
              className={`${FIELD} mt-1 text-ink`}
            />
          </label>
          {!valid && (
            <p role="alert" className="text-[13px] text-danger-text">
              {t.suggestion.invalid}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 space-y-2">
        <Button
          size="touch"
          className="w-full"
          disabled={!valid}
          onClick={() =>
            valid && onAccept({ ...value, costCents: costCents!, intervalMonths: months! })
          }
        >
          {t.suggestion.accept}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="touch"
            onClick={() => {
              if (edit && valid) {
                setValue((v) => ({ ...v, costCents: costCents!, intervalMonths: months! }));
              }
              setEdit(!edit);
            }}
            disabled={edit && !valid}
          >
            {edit ? t.suggestion.done : t.suggestion.edit}
          </Button>
          <Button variant="ghost" size="touch" onClick={onDismiss}>
            {t.suggestion.dismiss}
          </Button>
        </div>
      </div>
    </section>
  );
}
