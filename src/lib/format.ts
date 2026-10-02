import { format, parseISO } from 'date-fns';
import { daysUntil } from '@/domain/due';
import { dateLocale, getLang, getT } from '@/i18n';

// Formatting follows the current UI language (German by default).

const fmt = (iso: string, pattern: string) =>
  format(parseISO(iso), pattern, { locale: dateLocale() });

export const formatDate = (iso: string): string => fmt(iso, getT().fmt.date);
export const formatDateShort = (iso: string): string => fmt(iso, getT().fmt.dateShort);
export const formatMonthYear = (iso: string): string => fmt(iso, getT().fmt.monthYear);
export const formatWeekdayDate = (iso: string): string => fmt(iso, getT().fmt.weekdayDate);
export const formatDayMonthShort = (iso: string): string => fmt(iso, getT().fmt.dayMonthShort);

const euro = {
  de: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
  en: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }),
};
export const formatEuro = (cents: number): string => euro[getLang()].format(cents / 100);

/** "fällig in 21 Tagen" / "due in 21 days", "seit 5 Tagen überfällig" / "5 days overdue". */
export function formatDue(dueDate: string, today: string): string {
  const t = getT().fmt;
  const days = daysUntil(dueDate, today);
  if (days === 0) return t.dueToday;
  if (days === 1) return t.dueTomorrow;
  if (days > 1 && days <= 120) return t.dueInDays(days);
  if (days > 120) return t.dueInMonth(formatMonthYear(dueDate));
  if (days === -1) return t.overdueYesterday;
  return t.overdueDays(-days);
}

/** "4 Jahren" / "4 years", used after "in". */
export const formatInterval = (months: number): string => getT().fmt.inInterval(months);

/** "alle 4 Jahre" / "every 4 years". */
export const formatEvery = (months: number): string => getT().fmt.every(months);
