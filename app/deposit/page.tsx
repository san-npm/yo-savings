'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useDeposit } from '@yo-protocol/react';
import { parseTokenAmount, VAULTS } from '@yo-protocol/core';
import { useYoClient } from '@/lib/useYoClient';

import { getAccountById, getAllAccounts, type AccountId } from '@/lib/accounts';
import { DepositForm } from '@/components/DepositForm';
import { CurrencyIcon } from '@/components/CurrencyIcon';

export default function DepositPage() {
  const searchParams = useSearchParams();
  const { address } = useYoClient();

  const preselectedAccountId = searchParams.get('account') as AccountId | null;
  const [selectedAccountId, setSelectedAccountId] = useState<AccountId>(
    preselectedAccountId || 'dollar'
  );

  const selectedAccount = getAccountById(selectedAccountId);
  const allAccounts = getAllAccounts();

  // Use the SDK's useDeposit hook — handles approval + deposit + step tracking
  const {
    deposit,
    isLoading: depositLoading,
    hash,
    reset: resetDeposit,
  } = useDeposit({
    vault: selectedAccount.vaultAddress as `0x${string}`,
    slippageBps: 50,
    onError: (err) => {
      console.error('Deposit failed:', err);
    },
  });

  const handleDeposit = async (amount: string) => {
    if (!address) throw new Error('No wallet connected');

    const parsedAmount = parseTokenAmount(amount, 6);
    const txHash = await deposit(parsedAmount);

    return { hash: txHash };
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
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <span className="text-xl">&larr;</span>
        </Link>
        <h1 className="text-lg font-medium text-slate-800">Add Money</h1>
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
            Choose Savings Account
          </h2>

          <div className="space-y-2">
            {allAccounts.map((account) => (
              <motion.button
                key={account.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedAccountId(account.id)}
                className={`w-full p-3 rounded-xl border transition-all ${
                  selectedAccountId === account.id
                    ? 'bg-green-50 border-green-500 text-green-600'
                    : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CurrencyIcon accountId={account.id} size="sm" />
                  <span className="font-medium">{account.displayName}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Deposit Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DepositForm
          account={selectedAccount}
          onDeposit={handleDeposit}
          isProcessing={depositLoading}
          onReset={resetDeposit}
        />
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="text-sm font-medium text-slate-700 mb-2">
            How it works
          </h3>
          <div className="space-y-2 text-xs text-slate-500">
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">&bull;</span>
              <span>Your money goes into a secure savings account</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">&bull;</span>
              <span>Starts earning interest immediately</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">&bull;</span>
              <span>Withdraw anytime with no penalties</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-green-600">Secured by Audited Protocols</span>
          </div>
          <p className="text-xs text-slate-500">
            Your deposits are secured by independently audited smart contracts. Your funds are always yours &mdash; withdraw anytime.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
