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

const glowSizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const colorMap: Record<string, string> = {
  dollar: '#00FF8B',
  euro: '#4E6FFF',
};

const symbolMap: Record<string, string> = {
  dollar: '$',
  euro: '\u20AC',
};

export function CurrencyIcon({ accountId, size = 'md', className = '' }: CurrencyIconProps) {
  const color = colorMap[accountId] || '#666666';
  const symbol = symbolMap[accountId] || accountId[0]?.toUpperCase() || '?';

  return (
    <div className={`relative ${className}`}>
      {/* Glow effect */}
      <div
        className={`absolute inset-0 rounded-full blur-sm opacity-40`}
        style={{ backgroundColor: color }}
      />
      {/* Icon */}
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold relative`}
        style={{ backgroundColor: color, color: accountId === 'dollar' ? '#000' : '#fff' }}
      >
        {symbol}
      </div>
    </div>
  );
}
