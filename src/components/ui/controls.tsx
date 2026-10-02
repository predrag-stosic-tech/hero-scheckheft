import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

// --- Tabs: segmented control as on the ProtocolHero Startseite -----------------------------

export const Tabs = TabsPrimitive.Root;
export const TabsContent = TabsPrimitive.Content;

export function TabsList({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('flex w-full gap-1 overflow-x-auto rounded-control bg-tint p-1', className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex h-[28px] min-w-[96px] flex-1 items-center justify-center gap-1.5 rounded-[6px] px-3 text-[13px] font-medium text-ink',
        'data-[state=active]:bg-white data-[state=active]:shadow-card',
        className,
      )}
      {...props}
    />
  );
}

// --- Switch -------------------------------------------------------------------------------

export function Switch({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'inline-flex h-[26px] w-[46px] shrink-0 items-center rounded-full bg-tint-strong p-[3px] transition-colors data-[state=checked]:bg-primary',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-[20px] rounded-full bg-white shadow-card transition-transform data-[state=checked]:translate-x-[20px]" />
    </SwitchPrimitive.Root>
  );
}

// --- Tooltip ------------------------------------------------------------------------------

export const TooltipProvider = TooltipPrimitive.Provider;

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className="z-[60] rounded-[6px] bg-primary px-2 py-1 text-[12px] text-white shadow-pop"
        >
          {label}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

// --- Dropdown menu ------------------------------------------------------------------------

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        sideOffset={6}
        align="start"
        className={cn(
          'z-[60] min-w-[220px] rounded-card border border-line bg-white p-1.5 shadow-pop',
          className,
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        'flex min-h-[36px] cursor-pointer items-center gap-2.5 rounded-[6px] px-2 text-[14px] outline-none data-[highlighted]:bg-tint',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
  return (
    <DropdownPrimitive.Label className="px-2 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
      {children}
    </DropdownPrimitive.Label>
  );
}

export const DropdownMenuSeparator = () => (
  <DropdownPrimitive.Separator className="my-1 h-px bg-line" />
);
