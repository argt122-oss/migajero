import { useState, useCallback, useEffect } from 'react';
import type { AppState, Transaction, Currency } from './types';

const STORAGE_KEY = 'migajero_state';

const INITIAL_STATE: AppState = {
  balanceBOB: 850.00,
  balanceUSDC: 12.50,
  points: 340,
  lifetimePoints: 340,
  transactions: [
    {
      id: 't1',
      type: 'topup',
      currency: 'BOB',
      amount: 500,
      description: 'Recarga inicial',
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
      simulated: true,
    },
    {
      id: 't2',
      type: 'payment',
      currency: 'BOB',
      amount: 85,
      description: 'Pago en comercio',
      merchant: 'Super Chang',
      pointsEarned: 85,
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      simulated: true,
    },
    {
      id: 't3',
      type: 'topup',
      currency: 'USDC',
      amount: 15,
      description: 'Recarga USDC',
      date: new Date(Date.now() - 86400000).toISOString(),
      simulated: true,
    },
    {
      id: 't4',
      type: 'payment',
      currency: 'USDC',
      amount: 2.5,
      description: 'Café y snack',
      merchant: 'Café del Prado',
      pointsEarned: 25,
      date: new Date(Date.now() - 43200000).toISOString(),
      simulated: true,
    },
    {
      id: 't5',
      type: 'payment',
      currency: 'BOB',
      amount: 65,
      description: 'Almuerzo ejecutivo',
      merchant: 'Los Lomitos',
      pointsEarned: 130,
      date: new Date(Date.now() - 7200000).toISOString(),
      simulated: true,
    },
  ],
  redeemedRewards: [],
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    // ignore
  }
  return INITIAL_STATE;
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function genId(): string {
  return 'tx_' + Math.random().toString(36).slice(2, 9);
}

export function useStore() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addFunds = useCallback((amount: number, currency: Currency) => {
    setState(prev => {
      const tx: Transaction = {
        id: genId(),
        type: 'topup',
        currency,
        amount,
        description: `Recarga de ${currency === 'BOB' ? 'Bs. ' + amount : amount + ' USDC'}`,
        date: new Date().toISOString(),
        simulated: true,
      };
      return {
        ...prev,
        balanceBOB: currency === 'BOB' ? prev.balanceBOB + amount : prev.balanceBOB,
        balanceUSDC: currency === 'USDC' ? prev.balanceUSDC + amount : prev.balanceUSDC,
        transactions: [tx, ...prev.transactions],
      };
    });
  }, []);

  const makePayment = useCallback((
    amount: number,
    currency: Currency,
    merchant: string,
    pointsMultiplier = 1
  ): { ok: boolean; points: number } => {
    let ok = false;
    let pointsEarned = 0;

    setState(prev => {
      const hasFunds =
        currency === 'BOB' ? prev.balanceBOB >= amount : prev.balanceUSDC >= amount;

      if (!hasFunds) return prev;

      ok = true;
      // 1 punto por Bs. gastado; USDC usa tipo de cambio 6.9
      const basePoints = currency === 'BOB' ? amount : amount * 6.9;
      pointsEarned = Math.round(basePoints * pointsMultiplier);

      const tx: Transaction = {
        id: genId(),
        type: 'payment',
        currency,
        amount,
        description: `Pago en ${merchant}`,
        merchant,
        pointsEarned,
        date: new Date().toISOString(),
        simulated: true,
      };

      return {
        ...prev,
        balanceBOB: currency === 'BOB' ? prev.balanceBOB - amount : prev.balanceBOB,
        balanceUSDC: currency === 'USDC' ? prev.balanceUSDC - amount : prev.balanceUSDC,
        points: prev.points + pointsEarned,
        lifetimePoints: prev.lifetimePoints + pointsEarned,
        transactions: [tx, ...prev.transactions],
      };
    });

    return { ok, points: pointsEarned };
  }, []);

  const transferFunds = useCallback((amount: number, currency: Currency, destination: string) => {
    setState(prev => {
      const hasFunds =
        currency === 'BOB' ? prev.balanceBOB >= amount : prev.balanceUSDC >= amount;
      if (!hasFunds) return prev;

      const tx: Transaction = {
        id: genId(),
        type: 'transfer',
        currency,
        amount,
        description: `Transferencia a ${destination}`,
        date: new Date().toISOString(),
        simulated: true,
      };

      return {
        ...prev,
        balanceBOB: currency === 'BOB' ? prev.balanceBOB - amount : prev.balanceBOB,
        balanceUSDC: currency === 'USDC' ? prev.balanceUSDC - amount : prev.balanceUSDC,
        transactions: [tx, ...prev.transactions],
      };
    });
  }, []);

  const redeemReward = useCallback((rewardId: string, pointsCost: number): boolean => {
    let ok = false;
    setState(prev => {
      if (prev.points < pointsCost || prev.redeemedRewards.includes(rewardId)) return prev;
      ok = true;
      const tx: Transaction = {
        id: genId(),
        type: 'reward',
        currency: 'BOB',
        amount: 0,
        description: 'Canje de recompensa',
        pointsEarned: -pointsCost,
        date: new Date().toISOString(),
        simulated: true,
      };
      return {
        ...prev,
        points: prev.points - pointsCost,
        redeemedRewards: [...prev.redeemedRewards, rewardId],
        transactions: [tx, ...prev.transactions],
      };
    });
    return ok;
  }, []);

  const resetState = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { state, addFunds, makePayment, transferFunds, redeemReward, resetState };
}
