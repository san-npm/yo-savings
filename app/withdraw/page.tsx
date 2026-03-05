'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUserBalance, useRedeem } from '@yo-protocol/react';
import { useYoClient } from '@/lib/useYoClient';
import { parseTokenAmount } from '@yo-protocol/core';

import { getAccountById, getAllAccounts, type AccountId, type SavingsAccount } from '@/lib/accounts';
import { WithdrawForm } from '@/components/WithdrawForm';
import { CurrencyIcon } from '@/components/CurrencyIcon';

function AccountOptionItem({
  account,
  isSelected,
  onSelect,
  address
}: {
  account: SavingsAccount;
  isSelected: boolean;
  onSelect: () => void;
  address?: `0x${string}`;
}) {
  const { position } = useUserBalance(account.vaultAddress as `0x${string}`, address);
  const balance = Number(position?.assets || BigInt(0)) / 1e6;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      disabled={!balance || balance <= 0}
      className={`w-full p-3 rounded-xl border transition-all ${
        isSelected
          ? 'bg-white/5 border-white/20 shadow-[0_0_15px_rgba(182,80,158,0.15)]'
          : balance && balance > 0
          ? 'bg-[#1C2333] border-white/10 hover:border-white/20'
          : 'bg-[#1C2333] border-white/5 text-slate-600 cursor-not-allowed opacity-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CurrencyIcon accountId={account.id} size="sm" />
          <span className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
            {account.displayName}
          </span>
        </div>
        <div className={`text-sm tabular-nums ${isSelected ? 'text-white' : 'text-slate-400'}`}>
          {account.currencySymbol}{balance.toFixed(2)}
        </div>
      </div>
    </motion.button>
  );
}

export default function WithdrawPage() {
  const searchParams = useSearchParams();
  const { client, address } = useYoClient();

  const preselectedAccountId = searchParams.get('account') as AccountId | null;
  const [selectedAccountId, setSelectedAccountId] = useState<AccountId>(
    preselectedAccountId || 'dollar'
  );

  const selectedAccount = getAccountById(selectedAccountId);
  const allAccounts = getAllAccounts();

  const { position, isLoading: balanceLoading } = useUserBalance(
    selectedAccount.vaultAddress as `0x${string}`,
    address
  );
  const availableBalance = Number(position?.assets || BigInt(0)) / 1e6;

  const {
    redeem,
    isLoading: redeemLoading,
    hash,
    instant,
    reset: resetRedeem,
  } = useRedeem({
    vault: selectedAccount.vaultAddress as `0x${string}`,
    onError: (err) => {
      console.error('Withdrawal failed:', err);
    },
  });

  const handleWithdraw = async (amount: string) => {
    if (!address || !client) throw new Error('No wallet connected');

    const parsedAmount = parseTokenAmount(amount, 6);
    const sharesToRedeem = await client.convertToShares(
      selectedAccount.vaultAddress as `0x${string}`,
      parsedAmount
    );

    const txHash = await redeem(sharesToRedeem);

    return { hash: txHash, instant: instant ?? true };
  };

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Please sign in first</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="p-2 hover:bg-white/5 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-medium text-white">Withdraw</h1>
        <div className="w-8" />
      </div>

      {/* Account Selector */}
      {!preselectedAccountId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-medium text-slate-500">
            Choose Account to Withdraw From
          </h2>

          <div className="space-y-2">
            {allAccounts.map((account) => (
              <AccountOptionItem
                key={account.id}
                account={account}
                isSelected={selectedAccountId === account.id}
                onSelect={() => setSelectedAccountId(account.id)}
                address={address}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Withdraw Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <WithdrawForm
          account={selectedAccount}
          availableBalance={availableBalance || 0}
          onWithdraw={handleWithdraw}
          isProcessing={redeemLoading}
          isQueued={instant === false}
          onReset={resetRedeem}
          isLoading={balanceLoading}
        />
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="p-4 bg-[#1C2333] border border-white/10 rounded-xl">
          <h3 className="text-sm font-medium text-white mb-2">
            Withdrawal Details
          </h3>
          <div className="space-y-2 text-xs text-slate-500">
            <div className="flex items-start space-x-2">
              <span className="gradient-text mt-0.5">&bull;</span>
              <span>Funds available in your account instantly</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="gradient-text mt-0.5">&bull;</span>
              <span>No withdrawal fees or penalties</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="gradient-text mt-0.5">&bull;</span>
              <span>Processing typically takes 1-2 minutes</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-semibold text-amber-400">Important</span>
          </div>
          <p className="text-xs text-slate-400">
            Withdrawn funds will stop earning interest immediately. You can deposit again anytime to resume earning.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
