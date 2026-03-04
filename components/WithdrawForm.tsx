'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavingsAccount } from '@/lib/accounts';
import { parseAmountInput, formatBalance } from '@/lib/format';
import { Confetti } from './Confetti';
import { CurrencyIcon } from './CurrencyIcon';

interface WithdrawFormProps {
  account: SavingsAccount;
  availableBalance: number;
  onWithdraw: (amount: string) => Promise<{ hash: string; instant: boolean }>;
  isProcessing?: boolean;
  isQueued?: boolean;
  onReset?: () => void;
  isLoading?: boolean;
}

const MIN_WITHDRAW = 0.01;


function friendlyError(error: any): string {
  const msg = error?.message || error?.toString() || '';
  if (msg.includes('User rejected') || msg.includes('user rejected') || msg.includes('ACTION_REJECTED'))
    return 'Transaction cancelled. You can try again.';
  if (msg.includes('insufficient') || msg.includes('exceeds'))
    return 'Insufficient balance. Try a smaller amount.';
  if (msg.includes('network') || msg.includes('timeout'))
    return 'Network issue. Please check your connection and try again.';
  return 'Something went wrong. Please try again.';
}

export function WithdrawForm({
  account,
  availableBalance,
  onWithdraw,
  isProcessing = false,
  isQueued = false,
  onReset,
  isLoading = false
}: WithdrawFormProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successAmount, setSuccessAmount] = useState(0);
  const [localTxHash, setLocalTxHash] = useState<string | null>(null);
  const [localIsQueued, setLocalIsQueued] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleaned);
    setError(null);
  };

  const handleMaxAmount = () => {
    setAmount(availableBalance.toFixed(2));
    setError(null);
  };

  const handleQuickPercentage = (percentage: number) => {
    const quickAmount = (availableBalance * percentage / 100);
    setAmount(quickAmount.toFixed(2));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseAmountInput(amount);
    if (parsedAmount < MIN_WITHDRAW) {
      setError(`Minimum withdrawal is ${account.currencySymbol}${MIN_WITHDRAW}`);
      return;
    }
    if (parsedAmount > availableBalance) {
      setError('Amount exceeds available balance');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmWithdraw = async () => {
    setShowConfirm(false);
    const parsedAmount = parseAmountInput(amount);
    if (parsedAmount < MIN_WITHDRAW || parsedAmount > availableBalance) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessAmount(parsedAmount);

    try {
      const result = await onWithdraw(amount);
      setLocalTxHash(result.hash);
      setLocalIsQueued(!result.instant);
      setShowSuccess(true);
      setAmount('');
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedAmount = parseAmountInput(amount);
  const isValid = parsedAmount >= MIN_WITHDRAW && parsedAmount <= availableBalance;
  const isOverLimit = parsedAmount > availableBalance;
  const busy = isSubmitting || isProcessing;
  const currentStepLabel = busy ? 'Processing...' : null;
  const queuedStatus = isQueued || localIsQueued;

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 space-y-6"
      >
        <Confetti active={showSuccess} onComplete={() => {}} />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
        >
          <span className="text-2xl">&#10003;</span>
        </motion.div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            {queuedStatus ? 'Queued for Processing' : 'Done!'}
          </h2>
          <p className="text-slate-600">
            {account.currencySymbol}{successAmount.toFixed(2)} {queuedStatus ? 'queued for withdrawal' : 'withdrawn to your account'}
          </p>
          {queuedStatus && (
            <p className="text-sm text-orange-600">
              Your withdrawal may take some time to process during high demand
            </p>
          )}
          {localTxHash && (
            <a
              href={`https://basescan.org/tx/${localTxHash}`}
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
          onClick={() => {
            setShowSuccess(false);
            onReset?.();
          }}
          className="px-6 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors"
        >
          Done
        </motion.button>
      </motion.div>
    );
  }

  return (
    <>
      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-2xl p-6 space-y-5 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-slate-800 text-center">Confirm Withdrawal</h3>

              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Amount</span>
                  <span className="text-lg font-semibold text-slate-800">
                    {account.currencySymbol}{parsedAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">From</span>
                  <span className="text-sm font-medium text-slate-700">{account.displayName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Remaining</span>
                  <span className="text-sm text-slate-600">
                    {account.currencySymbol}{(availableBalance - parsedAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Withdrawn funds will stop earning interest immediately.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 h-12 rounded-xl font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmWithdraw}
                  className="flex-1 h-12 rounded-xl font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              disabled={busy}
              className="text-sm text-green-500 hover:text-green-400 transition-colors disabled:opacity-50"
            >
              Max
            </motion.button>
          </div>

          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              disabled={busy}
              className={`w-full text-4xl font-semibold text-center bg-transparent placeholder-slate-400 border-none outline-none tabular-nums ${
                isOverLimit ? 'text-red-400' : 'text-slate-800'
              } disabled:opacity-50`}
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
                disabled={busy}
                className="py-2 px-3 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 hover:text-slate-700 transition-colors disabled:opacity-50"
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

        {/* Step indicator */}
        {currentStepLabel && !error && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-sm text-green-700">{currentStepLabel}</p>
            </div>
          </div>
        )}

        {/* Withdraw Button */}
        <motion.button
          type="submit"
          disabled={!isValid || busy || isLoading}
          whileTap={{ scale: isValid && !busy ? 0.95 : 1 }}
          className={`w-full h-12 rounded-xl font-medium transition-all ${
            isValid && !busy
              ? 'bg-emerald-400 text-white hover:bg-emerald-500'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
        >
          {busy ? (
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>{currentStepLabel || 'Processing...'}</span>
            </div>
          ) : (
            `Withdraw ${isValid ? `${account.currencySymbol}${amount}` : ''}`
          )}
        </motion.button>

        {/* Info */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>Funds will be available in your account</p>
          <p>No fees &bull; Fast processing</p>
        </div>
      </motion.form>
    </>
  );
}
