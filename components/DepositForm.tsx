'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavingsAccount } from '@/lib/accounts';
import { parseAmountInput } from '@/lib/format';
import { Confetti } from './Confetti';
import { CurrencyIcon } from './CurrencyIcon';
import { useHaptics } from '@/lib/useHaptics';

interface DepositFormProps {
  account: SavingsAccount;
  onDeposit: (amount: string) => Promise<{ hash: string }>;
  isProcessing?: boolean;
  onReset?: () => void;
  isLoading?: boolean;
}

const quickAmounts = [50, 100, 500, 1000];
const MIN_DEPOSIT = 1;


// Map blockchain errors to user-friendly messages
function friendlyError(error: any): string {
  const msg = error?.message || error?.toString() || '';
  if (msg.includes('User rejected') || msg.includes('user rejected') || msg.includes('ACTION_REJECTED'))
    return 'Transaction cancelled. You can try again.';
  if (msg.includes('insufficient funds') || msg.includes('exceeds balance'))
    return 'Insufficient funds in your account. Try a smaller amount.';
  if (msg.includes('insufficient allowance'))
    return 'Authorization needed. Please try again.';
  if (msg.includes('network') || msg.includes('timeout'))
    return 'Network issue. Please check your connection and try again.';
  return 'Something went wrong. Please try again.';
}

export function DepositForm({
  account,
  onDeposit,
  isProcessing = false,
  onReset,
  isLoading = false,
}: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successAmount, setSuccessAmount] = useState(0);
  const [localTxHash, setLocalTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const haptics = useHaptics();

  const handleAmountChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleaned);
    setError(null);
  };

  const handleQuickAmount = (quickAmount: number) => {
    haptics.tap();
    setAmount(quickAmount.toString());
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseAmountInput(amount);
    if (parsedAmount < MIN_DEPOSIT) {
      haptics.error();
      setError(`Minimum deposit is ${account.currencySymbol}${MIN_DEPOSIT}`);
      return;
    }
    // Show confirmation dialog
    haptics.confirm();
    setShowConfirm(true);
  };

  const handleConfirmDeposit = async () => {
    setShowConfirm(false);
    const parsedAmount = parseAmountInput(amount);
    if (parsedAmount < MIN_DEPOSIT) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessAmount(parsedAmount);

    try {
      const result = await onDeposit(amount);
      setLocalTxHash(result.hash);
      haptics.success();
      setShowSuccess(true);
      setAmount('');
    } catch (err: any) {
      haptics.error();
      setError(friendlyError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedAmount = parseAmountInput(amount);
  const isValid = parsedAmount >= MIN_DEPOSIT;
  const busy = isSubmitting || isProcessing;

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 space-y-6"
      >
        <Confetti
          active={showSuccess}
          onComplete={() => {}}
        />

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
            Done!
          </h2>
          <p className="text-slate-600">
            {account.currencySymbol}{successAmount} added to {account.displayName}
          </p>
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
              <h3 className="text-lg font-semibold text-slate-800 text-center">Confirm Deposit</h3>

              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Amount</span>
                  <span className="text-lg font-semibold text-slate-800">
                    {account.currencySymbol}{parsedAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Account</span>
                  <span className="text-sm font-medium text-slate-700">{account.displayName}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 h-12 rounded-xl font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeposit}
                  className="flex-1 h-12 rounded-xl font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
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
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full text-4xl font-semibold text-center bg-transparent text-slate-800 placeholder-slate-400 border-none outline-none tabular-nums"
              autoFocus
              disabled={busy}
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
                disabled={busy}
                className="py-1.5 px-4 text-sm font-medium text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50"
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


        {/* Deposit Button — disabled during processing */}
        <motion.button
          type="submit"
          disabled={!isValid || busy || isLoading}
          whileTap={{ scale: isValid && !busy ? 0.95 : 1 }}
          className={`w-full h-12 rounded-xl font-medium transition-all ${
            isValid && !busy
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {busy ? (
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>Processing...</span>
            </div>
          ) : (
            `Deposit ${isValid ? `${account.currencySymbol}${amount}` : ''}`
          )}
        </motion.button>

        {/* Info */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>Your deposit will start earning immediately</p>
          <p>Powered by audited protocols &bull; Withdraw anytime</p>
        </div>
      </motion.form>
    </>
  );
}
