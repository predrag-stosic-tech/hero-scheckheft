import { describe, expect, it } from 'vitest';
import { decodeShareToken, encodeShareToken } from './shareToken';
import type { SharePayload } from './types';

const payload: SharePayload = {
  v: 1,
  o: 'lindenstrasse-12',
  s: ['historie', 'dokumente'],
  c: '2026-09-30',
  e: '2026-10-30',
  x: [
    { k: 's1-elektro', d: '2026-09-30', i: 48 },
    { k: 's5-upload', d: '2026-08-12', f: { t: 'Gartenbewässerung geprüft', c: 18900 } },
  ],
};

const encodeRaw = (value: unknown) =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

describe('share token', () => {
  it('round-trips a payload', () => {
    expect(decodeShareToken(encodeShareToken(payload))).toEqual(payload);
  });
  it('is URL-safe', () => {
    expect(encodeShareToken(payload)).toMatch(/^[A-Za-z0-9_-]+$/);
  });
  it('round-trips umlauts', () => {
    const p: SharePayload = {
      ...payload,
      x: [{ k: 's5-upload', d: '2026-01-01', f: { t: 'Prüfung Übergabe' } }],
    };
    expect(decodeShareToken(encodeShareToken(p))).toEqual(p);
  });
  it('rejects garbage', () => {
    expect(decodeShareToken('not a token!')).toBeUndefined();
    expect(decodeShareToken('')).toBeUndefined();
    expect(decodeShareToken(encodeShareToken(payload).slice(0, 20))).toBeUndefined();
  });
  it('rejects a wrong version', () => {
    expect(decodeShareToken(encodeRaw({ ...payload, v: 2 }))).toBeUndefined();
  });
  it('rejects a missing field', () => {
    const rest: Partial<SharePayload> = { ...payload };
    delete rest.e;
    expect(decodeShareToken(encodeRaw(rest))).toBeUndefined();
  });
  it('rejects a payload without any known section', () => {
    expect(decodeShareToken(encodeRaw({ ...payload, s: ['alles'] }))).toBeUndefined();
  });
});
