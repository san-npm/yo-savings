'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useYoClient } from '@/lib/useYoClient';
import { getAllAccounts } from '@/lib/accounts';

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

export default function ActivityPage() {
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

        // Fetch history from both vaults
        for (const account of allAccounts) {
          try {
            const history = await client.getUserHistory(
              account.vaultAddress as `0x${string}`,
              address,
              50 // Limit to last 50 transactions per vault
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
            // Continue with other vaults even if one fails
          }
        }

        // Sort by timestamp descending (newest first)
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

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Please sign in to view your activity</p>
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
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-800">Activity</h1>
        <p className="text-slate-500">Your transaction history</p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === item.key
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-700'
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
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                accountFilter === item.key
                  ? 'bg-white border border-slate-300 shadow-sm text-slate-800'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-white rounded-2xl shadow-sm animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="w-20 h-4 bg-slate-200 rounded" />
                    <div className="w-32 h-3 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="w-16 h-6 bg-slate-200 rounded" />
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
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">No transactions found</h3>
              <p className="text-slate-500">
                {transactions.length === 0 ? 'Make your first deposit to see activity here' : 'Try adjusting your filters'}
              </p>
            </motion.div>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' 
                        ? 'bg-green-100 text-green-500' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {transaction.type === 'deposit' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-slate-800">
                          {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full text-green-500">
                          completed
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <span>{transaction.account}</span>
                        <span>•</span>
                        <span>{formatDate(transaction.date)}</span>
                        <span>•</span>
                        <a
                          href={`https://basescan.org/tx/${transaction.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-green-600 hover:text-green-700 underline"
                        >
                          {transaction.hash.slice(0, 6)}...{transaction.hash.slice(-4)}
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-semibold text-lg ${
                      transaction.type === 'deposit' ? 'text-green-500' : 'text-slate-800'
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