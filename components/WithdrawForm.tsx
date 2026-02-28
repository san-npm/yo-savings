'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { SavingsAccount } from '@/lib/accounts';
import { parseAmountInput, formatBalance } from '@/lib/format';
import { Confetti } from './Confetti';
import { CurrencyIcon } from './CurrencyIcon';

interface WithdrawFormProps {
  account: SavingsAccount;
  availableBalance: number;
  onWithdraw: (amount: string) => Promise<{ hash: string; instant: boolean }>;
  isLoading?: boolean;
}

export function WithdrawForm({
  account,
  availableBalance,
  onWithdraw,
  isLoading = false
}: WithdrawFormProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAmount, setSuccessAmount] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isQueued, setIsQueued] = useState(false);

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setAmount(cleaned);
  };

  const handleMaxAmount = () => {
    setAmount(availableBalance.toString());
  };

  const handleQuickPercentage = (percentage: number) => {
    const quickAmount = (availableBalance * percentage / 100);
    setAmount(quickAmount.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseAmountInput(amount);
    if (parsedAmount <= 0 || parsedAmount > availableBalance) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessAmount(parsedAmount);
    
    try {
      const result = await onWithdraw(amount);
      setTxHash(result.hash);
      setIsQueued(!result.instant);
      setShowSuccess(true);
      setAmount('');
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      setError(error?.message || 'Withdrawal failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedAmount = parseAmountInput(amount);
  const isValid = parsedAmount > 0 && parsedAmount <= availableBalance;
  const isOverLimit = parsedAmount > availableBalance;

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 space-y-6"
      >
        <Confetti
          active={showSuccess}
          onComplete={() => setShowSuccess(false)}
        />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
        >
          <span className="text-2xl">✅</span>
        </motion.div>
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            {isQueued ? 'Queued for Processing' : 'Done!'}
          </h2>
          <p className="text-slate-600">
            {account.currencySymbol}{successAmount} {isQueued ? 'queued for withdrawal' : 'withdrawn to your account'}
          </p>
          {isQueued && (
            <p className="text-sm text-orange-600">
              Your withdrawal may take some time to process during high demand
            </p>
          )}
          {txHash && (
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:text-green-700 underline"
            >
              View transaction
            </a>
          )}
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSuccess(false)}
          className="px-6 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors"
        >
          Done
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Account Header */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3">
          <CurrencyIcon accountId={account.id} />
          <div>
            <h2 className="font-medium text-slate-800">{account.displayName}</h2>
            <p className="text-sm text-slate-400">Withdraw to your account</p>
          </div>
        </div>
      </div>

      {/* Available Balance */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Available balance</span>
          <div className="text-right">
            <div className="font-semibold text-slate-800 tabular-nums">
              {formatBalance(availableBalance, account.id)}
            </div>
          </div>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-500">
            Amount to withdraw
          </label>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleMaxAmount}
            className="text-sm text-green-500 hover:text-green-400 transition-colors"
          >
            Max
          </motion.button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            className={`w-full text-4xl font-semibold text-center bg-transparent placeholder-slate-400 border-none outline-none tabular-nums ${
              isOverLimit ? 'text-red-400' : 'text-slate-800'
            }`}
            autoFocus
          />
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 text-2xl text-slate-500">
            {account.currencySymbol}
          </div>
          
          {isOverLimit && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-red-400 mt-2"
            >
              Amount exceeds available balance
            </motion.p>
          )}
        </div>

        {/* Quick Percentages */}
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((percentage) => (
            <motion.button
              key={percentage}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickPercentage(percentage)}
              className="py-2 px-3 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 hover:text-slate-700 transition-colors"
            >
              {percentage}%
            </motion.button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Withdraw Button */}
      <motion.button
        type="submit"
        disabled={!isValid || isSubmitting || isLoading}
        whileTap={{ scale: isValid ? 0.95 : 1 }}
        className={`w-full h-12 rounded-xl font-medium transition-all ${
          isValid
            ? 'bg-emerald-400 text-white hover:bg-emerald-500'
            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span>Processing your withdrawal...</span>
          </div>
        ) : (
          `Withdraw ${isValid ? `${account.currencySymbol}${amount}` : ''}`
        )}
      </motion.button>

      {/* Info */}
      <div className="text-center text-xs text-slate-500 space-y-1">
        <p>Funds will be available in your account</p>
        <p>No fees • Instant processing</p>
      </div>
    </motion.form>
  );
}