import { DISPLAY_CURRENCIES } from './constants';
import type { AccountId } from './accounts';

export const formatCurrency = (
  amount: number,
  currency: keyof typeof DISPLAY_CURRENCIES,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    compact?: boolean;
  } = {}
): string => {
  const { minimumFractionDigits = 2, maximumFractionDigits = 2, compact = false } = options;
  
  // For fiat currencies
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short',
  });
  
  const symbol = DISPLAY_CURRENCIES[currency];
  return `${symbol}${formatter.format(amount)}`;
};

export const formatBalance = (amount: number, accountId: AccountId): string => {
  const currencyMap: Record<AccountId, keyof typeof DISPLAY_CURRENCIES> = {
    dollar: 'USD',
    euro: 'EUR',
  };
  
  return formatCurrency(amount, currencyMap[accountId]);
};

export const formatPercentage = (rate: number): string => {
  return `${rate.toFixed(2)}%`;
};

export const formatCompactCurrency = (
  amount: number,
  currency: keyof typeof DISPLAY_CURRENCIES
): string => {
  return formatCurrency(amount, currency, { compact: true });
};

export const parseAmountInput = (input: string): number => {
  // Remove currency symbols and spaces
  const cleaned = input.replace(/[$€₿⟠,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatDateRelative = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};