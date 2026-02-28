'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { SavingsAccount } from '@/lib/accounts';
import { parseAmountInput } from '@/lib/format';
import { Confetti } from './Confetti';
import { CurrencyIcon } from './CurrencyIcon';

interface DepositFormProps {
  account: SavingsAccount;
  onDeposit: (amount: string) => Promise<{ hash: string }>;
  isLoading?: boolean;
}

const quickAmounts = [50, 100, 500, 1000];

export function DepositForm({ account, onDeposit, isLoading = false }: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAmount, setSuccessAmount] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseAmountInput(amount);
    if (parsedAmount <= 0) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessAmount(parsedAmount);
    
    try {
      const result = await onDeposit(amount);
      setTxHash(result.hash);
      setShowSuccess(true);
      setAmount('');
    } catch (error: any) {
      console.error('Deposit failed:', error);
      setError(error?.message || 'Deposit failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedAmount = parseAmountInput(amount);
  const isValid = parsedAmount > 0;

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
            Done!
          </h2>
          <p className="text-slate-600">
            {account.currencySymbol}{successAmount} added to {account.displayName}
          </p>
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
      <div className="flex items-center space-x-3 p-4 bg-white rounded-2xl shadow-sm">
        <CurrencyIcon accountId={account.id} />
        <div>
          <h2 className="font-medium text-slate-800">{account.displayName}</h2>
          <p className="text-sm text-slate-500">Add money to start earning</p>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-600">
          Amount
        </label>
        
        <div className="relative">
          <input
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            className="w-full text-4xl font-semibold text-center bg-transparent text-slate-800 placeholder-slate-400 border-none outline-none tabular-nums"
            autoFocus
          />
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 text-2xl text-slate-500">
            {account.currencySymbol}
          </div>
        </div>

        {/* Quick Amounts */}
        <div className="flex flex-wrap gap-2 justify-center">
          {quickAmounts.map((quickAmount) => (
            <motion.button
              key={quickAmount}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAmount(quickAmount)}
              className="py-1.5 px-4 text-sm font-medium text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
            >
              {account.currencySymbol}{quickAmount}
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

      {/* Deposit Button */}
      <motion.button
        type="submit"
        disabled={!isValid || isSubmitting || isLoading}
        whileTap={{ scale: isValid ? 0.95 : 1 }}
        className={`w-full h-12 rounded-xl font-medium transition-all ${
          isValid
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span>Processing your deposit...</span>
          </div>
        ) : (
          `Deposit ${isValid ? `${account.currencySymbol}${amount}` : ''}`
        )}
      </motion.button>

      {/* Info */}
      <div className="text-center text-xs text-slate-500 space-y-1">
        <p>Your deposit will start earning immediately</p>
        <p>Secured by institutional-grade protocols • Withdraw anytime</p>
      </div>
    </motion.form>
  );
}