import { addMonths, differenceInCalendarDays, format, parseISO } from 'date-fns';
import type { DueItem, DueStatus, Entry, GewerkStatus, Rule } from './types';

const ISO = 'yyyy-MM-dd';

/** Interval that applies after an entry: the entry's own override, else the rule's default. */
export function effectiveInterval(rule: Rule, lastEntry: Entry): number {
  return lastEntry.intervalMonths ?? rule.intervalMonths;
}

/** Recommended next due date: last entry date plus the applicable interval in months. */
export function nextDueDate(rule: Rule, lastEntry: Entry | undefined): string | undefined {
  if (!lastEntry) return undefined;
  return format(addMonths(parseISO(lastEntry.date), effectiveInterval(rule, lastEntry)), ISO);
}

export function daysUntil(date: string, today: string): number {
  return differenceInCalendarDays(parseISO(date), parseISO(today));
}

export function dueStatus(dueDate: string, today: string): DueStatus {
  const days = daysUntil(dueDate, today);
  if (days < 0) return 'overdue';
  if (days <= 30) return 'due30';
  if (days <= 90) return 'due90';
  return 'ok';
}

/** Worst status wins. "due90" still counts as "in Ordnung" for owners. */
export function gewerkStatus(items: Pick<DueItem, 'status'>[]): GewerkStatus {
  if (items.some((i) => i.status === 'overdue')) return 'ueberfaellig';
  if (items.some((i) => i.status === 'due30')) return 'bald_faellig';
  return 'in_ordnung';
}

/** Accepts whole months from 1 to 120; anything else is rejected. */
export function validateIntervalMonths(input: unknown): number | undefined {
  if (typeof input === 'string' && input.trim() === '') return undefined;
  const n = typeof input === 'number' ? input : typeof input === 'string' ? Number(input) : NaN;
  if (!Number.isInteger(n) || n < 1 || n > 120) return undefined;
  return n;
}
