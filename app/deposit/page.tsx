'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useDeposit } from '@yo-protocol/react';
import { parseTokenAmount } from '@yo-protocol/core';
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
        <p className="text-[#666666]">Please sign in first</p>
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
          <svg className="w-5 h-5 text-[#A0A0A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-medium text-white">Add Money</h1>
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
          <h2 className="text-sm font-medium text-[#666666]">
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
                    ? 'bg-white/5 border-white/20 shadow-[0_0_15px_rgba(214,255,52,0.15)]'
                    : 'bg-[#2B2C2A] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CurrencyIcon accountId={account.id} size="sm" />
                  <span className={`font-medium ${
                    selectedAccountId === account.id ? 'text-white' : 'text-[#A0A0A0]'
                  }`}>{account.displayName}</span>
                  {selectedAccountId === account.id && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-[#D6FF34] flex items-center justify-center">
                      <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
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
        <div className="p-4 bg-[#2B2C2A] border border-white/10 rounded-xl">
          <h3 className="text-sm font-medium text-white mb-2">
            How it works
          </h3>
          <div className="space-y-2 text-xs text-[#666666]">
            <div className="flex items-start space-x-2">
              <span className="text-[#D6FF34] mt-0.5">&bull;</span>
              <span>Your money goes into a secure savings account</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-[#D6FF34] mt-0.5">&bull;</span>
              <span>Starts earning interest immediately</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-[#D6FF34] mt-0.5">&bull;</span>
              <span>Withdraw anytime with no penalties</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-[#D6FF34] flex items-center justify-center">
              <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white">Secured by Audited Protocols</span>
          </div>
          <p className="text-xs text-[#666666]">
            Your deposits are secured by independently audited smart contracts. Your funds are always yours &mdash; withdraw anytime.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
