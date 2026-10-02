import { Smartphone } from 'lucide-react';
import { useT } from '@/i18n';

/** The preview is shown beside the Betrieb view from this viewport width upwards. */
export const PREVIEW_MIN_WIDTH = 1440;
export const PREVIEW_PANEL_WIDTH = 430;

/**
 * Live preview of the owner's phone beside the Betrieb view. It is an iframe of /m, so the
 * phone components get a real phone-sized viewport, and it follows every change through the
 * browser's storage event. Visually set apart as a demo aid: it is not a ProtocolHero screen.
 */
export function PhonePreview() {
  const t = useT();
  return (
    <aside
      aria-label={t.demo.previewLabel}
      className="no-print flex h-dvh shrink-0 flex-col items-center border-l border-dashed border-line bg-tint px-5 py-4"
      style={{ width: PREVIEW_PANEL_WIDTH }}
    >
      <p className="flex items-center gap-2 text-[12px] font-medium text-muted">
        <Smartphone className="size-4" aria-hidden />
        {t.demo.previewCaption}
      </p>
      <div className="mt-3 min-h-0 w-[390px] flex-1 overflow-hidden rounded-[38px] border-[9px] border-primary bg-white shadow-pop">
        <iframe
          title={t.demo.previewFrame}
          src="/m?embed=1"
          className="block h-full w-full border-0"
        />
      </div>
    </aside>
  );
}
