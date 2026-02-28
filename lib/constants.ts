import { VAULTS } from '@yo-protocol/core';

// Chain and protocol constants
export const CHAIN_ID = 8453; // Base chain - cheapest gas
export const CHAIN_NAME = 'Base';

// YO Protocol vault addresses from @yo-protocol/core
export const YO_VAULT_ADDRESSES = {
  yoUSD: VAULTS.yoUSD.address,
  yoEUR: VAULTS.yoEUR.address,
} as const;

// Underlying token addresses
export const TOKEN_ADDRESSES = {
  USDC: '0xA0b86a33E6412b9e0e4e518F6bFfFaF5bA41F4C6' as const,
  EURC: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42' as const,
} as const;

// Display currencies
export const DISPLAY_CURRENCIES = {
  USD: '$',
  EUR: '€',
} as const;