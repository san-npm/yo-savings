'use client';

import { motion } from 'framer-motion';
import { CountUp } from './CountUp';
import { formatCurrency } from '@/lib/format';
import { BalanceSkeleton } from './Skeleton';

interface BalanceCardProps {
  totalBalance: number;
  monthlyEarnings: number;
  isLoading?: boolean;
  userName?: string;
}

export function BalanceCard({
  totalBalance,
  monthlyEarnings,
  isLoading = false,
  userName = 'there',
}: BalanceCardProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl px-6 py-8 bg-[#F8F9FA] border border-[#E9ECEF]"
      >
        <BalanceSkeleton />
        <div className="mt-4"><BalanceSkeleton /></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl px-6 py-8 space-y-6 border border-[#E9ECEF] bg-white"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
    >
      {/* Subtle emerald top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-60" />

      {/* Corner accent glow */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' }}
      />

      {/* Content */}
      <div className="relative z-10">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-[#6C757D]"
        >
          Welcome, {userName} 👋
        </motion.h1>
      </div>

      {/* Total Balance */}
      <div className="relative z-10">
        <div className="flex items-baseline space-x-2">
          <CountUp
            end={totalBalance}
            duration={1500}
            decimals={2}
            className="text-4xl lg:text-5xl font-bold text-[#1A1A2E] tabular-nums"
          >
            {(value) => formatCurrency(value, 'USD')}
          </CountUp>
        </div>
        <p className="text-[#6C757D] text-sm mt-1">Total savings</p>
      </div>

      {/* Monthly Earnings Pill */}
      {monthlyEarnings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 350, damping: 22 }}
          className="relative z-10 inline-flex items-center space-x-2 px-3 py-2 rounded-full border border-[#10B981]/20 bg-[#ECFDF5]"
        >
          <motion.div
            className="w-1.5 h-1.5 bg-[#10B981] rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="text-sm text-[#10B981] font-medium">
            <CountUp end={monthlyEarnings} duration={1000} decimals={2} className="tabular-nums">
              {(value) => `+${formatCurrency(value, 'USD')} this month`}
            </CountUp>
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
