import { useState, useCallback } from 'react';
import type { Currency, AppState } from '../types';
import Toast from '../components/Toast';

interface Props {
  state: AppState;
  addFunds: (amount: number, currency: Currency) => void;
  transferFunds: (amount: number, currency: Currency, dest: string) => void;
}

type Tab = 'balance' | 'topup' | 'transfer' | 'history';

function fmt(n: number, dec = 2) {
  return n.toLocaleString('es-BO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)} días`;
}

const TOPUP_AMOUNTS_BOB = [50, 100, 200, 500, 1000];
const TOPUP_AMOUNTS_USDC = [5, 10, 20, 50, 100];

export default function Wallet({ state, addFunds, transferFunds }: Props) {
  const [tab, setTab] = useState<Tab>('balance');
  const [topupCurrency, setTopupCurrency] = useState<Currency>('BOB');
  const [topupAmount, setTopupAmount] = useState('');
  const [topupMethod, setTopupMethod] = useState('tigo');
  const [transferCurrency, setTransferCurrency] = useState<Currency>('BOB');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDest, setTransferDest] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
  }, []);

  const handleTopup = () => {
    const val = parseFloat(topupAmount);
    if (!val || val <= 0) return showToast('Ingresa un monto válido', 'error');
    if (topupCurrency === 'BOB' && val > 10000) return showToast('Máximo Bs. 10.000 por recarga', 'error');
    if (topupCurrency === 'USDC' && val > 1000) return showToast('Máximo $1.000 por recarga', 'error');
    addFunds(val, topupCurrency);
    setTopupAmount('');
    showToast(`Recarga de ${topupCurrency === 'BOB' ? `Bs. ${fmt(val)}` : `$${fmt(val)}`} realizada ✓`);
  };

  const handleTransfer = () => {
    const val = parseFloat(transferAmount);
    if (!val || val <= 0) return showToast('Ingresa un monto válido', 'error');
    if (!transferDest.trim()) return showToast('Ingresa el destinatario', 'error');
    const bal = transferCurrency === 'BOB' ? state.balanceBOB : state.balanceUSDC;
    if (val > bal) return showToast('Saldo insuficiente', 'error');
    transferFunds(val, transferCurrency, transferDest.trim());
    setTransferAmount('');
    setTransferDest('');
    showToast(`Transferencia enviada a ${transferDest}`);
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'balance', label: '💰 Saldo' },
    { key: 'topup', label: '➕ Recargar' },
    { key: 'transfer', label: '↗️ Enviar' },
    { key: 'history', label: '📋 Historial' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Mi Wallet</h1>
        <p>Gestiona tu dinero digital</p>
      </div>

      {/* Tabs */}
      <div className="p16" style={{ paddingBottom: 0 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab(t.key)}
              style={{ whiteSpace: 'nowrap' }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: SALDO */}
      {tab === 'balance' && (
        <div className="p16">
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="balance-label" style={{ color: 'var(--text-muted)', fontSize: 12 }}>Bolivianos</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--bob-color)' }}>
                  Bs. {fmt(state.balanceBOB)}
                </div>
              </div>
              <div style={{ fontSize: 36 }}>🇧🇴</div>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="balance-label" style={{ color: 'var(--text-muted)', fontSize: 12 }}>USDC (Dólar Digital)</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--usdc-color)' }}>
                  ${fmt(state.balanceUSDC)}
                </div>
                <div className="text-muted" style={{ marginTop: 4 }}>
                  ≈ Bs. {fmt(state.balanceUSDC * 6.9)} al tipo de cambio referencial
                </div>
              </div>
              <div style={{ fontSize: 36 }}>💎</div>
            </div>
          </div>

          <div className="card mt12">
            <div className="info-row">
              <span className="info-row-label">Total en cartera (BOB)</span>
              <span className="info-row-val" style={{ color: 'var(--bob-color)' }}>
                Bs. {fmt(state.balanceBOB + state.balanceUSDC * 6.9)}
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Puntos acumulados</span>
              <span className="info-row-val" style={{ color: 'var(--points-color)' }}>
                ⭐ {state.points.toLocaleString()}
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Total transacciones</span>
              <span className="info-row-val">{state.transactions.length}</span>
            </div>
          </div>

          <div className="card mt12" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
            <p style={{ fontSize: 12, color: 'var(--warn)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <span>⚡</span>
              <span>Esta es una aplicación de demostración. Los saldos y transacciones son <strong>simulados</strong> y no representan dinero real.</span>
            </p>
          </div>
        </div>
      )}

      {/* TAB: RECARGAR */}
      {tab === 'topup' && (
        <div className="p16">
          <div className="input-group">
            <label className="input-label">Moneda a recargar</label>
            <div className="currency-toggle">
              <button
                className={`currency-btn ${topupCurrency === 'BOB' ? 'active-bob' : ''}`}
                onClick={() => setTopupCurrency('BOB')}
              >
                🇧🇴 Bolivianos (BOB)
              </button>
              <button
                className={`currency-btn ${topupCurrency === 'USDC' ? 'active-usdc' : ''}`}
                onClick={() => setTopupCurrency('USDC')}
              >
                💎 USDC
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Método de recarga (simulado)</label>
            <select
              className="input"
              value={topupMethod}
              onChange={e => setTopupMethod(e.target.value)}
            >
              <option value="tigo">Tigo Money</option>
              <option value="yape">Yape</option>
              <option value="banco">Transferencia bancaria</option>
              <option value="efectivo">Efectivo en agente</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">
              Monto ({topupCurrency === 'BOB' ? 'Bs.' : 'USDC'})
            </label>
            <input
              className="input input-amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={topupAmount}
              onChange={e => setTopupAmount(e.target.value)}
              min="1"
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {(topupCurrency === 'BOB' ? TOPUP_AMOUNTS_BOB : TOPUP_AMOUNTS_USDC).map(a => (
              <button
                key={a}
                className="btn btn-ghost btn-sm"
                onClick={() => setTopupAmount(String(a))}
              >
                {topupCurrency === 'BOB' ? `Bs. ${a}` : `$${a}`}
              </button>
            ))}
          </div>

          <button className="btn btn-primary btn-full" onClick={handleTopup}>
            ➕ Confirmar Recarga (Simulada)
          </button>

          <div className="card mt12" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
            <p style={{ fontSize: 12, color: 'var(--warn)', display: 'flex', gap: 6 }}>
              <span>⚡</span>
              <span>Recarga simulada. No se procesará ningún pago real.</span>
            </p>
          </div>
        </div>
      )}

      {/* TAB: TRANSFERIR */}
      {tab === 'transfer' && (
        <div className="p16">
          <div className="input-group">
            <label className="input-label">Moneda</label>
            <div className="currency-toggle">
              <button
                className={`currency-btn ${transferCurrency === 'BOB' ? 'active-bob' : ''}`}
                onClick={() => setTransferCurrency('BOB')}
              >
                🇧🇴 BOB
              </button>
              <button
                className={`currency-btn ${transferCurrency === 'USDC' ? 'active-usdc' : ''}`}
                onClick={() => setTransferCurrency('USDC')}
              >
                💎 USDC
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Destinatario (teléfono o usuario)</label>
            <input
              className="input"
              type="text"
              placeholder="Ej: 70012345 o @usuario"
              value={transferDest}
              onChange={e => setTransferDest(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              Monto — Disponible: {transferCurrency === 'BOB' ? `Bs. ${fmt(state.balanceBOB)}` : `$${fmt(state.balanceUSDC)}`}
            </label>
            <input
              className="input input-amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={transferAmount}
              onChange={e => setTransferAmount(e.target.value)}
              min="1"
            />
          </div>

          <button className="btn btn-accent btn-full" onClick={handleTransfer}>
            ↗️ Enviar Transferencia (Simulada)
          </button>

          <div className="card mt12" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
            <p style={{ fontSize: 12, color: 'var(--warn)', display: 'flex', gap: 6 }}>
              <span>⚡</span>
              <span>Transferencia simulada. No se moverá dinero real.</span>
            </p>
          </div>
        </div>
      )}

      {/* TAB: HISTORIAL */}
      {tab === 'history' && (
        <div>
          <div className="tx-list mt12">
            {state.transactions.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>Sin movimientos</p>
              </div>
            )}
            {state.transactions.map(tx => {
              const isIn = tx.type === 'topup';
              const isReward = tx.type === 'reward';
              return (
                <div key={tx.id} className="tx-item">
                  <div className={`tx-icon ${isIn ? 'in' : isReward ? 'points' : 'out'}`}>
                    {tx.type === 'topup' ? '⬇️' : tx.type === 'reward' ? '🎁' : tx.type === 'transfer' ? '↗️' : '🛍️'}
                  </div>
                  <div className="tx-info">
                    <div className="tx-name">{tx.description}</div>
                    {tx.merchant && <div className="tx-meta">{tx.merchant}</div>}
                    <div className="tx-meta">{timeAgo(tx.date)}</div>
                    <div className="tx-sim-badge">⚡ Simulado</div>
                  </div>
                  <div className="tx-amount">
                    <div className={`tx-amount-val ${isIn ? 'in' : isReward ? '' : 'out'}`}>
                      {isIn ? '+' : isReward ? '' : '−'}
                      {tx.currency === 'BOB' ? `Bs. ${fmt(tx.amount)}` : `$${fmt(tx.amount)}`}
                    </div>
                    {tx.pointsEarned && tx.pointsEarned > 0 && (
                      <div className="tx-amount-sub">+{tx.pointsEarned} pts ⭐</div>
                    )}
                    {tx.pointsEarned && tx.pointsEarned < 0 && (
                      <div className="tx-amount-sub">{tx.pointsEarned} pts ⭐</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ height: 8 }} />
        </div>
      )}

      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
