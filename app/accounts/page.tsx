'use client';

import { motion } from 'framer-motion';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useVaults, useUserBalance } from '@yo-protocol/react';
import { AccountRow } from '@/components/AccountRow';
import { getAllAccounts } from '@/lib/accounts';

// Helper function to get APY (placeholder until YO SDK provides this)
const getVaultAPY = (symbol?: string) => {
  const apyMap: Record<string, number> = {
    yoUSD: 8.5,
    yoEUR: 7.2,
  };
  return symbol ? apyMap[symbol] : 0;
};

export default function AccountsPage() {
  const { wallets } = useWallets();
  const { authenticated } = usePrivy();
  const { vaults, isLoading: vaultsLoading } = useVaults();
  
  // Get embedded wallet address
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const address = embeddedWallet?.address as `0x${string}` | undefined;
  
  // Get only dollar and euro accounts
  const accounts = getAllAccounts().filter(account => ['dollar', 'euro'].includes(account.id));
  const accountsWithData = accounts.map(account => {
    // Map vault data from real YO SDK response
    const vault = vaults?.find(v => v.address.toLowerCase() === account.vaultAddress.toLowerCase());
    const { position, isLoading: balanceLoading } = useUserBalance(account.vaultAddress as `0x${string}`, address);
    
    return {
      ...account,
      balance: Number(position?.assets || BigInt(0)),
      annualRate: getVaultAPY(vault?.symbol),
      isLoading: vaultsLoading || balanceLoading,
    };
  });

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Savings Accounts</h1>
          <p className="text-slate-600">Sign in to view your accounts</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Savings Accounts</h1>
        <p className="text-slate-600 mt-1">
          Your money, earning more every day
        </p>
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-slate-500 flex items-center justify-between">
          <span>Available Accounts</span>
          <span>Balance</span>
        </div>

        <div className="space-y-3">
          {accountsWithData.map((account, index) => (
            <AccountRow
              key={account.id}
              account={account}
              balance={account.balance}
              annualRate={account.annualRate}
              isLoading={account.isLoading}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 bg-white rounded-xl shadow-sm"
      >
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center">
            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-slate-800">Account Summary</span>
        </div>
        <div className="space-y-1 text-xs text-slate-500">
          <p>• All accounts earn interest daily</p>
          <p>• No minimum balance requirements</p>
          <p>• Withdraw anytime with no penalties</p>
          <p>• Secured by audited smart contracts</p>
        </div>
      </motion.div>

      {/* Bottom spacing for nav */}
      <div className="pb-20" />
    </motion.div>
  );
}