import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Benachrichtigung } from '@/domain/types';
import { getLang, getT } from '@/i18n';
import { buildFixtures, todayISO } from '@/mocks';
import { useStore } from '@/store';
import { notificationText } from './notifications';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/** True inside the phone preview iframe (`?embed=1`). */
export function isEmbedded(): boolean {
  return new URLSearchParams(window.location.search).get('embed') === '1';
}

/**
 * Shows a toast for every notification addressed to this surface that arrives after the
 * surface was loaded. Notifications that already existed at load are not toasted.
 */
export function useIncomingToasts(
  audience: Benachrichtigung['audience'],
  onArrive?: (n: Benachrichtigung) => void,
): void {
  const notifications = useStore((s) => s.notifications);
  const seen = useRef<Set<string> | null>(null);
  const callback = useRef(onArrive);
  callback.current = onArrive;

  useEffect(() => {
    if (seen.current === null) {
      seen.current = new Set(notifications.map((n) => n.id));
      return;
    }
    for (const n of notifications) {
      if (seen.current.has(n.id)) continue;
      seen.current.add(n.id);
      if (n.audience !== audience) continue;
      toast(notificationText(n, getT(), buildFixtures(todayISO(), getLang())), { id: n.id });
      callback.current?.(n);
    }
  }, [notifications, audience]);
}
