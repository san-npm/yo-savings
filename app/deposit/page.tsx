'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAccount } from 'wagmi';

import { getAccountById, getAllAccounts, type AccountId } from '@/lib/accounts';
import { DepositForm } from '@/components/DepositForm';

// Mock YO SDK hooks
const useDeposit = ({ vault }: { vault: string }) => {
  return {
    deposit: async (amount: number) => {
      // Simulate deposit process with YO SDK
      console.log(`Depositing ${amount} to ${vault}`);
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real app, this would:
      // 1. Check allowance
      // 2. Approve if needed
      // 3. Call deposit function on vault
      // 4. Wait for confirmation
      
      return {
        hash: '0x1234567890abcdef',
        receipt: { status: 1 }
      };
    },
    isLoading: false,
  };
};

const useApprove = ({ token }: { token: string }) => {
  return {
    approve: async (spender: string, amount: number) => {
      console.log(`Approving ${amount} of ${token} for ${spender}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { hash: '0xabcdef1234567890' };
    },
    isLoading: false,
  };
};

export default function DepositPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  
  const preselectedAccountId = searchParams.get('account') as AccountId | null;
  const [selectedAccountId, setSelectedAccountId] = useState<AccountId>(
    preselectedAccountId || 'dollar'
  );

  const selectedAccount = getAccountById(selectedAccountId);
  const allAccounts = getAllAccounts();
  
  const { deposit } = useDeposit({ vault: selectedAccount.yoVault });
  const { approve } = useApprove({ token: selectedAccount.underlyingToken });

  const handleDeposit = async (amount: number) => {
    try {
      // In real app with YO SDK:
      // 1. Check if approval is needed
      // 2. Approve tokens if needed
      // 3. Execute deposit
      
      await approve(selectedAccount.vaultAddress, amount);
      await deposit(amount);
      
      // Success is handled by the DepositForm component
    } catch (error) {
      console.error('Deposit failed:', error);
      throw error;
    }
  };

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400">Please connect your wallet first</p>
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
          className="p-2 hover:bg-zinc-800/50 rounded-xl transition-colors"
        >
          <span className="text-xl">←</span>
        </Link>
        <h1 className="text-lg font-medium text-zinc-200">Add Money</h1>
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
          <h2 className="text-sm font-medium text-zinc-400">
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
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                    : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-300 hover:border-zinc-700/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{account.icon}</span>
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
        <div className="p-4 bg-zinc-900/20 rounded-xl border border-zinc-800/30">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">
            How it works
          </h3>
          <div className="space-y-2 text-xs text-zinc-500">
            <div className="flex items-start space-x-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>Your money goes into a secure savings account</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>Starts earning interest immediately</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>Withdraw anytime with no penalties</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-emerald-500">🔒</span>
            <span className="text-sm font-medium text-emerald-500">Secure & Insured</span>
          </div>
          <p className="text-xs text-zinc-400">
            Your deposits are secured by bank-grade encryption and backed by independently audited protocols.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}