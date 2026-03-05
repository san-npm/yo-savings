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
        className="flex flex-col items-center justify-center py-16 space-y-6"
      >
        <Confetti active={showSuccess} onComplete={() => {}} />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="w-16 h-16 rounded-full flex items-center justify-center bg-[#D6FF34] relative"
        >
          {/* Neon glow burst */}
          <motion.div
            className="absolute inset-0 rounded-full bg-[#D6FF34]"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <span className="text-2xl text-black relative z-10">&#10003;</span>
        </motion.div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-white mb-2">Done!</h2>
          <p className="text-[#A0A0A0]">
            {account.currencySymbol}{successAmount} added to {account.displayName}
          </p>
          {localTxHash && (
            <a
              href={`https://basescan.org/tx/${localTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#D6FF34] hover:opacity-80 underline"
            >
              View transaction
            </a>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setShowSuccess(false); onReset?.(); }}
          className="px-6 py-3 text-black font-medium rounded-xl bg-[#D6FF34] hover:opacity-90 transition-opacity"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#2B2C2A] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-white text-center">Confirm Deposit</h3>

              <div className="p-4 bg-white/5 rounded-xl space-y-3 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#A0A0A0]">Amount</span>
                  <span className="text-lg font-semibold text-white">
                    {account.currencySymbol}{parsedAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#A0A0A0]">Account</span>
                  <span className="text-sm font-medium text-[#A0A0A0]">{account.displayName}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 h-12 rounded-xl font-medium bg-white/10 text-[#A0A0A0] hover:bg-white/15 transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeposit}
                  className="flex-1 h-12 rounded-xl font-medium text-black bg-[#D6FF34] hover:opacity-90 transition-opacity"
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
        <div className="flex items-center space-x-3 p-4 bg-[#2B2C2A] border border-white/10 rounded-2xl">
          <CurrencyIcon accountId={account.id} />
          <div>
            <h2 className="font-medium text-white">{account.displayName}</h2>
            <p className="text-sm text-[#A0A0A0]">Add money to start earning</p>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-[#A0A0A0]">Amount</label>

          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full text-4xl font-semibold text-center bg-transparent text-white placeholder-[#666666] border-none outline-none tabular-nums"
              autoFocus
              disabled={busy}
            />
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 text-2xl text-[#666666]">
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
                className="py-1.5 px-4 text-sm font-medium text-[#A0A0A0] bg-white/8 border border-white/10 rounded-full hover:bg-white/12 hover:border-white/20 transition-all disabled:opacity-50"
              >
                {account.currencySymbol}{quickAmount}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Deposit Button */}
        <motion.button
          type="submit"
          disabled={!isValid || busy || isLoading}
          whileTap={{ scale: isValid && !busy ? 0.95 : 1 }}
          className={`w-full h-12 rounded-xl font-medium transition-all ${
            isValid && !busy
              ? 'text-black bg-[#D6FF34] hover:opacity-90 shadow-lg'
              : 'bg-white/5 text-[#666666] cursor-not-allowed border border-white/5'
          }`}
          style={isValid && !busy ? { boxShadow: '0 0 20px rgba(214,255,52,0.2)' } : {}}
        >
          {busy ? (
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
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
        <div className="text-center text-xs text-[#666666] space-y-1">
          <p>Your deposit will start earning immediately</p>
          <p>Powered by Yo Protocol &bull; Withdraw anytime</p>
        </div>
      </motion.form>
    </>
  );
}
