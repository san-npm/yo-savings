'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavingsAccount } from '@/lib/accounts';
import { parseAmountInput, formatBalance } from '@/lib/format';
import { Confetti } from './Confetti';
import { CurrencyIcon } from './CurrencyIcon';
import { useHaptics } from '@/lib/useHaptics';

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
  const haptics = useHaptics();

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
    haptics.tap();
    const quickAmount = (availableBalance * percentage / 100);
    setAmount(quickAmount.toFixed(2));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseAmountInput(amount);
    if (parsedAmount < MIN_WITHDRAW) {
      haptics.error();
      setError(`Minimum withdrawal is ${account.currencySymbol}${MIN_WITHDRAW}`);
      return;
    }
    if (parsedAmount > availableBalance) {
      haptics.error();
      setError('Amount exceeds available balance');
      return;
    }
    haptics.confirm();
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
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="flex flex-col items-center justify-center py-16 space-y-6"
      >
        <Confetti active={showSuccess} onComplete={() => {}} />

        {/* Success icon */}
        <div className="relative">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-[#10B981]"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 2.5 + i * 0.5, opacity: 0 }}
              transition={{ duration: 0.9, delay: i * 0.15, ease: 'easeOut' }}
            />
          ))}

          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 18, delay: 0.05 }}
            className="w-20 h-20 rounded-full flex items-center justify-center relative bg-[#10B981]"
            style={{ boxShadow: '0 0 40px rgba(16,185,129,0.4)' }}
          >
            <svg className="w-10 h-10 text-white" viewBox="0 0 40 40" fill="none">
              <motion.path
                d="M8 20 L17 29 L33 13"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Success card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-center space-y-2 p-5 rounded-2xl border border-[#10B981]/20 w-full bg-[#ECFDF5]"
        >
          <h2 className="text-2xl font-bold text-[#1A1A2E]">
            {queuedStatus ? 'Queued! ⏳' : 'Withdrawn! 💸'}
          </h2>
          <p className="text-[#6C757D]">
            {account.currencySymbol}{successAmount.toFixed(2)}{' '}
            {queuedStatus ? 'queued for withdrawal from' : 'withdrawn from'}{' '}
            <span className="text-[#1A1A2E] font-medium">{account.displayName}</span>
          </p>
          {queuedStatus && (
            <p className="text-xs text-amber-600">
              May take some time during high demand
            </p>
          )}
          {localTxHash && (
            <a
              href={`https://basescan.org/tx/${localTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-[#10B981] hover:text-[#059669] underline mt-1"
            >
              View transaction ↗
            </a>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => { setShowSuccess(false); onReset?.(); }}
          className="px-8 py-3 text-white font-semibold rounded-xl bg-[#10B981] hover:bg-[#059669] transition-colors shadow-md"
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
            className="fixed inset-0 bg-black/20 z-50 flex items-end justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white border border-[#E9ECEF] rounded-2xl p-6 space-y-5 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-[#1A1A2E] text-center">Confirm Withdrawal</h3>

              <div className="p-4 bg-[#F8F9FA] rounded-xl space-y-3 border border-[#E9ECEF]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6C757D]">Amount</span>
                  <span className="text-lg font-semibold text-[#1A1A2E]">
                    {account.currencySymbol}{parsedAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6C757D]">From</span>
                  <span className="text-sm font-medium text-[#6C757D]">{account.displayName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6C757D]">Remaining</span>
                  <span className="text-sm text-[#6C757D]">
                    {account.currencySymbol}{(availableBalance - parsedAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#ADB5BD] text-center">
                Withdrawn funds will stop earning interest immediately.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 h-12 rounded-xl font-medium bg-[#F8F9FA] text-[#1A1A2E] hover:bg-[#F1F3F5] transition-colors border border-[#E9ECEF]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmWithdraw}
                  className="flex-1 h-12 rounded-xl font-medium text-white bg-[#10B981] hover:bg-[#059669] transition-colors"
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
        <div className="flex items-center justify-between p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl">
          <div className="flex items-center space-x-3">
            <CurrencyIcon accountId={account.id} />
            <div>
              <h2 className="font-medium text-[#1A1A2E]">{account.displayName}</h2>
              <p className="text-sm text-[#6C757D]">Withdraw to your account</p>
            </div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E9ECEF]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6C757D]">Available balance</span>
            <div className="text-right">
              <div className="font-semibold text-[#1A1A2E] tabular-nums">
                {formatBalance(availableBalance, account.id)}
              </div>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-[#6C757D]">Amount to withdraw</label>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleMaxAmount}
              disabled={busy}
              className="text-sm text-[#10B981] hover:text-[#059669] transition-colors disabled:opacity-50"
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
              className={`w-full text-4xl font-semibold text-center bg-transparent placeholder-[#ADB5BD] border-none outline-none tabular-nums ${
                isOverLimit ? 'text-red-500' : 'text-[#1A1A2E]'
              } disabled:opacity-50`}
              autoFocus
            />
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 text-2xl text-[#ADB5BD]">
              {account.currencySymbol}
            </div>

            {isOverLimit && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-red-500 mt-2"
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
                className="py-2 px-3 text-sm font-medium text-[#6C757D] bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl hover:bg-[#F1F3F5] hover:border-[#DEE2E6] transition-all disabled:opacity-50"
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
          <div className="p-3 bg-[#ECFDF5] border border-[#10B981]/20 rounded-xl">
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-4 h-4 border-2 border-[#10B981]/30 border-t-[#10B981] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-sm text-[#10B981]">{currentStepLabel}</p>
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
              ? 'text-white bg-[#10B981] hover:bg-[#059669] shadow-md'
              : 'bg-[#F8F9FA] text-[#ADB5BD] cursor-not-allowed border border-[#E9ECEF]'
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
        <div className="text-center text-xs text-[#ADB5BD] space-y-1">
          <p>Funds will be available in your account</p>
          <p>No fees &bull; Fast processing</p>
        </div>
      </motion.form>
    </>
  );
}
