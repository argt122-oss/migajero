import { useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Currency, AppState } from '../types';
import { MERCHANTS } from '../data';
import Toast from '../components/Toast';

interface Props {
  state: AppState;
  makePayment: (amount: number, currency: Currency, merchant: string, multiplier?: number) => { ok: boolean; points: number };
}

type Step = 'menu' | 'receive' | 'pay-select' | 'pay-confirm' | 'pay-success';

function fmt(n: number, dec = 2) {
  return n.toLocaleString('es-BO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export default function Payments({ state, makePayment }: Props) {
  const [step, setStep] = useState<Step>('menu');
  const [payAmount, setPayAmount] = useState('');
  const [payCurrency, setPayCurrency] = useState<Currency>('BOB');
  const [selectedMerchant, setSelectedMerchant] = useState(MERCHANTS[0]);
  const [lastResult, setLastResult] = useState<{ points: number; amount: number; currency: Currency } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
  }, []);

  const myQrValue = `migajero://receive?user=demo&wallet=MJR-7291-DEMO`;

  const handlePay = () => {
    const val = parseFloat(payAmount);
    if (!val || val <= 0) return showToast('Ingresa un monto válido', 'error');
    if (val < 0.5) return showToast('Monto mínimo: Bs. 0.50', 'error');

    const bal = payCurrency === 'BOB' ? state.balanceBOB : state.balanceUSDC;
    if (val > bal) return showToast('Saldo insuficiente', 'error');

    const result = makePayment(val, payCurrency, selectedMerchant.name, selectedMerchant.pointsMultiplier);
    if (result.ok) {
      setLastResult({ points: result.points, amount: val, currency: payCurrency });
      setStep('pay-success');
    } else {
      showToast('Error al procesar el pago', 'error');
    }
  };

  const reset = () => {
    setStep('menu');
    setPayAmount('');
    setLastResult(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Pagos QR</h1>
        <p>Paga o recibe dinero con tu código QR</p>
      </div>

      {/* MENU */}
      {step === 'menu' && (
        <div className="p16">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              className="card"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 16, alignItems: 'center' }}
              onClick={() => setStep('receive')}
            >
              <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(108,60,225,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                📲
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>Mostrar mi QR</div>
                <div className="text-muted">Genera tu código para recibir pagos</div>
              </div>
              <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 20 }}>›</div>
            </button>

            <button
              className="card"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 16, alignItems: 'center' }}
              onClick={() => setStep('pay-select')}
            >
              <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                🛍️
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>Pagar en comercio</div>
                <div className="text-muted">Simula un pago en un comercio afiliado</div>
              </div>
              <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 20 }}>›</div>
            </button>
          </div>

          <div className="card mt16" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
            <p style={{ fontSize: 12, color: 'var(--warn)', display: 'flex', gap: 6 }}>
              <span>⚡</span>
              <span>Todos los pagos son simulados. No se procesa dinero real.</span>
            </p>
          </div>
        </div>
      )}

      {/* QR DE RECEPCIÓN */}
      {step === 'receive' && (
        <div className="p16">
          <div className="qr-container">
            <div className="qr-label" style={{ fontSize: 15, fontWeight: 600 }}>Mi código de pago</div>
            <div className="qr-wrapper">
              <QRCodeSVG
                value={myQrValue}
                size={200}
                level="M"
              />
            </div>
            <div className="qr-label">Muestra este código al comercio o contacto</div>
            <div className="qr-id">{myQrValue.split('?')[1]}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              <span className="badge badge-green">✓ Activo</span>
              <span className="badge badge-purple">⚡ Demo</span>
            </div>
          </div>

          <div className="card mt16">
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
              En la versión real, este QR estará vinculado a tu wallet Migajero y será compatible con Yape, Tigo Money y apps bancarias bolivianas.
            </p>
          </div>

          <button className="btn btn-outline btn-full mt16" onClick={() => setStep('menu')}>
            ← Volver
          </button>
        </div>
      )}

      {/* SELECCIONAR COMERCIO Y MONTO */}
      {step === 'pay-select' && (
        <div className="p16">
          <div className="input-group">
            <label className="input-label">Comercio afiliado</label>
            <select
              className="input"
              value={selectedMerchant.id}
              onChange={e => {
                const m = MERCHANTS.find(m => m.id === e.target.value);
                if (m) setSelectedMerchant(m);
              }}
            >
              {MERCHANTS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.emoji} {m.name} — {m.city}
                </option>
              ))}
            </select>
          </div>

          {/* Info comercio */}
          <div className="card-sm mt8 mb16" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: selectedMerchant.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {selectedMerchant.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{selectedMerchant.name}</div>
              <div className="text-muted">{selectedMerchant.category} · {selectedMerchant.city}</div>
              {selectedMerchant.promo && (
                <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 3 }}>
                  🎯 {selectedMerchant.promo}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--points-color)' }}>
                {selectedMerchant.pointsMultiplier}×
              </div>
              <div className="text-muted" style={{ fontSize: 10 }}>puntos</div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Pagar con</label>
            <div className="currency-toggle">
              <button
                className={`currency-btn ${payCurrency === 'BOB' ? 'active-bob' : ''}`}
                onClick={() => setPayCurrency('BOB')}
              >
                🇧🇴 Bolivianos — Bs. {fmt(state.balanceBOB)}
              </button>
              <button
                className={`currency-btn ${payCurrency === 'USDC' ? 'active-usdc' : ''}`}
                onClick={() => setPayCurrency('USDC')}
              >
                💎 USDC — ${fmt(state.balanceUSDC)}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">
              Monto a pagar ({payCurrency === 'BOB' ? 'Bs.' : 'USDC'})
            </label>
            <input
              className="input input-amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
              min="0.5"
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button className="btn btn-outline btn-full" onClick={() => setStep('menu')}>
              ← Volver
            </button>
            <button
              className="btn btn-primary btn-full"
              onClick={() => setStep('pay-confirm')}
              disabled={!payAmount || parseFloat(payAmount) <= 0}
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMAR PAGO */}
      {step === 'pay-confirm' && (
        <div className="p16">
          <div className="qr-container" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 48 }}>{selectedMerchant.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{selectedMerchant.name}</div>
            <div className="text-muted">{selectedMerchant.category} · {selectedMerchant.city}</div>
          </div>

          <div className="card">
            <div className="info-row">
              <span className="info-row-label">Monto</span>
              <span className="info-row-val" style={{ fontSize: 20, color: payCurrency === 'BOB' ? 'var(--bob-color)' : 'var(--usdc-color)' }}>
                {payCurrency === 'BOB' ? `Bs. ${fmt(parseFloat(payAmount) || 0)}` : `$${fmt(parseFloat(payAmount) || 0)}`}
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Moneda</span>
              <span className="info-row-val">{payCurrency === 'BOB' ? '🇧🇴 Bolivianos' : '💎 USDC'}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Puntos a ganar</span>
              <span className="info-row-val" style={{ color: 'var(--points-color)' }}>
                ⭐ ~{Math.round((payCurrency === 'BOB' ? parseFloat(payAmount) : parseFloat(payAmount) * 6.9) * selectedMerchant.pointsMultiplier || 0)} pts
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Multiplicador</span>
              <span className="info-row-val">{selectedMerchant.pointsMultiplier}× puntos</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Tipo de transacción</span>
              <span><span className="badge badge-yellow">⚡ Simulado</span></span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn btn-outline btn-full" onClick={() => setStep('pay-select')}>
              ← Modificar
            </button>
            <button className="btn btn-primary btn-full" onClick={handlePay}>
              ✓ Confirmar Pago
            </button>
          </div>
        </div>
      )}

      {/* PAGO EXITOSO */}
      {step === 'pay-success' && lastResult && (
        <div className="success-screen">
          <div className="success-icon">✅</div>
          <div className="success-title">¡Pago realizado!</div>
          <div className="success-sub">Tu pago en {selectedMerchant.name} fue procesado</div>

          <div className="card" style={{ width: '100%', marginTop: 16 }}>
            <div className="info-row">
              <span className="info-row-label">Monto pagado</span>
              <span className="info-row-val" style={{ color: lastResult.currency === 'BOB' ? 'var(--bob-color)' : 'var(--usdc-color)' }}>
                {lastResult.currency === 'BOB' ? `Bs. ${fmt(lastResult.amount)}` : `$${fmt(lastResult.amount)}`}
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Comercio</span>
              <span className="info-row-val">{selectedMerchant.emoji} {selectedMerchant.name}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Puntos ganados</span>
              <span className="info-row-val" style={{ color: 'var(--points-color)' }}>
                +{lastResult.points} ⭐
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Total de puntos</span>
              <span className="info-row-val">{state.points.toLocaleString()} ⭐</span>
            </div>
          </div>

          <div className="card mt12" style={{ width: '100%', background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.3)' }}>
            <p style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <span>⚡</span>
              <span>Transacción simulada. No se movió dinero real.</span>
            </p>
          </div>

          <button className="btn btn-primary btn-full mt16" onClick={reset}>
            Realizar otro pago
          </button>
        </div>
      )}

      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
