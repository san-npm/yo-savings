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

// Currency icon components
const getCurrencyIcon = (accountId: string) => {
  const iconClass = "w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm";
  
  switch (accountId) {
    case 'dollar':
      return <div className={`${iconClass} bg-green-500`}>$</div>;
    case 'euro':
      return <div className={`${iconClass} bg-blue-500`}>€</div>;
    default:
      return <div className={`${iconClass} bg-slate-500`}>{accountId[0].toUpperCase()}</div>;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
    >
      <Link
        href={`/accounts/${account.id}`}
        className="flex items-center justify-between p-4"
      >
        <div className="flex items-center space-x-4">
          {getCurrencyIcon(account.id)}
          
          <div>
            <h3 className="font-medium text-slate-800 text-base">
              {account.displayName}
            </h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-green-500 font-medium">
                {formatPercentage(annualRate)} APY
              </p>
              {balance > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Earning
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-semibold text-slate-800 tabular-nums text-lg">
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