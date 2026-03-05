'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { SavingsAccount } from '@/lib/accounts';
import { formatBalance, formatPercentage } from '@/lib/format';
import { AccountRowSkeleton } from './Skeleton';
import { CountUp } from './CountUp';

interface AccountRowProps {
  account: SavingsAccount;
  balance: number;
  annualRate: number;
  isLoading?: boolean;
  index?: number;
}

const getCurrencyIcon = (accountId: string) => {
  const iconClass = "w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm";

  switch (accountId) {
    case 'dollar':
      return (
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#00FF8B] blur-sm opacity-40" />
          <div className={`${iconClass} bg-[#00FF8B] relative`}>
            <span className="text-black">$</span>
          </div>
        </div>
      );
    case 'euro':
      return (
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#4E6FFF] blur-sm opacity-40" />
          <div className={`${iconClass} bg-[#4E6FFF] relative`}>&#8364;</div>
        </div>
      );
    default:
      return <div className={`${iconClass} bg-[#666666]`}>{accountId[0].toUpperCase()}</div>;
  }
};

export function AccountRow({
  account,
  balance,
  annualRate,
  isLoading = false,
  index = 0,
}: AccountRowProps) {
  if (isLoading) {
    return <AccountRowSkeleton />;
  }

  const hoverColor = account.id === 'dollar'
    ? 'hover:shadow-[0_0_20px_rgba(0,255,139,0.1)]'
    : 'hover:shadow-[0_0_20px_rgba(78,111,255,0.1)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-[#2B2C2A] border border-white/10 rounded-2xl hover:border-white/20 ${hoverColor} transition-all`}
    >
      <Link
        href={`/accounts/${account.id}`}
        className="flex items-center justify-between p-4"
      >
        <div className="flex items-center space-x-4">
          {getCurrencyIcon(account.id)}

          <div>
            <h3 className="font-medium text-white text-base">
              {account.displayName}
            </h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-[#D6FF34] font-medium">
                {formatPercentage(annualRate)} annual rate
              </p>
              {balance > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/20">
                  Earning
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="font-semibold text-white tabular-nums text-lg">
            <CountUp
              end={balance}
              duration={1000}
              decimals={2}
            >
              {(value) => `${account.currencySymbol}${value.toFixed(2)}`}
            </CountUp>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
