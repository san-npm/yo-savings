'use client';

import { useState, useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { createYoClient, YO_GATEWAY_ADDRESS, parseTokenAmount } from '@yo-protocol/core';
import { createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';

export function useYoClient() {
  const { wallets } = useWallets();
  
  const getClient = useCallback(async () => {
    const embedded = wallets.find(w => w.walletClientType === 'privy');
    if (!embedded) throw new Error('No wallet found');
    
    // Switch to Base if needed
    await embedded.switchChain(8453);
    const provider = await embedded.getEthereumProvider();
    
    const walletClient = createWalletClient({
      chain: base,
      transport: custom(provider),
      account: embedded.address as `0x${string}`,
    });
    
    // Type assertion to work around viem version conflicts between YO SDK and main project
    return createYoClient({ chainId: 8453, walletClient: walletClient as any });
  }, [wallets]);
  
  const address = wallets.find(w => w.walletClientType === 'privy')?.address as `0x${string}` | undefined;
  
  return { getClient, address };
}