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
    gradient: 'linear-gradient(135deg, #00FF8B 0%, #00cc6e 40%, #009950 100%)',
    glow: 'rgba(0,255,139,0.45)',
    highlight: 'rgba(255,255,255,0.3)',
    symbol: '$',
    textColor: '#000',
  },
  euro: {
    gradient: 'linear-gradient(135deg, #6B8FFF 0%, #4E6FFF 40%, #3050CC 100%)',
    glow: 'rgba(78,111,255,0.45)',
    highlight: 'rgba(255,255,255,0.25)',
    symbol: '€',
    textColor: '#fff',
  },
};

export function CurrencyIcon({ accountId, size = 'md', className = '' }: CurrencyIconProps) {
  const config = coinConfig[accountId] ?? {
    gradient: 'linear-gradient(135deg, #666 0%, #444 100%)',
    glow: 'rgba(100,100,100,0.4)',
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
          boxShadow: `inset 0 -3px 6px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.3), 0 2px 8px ${config.glow}`,
        }}
      >
        {/* Inner edge rim */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.12)',
          }}
        />

        {/* Shine/reflection highlight */}
        <div
          className={`absolute top-1 left-1/2 -translate-x-1/2 ${sz.shine} rounded-full opacity-60`}
          style={{ background: config.highlight, filter: 'blur(1px)' }}
        />

        {/* Symbol */}
        <span className="relative z-10 select-none" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}>
          {config.symbol}
        </span>
      </div>
    </div>
  );
}
