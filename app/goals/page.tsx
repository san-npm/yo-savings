'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useUserBalance } from '@yo-protocol/react';

import { GoalCard } from '@/components/GoalCard';
import { AuthGate } from '@/components/AuthGate';
import { loadGoals, createGoal, updateGoal, deleteGoal, type SavingsGoal } from '@/lib/goals';
import { getAllAccounts, getAccountById, getDefaultAccount, type AccountId } from '@/lib/accounts';
import { CurrencyIcon } from '@/components/CurrencyIcon';

// Hook to fetch balance for a single account
function useAccountBalance(accountId: AccountId, address?: `0x${string}`) {
  const account = getAccountById(accountId) ?? getDefaultAccount();
  const { position, isLoading } = useUserBalance(
    account.vaultAddress as `0x${string}`,
    address
  );
  const balance = Number(position?.assets || BigInt(0)) / 1e6;
  return { balance, isLoading };
}

// Component that loads balance for a goal's linked account
function GoalWithBalance({
  goal,
  address,
  onEdit,
  onDelete,
  index,
}: {
  goal: SavingsGoal;
  address?: `0x${string}`;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}) {
  const { balance } = useAccountBalance(goal.linkedAccountId, address);

  return (
    <GoalCard
      goal={goal}
      currentBalance={balance}
      index={index}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

function GoalsPageContent() {
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const userAddress = embeddedWallet?.address;

  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedGoals = loadGoals(userAddress);
    setGoals(loadedGoals);
    setIsLoading(false);
  }, [userAddress]);

  const refreshGoals = () => {
    setGoals(loadGoals(userAddress));
  };

  const handleCreateGoal = (goalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt' | 'currentAmount'>) => {
    createGoal(goalData, userAddress);
    refreshGoals();
    setShowCreateForm(false);
  };

  const handleUpdateGoal = (id: string, updates: Partial<Omit<SavingsGoal, 'currentAmount'>>) => {
    updateGoal(id, updates, userAddress);
    refreshGoals();
    setEditingGoal(null);
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal(id, userAddress);
    refreshGoals();
    setDeleteConfirm(null);
  };

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

  if (deleteConfirm) {
    const goalToDelete = goals.find(g => g.id === deleteConfirm);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50"
        onClick={() => setDeleteConfirm(null)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-[#E9ECEF] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A2E]">Delete Goal?</h3>
            <p className="text-[#6C757D]">
              Are you sure you want to delete &ldquo;{goalToDelete?.name}&rdquo;? This action cannot be undone.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-3 px-4 bg-[#F8F9FA] text-[#6C757D] rounded-xl font-medium hover:bg-[#F1F3F5] transition-colors border border-[#E9ECEF]"
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
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Savings Goals</h1>
          <p className="text-[#6C757D] mt-1">Save for what matters most</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(true)}
          className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center text-white hover:bg-[#059669] transition-colors shadow-sm"
        >
          <span className="text-lg leading-none">+</span>
        </motion.button>
      </div>

      {/* Goals List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-6 h-6 rounded loading-pulse" />
                <div className="w-32 h-4 rounded loading-pulse" />
              </div>
              <div className="w-full h-12 rounded loading-pulse" />
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 space-y-4"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto bg-[#ECFDF5] border border-[#10B981]/20">
            <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#1A1A2E]">No goals yet</h3>
          <p className="text-[#6C757D] max-w-sm mx-auto">
            Create your first savings goal to start working towards something special
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(true)}
            className="mt-6 px-6 py-3 bg-[#10B981] text-white font-semibold rounded-xl hover:bg-[#059669] transition-colors"
          >
            Create Your First Goal
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, index) => (
            <GoalWithBalance
              key={goal.id}
              goal={goal}
              address={userAddress as `0x${string}` | undefined}
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
          className="p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl"
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#ECFDF5]">
              <svg className="w-3 h-3 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-[#1A1A2E]">Tips for Success</span>
          </div>
          <div className="space-y-1 text-xs text-[#6C757D]">
            <p>&bull; Set realistic target amounts you can achieve</p>
            <p>&bull; Link goals to accounts that match your timeline</p>
            <p>&bull; Your money keeps earning interest while working toward goals</p>
          </div>
        </motion.div>
      )}

      <div className="pb-20" />
    </motion.div>
  );
}

// Edit Goal Form (no currentAmount field)
function EditGoalForm({
  goal,
  onSubmit,
  onCancel
}: {
  goal: SavingsGoal;
  onSubmit: (updates: Partial<Omit<SavingsGoal, 'currentAmount'>>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(goal.name);
  const [emoji, setEmoji] = useState(goal.emoji);
  const [targetAmount, setTargetAmount] = useState(goal.targetAmount.toString());
  const [linkedAccountId, setLinkedAccountId] = useState<AccountId>(goal.linkedAccountId);

  const accounts = getAllAccounts();
  const popularEmojis = ['🎯', '🏖️', '🏡', '🚗', '💻', '🎓', '💍', '✈️', '🎸', '📱'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmountNum = parseFloat(targetAmount);
    if (!name.trim() || !targetAmountNum || targetAmountNum <= 0) return;
    onSubmit({ name: name.trim(), emoji, targetAmount: targetAmountNum, linkedAccountId });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="p-2 hover:bg-[#F8F9FA] rounded-xl transition-colors">
          <svg className="w-5 h-5 text-[#6C757D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-medium text-[#1A1A2E]">Edit Goal</h1>
        <div className="w-8" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#6C757D]">Goal name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Vacation, Emergency Fund, New Car"
            className="w-full px-4 py-3 bg-white border border-[#E9ECEF] rounded-xl text-[#1A1A2E] placeholder-[#ADB5BD] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 outline-none transition-all"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#6C757D]">Choose an emoji</label>
          <div className="grid grid-cols-5 gap-2">
            {popularEmojis.map((emojiOption) => (
              <button
                key={emojiOption}
                type="button"
                onClick={() => setEmoji(emojiOption)}
                className={`p-3 rounded-xl border transition-all ${
                  emoji === emojiOption
                    ? 'bg-[#ECFDF5] border-[#10B981]/30 shadow-sm'
                    : 'bg-[#F8F9FA] border-[#E9ECEF] hover:border-[#DEE2E6]'
                }`}
              >
                <span className="text-xl">{emojiOption}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#6C757D]">Target amount</label>
          <div className="relative">
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full pl-8 pr-4 py-3 bg-white border border-[#E9ECEF] rounded-xl text-[#1A1A2E] placeholder-[#ADB5BD] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 outline-none transition-all"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#ADB5BD]">$</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#6C757D]">Link to savings account</label>
          <div className="space-y-2">
            {accounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => setLinkedAccountId(account.id)}
                className={`w-full p-3 rounded-xl border transition-all ${
                  linkedAccountId === account.id
                    ? 'bg-[#ECFDF5] border-[#10B981]/30'
                    : 'bg-[#F8F9FA] border-[#E9ECEF] hover:border-[#DEE2E6]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CurrencyIcon accountId={account.id} size="sm" />
                  <span className={`font-medium ${linkedAccountId === account.id ? 'text-[#1A1A2E]' : 'text-[#6C757D]'}`}>
                    {account.displayName}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0}
          whileTap={{ scale: 0.95 }}
          className={`w-full h-12 rounded-xl font-medium transition-all ${
            name.trim() && targetAmount && parseFloat(targetAmount) > 0
              ? 'text-white bg-[#10B981] hover:bg-[#059669] shadow-sm'
              : 'bg-[#F8F9FA] text-[#ADB5BD] cursor-not-allowed border border-[#E9ECEF]'
          }`}
        >
          Save Changes
        </motion.button>
      </form>
    </motion.div>
  );
}

// Create Goal Form (no currentAmount field)
function CreateGoalForm({
  onSubmit,
  onCancel
}: {
  onSubmit: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt' | 'currentAmount'>) => void;
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
    onSubmit({ name: name.trim(), emoji, targetAmount: amount, linkedAccountId });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="p-2 hover:bg-[#F8F9FA] rounded-xl transition-colors">
          <svg className="w-5 h-5 text-[#6C757D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-medium text-[#1A1A2E]">Create Goal</h1>
        <div className="w-8" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#6C757D]">What are you saving for?</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Vacation, Emergency Fund, New Car"
            className="w-full px-4 py-3 bg-white border border-[#E9ECEF] rounded-xl text-[#1A1A2E] placeholder-[#ADB5BD] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 outline-none transition-all"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#6C757D]">Choose an emoji</label>
          <div className="grid grid-cols-5 gap-2">
            {popularEmojis.map((emojiOption) => (
              <button
                key={emojiOption}
                type="button"
                onClick={() => setEmoji(emojiOption)}
                className={`p-3 rounded-xl border transition-all ${
                  emoji === emojiOption
                    ? 'bg-[#ECFDF5] border-[#10B981]/30 shadow-sm'
                    : 'bg-[#F8F9FA] border-[#E9ECEF] hover:border-[#DEE2E6]'
                }`}
              >
                <span className="text-xl">{emojiOption}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#6C757D]">Target amount</label>
          <div className="relative">
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full pl-8 pr-4 py-3 bg-white border border-[#E9ECEF] rounded-xl text-[#1A1A2E] placeholder-[#ADB5BD] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 outline-none transition-all"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#ADB5BD]">$</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#6C757D]">Link to savings account</label>
          <div className="space-y-2">
            {accounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => setLinkedAccountId(account.id)}
                className={`w-full p-3 rounded-xl border transition-all ${
                  linkedAccountId === account.id
                    ? 'bg-[#ECFDF5] border-[#10B981]/30'
                    : 'bg-[#F8F9FA] border-[#E9ECEF] hover:border-[#DEE2E6]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CurrencyIcon accountId={account.id} size="sm" />
                  <span className={`font-medium ${linkedAccountId === account.id ? 'text-[#1A1A2E]' : 'text-[#6C757D]'}`}>
                    {account.displayName}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0}
          whileTap={{ scale: 0.95 }}
          className={`w-full h-12 rounded-xl font-medium transition-all ${
            name.trim() && targetAmount && parseFloat(targetAmount) > 0
              ? 'text-white bg-[#10B981] hover:bg-[#059669] shadow-sm'
              : 'bg-[#F8F9FA] text-[#ADB5BD] cursor-not-allowed border border-[#E9ECEF]'
          }`}
        >
          Create Goal
        </motion.button>
      </form>

      <div className="p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#ECFDF5]">
            <svg className="w-3 h-3 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-[#1A1A2E]">How it works</span>
        </div>
        <p className="text-xs text-[#6C757D]">
          Your goal progress is automatically tracked from your actual vault balance. Deposit to your linked savings account to make progress toward this goal.
        </p>
      </div>
    </motion.div>
  );
}

export default function GoalsPage() {
  return (
    <AuthGate>
      <GoalsPageContent />
    </AuthGate>
  );
}
