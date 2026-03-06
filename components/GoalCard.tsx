'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import type { SavingsGoal } from '@/lib/goals';
import { getAccountById } from '@/lib/accounts';
import { formatCurrency } from '@/lib/format';
import { GoalLadder } from './GoalLadder';

interface GoalCardProps {
  goal: SavingsGoal;
  currentBalance?: number; // Real vault balance passed from parent
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
}

export function GoalCard({ goal, currentBalance, onEdit, onDelete, index = 0 }: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const account = getAccountById(goal.linkedAccountId);
  const currencyMap = { dollar: 'USD', euro: 'EUR' } as const;
  const currency = currencyMap[goal.linkedAccountId] ?? 'USD';

  // Use real vault balance if provided, otherwise fall back to stored currentAmount
  const effectiveBalance = currentBalance !== undefined ? currentBalance : goal.currentAmount;
  const isComplete = goal.targetAmount > 0 && effectiveBalance >= goal.targetAmount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl hover:border-[#DEE2E6] transition-all"
      style={{ boxShadow: isComplete ? '0 0 0 2px rgba(16,185,129,0.2)' : undefined }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-xl">{goal.emoji}</span>
          <div>
            <h3 className="font-semibold text-[#1A1A2E]">{goal.name}</h3>
            <p className="text-xs text-[#ADB5BD]">Linked to {account.displayName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="text-sm font-semibold text-[#1A1A2E] tabular-nums">
              {formatCurrency(effectiveBalance, currency)}
            </div>
            <div className="text-xs text-[#ADB5BD]">
              of {formatCurrency(goal.targetAmount, currency)}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1 hover:bg-[#E9ECEF] rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-[#ADB5BD]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-1 w-32 bg-white border border-[#E9ECEF] rounded-lg shadow-lg z-10"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit?.(); }}
                  className="w-full px-3 py-2 text-sm text-[#6C757D] hover:bg-[#F8F9FA] rounded-t-lg transition-colors text-left"
                >
                  Edit Goal
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete?.(); }}
                  className="w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-b-lg transition-colors text-left"
                >
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* GoalLadder — replaces progress ring + bar */}
      <GoalLadder
        currentAmount={effectiveBalance}
        targetAmount={goal.targetAmount}
        goalEmoji={goal.emoji}
        lastDepositDate={goal.updatedAt}
      />

      {/* Completion banner / CTA */}
      {isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          className="mt-4 p-3 rounded-xl border border-[#10B981]/30 bg-[#ECFDF5]"
        >
          <div className="flex items-center space-x-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg"
            >
              🏆
            </motion.span>
            <span className="text-sm font-semibold text-[#10B981]">Goal achieved! Congrats!</span>
          </div>
        </motion.div>
      ) : (
        <div className="mt-4 pt-3 border-t border-[#E9ECEF]">
          <Link
            href={`/deposit?account=${goal.linkedAccountId}&goal=${goal.id}`}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 text-white text-sm font-semibold rounded-xl bg-[#10B981] hover:bg-[#059669] transition-colors"
          >
            Add Funds
          </Link>
        </div>
      )}
    </motion.div>
  );
}
