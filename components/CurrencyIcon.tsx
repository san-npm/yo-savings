'use client';

interface CurrencyIconProps {
  accountId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { outer: 'w-8 h-8', text: 'text-sm', shine: 'w-3 h-1' },
  md: { outer: 'w-10 h-10', text: 'text-base', shine: 'w-4 h-1' },
  lg: { outer: 'w-12 h-12', text: 'text-lg', shine: 'w-5 h-1.5' },
};

const coinConfig: Record<string, {
  gradient: string;
  glow: string;
  highlight: string;
  symbol: string;
  textColor: string;
}> = {
  dollar: {
    gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 40%, #059669 100%)',
    glow: 'rgba(16,185,129,0.35)',
    highlight: 'rgba(255,255,255,0.3)',
    symbol: '$',
    textColor: '#fff',
  },
  euro: {
    gradient: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 40%, #1D4ED8 100%)',
    glow: 'rgba(59,130,246,0.35)',
    highlight: 'rgba(255,255,255,0.25)',
    symbol: '€',
    textColor: '#fff',
  },
};

export function CurrencyIcon({ accountId, size = 'md', className = '' }: CurrencyIconProps) {
  const config = coinConfig[accountId] ?? {
    gradient: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
    glow: 'rgba(100,100,100,0.2)',
    highlight: 'rgba(255,255,255,0.15)',
    symbol: accountId[0]?.toUpperCase() ?? '?',
    textColor: '#fff',
  };

  const sz = sizeMap[size];

  return (
    <div className={`relative flex-shrink-0 ${sz.outer} ${className}`}>
      {/* Outer ambient glow */}
      <div
        className="absolute inset-0 rounded-full blur-md"
        style={{ backgroundColor: config.glow, transform: 'scale(1.15)' }}
      />

      {/* Coin body */}
      <div
        className={`${sz.outer} rounded-full relative overflow-hidden flex items-center justify-center font-bold ${sz.text}`}
        style={{
          background: config.gradient,
          color: config.textColor,
          boxShadow: `inset 0 -3px 6px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3), 0 2px 8px ${config.glow}`,
        }}
      >
        {/* Inner edge rim */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.12)' }}
        />

        {/* Shine/reflection highlight */}
        <div
          className={`absolute top-1 left-1/2 -translate-x-1/2 ${sz.shine} rounded-full opacity-60`}
          style={{ background: config.highlight, filter: 'blur(1px)' }}
        />

        {/* Symbol */}
        <span className="relative z-10 select-none" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
          {config.symbol}
        </span>
      </div>
    </div>
  );
}
