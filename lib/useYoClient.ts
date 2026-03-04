'use client';

import { useMemo } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { createYoClient } from '@yo-protocol/core';

export function useYoClient() {
  const { wallets } = useWallets();

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const address = embeddedWallet?.address as `0x${string}` | undefined;

  // Core SDK only prepares transactions now — no walletClient needed
  const client = useMemo(
    () => createYoClient({ chainId: 8453, partnerId: 9999 }),
    []
  );

  // Helper to switch to Base before any wallet operation
  const ensureBaseChain = async () => {
    if (!embeddedWallet) throw new Error('No wallet found');
    await embeddedWallet.switchChain(8453);
    return embeddedWallet;
  };

  return { client, address, ensureBaseChain };
}
