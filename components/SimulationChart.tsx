'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SimulationChartProps {
  currentApy?: number;
  accountCurrencySymbol?: string;
}

const PERIODS = [
  { key: '3m', label: '3 mo', months: 3 },
  { key: '6m', label: '6 mo', months: 6 },
  { key: '1y', label: '1 yr', months: 12 },
  { key: '5y', label: '5 yr', months: 60 },
] as const;

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

function compoundGrowth(principal: number, apy: number, months: number) {
  const monthlyRate = apy / 100 / 12;
  const points = [];
  let balance = principal;

  for (let m = 0; m <= months; m++) {
    const label =
      months <= 12
        ? `M${m}`
        : m % 12 === 0
        ? `Y${m / 12}`
        : '';

    points.push({
      month: m,
      label: label || `M${m}`,
      balance: Math.round(balance * 100) / 100,
      earnings: Math.round((balance - principal) * 100) / 100,
    });

    balance *= 1 + monthlyRate;
  }

  return points;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#21273A] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <div className="text-sm font-semibold text-white tabular-nums">
        ${data.balance.toLocaleString()}
      </div>
      <div className="text-xs text-green-400 tabular-nums">
        +${data.earnings.toLocaleString()} earned
      </div>
    </div>
  );
}

export function SimulationChart({
  currentApy = 8,
  accountCurrencySymbol = '$',
}: SimulationChartProps) {
  const [amount, setAmount] = useState('1000');
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['key']>('1y');

  const selectedPeriod = PERIODS.find((p) => p.key === period)!;
  const principal = parseFloat(amount) || 0;

  const data = useMemo(
    () => compoundGrowth(principal, currentApy, selectedPeriod.months),
    [principal, currentApy, selectedPeriod.months]
  );

  const finalBalance = data[data.length - 1]?.balance ?? 0;
  const totalEarnings = data[data.length - 1]?.earnings ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 bg-[#1C2333] border border-white/10 rounded-2xl space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Growth Simulator</h3>
        <span className="text-xs text-slate-500">
          Based on {currentApy}% APY
        </span>
      </div>

      {/* Deposit Amount Input */}
      <div className="space-y-3">
        <label className="text-xs text-slate-500">Deposit amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
            {accountCurrencySymbol}
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^0-9.]/g, '');
              setAmount(cleaned);
            }}
            className="w-full pl-8 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-lg font-semibold tabular-nums outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Quick Amounts */}
        <div className="flex space-x-2">
          {QUICK_AMOUNTS.map((qa) => (
            <button
              key={qa}
              type="button"
              onClick={() => setAmount(qa.toString())}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                amount === qa.toString()
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
              }`}
            >
              ${qa.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex space-x-2">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-all ${
              period === p.key
                ? 'gradient-bg text-white border-transparent shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/8'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {principal > 0 && (
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="simGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B6509E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2EBAC6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="simStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#B6509E" />
                  <stop offset="100%" stopColor="#2EBAC6" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748B', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? 'k' : ''}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="url(#simStroke)"
                strokeWidth={2}
                fill="url(#simGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Projected Result */}
      {principal > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-xs text-slate-500 mb-1">Projected Total</p>
            <p className="text-lg font-semibold text-white tabular-nums">
              {accountCurrencySymbol}{finalBalance.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
            <p className="text-xs text-green-400/80 mb-1">Estimated Earnings</p>
            <p className="text-lg font-semibold text-green-400 tabular-nums">
              +{accountCurrencySymbol}{totalEarnings.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-600 text-center">
        Projections are estimates based on current APY and may vary. Past performance does not guarantee future results.
      </p>
    </motion.div>
  );
}
