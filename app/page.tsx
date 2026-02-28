'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePrivy, useLogin, useWallets } from '@privy-io/react-auth';
import { useVaults, useUserBalance } from '@yo-protocol/react';
import { useYoClient } from '@/lib/useYoClient';

import { BalanceCard } from '@/components/BalanceCard';
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
  const { ready, authenticated, user, logout } = usePrivy();
  const { login } = useLogin();
  const { getClient } = useYoClient();
  
  // Get embedded wallet address
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const address = embeddedWallet?.address as `0x${string}` | undefined;
  const [userName, setUserName] = useState('');
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  
  const { vaults, isLoading: vaultsLoading } = useVaults();
  
  // Get all accounts with their data (only dollar and euro)
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

  // Calculate totals (convert everything to USD for simplicity)
  const totalBalance = accountsWithData.reduce((total, account) => {
    // In real app, would convert using actual exchange rates
    // USD/EUR roughly equal for demo
    return total + account.balance;
  }, 0);

  // Simple monthly earnings estimate (balance * average APY / 12)
  const averageAPY = accountsWithData.length > 0 
    ? accountsWithData.reduce((sum, acc) => sum + acc.annualRate, 0) / accountsWithData.length 
    : 0;
  const monthlyEarnings = (totalBalance * averageAPY / 100) / 12;

  // Fetch recent transactions
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      if (!address) return;
      
      try {
        setTransactionsLoading(true);
        const client = await getClient();
        const allTransactions: RecentTransaction[] = [];

        // Fetch recent history from both vaults
        for (const account of getAllAccounts()) {
          try {
            const history = await client.getUserHistory(
              account.vaultAddress as `0x${string}`,
              address,
              3 // Limit to last 3 transactions per vault
            );

            const accountTransactions = history.slice(0, 3).map((tx: any) => ({
              id: tx.transactionHash,
              type: (tx.type === 'deposit' ? 'deposit' : 'withdraw') as 'deposit' | 'withdraw',
              amount: Number(tx.amount) / 1e6, // Convert from 6 decimals
              account: account.displayName,
              date: formatTransactionDate(tx.timestamp),
              status: 'completed' as const,
            }));

            allTransactions.push(...accountTransactions);
          } catch (error) {
            console.error(`Error fetching recent transactions for ${account.displayName}:`, error);
          }
        }

        // Sort by timestamp and take first 3
        allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentTransactions(allTransactions.slice(0, 3));
      } catch (error) {
        console.error('Error fetching recent transactions:', error);
        setRecentTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchRecentTransactions();
  }, [address, getClient]);

  useEffect(() => {
    // Use email from Privy user or fallback to address
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

  // Onboarding flow for non-authenticated users
  if (!ready || !authenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex flex-col items-center justify-center px-4 -mt-6"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-8 max-w-md"
        >
          {/* Hero */}
          <div>
            <motion.div
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </motion.div>
            
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Your savings,<br />earning more
            </h1>
            
            <p className="text-lg text-slate-600 mb-8">
              Open a savings account in 30 seconds.<br />
              Earn up to <span className="text-green-500 font-semibold">12% per year</span>.
            </p>
          </div>

          {/* Connect Button */}
          <div className="space-y-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={login}
              disabled={!ready}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-lg h-14 rounded-xl font-semibold disabled:opacity-50 transition-colors"
            >
              Get Started
            </motion.button>
            
            <p className="text-xs text-slate-500">
              Simple and secure • Protected by institutional-grade security
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
      {/* Total Balance Card */}
      <BalanceCard
        totalBalance={totalBalance}
        monthlyEarnings={monthlyEarnings}
        userName={userName}
        isLoading={vaultsLoading}
      />

      {/* Savings Accounts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Savings Accounts
          </h2>
          <Link
            href="/deposit"
            className="text-sm text-green-500 hover:text-green-600 font-medium transition-colors"
          >
            Add money
          </Link>
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

      {/* Goals Section Link */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Savings Goals
          </h2>
          <Link
            href="/goals"
            className="text-sm text-green-500 hover:text-green-600 font-medium transition-colors"
          >
            View all
          </Link>
        </div>

        <Link
          href="/goals"
          className="block bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-slate-800">Create your first goal</h3>
              <p className="text-sm text-slate-500">Set targets and track progress</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Recent Activity
          </h2>
          <Link
            href="/activity"
            className="text-sm text-green-500 hover:text-green-600 font-medium transition-colors"
          >
            See all
          </Link>
        </div>

        <div className="space-y-3">
          {transactionsLoading ? (
            // Loading skeleton
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full" />
                  <div className="space-y-1">
                    <div className="w-16 h-4 bg-slate-200 rounded" />
                    <div className="w-24 h-3 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="w-12 h-4 bg-slate-200 rounded" />
              </div>
            ))
          ) : recentTransactions.length === 0 ? (
            <div className="p-6 text-center bg-white rounded-xl shadow-sm">
              <p className="text-sm text-slate-500">No recent activity</p>
              <p className="text-xs text-slate-400">Make your first deposit to see activity here</p>
            </div>
          ) : (
            recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.type === 'deposit' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {transaction.type === 'deposit' ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">
                      {transaction.type === 'deposit' ? 'Deposit' : 'Withdraw'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {transaction.account} • {transaction.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    transaction.type === 'deposit' ? 'text-green-500' : 'text-slate-700'
                  }`}>
                    {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Insights Card - Only show if user has funds */}
      {totalBalance > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-100"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-slate-800">Earning Interest</h3>
              <p className="text-sm text-slate-600">
                Your ${totalBalance.toLocaleString()} is earning interest daily. 
                Keep saving to reach your goals faster.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom spacing for nav */}
      <div className="pb-20" />
    </motion.div>
  );
}