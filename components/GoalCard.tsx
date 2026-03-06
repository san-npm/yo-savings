'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import type { SavingsGoal } from '@/lib/goals';
import { getAccountById } from '@/lib/accounts';
import { getGoalProgress } from '@/lib/goals';
import { formatCurrency } from '@/lib/format';

interface GoalCardProps {
  goal: SavingsGoal;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
}

/** Sparkle burst for completed goals */
function Sparkles() {
  const sparks = [
    { angle: 0, dist: 28 },
    { angle: 45, dist: 24 },
    { angle: 90, dist: 30 },
    { angle: 135, dist: 22 },
    { angle: 180, dist: 28 },
    { angle: 225, dist: 24 },
    { angle: 270, dist: 28 },
    { angle: 315, dist: 22 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none">
      {sparks.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180;
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#D6FF34]"
            style={{ top: '50%', left: '50%' }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: Math.cos(rad) * s.dist,
              y: Math.sin(rad) * s.dist,
              scale: [0, 1.5, 0],
            }}
            transition={{ duration: 0.8, delay: i * 0.04, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

export function GoalCard({ goal, onEdit, onDelete, index = 0 }: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const account = getAccountById(goal.linkedAccountId);
  const progress = getGoalProgress(goal);
  const currencyMap = { dollar: 'USD', euro: 'EUR' } as const;
  const currency = currencyMap[goal.linkedAccountId];
  const isComplete = progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 bg-[#2B2C2A] border border-white/10 rounded-2xl hover:border-white/20 transition-all"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-xl">{goal.emoji}</span>
          <div>
            <h3 className="font-medium text-white">{goal.name}</h3>
            <p className="text-sm text-[#A0A0A0]">Linked to {account.displayName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="text-sm font-semibold text-white tabular-nums">
              {formatCurrency(goal.currentAmount, currency)}
            </div>
            <div className="text-xs text-[#666666]">
              of {formatCurrency(goal.targetAmount, currency)}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-[#A0A0A0]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-1 w-32 bg-[#3A3B38] border border-white/10 rounded-lg shadow-lg z-10"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit?.(); }}
                  className="w-full px-3 py-2 text-sm text-[#A0A0A0] hover:bg-white/5 rounded-t-lg transition-colors text-left"
                >
                  Edit Goal
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete?.(); }}
                  className="w-full px-3 py-2 text-sm text-red-400 hover:bg-white/5 rounded-b-lg transition-colors text-left"
                >
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Progress ring + bar */}
      <div className="flex items-center space-x-3">
        {/* Gradient progress ring */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
            <defs>
              <linearGradient id={`ring-gradient-${goal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D6FF34" />
                <stop offset="100%" stopColor="#00FF8B" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
            {/* Progress */}
            <motion.circle
              cx="24" cy="24" r="20"
              stroke={`url(#ring-gradient-${goal.id})`}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 126' }}
              animate={{ strokeDasharray: `${(Math.min(progress, 100) / 100) * 126} 126` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>

          {/* Percentage label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-white tabular-nums">
              {Math.round(Math.min(progress, 100))}%
            </span>
          </div>

          {/* Sparkle burst for completed goals */}
          {isComplete && <Sparkles />}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-[#A0A0A0]">Progress</span>
            <span className="text-[#D6FF34] font-medium">
              {isComplete
                ? 'Goal reached! 🎉'
                : `${formatCurrency(goal.targetAmount - goal.currentAmount, currency)} to go`}
            </span>
          </div>

          <div className="w-full bg-white/8 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-2 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #D6FF34 0%, #00FF8B 100%)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Completion banner / CTA */}
      {isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          className="mt-3 p-3 rounded-xl border border-[#D6FF34]/30 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(214,255,52,0.12) 0%, rgba(0,255,139,0.08) 100%)' }}
        >
          <div className="flex items-center space-x-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg"
            >
              🏆
            </motion.span>
            <span className="text-sm font-semibold text-[#D6FF34]">Goal achieved! Congrats!</span>
          </div>
        </motion.div>
      ) : (
        <div className="mt-3 pt-3 border-t border-white/10">
          <Link
            href={`/deposit?account=${goal.linkedAccountId}&goal=${goal.id}`}
            className="w-full inline-flex items-center justify-center px-4 py-2 text-black text-sm font-semibold rounded-lg bg-[#D6FF34] hover:opacity-90 transition-opacity"
          >
            Add Funds
          </Link>
        </div>
      )}
    </motion.div>
  );
}
