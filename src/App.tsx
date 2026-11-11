import { useState } from 'react';
import './App.css';
import type { Page } from './types';
import { useStore } from './store';

import Header from './components/Header';
import BottomNav from './components/BottomNav';

import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Payments from './pages/Payments';
import Rewards from './pages/Rewards';
import Merchants from './pages/Merchants';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const { state, addFunds, makePayment, transferFunds, redeemReward } = useStore();

  return (
    <div className="app-shell">
      <Header />

      <main className="page-content">
        {page === 'dashboard' && (
          <Dashboard state={state} onNavigate={setPage} />
        )}
        {page === 'wallet' && (
          <Wallet
            state={state}
            addFunds={addFunds}
            transferFunds={transferFunds}
          />
        )}
        {page === 'payments' && (
          <Payments state={state} makePayment={makePayment} />
        )}
        {page === 'rewards' && (
          <Rewards state={state} redeemReward={redeemReward} />
        )}
        {page === 'merchants' && (
          <Merchants onNavigate={setPage} />
        )}
      </main>

      <BottomNav current={page} onChange={setPage} />
    </div>
  );
}
