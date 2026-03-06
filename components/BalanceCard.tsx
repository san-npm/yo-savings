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
        style={{
          background: 'linear-gradient(135deg, #2B2C2A 0%, #1e1f1d 60%, #242520 100%)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D6FF34]/40 to-transparent" />
        <BalanceSkeleton />
        <div className="mt-4"><BalanceSkeleton /></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl px-6 py-8 space-y-6 border border-white/10"
      style={{
        background:
          'linear-gradient(135deg, #2B2C2A 0%, #1d1e1b 50%, #25261f 100%)',
      }}
    >
      {/* Subtle dot-pattern texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Corner accent glow */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(214,255,52,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Animated scanner glow line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(214,255,52,0.15) 20%, rgba(214,255,52,0.7) 50%, rgba(214,255,52,0.15) 80%, transparent 100%)',
        }}
        animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <div className="relative z-10">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-white/80"
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
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 350, damping: 22 }}
          className="relative z-10 inline-flex items-center space-x-2 px-3 py-2 backdrop-blur-sm rounded-full border border-[#D6FF34]/20"
          style={{ background: 'rgba(214,255,52,0.08)' }}
        >
          <motion.div
            className="w-1.5 h-1.5 bg-[#D6FF34] rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="text-sm text-[#D6FF34] font-medium">
            <CountUp end={monthlyEarnings} duration={1000} decimals={2} className="tabular-nums">
              {(value) => `+${formatCurrency(value, 'USD')} this month`}
            </CountUp>
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
