// Persian (Jalali) date utilities and formatting helpers.
import { format, parseISO, isValid, differenceInCalendarDays } from 'date-fns';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)));
}

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const PERSIAN_WEEKDAYS = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
];

// Lightweight Gregorian→Jalali conversion (no extra dependency).
function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return [jy, jm, jd];
}

export type JalaliDate = { year: number; month: number; day: number; monthName: string; weekday: string };

export function toJalali(date: Date | string): JalaliDate {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const [jy, jm, jd] = gregorianToJalali(
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate(),
  );
  return {
    year: jy,
    month: jm,
    day: jd,
    monthName: PERSIAN_MONTHS[jm - 1],
    weekday: PERSIAN_WEEKDAYS[d.getDay()],
  };
}

export function formatJalali(date: Date | string, withWeekday = false): string {
  const j = toJalali(date);
  const base = `${toPersianDigits(j.day)} ${j.monthName} ${toPersianDigits(j.year)}`;
  return withWeekday ? `${j.weekday}، ${base}` : base;
}

export function formatJalaliShort(date: Date | string): string {
  const j = toJalali(date);
  return `${toPersianDigits(j.year)}/${toPersianDigits(String(j.month).padStart(2, '0'))}/${toPersianDigits(
    String(j.day).padStart(2, '0'),
  )}`;
}

export function formatTime(time: string): string {
  // time = "HH:MM:SS" or "HH:MM"
  const [h, m] = time.split(':');
  const hour = Number(h);
  const period = hour < 12 ? 'قبل‌ظهر' : 'بعدازظهر';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${toPersianDigits(String(hour12).padStart(2, '0'))}:${toPersianDigits(
    m,
  )} ${period}`;
}

export function formatPrice(amount: number): string {
  return `${toPersianDigits(amount.toLocaleString('en-US'))} تومان`;
}

export function isValidDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d);
}

export { format, differenceInCalendarDays };
