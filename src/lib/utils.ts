import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhp(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string | null | undefined, timezone: string = 'Asia/Manila'): string {
  if (!dateStr) return 'Not scheduled';
  try {
    return new Intl.DateTimeFormat('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone,
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}
