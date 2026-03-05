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
        className="relative overflow-hidden rounded-3xl px-6 py-8 bg-[#2B2C2A]"
      >
        {/* Decorative top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D6FF34]/40 to-transparent" />
        <BalanceSkeleton />
        <div className="mt-4">
          <BalanceSkeleton />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl px-6 py-8 space-y-6 bg-[#2B2C2A]"
    >
      {/* Decorative top glow line — breathing animation */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D6FF34]/40 to-transparent"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-lg font-semibold text-white/90">
            Welcome, {userName}
          </h1>
        </motion.div>
      </div>

      {/* Total Balance */}
      <div className="relative z-10">
        <div className="flex items-baseline space-x-2">
          <CountUp
            end={totalBalance}
            duration={1500}
            decimals={2}
            className="text-4xl lg:text-5xl font-bold text-white tabular-nums"
          >
            {(value) => formatCurrency(value, 'USD')}
          </CountUp>
        </div>
        <p className="text-[#A0A0A0] text-sm mt-1">Total savings</p>
      </div>

      {/* Monthly Earnings Pill */}
      {monthlyEarnings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 inline-flex items-center space-x-2 px-3 py-2 bg-[#D6FF34]/10 backdrop-blur-sm rounded-full border border-[#D6FF34]/20"
        >
          <div className="w-1.5 h-1.5 bg-[#D6FF34] rounded-full animate-pulse" />
          <span className="text-sm text-[#D6FF34] font-medium">
            <CountUp
              end={monthlyEarnings}
              duration={1000}
              decimals={2}
              className="tabular-nums"
            >
              {(value) => `+${formatCurrency(value, 'USD')} this month`}
            </CountUp>
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
