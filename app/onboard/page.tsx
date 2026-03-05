'use client';

import { motion } from 'framer-motion';
import { usePrivy, useLogin } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardPage() {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();
  const router = useRouter();

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
      {/* Gradient Orb Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(214,255,52,0.15) 0%, rgba(214,255,52,0.08) 50%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-8 max-w-md relative z-10"
      >
        {/* Hero Section */}
        <div>
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto bg-[#D6FF34]"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.8,
              ease: "easeOut"
            }}
            style={{ boxShadow: '0 0 40px rgba(214, 255, 52, 0.3)' }}
          >
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Your savings,<br /><span className="text-[#D6FF34]">earning more</span>
          </h1>

          <p className="text-[#A0A0A0] leading-relaxed">
            Earn up to <span className="text-[#D6FF34] font-semibold">12% per year</span> on your savings
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#D6FF34] flex-shrink-0">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[#A0A0A0]">Simple and secure</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#D6FF34] flex-shrink-0">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[#A0A0A0]">Withdraw anytime, no penalties</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#D6FF34] flex-shrink-0">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[#A0A0A0]">Protected by institutional-grade security</span>
          </motion.div>
        </div>

        {/* Connect Button */}
        <div className="space-y-6 pt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={login}
            disabled={!ready}
            className="w-full text-black text-lg h-14 rounded-xl font-semibold disabled:opacity-50 transition-all bg-[#D6FF34] hover:opacity-90"
            style={{ boxShadow: '0 0 30px rgba(214, 255, 52, 0.3)' }}
          >
            Get Started
          </motion.button>

          <p className="text-xs text-[#666666] text-center">
            Simple &bull; Secure &bull; No fees
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
