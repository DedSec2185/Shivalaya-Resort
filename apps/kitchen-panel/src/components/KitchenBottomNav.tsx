import React from 'react'
import { UtensilsCrossed, CheckCircle2, XCircle, Package, User } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

export type Tab = 'orders' | 'completed' | 'cancelled' | 'stock' | 'profile'

interface KitchenBottomNavProps {
  activeTab: Tab
  onSelectTab: (tab: Tab) => void
  newOrdersCount: number
}

export default function KitchenBottomNav({
  activeTab,
  onSelectTab,
  newOrdersCount
}: KitchenBottomNavProps) {
  const { t } = useLanguage()

  const navItems: Array<{ id: Tab; label: string; icon: React.ReactNode; badge?: number | null }> = [
    {
      id: 'orders',
      label: t('tab_orders').split(' ')[0], // Compact label on mobile
      icon: <UtensilsCrossed size={19} />,
      badge: newOrdersCount > 0 ? newOrdersCount : null
    },
    {
      id: 'completed',
      label: t('tab_completed').split(' ')[0],
      icon: <CheckCircle2 size={19} />
    },
    {
      id: 'cancelled',
      label: t('tab_cancelled').split(' ')[0],
      icon: <XCircle size={19} />
    },
    {
      id: 'stock',
      label: t('tab_stock').split(' ')[0],
      icon: <Package size={19} />
    },
    {
      id: 'profile',
      label: t('tab_profile').split(' ')[0],
      icon: <User size={19} />
    }
  ]

  return (
    <nav className="mobile-kds-bottom-nav">
      {navItems.map(item => {
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              height: '100%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: '6px 2px',
              color: isActive ? 'var(--forest-deep)' : 'var(--sage)',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px 14px',
                borderRadius: '16px',
                background: isActive ? 'rgba(44, 74, 34, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(44, 74, 34, 0.2)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              {item.icon}

              {item.badge != null && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--rust)',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 800,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>

            <span
              style={{
                fontSize: '10px',
                fontWeight: isActive ? 800 : 500,
                letterSpacing: '0.2px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
