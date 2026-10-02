import { useEffect, type ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/controls';
import { startStorageSync } from '@/store';

export function Providers({ children }: { children: ReactNode }) {
  // Frames and tabs follow each other's writes (phone preview beside the Betrieb view).
  useEffect(() => startStorageSync(), []);
  return <TooltipProvider delayDuration={200}>{children}</TooltipProvider>;
}
