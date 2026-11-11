import { useState, useCallback } from 'react';
import type { AppState } from '../types';
import { REWARDS, getTier, TIER_THRESHOLDS } from '../data';
import Toast from '../components/Toast';

interface Props {
  state: AppState;
  redeemReward: (id: string, cost: number) => boolean;
}

export default function Rewards({ state, redeemReward }: Props) {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
  }, []);

  const tier = getTier(state.lifetimePoints);
  const tierCurrent = state.lifetimePoints;
  const tierNext = tier.max === Infinity ? tier.min : tier.max;
  const tierPct = tier.max === Infinity ? 100 : Math.min(100, ((tierCurrent - tier.min) / (tierNext - tier.min)) * 100);

  const handleRedeem = (rewardId: string, cost: number) => {
    if (confirming !== rewardId) {
      setConfirming(rewardId);
      return;
    }
    setConfirming(null);
    if (state.points < cost) {
      showToast('Puntos insuficientes para canjear', 'error');
      return;
    }
    const ok = redeemReward(rewardId, cost);
    if (ok) {
      showToast('¡Premio canjeado con éxito! 🎉');
    } else {
      showToast('No se pudo canjear el premio', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Mis Premios</h1>
        <p>Canjea tus puntos por beneficios</p>
      </div>

      {/* Points summary */}
      <div className="points-header">
        <div className="points-icon-big">⭐</div>
        <div>
          <div className="points-label">Puntos disponibles</div>
          <div className="points-value">{state.points.toLocaleString()}</div>
          <div className="points-sub">
            {tier.emoji} Nivel {tier.name} · {state.lifetimePoints.toLocaleString()} pts acumulados
          </div>
        </div>
      </div>

      {/* Tier progress */}
      <div className="tier-bar">
        <div className="flex justify-between items-center">
          <span style={{ fontWeight: 600 }}>Progreso de nivel</span>
          {tier.max !== Infinity && (
            <span className="text-muted">{tierCurrent} / {tierNext} pts</span>
          )}
        </div>
        <div className="tier-bar-track mt8">
          <div className="tier-bar-fill" style={{ width: `${tierPct}%` }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {TIER_THRESHOLDS.map(t => (
            <span
              key={t.name}
              className="badge"
              style={{
                background: state.lifetimePoints >= t.min ? `rgba(255,255,255,0.1)` : 'transparent',
                borderColor: state.lifetimePoints >= t.min ? t.color : 'var(--border)',
                border: '1px solid',
                color: state.lifetimePoints >= t.min ? '#fff' : 'var(--text-muted)',
              }}
            >
              {t.emoji} {t.name}
            </span>
          ))}
        </div>
      </div>

      {/* Rewards catalog */}
      <p className="section-title">Catálogo de premios</p>
      <div className="rewards-grid">
        {REWARDS.map(reward => {
          const redeemed = state.redeemedRewards.includes(reward.id);
          const canAfford = state.points >= reward.pointsCost;
          const isConfirming = confirming === reward.id;

          return (
            <div key={reward.id} className="reward-card" style={redeemed ? { opacity: 0.5 } : {}}>
              <div className="reward-icon">{reward.emoji}</div>
              <div className="reward-info">
                <div className="reward-name">{reward.name}</div>
                <div className="reward-desc">{reward.description}</div>
                {reward.merchant && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                    📍 {reward.merchant}
                  </div>
                )}
                <div className="reward-cost">
                  ⭐ {reward.pointsCost.toLocaleString()} puntos
                </div>
                {reward.stock !== null && !redeemed && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {reward.stock} disponibles
                  </div>
                )}
              </div>
              <div className="reward-action">
                {redeemed ? (
                  <span className="badge badge-green">✓ Canjeado</span>
                ) : (
                  <button
                    className={`btn btn-sm ${isConfirming ? 'btn-primary' : canAfford ? 'btn-accent' : 'btn-ghost'}`}
                    disabled={!canAfford}
                    onClick={() => handleRedeem(reward.id, reward.pointsCost)}
                  >
                    {isConfirming ? '¿Confirmar?' : canAfford ? 'Canjear' : 'Sin pts'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {confirming && (
        <div className="p16">
          <button className="btn btn-outline btn-full btn-sm" onClick={() => setConfirming(null)}>
            Cancelar
          </button>
        </div>
      )}

      <div style={{ height: 8 }} />

      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
