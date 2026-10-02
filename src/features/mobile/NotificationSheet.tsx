import { BellRing, FilePlus2 } from 'lucide-react';
import { useEffect } from 'react';
import { Dialog, DialogDescription, DialogTitle, SheetContent } from '@/components/ui/dialog';
import type { DueItem } from '@/domain/types';
import { useT } from '@/i18n';
import { formatDue } from '@/lib/format';
import { notificationText } from '@/lib/notifications';
import { useFixtures } from '@/store/selectors';
import { useStore } from '@/store';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: DueItem[];
  today: string;
}

/** Notification list: incoming entries that were announced by toast, plus reminders. */
export function NotificationSheet({ open, onOpenChange, items, today }: Props) {
  const t = useT();
  const fx = useFixtures();
  const ns = t.mobile.notificationSheet;
  const notifications = useStore((s) => s.notifications).filter((n) => n.audience === 'owner');
  const markRead = useStore((s) => s.markNotificationsRead);
  const reminders = items.filter((i) => i.status === 'overdue' || i.status === 'due30');

  useEffect(() => {
    if (open) markRead('owner');
  }, [open, markRead]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <DialogTitle className="pr-12 text-[19px] font-semibold">{ns.title}</DialogTitle>
        <DialogDescription className="text-[14px] text-muted">
          {ns.sub}
        </DialogDescription>
        <ul className="mt-4 space-y-2">
          {[...notifications].reverse().map((n) => (
            <li key={n.id} className="flex items-start gap-3 rounded-card border border-line p-3">
              <FilePlus2 className="mt-0.5 size-5 shrink-0 text-success-icon" aria-hidden />
              <p className="text-[15px]">{notificationText(n, t, fx)}</p>
            </li>
          ))}
          {reminders.map((i) => (
            <li
              key={i.rule.id}
              className="flex items-start gap-3 rounded-card border border-line p-3"
            >
              <BellRing className="mt-0.5 size-5 shrink-0 text-warn" aria-hidden />
              <p className="text-[15px]">
                {t.notification.reminder(i.rule.title, formatDue(i.dueDate, today))}
                <span className="block text-[13px] text-muted">{t.common.recommendation}</span>
              </p>
            </li>
          ))}
          {notifications.length + reminders.length === 0 && (
            <li className="rounded-card border border-dashed border-line p-4 text-[15px] text-muted">
              {ns.nothingNew}
            </li>
          )}
        </ul>
      </SheetContent>
    </Dialog>
  );
}
