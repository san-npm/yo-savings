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
        className="relative overflow-hidden rounded-3xl px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #B6509E, #2EBAC6)' }}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 animate-shimmer" style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          backgroundSize: '200% 100%',
        }} />
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
      className="relative overflow-hidden rounded-3xl px-6 py-8 space-y-6"
      style={{ background: 'linear-gradient(135deg, #B6509E, #2EBAC6)' }}
    >
      {/* Glass overlay for depth */}
      <div className="absolute inset-0 bg-white/5" />

      {/* Animated shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            'linear-gradient(135deg, transparent 100%, rgba(255,255,255,0.1) 150%, transparent 200%)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s linear infinite',
        }}
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
        <p className="text-white/70 text-sm mt-1">Total savings</p>
      </div>

      {/* Monthly Earnings Pill with glow */}
      {monthlyEarnings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 inline-flex items-center space-x-2 px-3 py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/20"
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span className="text-sm text-white font-medium">
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
