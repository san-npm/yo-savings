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
        className="bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl shadow-lg px-6 py-8"
      >
        <BalanceSkeleton />
        <div className="mt-4">
          <BalanceSkeleton />
        </div>
      </motion.div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl shadow-lg px-6 py-8 space-y-6"
    >
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

      {/* Total Balance - Hero typography with white text */}
      <div>
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
        <p className="text-white/80 text-sm mt-1">Total savings</p>
      </div>

      {/* Monthly Earnings Pill */}
      {monthlyEarnings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center space-x-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
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