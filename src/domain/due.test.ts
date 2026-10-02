import { describe, expect, it } from 'vitest';
import { dueStatus, gewerkStatus, nextDueDate, validateIntervalMonths } from './due';
import type { Entry, Rule } from './types';

const rule: Rule = { id: 'r', anlageId: 'a', title: 'Wartung', intervalMonths: 12 };
const entry = (date: string, intervalMonths?: number): Entry => ({
  id: 'e',
  objektId: 'o',
  anlageId: 'a',
  ruleId: 'r',
  betriebName: 'Betrieb',
  date,
  title: 'Wartung',
  description: '',
  costCents: 0,
  origin: 'betrieb',
  intervalMonths,
  dokumente: [],
});

describe('nextDueDate', () => {
  it('adds the rule interval to the last entry date', () => {
    expect(nextDueDate(rule, entry('2025-03-10'))).toBe('2026-03-10');
  });
  it('prefers the interval stored on the entry', () => {
    expect(nextDueDate(rule, entry('2025-03-10', 48))).toBe('2029-03-10');
  });
  it('clamps to the end of a shorter month', () => {
    expect(nextDueDate({ ...rule, intervalMonths: 1 }, entry('2025-01-31'))).toBe('2025-02-28');
  });
  it('handles a leap day', () => {
    expect(nextDueDate(rule, entry('2024-02-29'))).toBe('2025-02-28');
  });
  it('returns undefined without an entry', () => {
    expect(nextDueDate(rule, undefined)).toBeUndefined();
  });
});

describe('dueStatus', () => {
  const today = '2026-09-30';
  it.each([
    ['2026-09-29', 'overdue'],
    ['2026-09-30', 'due30'],
    ['2026-10-30', 'due30'],
    ['2026-10-31', 'due90'],
    ['2026-12-29', 'due90'],
    ['2026-12-30', 'ok'],
  ])('%s → %s', (date, expected) => {
    expect(dueStatus(date, today)).toBe(expected);
  });
});

describe('gewerkStatus', () => {
  it('is überfällig when anything is overdue', () => {
    expect(gewerkStatus([{ status: 'ok' }, { status: 'overdue' }, { status: 'due30' }])).toBe(
      'ueberfaellig',
    );
  });
  it('is bald fällig when something is due within 30 days', () => {
    expect(gewerkStatus([{ status: 'ok' }, { status: 'due30' }])).toBe('bald_faellig');
  });
  it('is in Ordnung for due90 and ok', () => {
    expect(gewerkStatus([{ status: 'due90' }, { status: 'ok' }])).toBe('in_ordnung');
  });
  it('is in Ordnung when empty', () => {
    expect(gewerkStatus([])).toBe('in_ordnung');
  });
});

describe('validateIntervalMonths', () => {
  it.each([1, 120, '48'])('accepts %s', (v) => {
    expect(validateIntervalMonths(v)).toBe(Number(v));
  });
  it.each([0, -1, 121, 1.5, '', 'abc', null, undefined])('rejects %s', (v) => {
    expect(validateIntervalMonths(v)).toBeUndefined();
  });
});
