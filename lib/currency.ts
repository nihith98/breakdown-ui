export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
  { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound' },
];

export const DEFAULT_CURRENCY: CurrencyCode = 'INR';

export function getCurrencyConfig(code: CurrencyCode = DEFAULT_CURRENCY): CurrencyConfig {
  return SUPPORTED_CURRENCIES.find(c => c.code === code) ?? SUPPORTED_CURRENCIES[0];
}

export function getCurrencySymbol(code: CurrencyCode = DEFAULT_CURRENCY): string {
  return getCurrencyConfig(code).symbol;
}

export function getCurrencyName(code: CurrencyCode = DEFAULT_CURRENCY): string {
  return getCurrencyConfig(code).name;
}

// Formats a number as a full currency string using Intl (e.g. ₹1,234.56)
export function formatCurrency(amount: number, code: CurrencyCode = DEFAULT_CURRENCY): string {
  const config = getCurrencyConfig(code);
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: code,
  }).format(amount);
}

// Formats with symbol prefix, no sign (e.g. ₹42.00)
export function formatAmount(amount: number, code: CurrencyCode = DEFAULT_CURRENCY): string {
  return `${getCurrencySymbol(code)}${amount.toFixed(2)}`;
}

// Formats an amount with symbol, no sign (e.g. ₹42.00). Sign is communicated via color.
export function formatMoney(n: number, code: CurrencyCode = DEFAULT_CURRENCY): string {
  return formatAmount(Math.abs(n), code);
}
