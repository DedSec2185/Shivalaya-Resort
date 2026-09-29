import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LandingPage     from './pages/LandingPage'
import MenuPage        from './pages/MenuPage'
import OrderTrack      from './pages/OrderTrack'
import ExperiencesPage from './pages/ExperiencesPage'
import MyOrdersPage    from './pages/MyOrdersPage'
import LoginPage       from './pages/LoginPage'
import ProfilePage     from './pages/ProfilePage'
import RoomsPage       from './pages/RoomsPage'
import NotFound        from './pages/NotFound'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useQRSession } from './hooks/useQRSession'
import BottomNav       from './components/BottomNav'
import ActiveOrderBanner from './components/ActiveOrderBanner'
import { GuestAuthProvider } from './contexts/GuestAuthContext'
import HimalayanAtmosphere from './components/HimalayanAtmosphere'
import MountainSoundscape from './components/MountainSoundscape'
import PageTransition from './components/PageTransition'
import CustomCursor from './components/CustomCursor'
import ScrollProgress from './components/ScrollProgress'
import MountainParticles from './components/MountainParticles'

function AppLayout() {
  // Initialize QR session inside GuestAuthProvider
  useQRSession()

  const location = useLocation()
  const hideNav = location.pathname.startsWith('/order/') || location.pathname === '/login'
  
  return (
    <div className="mobile-app-container">
      <CustomCursor />
      <ScrollProgress />
      <MountainParticles />
      <HimalayanAtmosphere />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"            element={<PageTransition><LandingPage /></PageTransition>}  />
          <Route path="/menu"        element={<PageTransition><MenuPage /></PageTransition>}    />
          <Route path="/order/:id"   element={<PageTransition><OrderTrack /></PageTransition>}  />
          <Route path="/experiences" element={<PageTransition><ExperiencesPage /></PageTransition>} />
          <Route path="/orders"      element={<PageTransition><MyOrdersPage /></PageTransition>} />
          <Route path="/rooms"       element={<PageTransition><RoomsPage /></PageTransition>}   />
          <Route path="/login"       element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/profile"     element={<PageTransition><ProfilePage /></PageTransition>} />
          <Route path="*"            element={<PageTransition><NotFound /></PageTransition>}    />
        </Routes>
      </AnimatePresence>
      <MountainSoundscape />
      {!hideNav && <ActiveOrderBanner />}
      {!hideNav && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <GuestAuthProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </GuestAuthProvider>
    </ErrorBoundary>
  )
}
