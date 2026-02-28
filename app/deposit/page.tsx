'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { parseTokenAmount, YO_GATEWAY_ADDRESS } from '@yo-protocol/core';
import { useYoClient } from '@/lib/useYoClient';

import { getAccountById, getAllAccounts, type AccountId } from '@/lib/accounts';
import { DepositForm } from '@/components/DepositForm';
import { CurrencyIcon } from '@/components/CurrencyIcon';

export default function DepositPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getClient, address } = useYoClient();
  
  const preselectedAccountId = searchParams.get('account') as AccountId | null;
  const [selectedAccountId, setSelectedAccountId] = useState<AccountId>(
    preselectedAccountId || 'dollar'
  );

  const selectedAccount = getAccountById(selectedAccountId);
  const allAccounts = getAllAccounts();

  const handleDeposit = async (amount: string) => {
    try {
      if (!address) throw new Error('No wallet connected');
      
      const client = await getClient();
      
      // Parse amount with 6 decimals (USDC/EURC)
      const parsedAmount = parseTokenAmount(amount, 6);
      
      // Check allowance first
      const hasAllowance = await client.hasEnoughAllowance(
        selectedAccount.tokenAddress as `0x${string}`,
        address,
        YO_GATEWAY_ADDRESS,
        parsedAmount
      );
      
      // Approve if needed
      if (!hasAllowance) {
        const approveResult = await client.approve(
          selectedAccount.tokenAddress as `0x${string}`,
          parsedAmount
        );
        // Extract hash from result - it might be an object with a hash property
        const approveHash = typeof approveResult === 'string' ? approveResult : approveResult.hash;
        await client.waitForTransaction(approveHash);
      }
      
      // Execute deposit
      const depositResult = await client.deposit({
        vault: selectedAccount.vaultAddress as `0x${string}`,
        amount: parsedAmount
      });
      
      // Extract hash from result - it might be an object with a hash property
      const depositHash = typeof depositResult === 'string' ? depositResult : depositResult.hash;
      
      return { hash: depositHash };
    } catch (error) {
      console.error('Deposit failed:', error);
      throw error;
    }
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
          <span className="text-xl">←</span>
        </Link>
        <h1 className="text-lg font-medium text-slate-800">Add Money</h1>
        <div className="w-8" /> {/* Spacer */}
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
              <span className="text-green-500 mt-0.5">•</span>
              <span>Your money goes into a secure savings account</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Starts earning interest immediately</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Withdraw anytime with no penalties</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-green-500">Secure & Insured</span>
          </div>
          <p className="text-xs text-slate-500">
            Your deposits are secured by bank-grade encryption and backed by independently audited protocols.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}