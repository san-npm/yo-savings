'use client';

interface CurrencyIconProps {
  accountId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

const colorMap: Record<string, string> = {
  dollar: 'bg-green-500',
  euro: 'bg-blue-500',
};

const symbolMap: Record<string, string> = {
  dollar: '$',
  euro: '€',
};

export function CurrencyIcon({ accountId, size = 'md', className = '' }: CurrencyIconProps) {
  const bg = colorMap[accountId] || 'bg-slate-500';
  const symbol = symbolMap[accountId] || accountId[0]?.toUpperCase() || '?';

  return (
    <div className={`${sizeClasses[size]} ${bg} rounded-full flex items-center justify-center text-white font-semibold ${className}`}>
      {symbol}
    </div>
  );
}
