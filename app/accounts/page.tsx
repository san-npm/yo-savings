'use client';

import { motion } from 'framer-motion';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useUserBalance } from '@yo-protocol/react';
import { useVaultSnapshot } from '@/lib/useVaultSnapshot';
import { AccountRow } from '@/components/AccountRow';
import { getAllAccounts, type SavingsAccount } from '@/lib/accounts';

// Extracted component to safely call hooks per-account
function AccountWithBalance({
  account,
  address,
  index,
}: {
  account: SavingsAccount;
  address?: `0x${string}`;
  index: number;
}) {
  const { position, isLoading: balanceLoading } = useUserBalance(
    account.vaultAddress as `0x${string}`,
    address
  );
  const { snapshot, isLoading: snapshotLoading } = useVaultSnapshot(
    account.vaultAddress as `0x${string}`
  );

  const balance = Number(position?.assets || BigInt(0)) / 1e6;
  const annualRate = parseFloat(snapshot?.stats?.yield?.['7d'] ?? '0');

  return (
    <AccountRow
      account={account}
      balance={balance}
      annualRate={annualRate}
      isLoading={balanceLoading || snapshotLoading}
      index={index}
    />
  );
}

export default function AccountsPage() {
  const { wallets } = useWallets();
  const { authenticated } = usePrivy();

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const address = embeddedWallet?.address as `0x${string}` | undefined;

  const accounts = getAllAccounts();

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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Savings Accounts</h1>
        <p className="text-slate-600 mt-1">
          Your money, earning more every day
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-medium text-slate-500 flex items-center justify-between">
          <span>Available Accounts</span>
          <span>Balance</span>
        </div>

        <div className="space-y-3">
          {accounts.map((account, index) => (
            <AccountWithBalance
              key={account.id}
              account={account}
              address={address}
              index={index}
            />
          ))}
        </div>
      </div>

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
          <p>&bull; All accounts earn interest daily</p>
          <p>&bull; No minimum balance requirements</p>
          <p>&bull; Withdraw anytime with no penalties</p>
          <p>&bull; Secured by audited smart contracts</p>
        </div>
      </motion.div>

      <div className="pb-20" />
    </motion.div>
  );
}
