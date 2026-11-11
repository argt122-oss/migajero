import type { AppState, Page } from '../types';
import { getTier } from '../data';

interface Props {
  state: AppState;
  onNavigate: (p: Page) => void;
}

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

export default function Dashboard({ state, onNavigate }: Props) {
  const tier = getTier(state.lifetimePoints);
  const tierCurrent = state.lifetimePoints;
  const tierNext = tier.max === Infinity ? tier.min : tier.max;
  const tierPct = tier.max === Infinity ? 100 : Math.min(100, ((tierCurrent - tier.min) / (tierNext - tier.min)) * 100);

  const recent = state.transactions.slice(0, 5);

  return (
    <div>
      {/* Balance Card */}
      <div className="balance-card">
        <div className="balance-label">Saldo disponible</div>
        <div className="balance-amount">
          Bs. {fmt(state.balanceBOB)}
          <span className="balance-currency">BOB</span>
        </div>
        <div className="balance-secondary">
          <div className="balance-item">
            <span className="balance-item-label">USDC</span>
            <span className="balance-item-val usdc">${fmt(state.balanceUSDC)}</span>
          </div>
          <div className="balance-sep" />
          <div className="balance-item">
            <span className="balance-item-label">Puntos</span>
            <span className="balance-item-val points">⭐ {state.points.toLocaleString()}</span>
          </div>
          <div className="balance-sep" />
          <div className="balance-item">
            <span className="balance-item-label">Nivel</span>
            <span className="balance-item-val">{tier.emoji} {tier.name}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-btn" onClick={() => onNavigate('wallet')}>
          <span className="qb-icon">➕</span>
          <span>Recargar</span>
        </button>
        <button className="quick-btn" onClick={() => onNavigate('payments')}>
          <span className="qb-icon">📲</span>
          <span>Pagar QR</span>
        </button>
        <button className="quick-btn" onClick={() => onNavigate('wallet')}>
          <span className="qb-icon">↗️</span>
          <span>Enviar</span>
        </button>
        <button className="quick-btn" onClick={() => onNavigate('rewards')}>
          <span className="qb-icon">🎁</span>
          <span>Premios</span>
        </button>
      </div>

      {/* Tier progress */}
      <div className="tier-bar">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold">{tier.emoji} Nivel {tier.name}</span>
          {tier.max !== Infinity && (
            <span className="text-muted">{tierCurrent} / {tierNext} pts</span>
          )}
        </div>
        <div className="tier-bar-track mt8">
          <div className="tier-bar-fill" style={{ width: `${tierPct}%` }} />
        </div>
        {tier.max !== Infinity && (
          <p className="text-muted mt8">
            Faltan {(tierNext - tierCurrent).toLocaleString()} puntos para nivel superior
          </p>
        )}
      </div>

      {/* Últimas transacciones */}
      <p className="section-title">Últimas transacciones</p>
      <div className="tx-list">
        {recent.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🧾</div>
            <p>Sin movimientos aún</p>
          </div>
        )}
        {recent.map(tx => {
          const isIn = tx.type === 'topup';
          const isReward = tx.type === 'reward';
          return (
            <div key={tx.id} className="tx-item">
              <div className={`tx-icon ${isIn ? 'in' : isReward ? 'points' : 'out'}`}>
                {tx.type === 'topup' ? '⬇️' : tx.type === 'reward' ? '🎁' : tx.type === 'transfer' ? '↗️' : '🛍️'}
              </div>
              <div className="tx-info">
                <div className="tx-name">{tx.description}</div>
                <div className="tx-meta">{timeAgo(tx.date)}</div>
                <div className="tx-sim-badge">⚡ Simulado</div>
              </div>
              <div className="tx-amount">
                <div className={`tx-amount-val ${isIn ? 'in' : 'out'}`}>
                  {isIn ? '+' : isReward ? '' : '−'}
                  {tx.currency === 'BOB' ? `Bs. ${fmt(tx.amount)}` : `$${fmt(tx.amount)}`}
                </div>
                {tx.pointsEarned && tx.pointsEarned > 0 && (
                  <div className="tx-amount-sub">+{tx.pointsEarned} pts ⭐</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {state.transactions.length > 5 && (
        <div className="p16">
          <button className="btn btn-outline btn-full btn-sm" onClick={() => onNavigate('wallet')}>
            Ver todos los movimientos
          </button>
        </div>
      )}

      <div style={{ height: 8 }} />
    </div>
  );
}
