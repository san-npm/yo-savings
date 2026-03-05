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

export function GoalCard({ goal, onEdit, onDelete, index = 0 }: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const account = getAccountById(goal.linkedAccountId);
  const progress = getGoalProgress(goal);
  const currencyMap = {
    dollar: 'USD',
    euro: 'EUR',
  } as const;

  const currency = currencyMap[goal.linkedAccountId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 bg-[#2B2C2A] border border-white/10 rounded-2xl hover:border-white/20 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-xl">{goal.emoji}</span>
          <div>
            <h3 className="font-medium text-white">{goal.name}</h3>
            <p className="text-sm text-[#A0A0A0]">
              Linked to {account.displayName}
            </p>
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
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-[#A0A0A0]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
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

      {/* Progress Ring */}
      <div className="flex items-center space-x-3">
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
            <motion.circle
              cx="24" cy="24" r="20"
              stroke="#D6FF34"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 126" }}
              animate={{ strokeDasharray: `${(progress / 100) * 126} 126` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-white tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-[#A0A0A0]">Progress</span>
            <span className="text-[#D6FF34] font-medium">
              {formatCurrency(goal.targetAmount - goal.currentAmount, currency)} to go
            </span>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-[#D6FF34]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {progress >= 100 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded-xl"
        >
          <div className="flex items-center space-x-2 text-green-400">
            <span className="text-sm">&#127881;</span>
            <span className="text-sm font-medium">Goal completed!</span>
          </div>
        </motion.div>
      ) : (
        <div className="mt-3 pt-3 border-t border-white/10">
          <Link
            href={`/deposit?account=${goal.linkedAccountId}&goal=${goal.id}`}
            className="w-full inline-flex items-center justify-center px-4 py-2 text-black text-sm font-medium rounded-lg bg-[#D6FF34] hover:opacity-90 transition-opacity"
          >
            Add Funds
          </Link>
        </div>
      )}
    </motion.div>
  );
}
