import { CircleAlert } from 'lucide-react';
import { EmptyState } from '@/components/scheckheft/base';
import { useT } from '@/i18n';

/** Shared target for sidebar items that exist in ProtocolHero but are not part of the demo. */
export function NotInDemo() {
  const t = useT();
  return (
    <div className="pt-10">
      <h1 className="sr-only">{t.common.notInDemoTitle}</h1>
      <EmptyState
        icon={CircleAlert}
        title={t.common.notInDemoTitle}
        text={t.common.notInDemoText}
      />
    </div>
  );
}
