'use client';

import { ResponsiveContainer, Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/format';
import { ChartSkeleton } from './Skeleton';
import type { AccountId } from '@/lib/accounts';

interface ChartDataPoint {
  date: string;
  balance: number;
  earnings: number;
}

interface EarningsChartProps {
  data: ChartDataPoint[];
  accountId: AccountId;
  isLoading?: boolean;
}

const getCurrencyFromAccountId = (accountId: AccountId) => {
  const currencyMap = {
    dollar: 'USD',
    euro: 'EUR',
  } as const;

  return currencyMap[accountId];
};

function CustomTooltip({ active, payload, label, accountId }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const currency = getCurrencyFromAccountId(accountId);
  const data = payload[0].payload;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#21273A] border border-white/10 rounded-xl p-3 shadow-lg"
    >
      <p className="text-xs text-slate-400 mb-1">
        {new Date(label).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })}
      </p>
      <p className="text-sm font-semibold text-white">
        Balance: {formatCurrency(data.balance, currency as any)}
      </p>
      <p className="text-xs text-green-400 font-medium">
        Earned: {formatCurrency(data.earnings, currency as any)}
      </p>
    </motion.div>
  );
}

export function EarningsChart({ data, accountId, isLoading = false }: EarningsChartProps) {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-48 flex items-center justify-center text-slate-400 bg-[#1C2333] border border-white/10 rounded-xl"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-2 mx-auto">
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-slate-300">No earnings data yet</p>
          <p className="text-xs text-slate-500">Start saving to see your progress</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Earnings (Last 30 days)
        </h3>
        <div className="text-xs text-slate-400 flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full gradient-bg" />
          <span>Balance</span>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id={`colorGradient-${accountId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B6509E" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#2EBAC6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#2EBAC6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`strokeGradient-${accountId}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#B6509E" />
                <stop offset="100%" stopColor="#2EBAC6" />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).getDate().toString()}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickFormatter={(value) => {
                const currency = getCurrencyFromAccountId(accountId);
                return formatCurrency(value, currency as any, { compact: true, maximumFractionDigits: 0 });
              }}
            />

            <Tooltip
              content={<CustomTooltip accountId={accountId} />}
              cursor={{ stroke: '#B6509E', strokeWidth: 1, strokeDasharray: '5 5' }}
            />

            <Area
              type="monotone"
              dataKey="balance"
              stroke={`url(#strokeGradient-${accountId})`}
              strokeWidth={2}
              fill={`url(#colorGradient-${accountId})`}
              dot={{ fill: '#B6509E', strokeWidth: 0, r: 3 }}
              activeDot={{
                r: 6,
                fill: '#B6509E',
                strokeWidth: 2,
                stroke: 'rgba(182, 80, 158, 0.3)',
                style: { filter: 'drop-shadow(0 0 6px rgba(182, 80, 158, 0.5))' }
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
