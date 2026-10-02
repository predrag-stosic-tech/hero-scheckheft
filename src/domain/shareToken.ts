import { SHARE_SECTIONS, type SharePayload, type ShareSection } from './types';

// See specs/001-hero-scheckheft/contracts/share-token.md.
// The token is neither secret nor signed: it demonstrates the sharing flow, not access control.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(token: string): string {
  const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function encodeShareToken(payload: SharePayload): string {
  return toBase64Url(JSON.stringify(payload));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Returns undefined for anything that is not a well-formed version-1 payload. Never throws. */
export function decodeShareToken(token: string): SharePayload | undefined {
  try {
    const raw: unknown = JSON.parse(fromBase64Url(token));
    if (!isRecord(raw) || raw.v !== 1) return undefined;
    if (typeof raw.o !== 'string' || raw.o === '') return undefined;
    if (typeof raw.c !== 'string' || !ISO_DATE.test(raw.c)) return undefined;
    if (typeof raw.e !== 'string' || !ISO_DATE.test(raw.e)) return undefined;
    if (!Array.isArray(raw.s) || !Array.isArray(raw.x)) return undefined;
    const sections = raw.s.filter((s): s is ShareSection =>
      (SHARE_SECTIONS as string[]).includes(s as string),
    );
    if (sections.length === 0) return undefined;
    const extras: SharePayload['x'] = [];
    for (const item of raw.x) {
      if (!isRecord(item) || typeof item.k !== 'string' || typeof item.d !== 'string') continue;
      if (!ISO_DATE.test(item.d)) continue;
      const f = isRecord(item.f)
        ? {
            t: typeof item.f.t === 'string' ? item.f.t : undefined,
            a: typeof item.f.a === 'string' ? item.f.a : undefined,
            c: typeof item.f.c === 'number' ? item.f.c : undefined,
          }
        : undefined;
      extras.push({
        k: item.k,
        d: item.d,
        ...(typeof item.i === 'number' ? { i: item.i } : {}),
        ...(f ? { f } : {}),
      });
    }
    return { v: 1, o: raw.o, s: sections, c: raw.c, e: raw.e, x: extras };
  } catch {
    return undefined;
  }
}
