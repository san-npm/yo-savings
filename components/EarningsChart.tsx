'use client';

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart, Tooltip } from 'recharts';
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
      className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg"
    >
      <p className="text-xs text-slate-500 mb-1">
        {new Date(label).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })}
      </p>
      <p className="text-sm font-semibold text-slate-800">
        Balance: {formatCurrency(data.balance, currency as any)}
      </p>
      <p className="text-xs text-green-500 font-medium">
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
        className="h-48 flex items-center justify-center text-slate-500 bg-white rounded-xl shadow-sm"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2 mx-auto">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-slate-700">No earnings data yet</p>
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
        <h3 className="text-lg font-semibold text-slate-800">
          Earnings (Last 30 days)
        </h3>
        <div className="text-xs text-slate-500 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
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
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
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
              cursor={{ stroke: '#22C55E', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#22C55E"
              strokeWidth={2}
              fill={`url(#colorGradient-${accountId})`}
              dot={{ fill: '#22C55E', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#22C55E', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}