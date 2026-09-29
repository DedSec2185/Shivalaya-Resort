import { useLocation, useNavigate } from 'react-router-dom';
import { Home, UtensilsCrossed, Compass, ClipboardList, User } from 'lucide-react';
import { useGuestAuth } from '../contexts/GuestAuthContext';

import { motion } from 'framer-motion';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, guest } = useGuestAuth();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed, path: '/menu' },
    { id: 'experiences', label: 'Experiences', icon: Compass, path: '/experiences' },
    { id: 'orders', label: 'My Orders', icon: ClipboardList, path: '/orders' },
    { 
      id: 'profile', 
      label: isLoggedIn ? (guest?.roomNumber ? `Room ${guest.roomNumber}` : 'Profile') : 'Login', 
      icon: User, 
      path: isLoggedIn ? '/profile' : '/login' 
    }
  ];

  return (
    <nav 
      className="bottom-nav-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '540px',
        margin: '0 auto',
        zIndex: 100,
        backgroundColor: 'rgba(255,252,244,0.95)',
        backdropFilter: 'blur(20px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
        borderTop: '1px solid rgba(173, 138, 63, 0.2)',
        boxShadow: '0 -4px 20px rgba(26, 46, 19, 0.06)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        display: 'flex',
        height: '62px',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        
        return (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              height: '100%',
              background: 'transparent',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              position: 'relative',
              WebkitTapHighlightColor: 'transparent',
              color: isActive ? 'var(--forest-deep)' : 'var(--sage)'
            }}
          >
            <div style={{
              position: 'relative',
              padding: '4px 14px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2px'
            }}>
              {isActive && (
                <motion.div
                  layoutId="activeBottomTab"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '20px',
                    background: 'rgba(44, 74, 34, 0.12)',
                    border: '1px solid rgba(44, 74, 34, 0.2)'
                  }}
                />
              )}
              <Icon size={19} color={isActive ? 'var(--forest-deep)' : 'var(--sage)'} style={{ position: 'relative', zIndex: 1 }} />
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--forest-deep)' : 'var(--sage)',
              letterSpacing: '0.02em',
              lineHeight: 1
            }}>
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
