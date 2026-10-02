import type { Benachrichtigung } from '@/domain/types';
import type { Dict } from '@/i18n';
import type { Fixtures } from '@/mocks';

/** Text of a notification in the current UI language. */
export function notificationText(n: Benachrichtigung, t: Dict, fx: Fixtures): string {
  if (n.kind === 'terminanfrage') {
    const owner = fx.workspaces.find((w) => w.id === n.workspaceId)?.name ?? '';
    const rule = fx.rules.find((r) => r.id === n.ruleId)?.title ?? '';
    return t.notification.request(owner, rule);
  }
  return t.notification.newEntry(n.betriebName ?? '');
}
