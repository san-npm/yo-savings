'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { AuthGate } from '@/components/AuthGate';

function SettingsContent() {
  const { user, logout, exportWallet } = usePrivy();
  const { wallets } = useWallets();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const address = embeddedWallet?.address as `0x${string}` | undefined;

  const handleExportPrivateKey = async () => {
    if (!embeddedWallet) return;
    setIsExporting(true);
    try {
      await exportWallet();
    } catch (error) {
      console.error('Failed to export wallet:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Settings</h1>
        <p className="text-[#6C757D]">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <h2 className="text-sm font-medium text-[#ADB5BD] uppercase tracking-wider">Account</h2>

        <div className="p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="relative flex-shrink-0 w-14 h-14">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: 'conic-gradient(from 0deg, #10B981 0%, rgba(16,185,129,0.1) 40%, #10B981 70%, rgba(16,185,129,0.1) 100%)' }}
              />
              <div
                className="absolute inset-[2px] rounded-full flex items-center justify-center bg-[#10B981]"
              >
                <span className="text-white font-bold text-xl">
                  {user?.email?.address?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-[#1A1A2E]">
                {user?.email?.address || 'Anonymous User'}
              </p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
                <p className="text-sm text-[#6C757D]">Active account</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Wallet Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <h2 className="text-sm font-medium text-[#ADB5BD] uppercase tracking-wider">Wallet</h2>

        <div className="p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#10B981] flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#6C757D] mb-3">
                Your wallet is an embedded wallet created by Privy, secured with your email login. Only you control it.
              </p>

              <div className="p-3 bg-white rounded-xl border border-[#E9ECEF]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#ADB5BD]">Address</span>
                  <button
                    onClick={() => address && copyToClipboard(address)}
                    className="text-xs text-[#10B981] hover:text-[#059669] transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs font-mono text-[#6C757D] break-all">
                  {address || 'Not available'}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#10B981] rounded-full" />
                  <span className="text-xs text-[#6C757D]">Base (Chain ID: 8453)</span>
                </div>
                {address && (
                  <a
                    href={`https://basescan.org/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#10B981] hover:text-[#059669] underline"
                  >
                    View on BaseScan
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h2 className="text-sm font-medium text-[#ADB5BD] uppercase tracking-wider">About</h2>

        <div className="p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#ECFDF5]">
              <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[#1A1A2E]">Yo Savings</p>
              <p className="text-sm text-[#6C757D]">v1.0.0</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Advanced Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl text-left hover:border-[#DEE2E6] transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#F1F3F5] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-[#6C757D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-[#1A1A2E]">Advanced</h3>
                <p className="text-sm text-[#6C757D]">Export keys & technical details</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: showAdvanced ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-[#ADB5BD]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 overflow-hidden"
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleExportPrivateKey}
                disabled={isExporting || !embeddedWallet}
                className="w-full p-4 bg-amber-50 border border-amber-200 rounded-xl text-left hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-700">
                      {isExporting ? 'Exporting...' : 'Export Private Key'}
                    </p>
                    <p className="text-xs text-amber-600/70">
                      For advanced users only &mdash; keep secure
                    </p>
                  </div>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sign Out */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Sign Out</span>
          </div>
        </motion.button>
      </motion.div>

      <div className="pb-20" />
    </motion.div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGate>
      <SettingsContent />
    </AuthGate>
  );
}
