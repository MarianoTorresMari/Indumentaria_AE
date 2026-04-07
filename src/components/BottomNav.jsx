import { ShoppingCart, Package, ClipboardList, Settings } from 'lucide-react'

const tabs = [
  { id: 'vender', label: 'Vender', icon: ShoppingCart },
  { id: 'stock', label: 'Stock', icon: Package },
  { id: 'historial', label: 'Historial', icon: ClipboardList },
  { id: 'admin', label: 'Admin', icon: Settings },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 0 env(safe-area-inset-bottom, 8px)',
      zIndex: 1000,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
    }}>
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: isActive ? 'var(--primary)' : 'var(--text-light)',
              fontFamily: 'inherit',
              fontSize: '12px',
              fontWeight: isActive ? 700 : 500,
              transition: 'all 0.2s',
              borderRadius: '12px',
              minWidth: '72px',
            }}
          >
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '32px',
              borderRadius: '10px',
              background: isActive ? 'var(--primary-light)' : 'transparent',
              transition: 'background 0.2s',
            }}>
              <Icon size={22} />
            </span>
            {label}
          </button>
        )
      })}
    </nav>
  )
}
