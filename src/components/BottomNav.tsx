import type { Page } from '../types';

interface Props {
  current: Page;
  onChange: (p: Page) => void;
}

const NAV_ITEMS: { page: Page; icon: string; label: string }[] = [
  { page: 'dashboard', icon: '🏠', label: 'Inicio' },
  { page: 'wallet', icon: '👛', label: 'Wallet' },
  { page: 'payments', icon: '📲', label: 'Pagos' },
  { page: 'rewards', icon: '⭐', label: 'Premios' },
  { page: 'merchants', icon: '🏪', label: 'Comercios' },
];

export default function BottomNav({ current, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <button
          key={item.page}
          className={`nav-item${current === item.page ? ' active' : ''}`}
          onClick={() => onChange(item.page)}
          aria-label={item.label}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
