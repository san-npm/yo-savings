import { YO_VAULT_ADDRESSES, TOKEN_ADDRESSES, DISPLAY_CURRENCIES } from './constants';

export type AccountId = 'dollar' | 'euro';

export interface SavingsAccount {
  id: AccountId;
  displayName: string;
  icon: string;
  yoVault: keyof typeof YO_VAULT_ADDRESSES;
  underlyingToken: keyof typeof TOKEN_ADDRESSES;
  displayCurrency: keyof typeof DISPLAY_CURRENCIES;
  currencySymbol: string;
  vaultAddress: string;
  tokenAddress: string;
}

export const SAVINGS_ACCOUNTS: Record<AccountId, SavingsAccount> = {
  dollar: {
    id: 'dollar',
    displayName: 'Dollar Savings',
    icon: '$',
    yoVault: 'yoUSD',
    underlyingToken: 'USDC',
    displayCurrency: 'USD',
    currencySymbol: DISPLAY_CURRENCIES.USD,
    vaultAddress: YO_VAULT_ADDRESSES.yoUSD,
    tokenAddress: TOKEN_ADDRESSES.USDC,
  },
  euro: {
    id: 'euro',
    displayName: 'Euro Savings',
    icon: '€',
    yoVault: 'yoEUR',
    underlyingToken: 'EURC',
    displayCurrency: 'EUR',
    currencySymbol: DISPLAY_CURRENCIES.EUR,
    vaultAddress: YO_VAULT_ADDRESSES.yoEUR,
    tokenAddress: TOKEN_ADDRESSES.EURC,
  },
};

export const isAccountId = (id: string): id is AccountId => {
  return id in SAVINGS_ACCOUNTS;
};

export const getAccountById = (id: string): SavingsAccount | undefined => {
  return isAccountId(id) ? SAVINGS_ACCOUNTS[id] : undefined;
};

export const getAllAccounts = (): SavingsAccount[] => {
  return Object.values(SAVINGS_ACCOUNTS);
};

export const getDefaultAccount = (): SavingsAccount => {
  return SAVINGS_ACCOUNTS.dollar;
};
