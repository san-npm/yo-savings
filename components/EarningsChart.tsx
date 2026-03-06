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

const getAccountColor = (accountId: AccountId) => {
  return accountId === 'dollar' ? '#10B981' : '#3B82F6';
};

function CustomTooltip({ active, payload, label, accountId }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const currency = getCurrencyFromAccountId(accountId);
  const data = payload[0].payload;
  const color = getAccountColor(accountId);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-[#E9ECEF] rounded-xl p-3 shadow-md"
    >
      <p className="text-xs text-[#6C757D] mb-1">
        {new Date(label).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })}
      </p>
      <p className="text-sm font-semibold text-[#1A1A2E]">
        Balance: {formatCurrency(data.balance, currency as any)}
      </p>
      <p className="text-xs font-medium" style={{ color }}>
        Earned: {formatCurrency(data.earnings, currency as any)}
      </p>
    </motion.div>
  );
}

export function EarningsChart({ data, accountId, isLoading = false }: EarningsChartProps) {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  const color = getAccountColor(accountId);

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-48 flex items-center justify-center text-[#6C757D] bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-[#ECFDF5] rounded-full flex items-center justify-center mb-2 mx-auto">
            <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-[#6C757D]">No earnings data yet</p>
          <p className="text-xs text-[#ADB5BD]">Start saving to see your progress</p>
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
        <h3 className="text-lg font-semibold text-[#1A1A2E]">
          Earnings (Last 30 days)
        </h3>
        <div className="text-xs text-[#6C757D] flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
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
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#ADB5BD', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).getDate().toString()}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#ADB5BD', fontSize: 12 }}
              tickFormatter={(value) => {
                const currency = getCurrencyFromAccountId(accountId);
                return formatCurrency(value, currency as any, { compact: true, maximumFractionDigits: 0 });
              }}
            />

            <Tooltip
              content={<CustomTooltip accountId={accountId} />}
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '5 5' }}
            />

            <Area
              type="monotone"
              dataKey="balance"
              stroke={color}
              strokeWidth={2}
              fill={`url(#colorGradient-${accountId})`}
              dot={{ fill: color, strokeWidth: 0, r: 3 }}
              activeDot={{
                r: 6,
                fill: color,
                strokeWidth: 2,
                stroke: `${color}40`,
              }}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
