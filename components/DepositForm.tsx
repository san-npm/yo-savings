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
          <h2 className="text-2xl font-bold text-[#1A1A2E]">Deposited! 🎉</h2>
          <p className="text-[#6C757D]">
            {account.currencySymbol}{successAmount.toFixed(2)} added to{' '}
            <span className="text-[#1A1A2E] font-medium">{account.displayName}</span>
          </p>
          <p className="text-xs text-[#ADB5BD]">Your savings are now earning interest</p>
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
              <h3 className="text-lg font-semibold text-[#1A1A2E] text-center">Confirm Deposit</h3>

              <div className="p-4 bg-[#F8F9FA] rounded-xl space-y-3 border border-[#E9ECEF]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6C757D]">Amount</span>
                  <span className="text-lg font-semibold text-[#1A1A2E]">
                    {account.currencySymbol}{parsedAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6C757D]">Account</span>
                  <span className="text-sm font-medium text-[#6C757D]">{account.displayName}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 h-12 rounded-xl font-medium bg-[#F8F9FA] text-[#1A1A2E] hover:bg-[#F1F3F5] transition-colors border border-[#E9ECEF]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeposit}
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
        <div className="flex items-center space-x-3 p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl">
          <CurrencyIcon accountId={account.id} />
          <div>
            <h2 className="font-medium text-[#1A1A2E]">{account.displayName}</h2>
            <p className="text-sm text-[#6C757D]">Add money to start earning</p>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-[#6C757D]">Amount</label>

          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full text-4xl font-semibold text-center bg-transparent text-[#1A1A2E] placeholder-[#ADB5BD] border-none outline-none tabular-nums"
              autoFocus
              disabled={busy}
            />
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 text-2xl text-[#ADB5BD]">
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
                className="py-1.5 px-4 text-sm font-medium text-[#6C757D] bg-[#F8F9FA] border border-[#E9ECEF] rounded-full hover:bg-[#F1F3F5] hover:border-[#DEE2E6] transition-all disabled:opacity-50"
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
              <span>Processing...</span>
            </div>
          ) : (
            `Deposit ${isValid ? `${account.currencySymbol}${amount}` : ''}`
          )}
        </motion.button>

        {/* Info */}
        <div className="text-center text-xs text-[#ADB5BD] space-y-1">
          <p>Your deposit will start earning immediately</p>
          <p>Powered by Yo Protocol &bull; Withdraw anytime</p>
        </div>
      </motion.form>
    </>
  );
}
