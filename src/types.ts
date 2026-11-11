export type Currency = 'BOB' | 'USDC';

export type TxType = 'topup' | 'payment' | 'transfer' | 'reward';

export interface Transaction {
  id: string;
  type: TxType;
  currency: Currency;
  amount: number;
  description: string;
  merchant?: string;
  pointsEarned?: number;
  date: string; // ISO string
  simulated: true;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  emoji: string;
  bgColor: string;
  pointsMultiplier: number; // e.g. 2 = doble puntos
  promo?: string;
  city: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  emoji: string;
  pointsCost: number;
  type: 'discount' | 'product' | 'cashback';
  merchant?: string;
  stock: number | null; // null = ilimitado
}

export interface AppState {
  balanceBOB: number;
  balanceUSDC: number;
  points: number;
  lifetimePoints: number;
  transactions: Transaction[];
  redeemedRewards: string[]; // reward ids
}

export type Page = 'dashboard' | 'wallet' | 'payments' | 'rewards' | 'merchants';
