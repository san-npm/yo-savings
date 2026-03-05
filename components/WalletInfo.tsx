'use client';

import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';

export function WalletInfo() {
  const { wallets } = useWallets();
  const [copied, setCopied] = useState(false);

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const address = embeddedWallet?.address;

  const copyToClipboard = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="p-4 bg-[#2B2C2A] border border-white/10 rounded-2xl space-y-4">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#D6FF34] flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white mb-1">Your Wallet</h3>
          <p className="text-xs text-[#A0A0A0] mb-3">
            Your wallet is an embedded wallet created by Privy, secured with your email login. Only you control it.
          </p>

          {/* Address */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#666666]">Address</span>
              <button
                onClick={copyToClipboard}
                className="text-xs text-[#D6FF34] hover:opacity-80 transition-opacity"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs font-mono text-[#A0A0A0] break-all">
              {address || 'Not available'}
            </p>
          </div>

          {/* Network + Explorer */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-[#666666]">Base (Chain ID: 8453)</span>
            </div>
            {address && (
              <a
                href={`https://basescan.org/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#D6FF34] hover:opacity-80 underline"
              >
                View on BaseScan
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
