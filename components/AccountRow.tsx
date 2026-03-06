'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { SavingsAccount } from '@/lib/accounts';
import { formatBalance, formatPercentage } from '@/lib/format';
import { AccountRowSkeleton } from './Skeleton';
import { CountUp } from './CountUp';
import { CurrencyIcon } from './CurrencyIcon';

interface AccountRowProps {
  account: SavingsAccount;
  balance: number;
  annualRate: number;
  isLoading?: boolean;
  index?: number;
}

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

  const isDollar = account.id === 'dollar';
  const accentColor = isDollar ? '#10B981' : '#3B82F6';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl hover:border-[#DEE2E6] hover:shadow-md transition-all overflow-hidden group"
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      <Link href={`/accounts/${account.id}`} className="flex items-center justify-between p-4 relative">
        {/* Left: icon + info */}
        <div className="flex items-center space-x-4">
          <CurrencyIcon accountId={account.id} size="md" />

          <div>
            <h3 className="font-medium text-[#1A1A2E] text-base">{account.displayName}</h3>
            <div className="flex items-center space-x-2 mt-0.5">
              <p className="text-sm font-medium" style={{ color: accentColor }}>
                {formatPercentage(annualRate)} annual rate
              </p>
              {balance > 0 && (
                <motion.span
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20"
                >
                  ● Earning
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* Right: balance + chevron */}
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="font-semibold text-[#1A1A2E] tabular-nums text-lg">
              <CountUp end={balance} duration={1000} decimals={2}>
                {(value) => `${account.currencySymbol}${value.toFixed(2)}`}
              </CountUp>
            </div>
          </div>
          <svg
            className="w-4 h-4 text-[#ADB5BD] group-hover:text-[#6C757D] transition-colors flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}
