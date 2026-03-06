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
import { YO_VAULT_ADDRESSES } from '@/lib/constants';

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

function FloatingParticle({ delay, x, y, shape = 'dot' }: { delay: number; x: string; y: string; shape?: 'dot' | 'coin' | 'spark' }) {
  if (shape === 'coin') {
    return (
      <motion.div
        className="absolute"
        style={{ left: x, top: y }}
        animate={{ y: [0, -10, 0], rotate: [0, 15, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 5, delay, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-4 h-4 rounded-full border border-[#D6FF34]/50 bg-[#D6FF34]/10 flex items-center justify-center">
          <span className="text-[7px] text-[#D6FF34]/80 font-bold">$</span>
        </div>
      </motion.div>
    );
  }
  if (shape === 'spark') {
    return (
      <motion.div
        className="absolute w-1 h-1 bg-[#D6FF34] rotate-45"
        style={{ left: x, top: y }}
        animate={{ scale: [0, 1, 0], opacity: [0, 0.8, 0] }}
        transition={{ duration: 3, delay, repeat: Infinity, ease: 'easeInOut' }}
      />
    );
  }
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full bg-[#D6FF34]"
      style={{ left: x, top: y, opacity: 0.4 }}
      animate={{ y: [0, -8, 0], opacity: [0.2, 0.6, 0.2] }}
      transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export default function HomePage() {
  const { wallets } = useWallets();
  const { ready, authenticated, user } = usePrivy();
  const { login } = useLogin();
  const { client } = useYoClient();

  // Fetch vault snapshots for landing page (no auth needed)
  const { snapshot: usdSnapshot } = useVaultSnapshot(
    YO_VAULT_ADDRESSES.yoUSD as `0x${string}`
  );
  const { snapshot: eurSnapshot } = useVaultSnapshot(
    YO_VAULT_ADDRESSES.yoEUR as `0x${string}`
  );

  const usdApy = parseFloat(usdSnapshot?.stats?.yield?.['7d'] ?? '0');
  const eurApy = parseFloat(eurSnapshot?.stats?.yield?.['7d'] ?? '0');
  const bestApy = Math.max(usdApy, eurApy);

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
        className="min-h-[85vh] flex flex-col items-center justify-center px-4 -mt-6 relative"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none decorative-glow" />

        {/* Floating particles */}
        <FloatingParticle delay={0} x="15%" y="20%" shape="dot" />
        <FloatingParticle delay={1.2} x="80%" y="30%" shape="coin" />
        <FloatingParticle delay={2.4} x="25%" y="70%" shape="spark" />
        <FloatingParticle delay={0.8} x="75%" y="65%" shape="coin" />
        <FloatingParticle delay={1.8} x="60%" y="15%" shape="dot" />
        <FloatingParticle delay={3.0} x="10%" y="55%" shape="spark" />

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-8 max-w-md relative z-10"
        >
          <div>
            {/* Dynamic hero orb with animated rings */}
            <div className="relative w-28 h-28 mx-auto mb-8">
              {/* Outer ambient glow */}
              <div
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ background: 'radial-gradient(circle, rgba(214,255,52,0.25) 0%, transparent 70%)', transform: 'scale(1.8)' }}
              />

              {/* Pulsing rings */}
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-[#D6FF34]"
                  style={{ opacity: 0 }}
                  animate={{
                    scale: [1, 1.6 + i * 0.3],
                    opacity: [0.4, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: i * 0.7,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              ))}

              {/* Orb body */}
              <motion.div
                className="absolute inset-0 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background: 'linear-gradient(135deg, #D6FF34 0%, #b8d900 50%, #8faa00 100%)',
                  boxShadow: '0 0 50px rgba(214,255,52,0.4), 0 0 100px rgba(214,255,52,0.15), inset 0 -4px 8px rgba(0,0,0,0.2)',
                }}
              >
                {/* Shine */}
                <div
                  className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-3 rounded-full opacity-40"
                  style={{ background: 'rgba(255,255,255,0.5)', filter: 'blur(2px)' }}
                />
                <svg className="w-12 h-12 text-black relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                </svg>
              </motion.div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">
              Your savings,<br />
              <span className="text-[#D6FF34] shimmer-text">earning more</span>
            </h1>

            <p className="text-lg text-[#A0A0A0] mb-6">
              {bestApy > 0
                ? <>Earn up to <span className="text-[#D6FF34] font-semibold">{bestApy.toFixed(1)}%</span> per year, automatically.</>
                : <>Open a savings account in 30 seconds. Earn competitive rates, <span className="text-[#D6FF34] font-semibold">automatically</span>.</>
              }
            </p>

            {/* Mini APY cards */}
            {(usdApy > 0 || eurApy > 0) && (
              <div className="flex gap-3 justify-center mb-2">
                {usdApy > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="px-4 py-2.5 bg-[#2B2C2A] border border-white/10 rounded-xl"
                    style={{ boxShadow: '0 0 12px rgba(0,255,139,0.1)' }}
                  >
                    <p className="text-xs text-[#A0A0A0] mb-0.5">Dollar Savings</p>
                    <p className="text-lg font-semibold text-[#00FF8B] tabular-nums">{usdApy.toFixed(1)}%</p>
                  </motion.div>
                )}
                {eurApy > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="px-4 py-2.5 bg-[#2B2C2A] border border-white/10 rounded-xl"
                    style={{ boxShadow: '0 0 12px rgba(78,111,255,0.1)' }}
                  >
                    <p className="text-xs text-[#A0A0A0] mb-0.5">Euro Savings</p>
                    <p className="text-lg font-semibold text-[#4E6FFF] tabular-nums">{eurApy.toFixed(1)}%</p>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={login}
              disabled={!ready}
              className="w-full h-14 rounded-xl font-semibold text-black text-lg bg-[#D6FF34] disabled:opacity-50 transition-all"
              style={{ boxShadow: '0 0 30px rgba(214,255,52,0.3)' }}
            >
              Get Started
            </motion.button>

            <p className="text-xs text-[#666666]">
              Simple and secure &bull; Powered by Yo Protocol
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
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0,255,139,0.15)' }}
            className="p-4 bg-[#2B2C2A] border border-white/10 rounded-2xl flex items-center justify-center space-x-3 hover:border-[#00FF8B]/30 transition-all"
          >
            {/* Deposit icon: coin dropping down */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,255,139,0.12)' }}>
              <svg className="w-5 h-5 text-[#00FF8B]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="6" r="3" strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v10m-4-4 4 4 4-4" />
              </svg>
            </div>
            <span className="font-semibold text-white">Deposit</span>
          </motion.div>
        </Link>
        <Link href="/withdraw">
          <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(214,255,52,0.12)' }}
            className="p-4 bg-[#2B2C2A] border border-white/10 rounded-2xl flex items-center justify-center space-x-3 hover:border-[#D6FF34]/30 transition-all"
          >
            {/* Withdraw icon: paper plane up */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(214,255,52,0.10)' }}>
              <svg className="w-5 h-5 text-[#D6FF34]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-4 4 4-4 4 4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 21h14" />
              </svg>
            </div>
            <span className="font-semibold text-white">Withdraw</span>
          </motion.div>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Savings Accounts</h2>
          <Link href="/deposit" className="text-sm text-[#D6FF34] font-medium">
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

      {/* Growth Simulator — pass real APY */}
      <SimulationChart currentApy={averageAPY || 0} />

      {/* Goals Section Link */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Savings Goals</h2>
          <Link href="/goals" className="text-sm text-[#D6FF34] font-medium">View all</Link>
        </div>

        <Link
          href="/goals"
          className="block bg-[#2B2C2A] border border-white/10 rounded-2xl hover:border-white/20 transition-all p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#D6FF34]">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-white">Create your first goal</h3>
              <p className="text-sm text-[#A0A0A0]">Set targets and track progress</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <Link href="/activity" className="text-sm text-[#D6FF34] font-medium">See all</Link>
        </div>

        <div className="space-y-3">
          {transactionsLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#2B2C2A] border border-white/10 rounded-xl">
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
            <div className="p-6 text-center bg-[#2B2C2A] border border-white/10 rounded-xl">
              <p className="text-sm text-[#A0A0A0]">No recent activity</p>
              <p className="text-xs text-[#666666]">Make your first deposit to see activity here</p>
            </div>
          ) : (
            recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-[#2B2C2A] border border-white/10 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    transaction.type === 'deposit'
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}>
                    {transaction.type === 'deposit' ? (
                      /* Coin drop icon */
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="2.5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v10m-3-3 3 3 3-3" />
                      </svg>
                    ) : (
                      /* Paper plane icon */
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-3.5 3.5L12 5l3.5 3.5M5 21h14" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">
                      {transaction.type === 'deposit' ? 'Deposit' : 'Withdraw'}
                    </p>
                    <p className="text-xs text-[#666666]">
                      {transaction.account} &bull; {transaction.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    transaction.type === 'deposit' ? 'text-green-400' : 'text-[#A0A0A0]'
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
          className="p-4 rounded-2xl bg-[#D6FF34]/10 border border-[#D6FF34]/20"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#D6FF34]">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-white">Earning Interest</h3>
              <p className="text-sm text-[#A0A0A0]">
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
