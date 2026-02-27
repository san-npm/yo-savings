'use client';

import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  // Redirect to home if already connected
  useEffect(() => {
    if (isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

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
        {/* Hero Section */}
        <div>
          <motion.div
            className="text-6xl mb-6"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            💰
          </motion.div>
          
          <h1 className="text-3xl font-bold text-zinc-200 mb-4">
            Your savings,<br />earning more
          </h1>
          
          <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
            Open a savings account in 30 seconds.<br />
            Earn up to <span className="text-emerald-500 font-semibold">12% per year</span> on your money.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <span className="text-emerald-500 text-sm">✓</span>
            </div>
            <span className="text-zinc-300">Simple and secure</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <span className="text-emerald-500 text-sm">✓</span>
            </div>
            <span className="text-zinc-300">Withdraw anytime, no penalties</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <span className="text-emerald-500 text-sm">✓</span>
            </div>
            <span className="text-zinc-300">Protected by institutional-grade security</span>
          </motion.div>
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
                  className="w-full btn-primary text-lg h-14 shadow-lg shadow-emerald-500/25"
                >
                  Get Started
                </motion.button>
              );
            }}
          </ConnectButton.Custom>
          
          <p className="text-xs text-zinc-500">
            By connecting, you agree to our{' '}
            <a href="#" className="text-emerald-500 hover:text-emerald-400 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-emerald-500 hover:text-emerald-400 underline">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="pt-8 border-t border-zinc-800/50"
        >
          <p className="text-xs text-zinc-600 mb-3">Trusted by thousands</p>
          <div className="flex items-center justify-center space-x-6 text-zinc-600">
            <div className="text-center">
              <div className="text-lg font-semibold text-zinc-400">$50M+</div>
              <div className="text-xs">Total Savings</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-zinc-400">10K+</div>
              <div className="text-xs">Users</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-zinc-400">99.9%</div>
              <div className="text-xs">Uptime</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}