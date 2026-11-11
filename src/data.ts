import type { Merchant, Reward } from './types';

export const MERCHANTS: Merchant[] = [
  {
    id: 'm1',
    name: 'Super Chang',
    category: 'Supermercado',
    emoji: '🛒',
    bgColor: 'rgba(34,197,94,0.15)',
    pointsMultiplier: 1,
    city: 'La Paz',
    promo: 'Paga con USDC y gana el doble',
  },
  {
    id: 'm2',
    name: 'Café del Prado',
    category: 'Cafetería',
    emoji: '☕',
    bgColor: 'rgba(245,158,11,0.15)',
    pointsMultiplier: 2,
    city: 'La Paz',
    promo: '2× puntos todos los martes',
  },
  {
    id: 'm3',
    name: 'Los Lomitos',
    category: 'Restaurante',
    emoji: '🥩',
    bgColor: 'rgba(239,68,68,0.15)',
    pointsMultiplier: 2,
    city: 'Santa Cruz',
    promo: '2× puntos en almuerzo',
  },
  {
    id: 'm4',
    name: 'FarmaPlus',
    category: 'Farmacia',
    emoji: '💊',
    bgColor: 'rgba(59,130,246,0.15)',
    pointsMultiplier: 1.5,
    city: 'Cochabamba',
    promo: '1.5× puntos en medicamentos',
  },
  {
    id: 'm5',
    name: 'ElectroZona',
    category: 'Electrónica',
    emoji: '📱',
    bgColor: 'rgba(108,60,225,0.15)',
    pointsMultiplier: 3,
    city: 'Santa Cruz',
    promo: '3× puntos en accesorios',
  },
  {
    id: 'm6',
    name: 'Librería Génesis',
    category: 'Librería',
    emoji: '📚',
    bgColor: 'rgba(16,185,129,0.15)',
    pointsMultiplier: 1,
    city: 'La Paz',
  },
];

export const REWARDS: Reward[] = [
  {
    id: 'r1',
    name: '10% descuento en Super Chang',
    description: 'Válido en tu próxima compra mayor a Bs. 50',
    emoji: '🏷️',
    pointsCost: 150,
    type: 'discount',
    merchant: 'Super Chang',
    stock: 20,
  },
  {
    id: 'r2',
    name: 'Café gratis',
    description: 'Un café americano en Café del Prado',
    emoji: '☕',
    pointsCost: 100,
    type: 'product',
    merchant: 'Café del Prado',
    stock: 50,
  },
  {
    id: 'r3',
    name: 'Cashback Bs. 10',
    description: 'Se acredita directamente a tu wallet',
    emoji: '💰',
    pointsCost: 300,
    type: 'cashback',
    stock: null,
  },
  {
    id: 'r4',
    name: '5% descuento en FarmaPlus',
    description: 'En cualquier compra, sin monto mínimo',
    emoji: '💊',
    pointsCost: 200,
    type: 'discount',
    merchant: 'FarmaPlus',
    stock: 30,
  },
  {
    id: 'r5',
    name: 'Almuerzo ejecutivo gratis',
    description: 'Para 1 persona en Los Lomitos',
    emoji: '🍽️',
    pointsCost: 500,
    type: 'product',
    merchant: 'Los Lomitos',
    stock: 10,
  },
  {
    id: 'r6',
    name: 'Cashback 1 USDC',
    description: 'Se acredita en USDC a tu wallet',
    emoji: '💎',
    pointsCost: 450,
    type: 'cashback',
    stock: null,
  },
];

export const TIER_THRESHOLDS = [
  { name: 'Bronce', min: 0, max: 500, color: '#CD7F32', emoji: '🥉' },
  { name: 'Plata', min: 500, max: 1500, color: '#C0C0C0', emoji: '🥈' },
  { name: 'Oro', min: 1500, max: 3000, color: '#FFD700', emoji: '🥇' },
  { name: 'Platino', min: 3000, max: Infinity, color: '#E5E4E2', emoji: '💎' },
];

export function getTier(lifetimePoints: number) {
  return TIER_THRESHOLDS.find(t => lifetimePoints >= t.min && lifetimePoints < t.max)
    ?? TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1];
}
