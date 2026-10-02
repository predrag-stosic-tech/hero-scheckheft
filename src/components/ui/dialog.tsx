import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

interface ContentProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  hideClose?: boolean;
  children: ReactNode;
}

export function DialogContent({ className, children, hideClose, ...props }: ContentProps) {
  const t = useT();
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 max-h-[92dvh] w-[calc(100vw-24px)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card bg-white p-6 shadow-pop',
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            className="absolute right-1.5 top-1.5 inline-flex size-[48px] items-center justify-center rounded-full bg-white text-ink hover:bg-tint md:right-3 md:top-3 md:size-[32px] md:border md:border-line"
            aria-label={t.common.close}
          >
            <X className="size-4" aria-hidden />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

interface SheetProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: 'bottom' | 'left' | 'right';
  children: ReactNode;
}

/** Sheet built on the dialog primitive: bottom sheet on the phone, side drawer in the shell. */
export function SheetContent({ side = 'bottom', className, children, ...props }: SheetProps) {
  const t = useT();
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay" />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 overflow-y-auto bg-white shadow-pop',
          // Bottom sheet on the phone, centred dialog from tablet width upwards.
          side === 'bottom' &&
            'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[20px] p-5 pb-[max(20px,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-[460px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-card',
          side === 'left' && 'inset-y-0 left-0 w-[260px] max-w-[85vw]',
          side === 'right' && 'inset-y-0 right-0 w-[380px] max-w-[92vw] p-5',
          className,
        )}
        {...props}
      >
        {side === 'bottom' && (
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line md:hidden" aria-hidden />
        )}
        {children}
        {side !== 'left' && (
          <DialogPrimitive.Close
            className="absolute right-3 top-3 inline-flex size-[48px] items-center justify-center rounded-full text-ink hover:bg-tint"
            aria-label={t.common.close}
          >
            <X className="size-5" aria-hidden />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
