'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useDeposit } from '@yo-protocol/react';
import { parseTokenAmount } from '@yo-protocol/core';
import { useYoClient } from '@/lib/useYoClient';

import { getAccountById, getAllAccounts, isAccountId, type AccountId } from '@/lib/accounts';
import { DepositForm } from '@/components/DepositForm';
import { CurrencyIcon } from '@/components/CurrencyIcon';

export default function DepositPage() {
  const searchParams = useSearchParams();
  const { address } = useYoClient();

  const accountParam = searchParams.get('account');
  const preselectedAccountId = accountParam && isAccountId(accountParam) ? accountParam : null;
  const [selectedAccountId, setSelectedAccountId] = useState<AccountId>(preselectedAccountId || 'dollar');

  const selectedAccount = getAccountById(selectedAccountId);

  if (!selectedAccount) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#6C757D]">Account not found</p>
      </div>
    );
  }
  const allAccounts = getAllAccounts();

  const {
    deposit,
    isLoading: depositLoading,
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
        <p className="text-[#6C757D]">Please sign in first</p>
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
        <Link href="/" className="p-2 hover:bg-[#F8F9FA] rounded-xl transition-colors">
          <svg className="w-5 h-5 text-[#6C757D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-medium text-[#1A1A2E]">Add Money</h1>
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
          <h2 className="text-sm font-medium text-[#6C757D]">
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
                    ? 'bg-[#ECFDF5] border-[#10B981]/30 shadow-sm'
                    : 'bg-[#F8F9FA] border-[#E9ECEF] hover:border-[#DEE2E6]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CurrencyIcon accountId={account.id} size="sm" />
                  <span className={`font-medium ${
                    selectedAccountId === account.id ? 'text-[#1A1A2E]' : 'text-[#6C757D]'
                  }`}>{account.displayName}</span>
                  {selectedAccountId === account.id && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl">
          <h3 className="text-sm font-medium text-[#1A1A2E] mb-2">How it works</h3>
          <div className="space-y-2 text-xs text-[#6C757D]">
            <div className="flex items-start space-x-2">
              <span className="text-[#10B981] mt-0.5">&bull;</span>
              <span>Your money goes into a secure savings account</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-[#10B981] mt-0.5">&bull;</span>
              <span>Starts earning interest immediately</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-[#10B981] mt-0.5">&bull;</span>
              <span>Withdraw anytime with no penalties</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#ECFDF5] border border-[#10B981]/20 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-[#1A1A2E]">Secured by Audited Protocols</span>
          </div>
          <p className="text-xs text-[#6C757D]">
            Your deposits are secured by independently audited smart contracts. Your funds are always yours — withdraw anytime.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
