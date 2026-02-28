'use client';

import { motion } from 'framer-motion';
import { usePrivy, useLogin } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardPage() {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();
  const router = useRouter();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (ready && authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

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
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut"
            }}
          >
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </motion.div>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Your savings,<br />earning more
          </h1>
          
          <p className="text-slate-600 leading-relaxed">
            Earn up to <span className="text-green-500 font-semibold">12% per year</span> on your savings
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
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-500 text-sm font-semibold">✓</span>
            </div>
            <span className="text-slate-700">Simple and secure</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-500 text-sm font-semibold">✓</span>
            </div>
            <span className="text-slate-700">Withdraw anytime, no penalties</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-500 text-sm font-semibold">✓</span>
            </div>
            <span className="text-slate-700">Protected by institutional-grade security</span>
          </motion.div>
        </div>

        {/* Connect Button */}
        <div className="space-y-6 pt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={login}
            disabled={!ready}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-lg h-14 rounded-xl font-semibold shadow-lg shadow-green-500/25 disabled:opacity-50 transition-all"
          >
            Get Started
          </motion.button>
          
          <p className="text-xs text-slate-500 text-center">
            Simple • Secure • No fees
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}