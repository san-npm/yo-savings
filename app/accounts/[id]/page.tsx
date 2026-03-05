'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUserBalance, useVaultHistory } from '@yo-protocol/react';
import { useVaultSnapshot } from '@/lib/useVaultSnapshot';
import { useYoClient } from '@/lib/useYoClient';

import { getAccountById, type AccountId } from '@/lib/accounts';
import { EarningsChart } from '@/components/EarningsChart';
import { formatBalance, formatPercentage } from '@/lib/format';
import { CurrencyIcon } from '@/components/CurrencyIcon';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  timestamp: number;
  status: 'completed';
}

export default function AccountDetailPage() {
  const params = useParams();
  const accountId = params.id as AccountId;
  const { client, address } = useYoClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  const account = getAccountById(accountId);
  const { position, isLoading: balanceLoading } = useUserBalance(
    account.vaultAddress as `0x${string}`,
    address
  );
  const { yieldHistory, isLoading: historyLoading } = useVaultHistory(
    account.vaultAddress as `0x${string}`
  );
  const { snapshot, isLoading: snapshotLoading } = useVaultSnapshot(
    account.vaultAddress as `0x${string}`
  );

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!address || !client) return;

      try {
        setTransactionsLoading(true);
        const history = await client.getUserHistory(
          account.vaultAddress as `0x${string}`,
          address,
          5
        );

        const formattedTransactions = history.map((tx) => ({
          id: tx.txHash,
          type: (tx.type === 'deposit' ? 'deposit' : 'withdrawal') as 'deposit' | 'withdrawal',
          amount: Number(tx.assets.raw) / 1e6,
          timestamp: tx.timestamp,
          status: 'completed' as const,
        }));

        setTransactions(formattedTransactions);
      } catch {
        setTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [address, account.vaultAddress, client]);

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#666666]">Account not found</p>
      </div>
    );
  }

  const annualRate = parseFloat(snapshot?.stats?.yield?.['7d'] ?? '0');
  const yield1d = parseFloat(snapshot?.stats?.yield?.['1d'] ?? '0');
  const yield7d = parseFloat(snapshot?.stats?.yield?.['7d'] ?? '0');
  const yield30d = parseFloat(snapshot?.stats?.yield?.['30d'] ?? '0');
  const balance = Number(position?.assets || BigInt(0)) / 1e6;
  const isLoading = balanceLoading || snapshotLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/" className="p-2 hover:bg-white/5 rounded-xl transition-colors">
          <svg className="w-5 h-5 text-[#A0A0A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-medium text-white">Account Details</h1>
        <div className="w-8" />
      </div>

      {/* Account Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-2xl"
      >
        <div className="p-6 bg-[#2B2C2A] relative">
          {/* Vault-colored top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{ backgroundColor: account.id === 'dollar' ? '#00FF8B' : '#4E6FFF' }}
          />
          <div className="flex items-center space-x-4 mb-6">
            <CurrencyIcon accountId={account.id} size="lg" />
            <div>
              <h2 className="text-xl font-semibold text-white">{account.displayName}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[#D6FF34] font-medium">
                  {formatPercentage(annualRate)} annual rate
                </span>
                <div className="w-1 h-1 bg-white/40 rounded-full" />
                <span className="text-sm text-[#666666]">Earning daily</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-sm text-[#666666]">Current Balance</p>
            <div className="text-4xl font-semibold text-white tabular-nums">
              {isLoading ? (
                <div className="w-32 h-10 bg-white/10 rounded loading-pulse" />
              ) : (
                formatBalance(balance, accountId)
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#2B2C2A] border-x border-b border-white/10 rounded-b-2xl">
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/deposit?account=${accountId}`}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full btn-primary"
              >
                Deposit
              </motion.button>
            </Link>
            <Link href={`/withdraw?account=${accountId}`}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full btn-secondary"
              >
                Withdraw
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Yield Cards (1d/7d/30d) */}
      {!snapshotLoading && (yield1d > 0 || yield7d > 0 || yield30d > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="p-3 bg-[#2B2C2A] border border-white/10 rounded-xl text-center">
            <p className="text-xs text-[#666666] mb-1">1 Day</p>
            <p className="text-lg font-semibold text-[#D6FF34] tabular-nums">{formatPercentage(yield1d)}</p>
          </div>
          <div className="p-3 bg-[#2B2C2A] border border-white/10 rounded-xl text-center">
            <p className="text-xs text-[#666666] mb-1">7 Days</p>
            <p className="text-lg font-semibold text-[#D6FF34] tabular-nums">{formatPercentage(yield7d)}</p>
          </div>
          <div className="p-3 bg-[#2B2C2A] border border-white/10 rounded-xl text-center">
            <p className="text-xs text-[#666666] mb-1">30 Days</p>
            <p className="text-lg font-semibold text-[#D6FF34] tabular-nums">{formatPercentage(yield30d)}</p>
          </div>
        </motion.div>
      )}

      {/* Earnings Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-[#2B2C2A] border border-white/10 rounded-2xl"
      >
        <EarningsChart
          data={(yieldHistory || []).map((point: { timestamp: number; value: number }, i: number) => ({
            date: new Date(point.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            balance: point.value,
            earnings: i > 0 ? point.value - (yieldHistory || [])[0].value : 0,
          }))}
          accountId={accountId}
          isLoading={historyLoading}
        />
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-medium text-white">Recent Activity</h3>

        <div className="space-y-3">
          {transactionsLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#2B2C2A] border border-white/10 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full loading-pulse" />
                  <div className="space-y-1">
                    <div className="w-16 h-4 rounded loading-pulse" />
                    <div className="w-24 h-3 rounded loading-pulse" />
                  </div>
                </div>
                <div className="w-16 h-4 rounded loading-pulse" />
              </div>
            ))
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center bg-[#2B2C2A] border border-white/10 rounded-2xl">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-2 mx-auto">
                <svg className="w-6 h-6 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-[#A0A0A0]">No transactions yet</p>
              <p className="text-xs text-[#666666]">Your activity will appear here</p>
            </div>
          ) : (
            transactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-[#2B2C2A] border border-white/10 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'deposit'
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-white/5 text-[#A0A0A0]'
                  }`}>
                    {tx.type === 'deposit' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0l-4-4m4 4l4-4" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V4m0 0l4 4m-4-4l-4 4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white capitalize">{tx.type}</p>
                    <p className="text-xs text-[#666666]">
                      {new Date(tx.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-semibold tabular-nums ${
                    tx.type === 'deposit' ? 'text-green-400' : 'text-[#A0A0A0]'
                  }`}>
                    {tx.type === 'deposit' ? '+' : '-'}{formatBalance(tx.amount, accountId)}
                  </div>
                  <div className="text-xs text-[#666666] capitalize">{tx.status}</div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Trust & Safety */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 bg-white/5 rounded-xl border border-white/10"
      >
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#D6FF34]">
            <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white">Secured by audited protocols</span>
        </div>
        <p className="text-xs text-[#666666]">
          Your funds are always yours. Withdraw anytime with no fees.
        </p>
      </motion.div>

      <div className="pb-20" />
    </motion.div>
  );
}
