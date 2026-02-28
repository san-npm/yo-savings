'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUserBalance } from '@yo-protocol/react';
import { useYoClient } from '@/lib/useYoClient';
import { parseTokenAmount } from '@yo-protocol/core';

import { getAccountById, getAllAccounts, type AccountId, type SavingsAccount } from '@/lib/accounts';
import { WithdrawForm } from '@/components/WithdrawForm';
import { CurrencyIcon } from '@/components/CurrencyIcon';

// Component to handle individual account option with proper hooks usage
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
  const balance = Number(position?.assets || BigInt(0));
  
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      disabled={!balance || balance <= 0}
      className={`w-full p-3 rounded-xl border transition-all ${
        isSelected
          ? 'bg-green-50 border-green-500 text-green-600'
          : balance && balance > 0
          ? 'bg-white border-slate-200 text-slate-700 shadow-sm hover:border-slate-300'
          : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CurrencyIcon accountId={account.id} size="sm" />
          <span className="font-medium">{account.displayName}</span>
        </div>
        <div className="text-sm tabular-nums">
          {account.currencySymbol}{balance.toFixed(2)}
        </div>
      </div>
    </motion.button>
  );
}

export default function WithdrawPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getClient, address } = useYoClient();
  
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
  const availableBalance = Number(position?.assets || BigInt(0));

  const handleWithdraw = async (amount: string) => {
    try {
      if (!address) throw new Error('No wallet connected');
      
      const client = await getClient();
      const vaultAddress = selectedAccount.vaultAddress as `0x${string}`;
      
      // Parse amount with 6 decimals (USDC/EURC)
      const parsedAmount = parseTokenAmount(amount, 6);
      
      // Convert asset amount to shares
      const sharesToRedeem = await client.convertToShares(vaultAddress, parsedAmount);
      
      // Execute redeem
      const redeemResult = await client.redeem({
        vault: vaultAddress,
        shares: sharesToRedeem
      });
      
      // Extract hash from result - it might be an object with a hash property
      const redeemHash = typeof redeemResult === 'string' ? redeemResult : redeemResult.hash;
      
      // For now, assume all redeems are instant
      // TODO: Implement proper queued vs instant detection based on YO SDK documentation
      return { hash: redeemHash, instant: true };
    } catch (error) {
      console.error('Withdrawal failed:', error);
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
        <h1 className="text-lg font-medium text-slate-800">Withdraw</h1>
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
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="text-sm font-medium text-slate-700 mb-2">
            Withdrawal Details
          </h3>
          <div className="space-y-2 text-xs text-slate-500">
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Funds available in your account instantly</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>No withdrawal fees or penalties</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">•</span>
              <span>Processing typically takes 1-2 minutes</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-semibold text-orange-500">Important</span>
          </div>
          <p className="text-xs text-slate-500">
            Withdrawn funds will stop earning interest immediately. You can deposit again anytime to resume earning.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-slate-700">Tip</span>
          </div>
          <p className="text-xs text-slate-500">
            Consider creating a savings goal instead of withdrawing. Goals help you save for specific purposes while keeping your money earning interest.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}