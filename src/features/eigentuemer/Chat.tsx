import { FileText, Info, SendHorizontal, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DOKUMENT_ICON, useOpenDokument } from '@/components/scheckheft/DocumentPreview';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/pill';
import { matchIntent } from '@/domain/intent';
import { simulate } from '@/lib/simulate';
import { useLang, useT } from '@/i18n';
import { buildIntents, chatFallback, CHAT_OBJEKT_ID } from '@/mocks/chat';
import { useStore } from '@/store';
import { allEntries, findDokument, useFixtures } from '@/store/selectors';

interface Message {
  id: number;
  from: 'user' | 'scheckheft';
  /** Free text the user typed; prepared questions and all answers come from the intent. */
  text?: string;
  intentId?: string;
}

/**
 * "Frag dein Scheckheft": scripted answers, always shown as a suggestion together with the
 * documents they are based on. No model is called.
 */
export default function Chat() {
  const t = useT();
  const c = t.owner.chat;
  const lang = useLang();
  const fx = useFixtures();
  const s = useStore();
  const openDokument = useOpenDokument();
  const entries = useMemo(() => allEntries(s, fx), [s, fx]);
  const intents = useMemo(
    () => buildIntents(fx, s.entries.added, lang),
    [fx, s.entries.added, lang],
  );
  const objekt = fx.objekte.find((o) => o.id === CHAT_OBJEKT_ID)!;
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const counter = useRef(0);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [messages, typing]);

  // Messages keep the intent id, so prepared questions and answers follow a language switch.
  const intentOf = (m: Message) => intents.find((i) => i.id === m.intentId);
  const textOf = (m: Message): string => {
    const intent = intentOf(m);
    if (m.from === 'user') return intent && !m.text ? intent.question : (m.text ?? '');
    return intent?.answer ?? chatFallback(lang);
  };

  const ask = async (question: string, intentId?: string) => {
    const text = question.trim();
    if (!text || typing) return;
    setDraft('');
    setMessages((m) => [
      ...m,
      { id: ++counter.current, from: 'user', ...(intentId ? { intentId } : { text }) },
    ]);
    setTyping(true);
    await simulate(800);
    const intent = intentId ? intents.find((i) => i.id === intentId) : matchIntent(text, intents);
    setTyping(false);
    setMessages((m) => [...m, { id: ++counter.current, from: 'scheckheft', intentId: intent?.id }]);
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-60px)] max-w-[860px] flex-col">
      <PageHeader
        title={c.title}
        subtitle={`${objekt.address.street} · ${objekt.title}`}
      />
      <p className="flex items-start gap-2 rounded-control border border-line bg-sidebar px-3 py-2 text-[13px]">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        {c.banner}
      </p>

      <div
        className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto rounded-card border border-line p-4"
        role="log"
        aria-live="polite"
        aria-label={c.log}
      >
        {messages.length === 0 && (
          <p className="py-6 text-center text-[14px] text-muted">
            {c.empty}
          </p>
        )}
        {messages.map((m) => {
          const sources = m.from === 'scheckheft' ? (intentOf(m)?.sourceDokumentIds ?? []) : [];
          return m.from === 'user' ? (
            <p
              key={m.id}
              className="ml-auto w-fit max-w-[80%] rounded-[14px] bg-primary px-3.5 py-2 text-[14px] text-white"
            >
              {textOf(m)}
            </p>
          ) : (
            <div
              key={m.id}
              className="w-fit max-w-[88%] rounded-[14px] border border-line bg-white px-3.5 py-2.5"
            >
              <Badge tone="gold" icon={<Sparkles className="size-3" aria-hidden />}>
                {c.suggestion}
              </Badge>
              <p className="mt-1.5 text-[14px] leading-relaxed">{textOf(m)}</p>
              {sources.length > 0 && (
                <div className="mt-2.5">
                  <p className="text-[12px] text-muted">{c.sources}</p>
                  <ul className="mt-1 flex flex-wrap gap-1.5">
                    {sources.slice(0, 6).map((id) => {
                      const ref = findDokument(entries, fx, id);
                      if (!ref) return null;
                      const Icon = DOKUMENT_ICON[ref.dokument.typ] ?? FileText;
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            onClick={() => openDokument(ref)}
                            className="inline-flex h-[28px] max-w-[260px] items-center gap-1.5 rounded-full border border-gold bg-gold-tint px-2.5 text-[12px] font-medium hover:border-gold-strong"
                          >
                            <Icon className="size-3.5 shrink-0" aria-hidden />
                            <span className="truncate">{ref.dokument.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
        {typing && (
          <p
            role="status"
            className="flex w-fit items-center gap-1 rounded-[14px] border border-line px-3.5 py-3"
          >
            <span className="sr-only">{c.searching}</span>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 animate-bounce rounded-full bg-muted"
                style={{ animationDelay: `${i * 120}ms` }}
                aria-hidden
              />
            ))}
          </p>
        )}
        <div ref={end} />
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={c.suggested}>
        {intents.map((i) => (
          <li key={i.id}>
            <button
              type="button"
              disabled={typing}
              onClick={() => ask(i.question)}
              className="inline-flex min-h-[30px] items-center rounded-full bg-tint px-3 py-1 text-left text-[13px] font-medium hover:bg-tint-strong disabled:opacity-50"
            >
              {i.question}
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-2 flex gap-2 pb-3"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(draft);
        }}
      >
        <label className="sr-only" htmlFor="chat-input">
          {c.inputLabel}
        </label>
        <input
          id="chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={c.placeholder}
          className="h-[40px] min-w-0 flex-1 rounded-control border border-line px-3 text-[14px] placeholder:text-muted"
        />
        <Button type="submit" className="h-[40px]" disabled={typing || !draft.trim()}>
          <SendHorizontal className="size-4" aria-hidden />
          {c.send}
        </Button>
      </form>
    </div>
  );
}
