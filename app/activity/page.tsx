'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useYoClient } from '@/lib/useYoClient';
import { getAllAccounts } from '@/lib/accounts';
import { AuthGate } from '@/components/AuthGate';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  account: string;
  accountId: string;
  date: number; // timestamp
  status: 'completed';
  hash: string;
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return '1 day ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function ActivityContent() {
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { client, address } = useYoClient();
  const allAccounts = getAllAccounts();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!address || !client) return;

      try {
        setIsLoading(true);
        setError(null);
        const allTransactions: Transaction[] = [];

        for (const account of allAccounts) {
          try {
            const history = await client.getUserHistory(
              account.vaultAddress as `0x${string}`,
              address,
              50
            );

            const accountTransactions = history.map((tx) => ({
              id: tx.txHash,
              type: (tx.type === 'deposit' ? 'deposit' : 'withdraw') as 'deposit' | 'withdraw',
              amount: Number(tx.assets.raw) / 1e6,
              account: account.displayName,
              accountId: account.id,
              date: tx.timestamp,
              status: 'completed' as const,
              hash: tx.txHash,
            }));

            allTransactions.push(...accountTransactions);
          } catch (vaultError) {
            console.error(`Error fetching history for ${account.displayName}:`, vaultError);
          }
        }

        allTransactions.sort((a, b) => Number(b.date) - Number(a.date));
        setTransactions(allTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Failed to load transaction history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [address, client]);

  const filteredTransactions = transactions.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false;
    if (accountFilter !== 'all' && tx.accountId !== accountFilter) return false;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Activity</h1>
        <p className="text-[#A0A0A0]">Your transaction history</p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Transaction Type Filter */}
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'deposit', label: 'Deposits' },
            { key: 'withdraw', label: 'Withdrawals' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === item.key
                  ? 'bg-[#D6FF34] text-black font-semibold shadow-lg'
                  : 'bg-white/5 text-[#A0A0A0] border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Account Filter */}
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All Accounts' },
            { key: 'dollar', label: 'Dollar' },
            { key: 'euro', label: 'Euro' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setAccountFilter(item.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                accountFilter === item.key
                  ? 'bg-white/10 border border-white/20 text-white'
                  : 'bg-white/5 text-[#666666] border border-white/5 hover:bg-white/8 hover:text-[#A0A0A0]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-[#2B2C2A] border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full loading-pulse" />
                  <div className="space-y-2">
                    <div className="w-20 h-4 rounded loading-pulse" />
                    <div className="w-32 h-3 rounded loading-pulse" />
                  </div>
                </div>
                <div className="w-16 h-6 rounded loading-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transactions List */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto"
                style={{ background: 'linear-gradient(135deg, rgba(214,255,52,0.08) 0%, rgba(214,255,52,0.03) 100%)', border: '1px solid rgba(214,255,52,0.15)' }}
              >
                <span className="text-3xl">🌱</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No transactions yet</h3>
              <p className="text-[#666666] text-sm">
                {transactions.length === 0 ? 'Make your first deposit to start earning' : 'Try adjusting your filters'}
              </p>
            </motion.div>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
                className="p-4 bg-[#2B2C2A] border border-white/10 rounded-2xl hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      transaction.type === 'deposit'
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {transaction.type === 'deposit' ? (
                        /* Coin drop */
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <circle cx="12" cy="5" r="2.5" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v10m-3-3 3 3 3-3" />
                        </svg>
                      ) : (
                        /* Paper plane */
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-white">
                          {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                          completed
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-[#666666]">
                        <span>{transaction.account}</span>
                        <span>&bull;</span>
                        <span>{formatDate(transaction.date)}</span>
                        <span>&bull;</span>
                        <a
                          href={`https://basescan.org/tx/${transaction.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[#D6FF34] hover:opacity-80 underline"
                        >
                          {transaction.hash.slice(0, 6)}...{transaction.hash.slice(-4)}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-semibold text-lg tabular-nums ${
                      transaction.type === 'deposit' ? 'text-green-400' : 'text-amber-400'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Bottom spacing for nav */}
      <div className="pb-20" />
    </motion.div>
  );
}

export default function ActivityPage() {
  return (
    <AuthGate>
      <ActivityContent />
    </AuthGate>
  );
}
