import { useState } from 'react';
import { MERCHANTS } from '../data';
import type { Page } from '../types';

interface Props {
  onNavigate: (p: Page) => void;
}

const CITIES = ['Todas', 'La Paz', 'Santa Cruz', 'Cochabamba'];

export default function Merchants({ onNavigate }: Props) {
  const [city, setCity] = useState('Todas');
  const [search, setSearch] = useState('');

  const filtered = MERCHANTS.filter(m => {
    const matchCity = city === 'Todas' || m.city === city;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
      || m.category.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchSearch;
  });

  return (
    <div>
      <div className="page-header">
        <h1>Comercios Afiliados</h1>
        <p>Paga con Migajero y gana puntos</p>
      </div>

      {/* Search */}
      <div className="p16" style={{ paddingBottom: 0 }}>
        <input
          className="input"
          placeholder="🔍 Buscar comercio o categoría..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* City filter */}
      <div className="p16" style={{ paddingBottom: 0 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {CITIES.map(c => (
            <button
              key={c}
              className={`btn btn-sm ${city === c ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setCity(c)}
              style={{ whiteSpace: 'nowrap' }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="p16" style={{ paddingBottom: 0 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="card-sm" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary-light)' }}>
              {MERCHANTS.length}
            </div>
            <div className="text-muted">Comercios</div>
          </div>
          <div className="card-sm" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
              {MERCHANTS.filter(m => m.promo).length}
            </div>
            <div className="text-muted">Con promos</div>
          </div>
          <div className="card-sm" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--points-color)' }}>
              3×
            </div>
            <div className="text-muted">Máx. puntos</div>
          </div>
        </div>
      </div>

      {/* Promo banner */}
      <div className="p16" style={{ paddingBottom: 0 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(108,60,225,0.15) 100%)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 28 }}>🎯</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Semana de puntos dobles</div>
            <div className="text-muted">Paga en Café del Prado y Los Lomitos y gana el doble</div>
          </div>
        </div>
      </div>

      {/* Merchant list */}
      <p className="section-title">
        {filtered.length} comercio{filtered.length !== 1 ? 's' : ''}
        {city !== 'Todas' ? ` en ${city}` : ''}
      </p>

      <div className="merchant-grid">
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <p>No se encontraron comercios</p>
          </div>
        )}
        {filtered.map(merchant => (
          <div key={merchant.id} className="merchant-card">
            <div
              className="merchant-logo"
              style={{ background: merchant.bgColor }}
            >
              {merchant.emoji}
            </div>
            <div className="merchant-info">
              <div className="merchant-name">{merchant.name}</div>
              <div className="merchant-cat">
                {merchant.category} · {merchant.city}
              </div>
              {merchant.promo && (
                <div className="merchant-promo">
                  🎯 {merchant.promo}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-green">✓ Afiliado</span>
                {merchant.pointsMultiplier > 1 && (
                  <span className="badge badge-yellow">
                    {merchant.pointsMultiplier}× puntos
                  </span>
                )}
              </div>
            </div>
            <div className="merchant-pts">
              <div className="merchant-pts-val">{merchant.pointsMultiplier}×</div>
              <div className="merchant-pts-label">puntos</div>
              <button
                className="btn btn-sm btn-primary"
                style={{ marginTop: 8, fontSize: 11, padding: '6px 10px' }}
                onClick={() => onNavigate('payments')}
              >
                Pagar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}
