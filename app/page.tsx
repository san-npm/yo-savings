'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePrivy, useLogin, useWallets } from '@privy-io/react-auth';
import { useVaults, useUserBalance } from '@yo-protocol/react';
import { useVaultSnapshot } from '@/lib/useVaultSnapshot';
import { useYoClient } from '@/lib/useYoClient';

import { BalanceCard } from '@/components/BalanceCard';
import { AccountRow } from '@/components/AccountRow';
import { SimulationChart } from '@/components/SimulationChart';
import { getAllAccounts, type SavingsAccount } from '@/lib/accounts';

function AccountWithData({
  account,
  address,
  index,
  onData,
}: {
  account: SavingsAccount;
  address?: `0x${string}`;
  index: number;
  onData: (id: string, balance: number, apy: number) => void;
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

  useEffect(() => {
    onData(account.id, balance, annualRate);
  }, [account.id, balance, annualRate, onData]);

  return (
    <AccountRow
      key={account.id}
      account={account}
      balance={balance}
      annualRate={annualRate}
      isLoading={balanceLoading || snapshotLoading}
      index={index}
    />
  );
}

interface RecentTransaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  account: string;
  date: string;
  status: 'completed';
}

export default function HomePage() {
  const { wallets } = useWallets();
  const { ready, authenticated, user } = usePrivy();
  const { login } = useLogin();
  const { client } = useYoClient();

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const address = embeddedWallet?.address as `0x${string}` | undefined;
  const [userName, setUserName] = useState('');
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const [accountData, setAccountData] = useState<Record<string, { balance: number; apy: number }>>({});

  const handleAccountData = useMemo(
    () => (id: string, balance: number, apy: number) => {
      setAccountData(prev => {
        if (prev[id]?.balance === balance && prev[id]?.apy === apy) return prev;
        return { ...prev, [id]: { balance, apy } };
      });
    },
    []
  );

  const accounts = getAllAccounts();

  const totalBalance = Object.values(accountData).reduce((sum, d) => sum + d.balance, 0);
  const averageAPY = Object.keys(accountData).length > 0
    ? Object.values(accountData).reduce((sum, d) => sum + d.apy, 0) / Object.keys(accountData).length
    : 0;
  const monthlyEarnings = (totalBalance * averageAPY / 100) / 12;

  const { vaults, isLoading: vaultsLoading } = useVaults();

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      if (!address || !client) return;

      try {
        setTransactionsLoading(true);
        const allTransactions: RecentTransaction[] = [];

        for (const account of getAllAccounts()) {
          try {
            const history = await client.getUserHistory(
              account.vaultAddress as `0x${string}`,
              address,
              3
            );

            const accountTransactions = history.slice(0, 3).map((tx) => ({
              id: tx.txHash,
              type: (tx.type === 'deposit' ? 'deposit' : 'withdraw') as 'deposit' | 'withdraw',
              amount: Number(tx.assets.raw) / 1e6,
              account: account.displayName,
              date: formatTransactionDate(tx.timestamp),
              status: 'completed' as const,
            }));

            allTransactions.push(...accountTransactions);
          } catch {
            // Continue with other vaults
          }
        }

        allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentTransactions(allTransactions.slice(0, 3));
      } catch {
        setRecentTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchRecentTransactions();
  }, [address, client]);

  useEffect(() => {
    if (user?.email) {
      setUserName(user.email.address.split('@')[0]);
    } else if (address) {
      setUserName(address.slice(2, 6));
    }
  }, [user, address]);

  const formatTransactionDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Landing for non-authenticated users
  if (!ready || !authenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[85vh] flex flex-col items-center justify-center px-4 -mt-6"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-8 max-w-md"
        >
          <div>
            {/* Animated gradient orb */}
            <motion.div
              className="w-20 h-20 rounded-full mx-auto mb-6 relative"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
            >
              <div className="absolute inset-0 rounded-full gradient-bg opacity-60 blur-md" />
              <div className="absolute inset-0 rounded-full gradient-bg flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-4">
              Your savings,<br />
              <span className="gradient-text">earning more</span>
            </h1>

            <p className="text-lg text-slate-400 mb-8">
              Open a savings account in 30 seconds.<br />
              Earn competitive interest rates, <span className="gradient-text font-semibold">automatically</span>.
            </p>
          </div>

          <div className="space-y-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={login}
              disabled={!ready}
              className="w-full h-14 rounded-xl font-semibold text-white text-lg gradient-bg disabled:opacity-50 transition-all"
              style={{ boxShadow: '0 0 30px rgba(182, 80, 158, 0.3)' }}
            >
              Get Started
            </motion.button>

            <p className="text-xs text-slate-500">
              Simple and secure &bull; Powered by audited protocols
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <BalanceCard
        totalBalance={totalBalance}
        monthlyEarnings={monthlyEarnings}
        userName={userName}
        isLoading={vaultsLoading}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/deposit">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-[#1C2333] border border-white/10 rounded-2xl flex items-center justify-center space-x-2 hover:border-accent-purple/30 hover:shadow-[0_0_15px_rgba(182,80,158,0.1)] transition-all"
          >
            <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium text-white">Deposit</span>
          </motion.div>
        </Link>
        <Link href="/withdraw">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-[#1C2333] border border-white/10 rounded-2xl flex items-center justify-center space-x-2 hover:border-accent-teal/30 hover:shadow-[0_0_15px_rgba(46,186,198,0.1)] transition-all"
          >
            <svg className="w-5 h-5 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V4m8 8H4" />
            </svg>
            <span className="font-medium text-white">Withdraw</span>
          </motion.div>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Savings Accounts</h2>
          <Link href="/deposit" className="text-sm gradient-text font-medium">
            Add money
          </Link>
        </div>

        <div className="space-y-3">
          {accounts.map((account, index) => (
            <AccountWithData
              key={account.id}
              account={account}
              address={address}
              index={index}
              onData={handleAccountData}
            />
          ))}
        </div>
      </div>

      {/* Growth Simulator */}
      <SimulationChart currentApy={averageAPY || 8} />

      {/* Goals Section Link */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Savings Goals</h2>
          <Link href="/goals" className="text-sm gradient-text font-medium">View all</Link>
        </div>

        <Link
          href="/goals"
          className="block bg-[#1C2333] border border-white/10 rounded-2xl hover:border-white/20 transition-all p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center gradient-bg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-white">Create your first goal</h3>
              <p className="text-sm text-slate-400">Set targets and track progress</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <Link href="/activity" className="text-sm gradient-text font-medium">See all</Link>
        </div>

        <div className="space-y-3">
          {transactionsLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#1C2333] border border-white/10 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full loading-pulse" />
                  <div className="space-y-1">
                    <div className="w-16 h-4 rounded loading-pulse" />
                    <div className="w-24 h-3 rounded loading-pulse" />
                  </div>
                </div>
                <div className="w-12 h-4 rounded loading-pulse" />
              </div>
            ))
          ) : recentTransactions.length === 0 ? (
            <div className="p-6 text-center bg-[#1C2333] border border-white/10 rounded-xl">
              <p className="text-sm text-slate-400">No recent activity</p>
              <p className="text-xs text-slate-500">Make your first deposit to see activity here</p>
            </div>
          ) : (
            recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-[#1C2333] border border-white/10 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.type === 'deposit'
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-white/5 text-slate-400'
                  }`}>
                    {transaction.type === 'deposit' ? '\u2193' : '\u2191'}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">
                      {transaction.type === 'deposit' ? 'Deposit' : 'Withdraw'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {transaction.account} &bull; {transaction.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    transaction.type === 'deposit' ? 'text-green-400' : 'text-slate-300'
                  }`}>
                    {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Insights Card */}
      {totalBalance > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl gradient-bg-subtle border border-white/10"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center gradient-bg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-white">Earning Interest</h3>
              <p className="text-sm text-slate-400">
                Your ${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} is earning interest daily.
                Keep saving to reach your goals faster.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="pb-20" />
    </motion.div>
  );
}
