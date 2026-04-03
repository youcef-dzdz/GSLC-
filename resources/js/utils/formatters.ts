import i18n from '../i18n';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { ar, fr, enUS } from 'date-fns/locale';

/**
 * Returns the correct date-fns locale mapping based on the active i18n language
 */
const getDateLocale = () => {
  const lang = i18n.language || 'fr';
  if (lang.startsWith('ar')) return ar;
  if (lang.startsWith('en')) return enUS;
  return fr;
};

/**
 * Formats a date string (ISO) or Date object into a readable localized format.
 * If the language is Arabic, we use Arabic-Indic numerals.
 */
export const formatDate = (date: string | Date | null | undefined, formatStr: string = 'PP') => {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';

  const dateLocale = getDateLocale();
  let formattedDate = format(d, formatStr, { locale: dateLocale });

  // If the language is Arabic, aggressively convert western digits to Arabic-Indic digits
  if (i18n.language?.startsWith('ar')) {
    return formatArabicIndic(formattedDate);
  }

  return formattedDate;
};

/**
 * Formats a relative date (e.g., "3 days ago")
 */
export const formatRelativeDate = (date: string | Date | null | undefined) => {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';

  let relative = formatDistanceToNow(d, { addSuffix: true, locale: getDateLocale() });

  if (i18n.language?.startsWith('ar')) {
    return formatArabicIndic(relative);
  }

  return relative;
};

/**
 * Formats a number with proper thousand separators.
 * Enforces Arabic-Indic numerals specifically for the 'ar' locale.
 */
export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return '-';

  const lang = i18n.language || 'fr';
  const isArabic = lang.startsWith('ar');

  // Use the native Intl.NumberFormat targeting 'ar-EG' to naturally get '٠-٩'
  // Or 'fr-FR' / 'en-US' for western
  const localeStr = isArabic ? 'ar-EG-u-nu-arab' : lang === 'en' ? 'en-US' : 'fr-FR';

  return new Intl.NumberFormat(localeStr, {
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Formats currency safely according to locale with proper digits.
 */
export const formatCurrency = (amount: number | null | undefined, currency: string = 'DZD'): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '-';

  const lang = i18n.language || 'fr';
  const isArabic = lang.startsWith('ar');
  const localeStr = isArabic ? 'ar-EG-u-nu-arab' : lang === 'en' ? 'en-US' : 'fr-FR';

  return new Intl.NumberFormat(localeStr, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Helper strictly converting given string numbers into Arabic-indic
 * Useful for string manipulations or pure string numeral replacement
 */
export const formatArabicIndic = (str: string): string => {
  const westernToArabicMap: { [key: string]: string } = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
  };

  return str.replace(/[0-9]/g, match => westernToArabicMap[match]);
};
