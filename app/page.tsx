'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { BalanceCard } from '@/components/BalanceCard';
import { AccountRow } from '@/components/AccountRow';
import { getAllAccounts } from '@/lib/accounts';

// Mock hooks - in real app these would come from @yo-protocol/react
const useVaults = () => {
  return {
    data: [
      { name: 'yoUSD', apy: 8.5 },
      { name: 'yoEUR', apy: 7.2 },
      { name: 'yoBTC', apy: 5.8 },
      { name: 'yoETH', apy: 6.5 },
      { name: 'yoGOLD', apy: 4.2 },
    ],
    isLoading: false,
  };
};

const useUserBalance = (vaultName: string, address?: string) => {
  // Mock balances
  const mockBalances: Record<string, number> = {
    yoUSD: 2450.75,
    yoEUR: 1200.50,
    yoBTC: 0.05,
    yoETH: 1.25,
    yoGOLD: 2.5,
  };
  
  return {
    data: address ? (mockBalances[vaultName] || 0) : 0,
    isLoading: false,
  };
};

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [userName, setUserName] = useState('');
  
  const { data: vaults, isLoading: vaultsLoading } = useVaults();
  
  // Get all accounts with their data
  const accounts = getAllAccounts();
  const accountsWithData = accounts.map(account => {
    const vault = vaults?.find(v => v.name === account.yoVault);
    const { data: balance, isLoading: balanceLoading } = useUserBalance(account.yoVault, address);
    
    return {
      ...account,
      balance: balance || 0,
      annualRate: vault?.apy || 0,
      isLoading: vaultsLoading || balanceLoading,
    };
  });

  // Calculate totals (convert everything to USD for simplicity)
  const totalBalance = accountsWithData.reduce((total, account) => {
    // In real app, would convert using actual exchange rates
    const usdValue = account.id === 'bitcoin' ? account.balance * 50000 :
                    account.id === 'ethereum' ? account.balance * 3000 :
                    account.id === 'gold' ? account.balance * 2000 :
                    account.balance; // USD/EUR roughly equal for demo
    return total + usdValue;
  }, 0);

  // Mock monthly earnings (2% of total balance)
  const monthlyEarnings = totalBalance * 0.02;

  useEffect(() => {
    // Extract name from address for demo
    if (address) {
      setUserName(address.slice(2, 6));
    }
  }, [address]);

  // Onboarding flow for non-connected users
  if (!isConnected) {
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
              className="text-6xl mb-4"
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
              💰
            </motion.div>
            
            <h1 className="text-3xl font-bold text-zinc-200 mb-4">
              Your savings,<br />earning more
            </h1>
            
            <p className="text-lg text-zinc-400 mb-8">
              Open a savings account in 30 seconds.<br />
              Earn up to <span className="text-emerald-500 font-semibold">12% per year</span>.
            </p>
          </div>

          {/* Connect Button */}
          <div className="space-y-4">
            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, openAccountModal, openChainModal, authenticationStatus, mounted }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

                return (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={openConnectModal}
                    className="w-full btn-primary text-lg h-14"
                  >
                    Get Started
                  </motion.button>
                );
              }}
            </ConnectButton.Custom>
            
            <p className="text-xs text-zinc-500">
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
      {/* Header with user menu */}
      <div className="flex items-center justify-between">
        <div>
          {/* Empty for balance card greeting */}
        </div>
        <ConnectButton />
      </div>

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
          <h2 className="text-lg font-medium text-zinc-200">
            Savings Accounts
          </h2>
          <Link
            href="/deposit"
            className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/deposit">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center"
          >
            <div className="text-2xl mb-2">💵</div>
            <span className="text-sm font-medium text-emerald-500">Add Money</span>
          </motion.div>
        </Link>
        
        <Link href="/goals">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl text-center"
          >
            <div className="text-2xl mb-2">🎯</div>
            <span className="text-sm font-medium text-zinc-400">Savings Goals</span>
          </motion.div>
        </Link>
      </div>

      {/* Bottom spacing for nav */}
      <div className="pb-20" />
    </motion.div>
  );
}