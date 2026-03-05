'use client';

import { motion } from 'framer-motion';
import { usePrivy, useLogin } from '@privy-io/react-auth';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-white/20 border-t-[#D6FF34] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[80vh] flex flex-col items-center justify-center px-4 -mt-6"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-8 max-w-md"
        >
          {/* Neon orb */}
          <motion.div
            className="w-20 h-20 rounded-full mx-auto relative"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <div className="absolute inset-0 rounded-full bg-[#D6FF34] opacity-30 blur-xl" />
            <div
              className="absolute inset-0 rounded-full bg-[#D6FF34] flex items-center justify-center"
              style={{ boxShadow: '0 0 40px rgba(214,255,52,0.3)' }}
            >
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </motion.div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-white">
              Sign in to continue
            </h1>
            <p className="text-[#A0A0A0]">
              Access your savings accounts, track earnings, and manage your money.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={login}
            className="w-full h-14 rounded-xl font-semibold text-black text-lg bg-[#D6FF34] hover:opacity-90 transition-opacity shadow-lg"
            style={{ boxShadow: '0 0 30px rgba(214,255,52,0.3)' }}
          >
            Sign In
          </motion.button>

          <p className="text-xs text-[#666666]">
            Secure &bull; No fees &bull; Powered by Yo Protocol
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return <>{children}</>;
}
