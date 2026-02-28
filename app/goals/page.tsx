'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePrivy, useWallets } from '@privy-io/react-auth';

import { ClientOnly } from '@/components/ClientOnly';
import { GoalCard } from '@/components/GoalCard';
import { loadGoals, createGoal, updateGoal, deleteGoal, type SavingsGoal } from '@/lib/goals';
import { getAllAccounts, type AccountId } from '@/lib/accounts';
import { formatCurrency } from '@/lib/format';
import { CurrencyIcon } from '@/components/CurrencyIcon';

function GoalsPageContent() {
  const { authenticated } = usePrivy();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load goals on mount
  useEffect(() => {
    const loadedGoals = loadGoals();
    setGoals(loadedGoals);
    setIsLoading(false);
  }, []);

  const refreshGoals = () => {
    setGoals(loadGoals());
  };

  const handleCreateGoal = (goalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    createGoal(goalData);
    refreshGoals();
    setShowCreateForm(false);
  };

  const handleUpdateGoal = (id: string, updates: Partial<SavingsGoal>) => {
    updateGoal(id, updates);
    refreshGoals();
    setEditingGoal(null);
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal(id);
    refreshGoals();
    setDeleteConfirm(null);
  };

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Savings Goals</h1>
          <p className="text-slate-500">Sign in to start saving</p>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return <CreateGoalForm onSubmit={handleCreateGoal} onCancel={() => setShowCreateForm(false)} />;
  }

  if (editingGoal) {
    return (
      <EditGoalForm 
        goal={editingGoal}
        onSubmit={(updates) => handleUpdateGoal(editingGoal.id, updates)}
        onCancel={() => setEditingGoal(null)}
      />
    );
  }

  // Delete confirmation dialog
  if (deleteConfirm) {
    const goalToDelete = goals.find(g => g.id === deleteConfirm);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={() => setDeleteConfirm(null)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Delete Goal?</h3>
            <p className="text-slate-500">
              Are you sure you want to delete "{goalToDelete?.name}"? This action cannot be undone.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-3 px-4 bg-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteGoal(deleteConfirm)}
              className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Savings Goals</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(true)}
          className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
        >
          <span className="text-lg">+</span>
        </motion.button>
      </div>

      {/* Subtitle */}
      <p className="text-slate-500">
        Create goals to save for what matters most to you
      </p>

      {/* Goals List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-6 h-6 bg-slate-300 rounded" />
                <div className="w-32 h-4 bg-slate-300 rounded" />
              </div>
              <div className="w-full h-12 bg-slate-300 rounded" />
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 space-y-4"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No goals yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Create your first savings goal to start working towards something special
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(true)}
            className="mt-6 btn-primary"
          >
            Create Your First Goal
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, index) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={index}
              onEdit={() => setEditingGoal(goal)}
              onDelete={() => setDeleteConfirm(goal.id)}
            />
          ))}
        </div>
      )}

      {/* Quick Tips */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-slate-50 rounded-xl border border-slate-200"
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">Tips for Success</span>
          </div>
          <div className="space-y-1 text-xs text-slate-400">
            <p>• Set realistic target amounts you can achieve</p>
            <p>• Link goals to accounts that match your timeline</p>
            <p>• Your money keeps earning interest while working toward goals</p>
          </div>
        </motion.div>
      )}

      {/* Bottom spacing for nav */}
      <div className="pb-20" />
    </motion.div>
  );
}

// Edit Goal Form Component
function EditGoalForm({ 
  goal,
  onSubmit, 
  onCancel 
}: { 
  goal: SavingsGoal;
  onSubmit: (updates: Partial<SavingsGoal>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(goal.name);
  const [emoji, setEmoji] = useState(goal.emoji);
  const [targetAmount, setTargetAmount] = useState(goal.targetAmount.toString());
  const [currentAmount, setCurrentAmount] = useState(goal.currentAmount.toString());
  const [linkedAccountId, setLinkedAccountId] = useState<AccountId>(goal.linkedAccountId);

  const accounts = getAllAccounts();
  const popularEmojis = ['🎯', '🏖️', '🏡', '🚗', '💻', '🎓', '💍', '✈️', '🎸', '📱'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetAmountNum = parseFloat(targetAmount);
    const currentAmountNum = parseFloat(currentAmount);
    
    if (!name.trim() || !targetAmountNum || targetAmountNum <= 0) return;
    if (currentAmountNum < 0 || currentAmountNum > targetAmountNum) return;

    onSubmit({
      name: name.trim(),
      emoji,
      targetAmount: targetAmountNum,
      currentAmount: Math.max(0, currentAmountNum),
      linkedAccountId,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-medium text-slate-800">Edit Goal</h1>
        <div className="w-8" /> {/* Spacer */}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Goal Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-500">
            Goal name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Vacation, Emergency Fund, New Car"
            className="w-full input"
            autoFocus
          />
        </div>

        {/* Emoji Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-400">
            Choose an emoji
          </label>
          <div className="grid grid-cols-5 gap-2">
            {popularEmojis.map((emojiOption) => (
              <button
                key={emojiOption}
                type="button"
                onClick={() => setEmoji(emojiOption)}
                className={`p-3 rounded-xl border transition-all ${
                  emoji === emojiOption
                    ? 'bg-violet-500/10 border-violet-500/50'
                    : 'bg-[#1E2340]/50 border-[#1E2340] hover:border-[#2A3441]'
                }`}
              >
                <span className="text-xl">{emojiOption}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Target Amount */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-400">
            Target amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full input pl-8"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              $
            </span>
          </div>
        </div>

        {/* Current Amount */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-500">
            Current progress
          </label>
          <div className="relative">
            <input
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              max={targetAmount}
              className="w-full input pl-8"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
              $
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Manually update your progress towards this goal
          </p>
        </div>

        {/* Linked Account */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-500">
            Link to savings account
          </label>
          <div className="space-y-2">
            {accounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => setLinkedAccountId(account.id)}
                className={`w-full p-3 rounded-xl border transition-all ${
                  linkedAccountId === account.id
                    ? 'bg-green-50 border-green-500 text-green-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CurrencyIcon accountId={account.id} size="sm" />
                  <span className="font-medium">{account.displayName}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0}
          whileTap={{ scale: 0.95 }}
          className={`w-full h-12 rounded-xl font-medium transition-all ${
            name.trim() && targetAmount && parseFloat(targetAmount) > 0
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
        >
          Save Changes
        </motion.button>
      </form>
    </motion.div>
  );
}

// Create Goal Form Component
function CreateGoalForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [targetAmount, setTargetAmount] = useState('');
  const [linkedAccountId, setLinkedAccountId] = useState<AccountId>('dollar');

  const accounts = getAllAccounts();
  const popularEmojis = ['🎯', '🏖️', '🏡', '🚗', '💻', '🎓', '💍', '✈️', '🎸', '📱'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(targetAmount);
    if (!name.trim() || !amount || amount <= 0) return;

    onSubmit({
      name: name.trim(),
      emoji,
      targetAmount: amount,
      currentAmount: 0,
      linkedAccountId,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-medium text-slate-800">Create Goal</h1>
        <div className="w-8" /> {/* Spacer */}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Goal Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-500">
            What are you saving for?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Vacation, Emergency Fund, New Car"
            className="w-full input"
            autoFocus
          />
        </div>

        {/* Emoji Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-400">
            Choose an emoji
          </label>
          <div className="grid grid-cols-5 gap-2">
            {popularEmojis.map((emojiOption) => (
              <button
                key={emojiOption}
                type="button"
                onClick={() => setEmoji(emojiOption)}
                className={`p-3 rounded-xl border transition-all ${
                  emoji === emojiOption
                    ? 'bg-violet-500/10 border-violet-500/50'
                    : 'bg-[#1E2340]/50 border-[#1E2340] hover:border-[#2A3441]'
                }`}
              >
                <span className="text-xl">{emojiOption}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Target Amount */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-500">
            Target amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full input pl-8"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
              $
            </span>
          </div>
        </div>

        {/* Linked Account */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-500">
            Link to savings account
          </label>
          <div className="space-y-2">
            {accounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => setLinkedAccountId(account.id)}
                className={`w-full p-3 rounded-xl border transition-all ${
                  linkedAccountId === account.id
                    ? 'bg-green-50 border-green-500 text-green-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CurrencyIcon accountId={account.id} size="sm" />
                  <span className="font-medium">{account.displayName}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0}
          whileTap={{ scale: 0.95 }}
          className={`w-full h-12 rounded-xl font-medium transition-all ${
            name.trim() && targetAmount && parseFloat(targetAmount) > 0
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
        >
          Create Goal
        </motion.button>
      </form>

      {/* Info */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-slate-700">How it works</span>
        </div>
        <p className="text-xs text-slate-400">
          Goals are linked to your savings accounts. Your money continues earning interest while you track progress toward your target. You can contribute to goals through regular deposits.
        </p>
      </div>
    </motion.div>
  );
}

export default function GoalsPage() {
  return <GoalsPageContent />;
}