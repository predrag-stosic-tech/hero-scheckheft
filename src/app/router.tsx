import { LoaderCircle } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router';
import { Toaster } from 'sonner';
import { DemoControl } from '@/features/demo/DemoControl';
import { useT } from '@/i18n';

// One code-split chunk per route group.
const BetriebRoutes = lazy(() => import('@/features/betrieb'));
const EigentuemerRoutes = lazy(() => import('@/features/eigentuemer'));
const MobileRoutes = lazy(() => import('@/features/mobile'));
const ShareView = lazy(() => import('@/features/share/ShareView'));

function Loading() {
  const t = useT();
  return (
    <p
      role="status"
      className="flex h-dvh items-center justify-center gap-2 text-[14px] text-muted"
    >
      <LoaderCircle className="size-5 animate-spin" aria-hidden />
      {t.common.loading}
    </p>
  );
}

/** Toasts appear at the top on the phone surface and at the bottom in the desktop shells. */
function AppToaster() {
  const { pathname } = useLocation();
  return (
    <Toaster
      position={pathname.startsWith('/m') ? 'top-center' : 'bottom-center'}
      style={{ ['--width' as string]: 'min(460px, calc(100vw - 32px))' }}
      toastOptions={{
        classNames: {
          toast: '!rounded-card !border-line !font-sans !text-[14px] !text-ink !shadow-pop',
          description: '!text-muted',
          actionButton: '!bg-primary !text-white !rounded-control',
        },
      }}
    />
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/betrieb" replace />} />
          <Route path="/betrieb/*" element={<BetriebRoutes />} />
          <Route path="/eigentuemer/*" element={<EigentuemerRoutes />} />
          <Route path="/m/*" element={<MobileRoutes />} />
          <Route path="/share/:token" element={<ShareView />} />
          <Route path="*" element={<Navigate to="/betrieb" replace />} />
        </Routes>
      </Suspense>
      <DemoControl />
      <AppToaster />
    </BrowserRouter>
  );
}
