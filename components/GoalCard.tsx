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
      className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-xl">{goal.emoji}</span>
          <div>
            <h3 className="font-medium text-slate-800">{goal.name}</h3>
            <p className="text-sm text-slate-500">
              Linked to {account.displayName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-800 tabular-nums">
              {formatCurrency(goal.currentAmount, currency)}
            </div>
            <div className="text-xs text-slate-500">
              of {formatCurrency(goal.targetAmount, currency)}
            </div>
          </div>
          
          {/* Three dots menu button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
            
            {/* Dropdown menu */}
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-10"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit?.();
                  }}
                  className="w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg transition-colors text-left"
                >
                  Edit Goal
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDelete?.();
                  }}
                  className="w-full px-3 py-2 text-sm text-red-500 hover:bg-slate-50 rounded-b-lg transition-colors text-left"
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
          <svg
            className="w-12 h-12 transform -rotate-90"
            viewBox="0 0 48 48"
          >
            {/* Background circle */}
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#E2E8F0"
              strokeWidth="4"
              fill="none"
            />
            
            {/* Progress circle */}
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              stroke="#22C55E"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 126" }}
              animate={{ 
                strokeDasharray: `${(progress / 100) * 126} 126` 
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-slate-700 tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-500">Progress</span>
            <span className="text-green-500 font-medium">
              {formatCurrency(goal.targetAmount - goal.currentAmount, currency)} to go
            </span>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div
              className="h-2 bg-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
      
      {/* Achievement message or Add Funds button */}
      {progress >= 100 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-green-50 border border-green-200 rounded-xl"
        >
          <div className="flex items-center space-x-2 text-green-600">
            <span className="text-sm">🎉</span>
            <span className="text-sm font-medium">Goal completed!</span>
          </div>
        </motion.div>
      ) : (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <Link
            href={`/deposit?account=${goal.linkedAccountId}&goal=${goal.id}`}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add Funds
          </Link>
        </div>
      )}
    </motion.div>
  );
}