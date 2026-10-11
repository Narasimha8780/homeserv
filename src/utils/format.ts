import type { AppLanguage } from '../types';

const LOCALES: Record<AppLanguage, string> = { en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', mr: 'mr-IN', bn: 'bn-IN' };

export const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase();

export const formatIndianPhone = (digits: string) => `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;

export const formatPrice = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

export const formatCount = (n: number, lang: AppLanguage) =>
  new Intl.NumberFormat(LOCALES[lang], { notation: 'compact', maximumFractionDigits: 1 }).format(n);

// "3 weeks ago" / "3 सप्ताह पहले" — falls back to the raw date if it can't be parsed.
export function timeAgo(dateStr: string, lang: AppLanguage): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  const days = Math.round((date.getTime() - Date.now()) / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat(LOCALES[lang], { numeric: 'auto' });
  const abs = Math.abs(days);
  if (abs < 7) return rtf.format(days, 'day');
  if (abs < 30) return rtf.format(Math.round(days / 7), 'week');
  if (abs < 365) return rtf.format(Math.round(days / 30), 'month');
  return rtf.format(Math.round(days / 365), 'year');
}

// Pre-filled first message so customers don't stare at an empty WhatsApp chat.
export const whatsappGreeting = (captain: { name: string }, categoryTitle?: string) =>
  `Hi ${firstName(captain.name)}, I found you on HomeServ.${categoryTitle ? ` I need a ${categoryTitle.toLowerCase()}.` : ''} Are you available?`;

export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

export const whatsappLink = (number: string, text?: string) =>
  `https://wa.me/${number.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

// Native share sheet where available (mobile browsers), otherwise copy to clipboard.
export async function shareText(title: string, text: string): Promise<'shared' | 'copied' | 'failed'> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return 'shared';
    } catch (err) {
      if ((err as Error).name === 'AbortError') return 'failed';
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
