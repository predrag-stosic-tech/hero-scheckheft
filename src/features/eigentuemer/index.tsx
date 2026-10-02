import { Crown } from 'lucide-react';
import { lazy, Suspense, type ReactNode } from 'react';
import { Route, Routes } from 'react-router';
import { EmptyState } from '@/components/scheckheft/base';
import { NotInDemo } from '@/components/shell/NotInDemo';
import { Button } from '@/components/ui/button';
import { FEATURE_PLAN, featureGate } from '@/domain/featureGate';
import type { Feature } from '@/domain/types';
import { useT } from '@/i18n';
import { useStore } from '@/store';
import { effectivePlan } from '@/store/selectors';
import EigentuemerLayout, { useUpgrade } from './EigentuemerLayout';
import Kalender from './Kalender';
import ObjektDetail from './ObjektDetail';
import { PortfolioGraph } from './PortfolioDashboard';
import ScheckheftHome from './ScheckheftHome';

const Chat = lazy(() => import('./Chat'));

/** A route of a higher plan never shows the feature; it shows the locked state. */
function Gate({
  feature,
  title,
  children,
}: {
  feature: Feature;
  title: string;
  children: ReactNode;
}) {
  const plan = useStore(effectivePlan);
  const upgrade = useUpgrade();
  const t = useT();
  if (featureGate(plan, feature)) return <>{children}</>;
  const g = t.owner.gate;
  return (
    <div className="pt-10">
      <EmptyState
        icon={Crown}
        title={title}
        text={g.text(t.plan[FEATURE_PLAN[feature]])}
        action={
          <Button variant="goldDark" onClick={() => upgrade(feature)}>
            <Crown className="size-4" aria-hidden />
            {g.more}
          </Button>
        }
      />
    </div>
  );
}

export default function EigentuemerRoutes() {
  const g = useT().owner.gate;
  return (
    <Routes>
      <Route element={<EigentuemerLayout />}>
        <Route index element={<ScheckheftHome />} />
        <Route path="objekte/:objektId" element={<ObjektDetail />} />
        <Route path="kalender" element={<Kalender />} />
        <Route
          path="graph"
          element={
            <Gate feature="portfolio_graph" title={g.graphTitle}>
              <PortfolioGraph />
            </Gate>
          }
        />
        <Route
          path="frag"
          element={
            <Gate feature="chat" title={g.chatTitle}>
              <Suspense fallback={null}>
                <Chat />
              </Suspense>
            </Gate>
          }
        />
        <Route path="*" element={<NotInDemo />} />
      </Route>
    </Routes>
  );
}
