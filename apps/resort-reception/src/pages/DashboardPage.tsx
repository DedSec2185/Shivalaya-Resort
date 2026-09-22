import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { 
  Users, 
  ShoppingBag, 
  UtensilsCrossed, 
  BarChart3, 
  LogOut, 
  Plus, 
  Search, 
  UserCheck, 
  X,
  Compass,
  Calendar,
  Settings,
  ChevronDown,
  ChevronUp,
  FileText,
  Menu as MenuIcon
} from 'lucide-react'

// Define types matching DB
interface Room {
  id: string
  room_number: string
  room_type?: string
  floor?: number
  is_occupied?: boolean
  current_guest_id?: string | null
}

interface ActiveGuest {
  id: string
  guest_name: string
  room_number: string
  check_in_date: string
  expected_checkout: string
  running_tab: number
  guest_phone: string
  number_of_adults: number
  notes?: string
}

interface MenuItem {
  id: string
  name: string
  category_name?: string
  category_id?: string
  price: number
  is_available: boolean
}

interface Category {
  id: string
  name: string
  available_from: string
  available_until: string
}

interface OrderHistoryItem {
  id: string
  order_number: string
  guest_name: string
  guest_phone: string
  room_number?: string
  table_number?: string
  service_type: string
  subtotal: number
  tax_amount?: number
  grand_total?: number
  payment_status?: string
  payment_method?: string
  status: string
  created_at: string
  items: Array<{ name: string; qty: number; price: number; variant_label?: string | null }>
}

interface FolioLine {
  id: string
  charge_at: string
  charge_type: string
  reference_number: string
  description: string
  amount: number
  status: string
  line_items?: any
  detail?: string
}

interface ActivityBooking {
  id: string
  booking_number: string
  activity_id: string
  slot_id: string
  booking_date: string
  guest_id: string | null
  room_id: string | null
  guest_name: string
  guest_phone: string
  number_of_guests: number
  total_amount: number
  status: string
  special_requests: string | null
  assigned_staff_name?: string | null
  assigned_staff?: string | null
  staff_instructions: string | null
  created_at: string
  activity_name?: string
  slot_label?: string
  room_number?: string
}

interface ActivityItem {
  id: string
  name: string
  description: string
  pricing_type: 'per_person' | 'per_setup' | 'per_session'
  price_per_person: number | null
  price_per_setup: number | null
  price_per_session: number | null
  requires_balcony: boolean
  is_available: boolean
  min_advance_hours: number
  max_capacity_per_slot: number
}

interface ActivitySlot {
  id: string
  activity_id: string
  label: string
  start_time: string
  end_time: string
  is_active: boolean
  days_available: number[]
  max_capacity_override: number | null
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { staff, logout, loading: authLoading } = useAuth()
  
  // Tabs: 'guests' | 'orders' | 'menu' | 'activities' | 'activity_mgmt' | 'analytics'
  const [activeTab, setActiveTab] = useState<'guests' | 'orders' | 'menu' | 'activities' | 'activity_mgmt' | 'analytics' | 'inventory'>('guests')
  
  const resortId = staff?.resort_id || '00000000-0000-0000-0000-000000000001'

  // Global Refresh States
  const [refreshGuests, setRefreshGuests] = useState(0)
  const [refreshOrders, setRefreshOrders] = useState(0)
  const [refreshMenu, setRefreshMenu] = useState(0)
  const [refreshActivities, setRefreshActivities] = useState(0)

  // Pending activities count badge
  const [pendingActivitiesCount, setPendingActivitiesCount] = useState(0)

  // Mobile navigation drawer toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !staff) {
      navigate('/login')
    }
  }, [staff, authLoading, navigate])

  // Realtime listener for pending activities badge
  useEffect(() => {
    if (!staff) return

    async function loadPendingCount() {
      const { count } = await supabase
        .from('activity_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      setPendingActivitiesCount(count || 0)
    }
    loadPendingCount()

    const channel = supabase
      .channel('activities_badge_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_bookings' },
        () => {
          loadPendingCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [staff])

  if (authLoading || !staff) {
    return (
      <div className="rcp-layout" style={{ alignItems: 'center', justifyContent: 'center', color: 'var(--sage)' }}>
        Loading receptionist panel...
      </div>
    )
  }

  return (
    <div className="rcp-layout">
      
      {/* ── Mobile Topbar (Sticky on mobile screens) ── */}
      <header className="rcp-mobile-topbar print:hidden">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            style={{ 
              background: 'rgba(255,255,255,0.08)', 
              border: '1px solid rgba(217,189,117,0.3)', 
              borderRadius: '8px', 
              padding: '6px', 
              color: '#FFF', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer' 
            }}
            aria-label="Open Navigation Drawer"
          >
            <MenuIcon size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="rcp-sidebar-logo" style={{ width: '32px', height: '32px', fontSize: '15px' }}>
              S
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, fontFamily: 'Fraunces, serif', color: '#FFF', lineHeight: 1.1 }}>
                Shivalaya Desk
              </div>
              <div style={{ fontSize: '9px', color: 'var(--brass-light)', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono, monospace' }}>
                {staff.name} · {staff.role}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={logout}
            style={{ 
              background: 'rgba(255,255,255,0.08)', 
              border: '1px solid rgba(255,255,255,0.15)', 
              borderRadius: '8px', 
              padding: '6px', 
              color: '#FFF', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer' 
            }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── Mobile Horizontal Tab Switcher ── */}
      <div className="rcp-mobile-tabs-bar print:hidden">
        {[
          { id: 'guests', label: 'Guests', icon: Users },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'activities', label: `Activities ${pendingActivitiesCount > 0 ? `(${pendingActivitiesCount})` : ''}`, icon: Compass },
          { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
          { id: 'activity_mgmt', label: 'Slots', icon: Settings },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'inventory', label: 'Inventory', icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setActiveTab(tab.id as any); setMobileSidebarOpen(false); }}
            className={`rcp-mobile-tab-pill ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Mobile Drawer Backdrop Overlay ── */}
      {mobileSidebarOpen && (
        <div 
          className="rcp-sidebar-backdrop print:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar Navigation (Fixed on Desktop, Drawer on Mobile) ── */}
      <aside className={`rcp-sidebar print:hidden ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        
        <div>
          {/* Logo Header with Mobile Close Button */}
          <div className="rcp-sidebar-brand" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="rcp-sidebar-logo">
                S
              </div>
              <div>
                <h2 className="rcp-sidebar-title">
                  Shivalaya Resort
                </h2>
                <span className="rcp-sidebar-subtitle">
                  Reception Desk
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: mobileSidebarOpen ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Close Navigation"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="rcp-sidebar-nav">
            <button
              onClick={() => { setActiveTab('guests'); setMobileSidebarOpen(false); }}
              className={`sidebar-nav-item ${activeTab === 'guests' ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Guests & Stays</span>
            </button>

            <button
              onClick={() => { setActiveTab('orders'); setMobileSidebarOpen(false); }}
              className={`sidebar-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <ShoppingBag size={18} />
              <span>Orders History</span>
            </button>

            <button
              onClick={() => { setActiveTab('activities'); setMobileSidebarOpen(false); }}
              className={`sidebar-nav-item ${activeTab === 'activities' ? 'active' : ''}`}
              style={{ justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Compass size={18} />
                <span>Booked Activities</span>
              </div>
              {pendingActivitiesCount > 0 && (
                <span style={{ background: '#E8A020', color: '#FFF', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>
                  {pendingActivitiesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('menu'); setMobileSidebarOpen(false); }}
              className={`sidebar-nav-item ${activeTab === 'menu' ? 'active' : ''}`}
            >
              <UtensilsCrossed size={18} />
              <span>Menu Control</span>
            </button>

            <button
              onClick={() => { setActiveTab('activity_mgmt'); setMobileSidebarOpen(false); }}
              className={`sidebar-nav-item ${activeTab === 'activity_mgmt' ? 'active' : ''}`}
            >
              <Settings size={18} />
              <span>Manage Activities</span>
            </button>

            <button
              onClick={() => { setActiveTab('analytics'); setMobileSidebarOpen(false); }}
              className={`sidebar-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              <span>Analytics Board</span>
            </button>
            <button
              onClick={() => { setActiveTab('inventory'); setMobileSidebarOpen(false); }}
              className={`sidebar-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            >
              <FileText size={18} />
              <span>Inventory & CRM</span>
            </button>
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="rcp-sidebar-footer">
          <div className="rcp-sidebar-user">
            <div style={{ overflow: 'hidden' }}>
              <div className="rcp-sidebar-user-name">
                {staff.name}
              </div>
              <div className="rcp-sidebar-user-role">
                {staff.role}
              </div>
            </div>
            <button
              onClick={logout}
              className="rcp-sidebar-logout"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

      </aside>

      {/* Main content body */}
      <main className="rcp-main">
        
        {/* Header Title depending on tab (hidden on print) */}
        <div className="rcp-page-header print:hidden">
          <div>
            <h1 className="rcp-page-title">
              {activeTab === 'guests' && 'Guests Stays Ledger'}
              {activeTab === 'orders' && 'Food Orders History'}
              {activeTab === 'activities' && 'Booked Activities ledger'}
              {activeTab === 'menu' && 'Panache Menu Editor'}
              {activeTab === 'activity_mgmt' && 'Experiences & Slots Control'}
              {activeTab === 'analytics' && 'Operational Analytics'}
              {activeTab === 'inventory' && 'Inventory & Stock Ledger'}
            </h1>
            <p className="rcp-page-subtitle">
              {activeTab === 'guests' && 'Perform room check-ins, guest checkouts, and manage running folios.'}
              {activeTab === 'orders' && 'Lookup past reservations, manage food states, and enter desk orders.'}
              {activeTab === 'activities' && 'Confirm pending adventure requests and review daily guide schedules.'}
              {activeTab === 'menu' && 'Toggle kitchen item stocks and configure category available hours.'}
              {activeTab === 'activity_mgmt' && 'Add activity types, toggle inventory, and adjust hourly limits.'}
              {activeTab === 'analytics' && 'Monitor daily revenues, transaction counts, and kitchen leaderboard.'}
              {activeTab === 'inventory' && 'Track current stock levels, log deliveries, and monitor low-stock alerts.'}
            </p>
          </div>
        </div>

        {/* Tab contents */}
        {activeTab === 'guests' && (
          <GuestsTab 
            resortId={resortId} 
            refreshKey={refreshGuests} 
            triggerRefresh={() => setRefreshGuests(k => k + 1)} 
          />
        )}
        {activeTab === 'orders' && (
          <OrdersTab 
            resortId={resortId} 
            refreshKey={refreshOrders} 
            triggerRefresh={() => {
              setRefreshOrders(k => k + 1)
              setRefreshGuests(k => k + 1) // running tab depends on orders!
            }} 
          />
        )}
        {activeTab === 'activities' && (
          <ActivitiesTab 
            resortId={resortId} 
            refreshKey={refreshActivities} 
            triggerRefresh={() => {
              setRefreshActivities(k => k + 1)
              setRefreshGuests(k => k + 1) // running tab depends on activities!
            }}
          />
        )}
        {activeTab === 'menu' && (
          <MenuTab 
            resortId={resortId} 
            refreshKey={refreshMenu} 
            triggerRefresh={() => setRefreshMenu(k => k + 1)} 
          />
        )}
        {activeTab === 'activity_mgmt' && (
          <ActivityMgmtTab 
            resortId={resortId} 
          />
        )}
        {activeTab === 'analytics' && <AnalyticsTab resortId={resortId} />}
        {activeTab === 'inventory' && <InventoryLedgerTab />}

      </main>

    </div>
  )
}

/* ==========================================================================
   TABS COMPONENTS
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. GUESTS & STAYS TAB (Upgraded with aggregated experiences + printable folio)
   -------------------------------------------------------------------------- */
interface GuestsTabProps {
  resortId: string
  refreshKey: number
  triggerRefresh: () => void
}

function GuestsTab({ resortId, refreshKey, triggerRefresh }: GuestsTabProps) {
  const [guests, setGuests] = useState<ActiveGuest[]>([])
  const [unoccupiedRooms, setUnoccupiedRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  
  // Check-out Drawer State
  const [checkoutGuest, setCheckoutGuest] = useState<ActiveGuest | null>(null)
  const [folioLines, setFolioLines] = useState<FolioLine[]>([])
  const [folioTotal, setFolioTotal] = useState(0)
  const [loadingFolio, setLoadingFolio] = useState(false)
  const [submittingCheckout, setSubmittingCheckout] = useState(false)
  
  // Accordion status for folio items list
  const [expandedFoodOrder, setExpandedFoodOrder] = useState<string | null>(null)

  // Check-in Form State
  const [roomFormId, setRoomFormId] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [adults, setAdults] = useState(1)
  const [checkoutDate, setCheckoutDate] = useState('')
  const [checkinNotes, setCheckinNotes] = useState('')
  const [checkinError, setCheckinError] = useState('')
  const [checkinSubmitting, setCheckinSubmitting] = useState(false)

  // WhatsApp & Automation States
  const [sendWhatsappWelcome, setSendWhatsappWelcome] = useState(true)
  const [sendWhatsappFolio, setSendWhatsappFolio] = useState(true)
  const [waToast, setWaToast] = useState<{ show: boolean; msg: string; title: string } | null>(null)

  // Load Guests & Unoccupied Rooms
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // 1. Fetch active stays using joined grouping query
        const { data: activeStays, error: staysError } = await supabase
          .from('guests')
          .select(`
            id,
            guest_name,
            check_in_date,
            expected_checkout,
            guest_phone,
            number_of_adults,
            notes,
            rooms ( room_number )
          `)
          .eq('resort_id', resortId)
          .eq('status', 'checked_in')

        if (staysError) throw staysError

        // Fetch running tabs from folio view (includes food + activities)
        const resolvedStays = await Promise.all(
          (activeStays || []).map(async (g: any) => {
            const { data: folioSum } = await supabase
              .from('guest_folio')
              .select('amount')
              .eq('guest_id', g.id)

            const running_tab = (folioSum || []).reduce((s, row) => s + row.amount, 0)
            return {
              id: g.id,
              guest_name: g.guest_name,
              room_number: g.rooms?.room_number || 'N/A',
              check_in_date: g.check_in_date,
              expected_checkout: g.expected_checkout,
              guest_phone: g.guest_phone,
              number_of_adults: g.number_of_adults,
              notes: g.notes,
              running_tab
            }
          })
        )

        // Sort by room number
        resolvedStays.sort((a, b) => a.room_number.localeCompare(b.room_number, undefined, { numeric: true }))
        setGuests(resolvedStays)

        // 2. Fetch unoccupied rooms
        const { data: roomsList, error: roomsError } = await supabase
          .from('rooms')
          .select('id, room_number, room_type, floor, is_occupied, sort_order')
          .eq('resort_id', resortId)
          .eq('is_occupied', false)
          .order('sort_order')

        if (roomsError) throw roomsError
        setUnoccupiedRooms(roomsList || [])

      } catch (err) {
        console.error('Guests Tab load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [resortId, refreshKey])

  // Open Folio Drawer
  async function handleOpenCheckout(guest: ActiveGuest) {
    setCheckoutGuest(guest)
    setLoadingFolio(true)
    try {
      const { data, error } = await supabase
        .from('guest_folio')
        .select('*')
        .eq('guest_id', guest.id)
        .order('charge_at')

      if (error) throw error

      setFolioLines(data || [])
      const total = (data || []).reduce((s, r) => s + r.amount, 0)
      setFolioTotal(total)
    } catch (err) {
      console.error('Folio fetch error:', err)
    } finally {
      setLoadingFolio(false)
    }
  }

  // Handle Checkout submission
  async function handleConfirmCheckout() {
    if (!checkoutGuest) return
    const targetGuest = checkoutGuest
    const totalToReport = folioTotal
    setSubmittingCheckout(true)
    try {
      const { error } = await supabase.rpc('check_out_guest', {
        p_guest_id: checkoutGuest.id
      })

      if (error) throw error
      
      if (sendWhatsappFolio && targetGuest) {
        setWaToast({
          show: true,
          title: 'WhatsApp Settlement Receipt Dispatched',
          msg: `📱 Receipt sent to ${targetGuest.guest_phone}: "Namaste ${targetGuest.guest_name}! Your stay settlement for Room ${targetGuest.room_number} total ₹${totalToReport.toLocaleString('en-IN')} has been finalized. Thank you for staying at Shivalaya Resorts!"`
        })
        setTimeout(() => setWaToast(null), 7000)
      }

      setCheckoutGuest(null)
      triggerRefresh()
    } catch (err: any) {
      console.error('Checkout failed:', err)
      setCheckoutGuest(null)
      triggerRefresh()
    } finally {
      setSubmittingCheckout(false)
    }
  }

  // Submit Check-in Form
  async function handleCheckinSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCheckinError('')
    if (!roomFormId || !guestName || !guestPhone) {
      setCheckinError('Please complete all required fields.')
      return
    }

    const selectedRoomNum = unoccupiedRooms.find(r => r.id === roomFormId)?.room_number || 'N/A'
    const targetPhone = guestPhone
    const targetName = guestName

    setCheckinSubmitting(true)
    try {
      const { data, error } = await supabase.rpc('check_in_guest', {
        p_resort_id: resortId,
        p_room_id: roomFormId,
        p_guest_name: guestName,
        p_guest_phone: guestPhone,
        p_number_of_adults: adults,
        p_expected_checkout: checkoutDate || null,
        p_notes: checkinNotes || null
      })

      if (error) throw error

      if (data && !data.success) {
        setCheckinError(data.error || 'Failed to check in.')
        return
      }

      if (sendWhatsappWelcome) {
        const portalBaseUrl = import.meta.env.VITE_GUEST_PORTAL_URL || 'http://localhost:5190'
        setWaToast({
          show: true,
          title: 'WhatsApp Welcome Link Sent',
          msg: `📱 Sent to ${targetPhone}: "Namaste ${targetName}! Welcome to Room ${selectedRoomNum}. Open your personalized guest portal for food ordering & experience booking: ${portalBaseUrl}/?room=${selectedRoomNum}"`
        })
        setTimeout(() => setWaToast(null), 7000)
      }

      setShowCheckInModal(false)
      setRoomFormId('')
      setGuestName('')
      setGuestPhone('')
      setAdults(1)
      setCheckoutDate('')
      setCheckinNotes('')
      triggerRefresh()
    } catch (err: any) {
      console.error('Check-in RPC error:', err)
      setShowCheckInModal(false)
      triggerRefresh()
    } finally {
      setCheckinSubmitting(false)
    }
  }

  // Trigger A4 receipt print
  function handleDownloadFolioPDF() {
    window.print()
  }

  // Calculate Subtotals & 5% GST on Food & Beverage
  const foodSubtotal = folioLines.filter(l => l.charge_type === 'food').reduce((sum, r) => sum + r.amount, 0)
  const activitySubtotal = folioLines.filter(l => l.charge_type === 'activity').reduce((sum, r) => sum + r.amount, 0)
  const foodGst = Math.round(foodSubtotal * 0.05)
  const grandTotalWithGst = foodSubtotal + foodGst + activitySubtotal

  return (
    <div>
      {/* Top Action Ribbon */}
      <div className="print:hidden" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button
          onClick={() => {
            setCheckinError('')
            setShowCheckInModal(true)
          }}
          className="rcp-btn rcp-btn-primary"
        >
          <Plus size={16} />
          New Check-in
        </button>
      </div>

      {/* Main Ledger Table */}
      <div className="print:hidden rcp-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="rcp-empty-state">Loading stays ledger...</div>
        ) : guests.length === 0 ? (
          <div className="rcp-empty-state" style={{ padding: '36px 20px' }}>
            <UserCheck size={32} style={{ margin: '0 auto 12px', stroke: 'var(--border-strong)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>No checked-in guests</h3>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Click "New Check-in" to allocate empty rooms.</p>
          </div>
        ) : (
          <div className="rcp-table-container">
            <table className="rcp-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Guest Name</th>
                  <th>WhatsApp No.</th>
                  <th style={{ textAlign: 'center' }}>Adults</th>
                  <th>Check-in</th>
                  <th>Expected Checkout</th>
                  <th style={{ textAlign: 'right' }}>Running Tab</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr key={guest.id}>
                    <td style={{ fontWeight: 700, color: 'var(--forest)' }}>
                      <span className="badge badge-success" style={{ fontSize: '12px' }}>
                        {guest.room_number}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {guest.guest_name}
                    </td>
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '12.5px' }}>
                      {guest.guest_phone}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {guest.number_of_adults}
                    </td>
                    <td style={{ fontSize: '12.5px' }}>
                      {guest.check_in_date}
                    </td>
                    <td style={{ fontSize: '12.5px' }}>
                      {guest.expected_checkout || '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--forest)' }}>
                      ₹{guest.running_tab.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleOpenCheckout(guest)}
                        className="rcp-btn rcp-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                      >
                        Check Out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CHECK-IN MODAL */}
      {showCheckInModal && (
        <div className="rcp-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="rcp-card" style={{ maxWidth: '440px', width: '100%', padding: '24px 20px', maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 700, color: 'var(--forest)' }}>
                New Guest Check-in
              </h3>
              <button onClick={() => setShowCheckInModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--sage)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {checkinError && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(154,69,48,0.2)', color: 'var(--danger)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
                {checkinError}
              </div>
            )}

            <form onSubmit={handleCheckinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="rcp-label">Room Number *</label>
                <select
                  value={roomFormId}
                  onChange={(e) => setRoomFormId(e.target.value)}
                  className="rcp-select"
                >
                  <option value="">Select unoccupied room...</option>
                  {unoccupiedRooms.map(rm => (
                    <option key={rm.id} value={rm.id}>
                      {rm.room_type ? `${rm.room_type} — ` : ''}Room {rm.room_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="rcp-label">Guest Name *</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Abhay Kumar"
                  className="rcp-input"
                />
              </div>

              <div>
                <label className="rcp-label">WhatsApp Phone No. *</label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="rcp-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label className="rcp-label">Adults</label>
                  <input
                    type="number"
                    min={1}
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                    className="rcp-input"
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <label className="rcp-label">Expected Checkout</label>
                  <input
                    type="date"
                    value={checkoutDate}
                    onChange={(e) => setCheckoutDate(e.target.value)}
                    className="rcp-input"
                  />
                </div>
              </div>

              <div style={{ background: '#EDF7EE', border: '1px solid rgba(44,110,59,0.3)', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="waCheckin"
                  checked={sendWhatsappWelcome}
                  onChange={(e) => setSendWhatsappWelcome(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#2C6E3B', cursor: 'pointer' }}
                />
                <label htmlFor="waCheckin" style={{ fontSize: '12px', fontWeight: 600, color: '#2C6E3B', cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📱 Send Automated WhatsApp Welcome & Portal Link</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={checkinSubmitting}
                className="rcp-btn rcp-btn-primary"
                style={{ justifyContent: 'center', padding: '12px', marginTop: '6px' }}
              >
                {checkinSubmitting ? 'Registering...' : 'Register stay'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHECK-OUT FOLIO DRAWER / PRINT VIEW */}
      {checkoutGuest && (
        <>
          {/* Print-visible Full receipt (Visible only when window.print() is called) */}
          <div id="folio-print-container" className="print-visible font-mono p-10 text-black hidden bg-white">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>SHIVALAYA PANACHE RESORT</h1>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Uttarakhand, India · Stay Invoice Folio</p>
            </div>
            
            <div className="kot-divider" style={{ borderTop: '2px solid black', margin: '16px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '12px' }}>
              <div>
                <strong>Guest:</strong> {checkoutGuest.guest_name} <br />
                <strong>Contact:</strong> {checkoutGuest.guest_phone}
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>Room Allocated:</strong> Room {checkoutGuest.room_number} <br />
                <strong>Stay Period:</strong> {checkoutGuest.check_in_date} to {new Date().toISOString().split('T')[0]}
              </div>
            </div>

            <div className="kot-divider" style={{ borderTop: '1px solid black', margin: '16px 0' }} />

            <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px' }}>F&B FOOD SERVICE</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {folioLines.filter(l => l.charge_type === 'food').map(line => (
                <div key={line.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>{line.description} (Ref: {line.reference_number})</span>
                  <span>₹{line.amount}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', borderTop: '1px dashed #DDD', paddingTop: '6px', marginTop: '4px' }}>
                <span>Food Subtotal:</span>
                <span>₹{foodSubtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#555', marginTop: '2px' }}>
                <span>F&B GST (5%):</span>
                <span>₹{foodGst}</span>
              </div>
            </div>

            <div style={{ margin: '20px 0' }} />

            <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px' }}>EXPERIENCES & OUTDOORS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {folioLines.filter(l => l.charge_type === 'activity').map(line => (
                <div key={line.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>{line.description} (Ref: {line.reference_number})</span>
                  <span>₹{line.amount}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', borderTop: '1px dashed #DDD', paddingTop: '6px', marginTop: '4px' }}>
                <span>Activities Subtotal:</span>
                <span>₹{activitySubtotal}</span>
              </div>
            </div>

            <div className="kot-divider" style={{ borderTop: '2px solid black', margin: '20px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
              <span>Grand Total Settled (incl. 5% GST):</span>
              <span>₹{grandTotalWithGst.toLocaleString('en-IN')}</span>
            </div>
            
            <div style={{ textAlign: 'center', fontSize: '10px', color: '#666', marginTop: '60px' }}>
              Thank you for staying at Shivalaya Resorts. Have a pleasant journey back!
            </div>
          </div>

          {/* Drawer backdrop (hidden on print) */}
          <div className="rcp-overlay print:hidden" onClick={() => setCheckoutGuest(null)}>
            <div 
              className="rcp-drawer"
              style={{ padding: '32px', color: 'var(--ink)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 700, color: 'var(--forest)' }}>
                      Settlement Folio
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--sage)' }}>
                      Room {checkoutGuest.room_number} · {checkoutGuest.guest_name}
                    </span>
                  </div>
                  <button onClick={() => setCheckoutGuest(null)} style={{ background: 'transparent', border: 'none', color: 'var(--sage)', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0' }} />

                {loadingFolio ? (
                  <div className="rcp-empty-state" style={{ padding: '20px 0', fontSize: '13px' }}>Loading folio lines...</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
                    
                    {/* 1. Food section */}
                    <div>
                      <h4 style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--warn)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Food & Beverage</span>
                        <span>₹{foodSubtotal}</span>
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {folioLines.filter(l => l.charge_type === 'food').map(line => {
                          const isExpanded = expandedFoodOrder === line.id
                          return (
                            <div key={line.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px' }}>
                              <div 
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => setExpandedFoodOrder(isExpanded ? null : line.id)}
                              >
                                <div>
                                  <strong style={{ fontSize: '12px' }}>{line.reference_number}</strong>
                                  <span style={{ fontSize: '10px', color: 'var(--sage)', marginLeft: '8px' }}>
                                    {new Date(line.charge_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontWeight: 700, fontSize: '12px' }}>₹{line.amount}</span>
                                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                              </div>
                              
                              {/* Expandable items detail list */}
                              {isExpanded && line.line_items && (
                                <div style={{ borderTop: '1px dashed var(--border-strong)', marginTop: '8px', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {Array.isArray(line.line_items) && line.line_items.map((it: any, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ink-soft)' }}>
                                      <span>{it.qty}x {it.name}</span>
                                      <span>₹{it.price * it.qty}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* 2. Experiences Section */}
                    <div>
                      <h4 style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--warn)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Experiences & Activities</span>
                        <span>₹{activitySubtotal}</span>
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {folioLines.filter(l => l.charge_type === 'activity').map(line => (
                          <div key={line.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                            <div>
                              <strong style={{ display: 'block' }}>{line.description}</strong>
                              <span style={{ fontSize: '10px', color: 'var(--sage)', display: 'block', marginTop: '2px' }}>
                                {line.detail} · Ref: {line.reference_number}
                              </span>
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--forest)' }}>₹{line.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Confirm footer */}
              <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: '20px' }}>
                
                {/* Print button */}
                <button
                  onClick={handleDownloadFolioPDF}
                  className="rcp-btn rcp-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: '12px' }}
                >
                  <FileText size={16} />
                  Download Folio PDF
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--sage)' }}>F&B GST (5%):</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>₹{foodGst}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sage)' }}>Grand Settlement Total:</span>
                  <strong style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest)', fontFamily: 'Fraunces, serif' }}>
                    ₹{grandTotalWithGst.toLocaleString('en-IN')}
                  </strong>
                </div>
                <div style={{ background: '#EDF7EE', border: '1px solid rgba(44,110,59,0.3)', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="waCheckout"
                    checked={sendWhatsappFolio}
                    onChange={(e) => setSendWhatsappFolio(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#2C6E3B', cursor: 'pointer' }}
                  />
                  <label htmlFor="waCheckout" style={{ fontSize: '12px', fontWeight: 600, color: '#2C6E3B', cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📱 Send WhatsApp Folio Summary & Digital Receipt</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setCheckoutGuest(null)}
                    className="rcp-btn rcp-btn-ghost"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Close
                  </button>
                  <button
                    onClick={handleConfirmCheckout}
                    disabled={submittingCheckout}
                    className="rcp-btn rcp-btn-danger"
                    style={{ flex: 2, justifyContent: 'center', border: 'none', background: '#EC5959', color: 'white' }}
                  >
                    {submittingCheckout ? 'Processing...' : 'Confirm checkout'}
                  </button>
                </div>
              </div>

            </div>
          </div>
          {waToast && (
            <div style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: 'var(--forest-deep)',
              color: 'var(--brass-light)',
              border: '1.5px solid var(--brass)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
              borderRadius: '12px',
              padding: '16px 20px',
              maxWidth: '440px',
              zIndex: 99999,
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              animation: 'fadeUp 0.3s cubic-bezier(0.2,0.9,0.25,1.1)'
            }}>
              <span style={{ fontSize: '22px' }}>📱</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#FFF' }}>{waToast.title}</div>
                <div style={{ fontSize: '11.5px', opacity: 0.9, marginTop: '4px', lineHeight: 1.4, color: 'var(--parchment)' }}>{waToast.msg}</div>
              </div>
              <button onClick={() => setWaToast(null)} style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', padding: '0 4px', fontSize: '14px' }}>✕</button>
            </div>
          )}
        </>
      )}

    </div>
  )
}

/* --------------------------------------------------------------------------
   2. ORDERS OVERVIEW TAB
   -------------------------------------------------------------------------- */
interface OrdersTabProps {
  resortId: string
  refreshKey: number
  triggerRefresh: () => void
}

function OrdersTab({ resortId, refreshKey, triggerRefresh }: OrdersTabProps) {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchRoom, setSearchRoom] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  
  // Manual Order states
  const [showManualOrderModal, setShowManualOrderModal] = useState(false)
  const [deskOrderType, setDeskOrderType] = useState<'resident' | 'walk_in'>('resident')
  const [rooms, setRooms] = useState<Room[]>([])
  const [restaurantTables, setRestaurantTables] = useState<Array<{ id: string; table_number: string }>>([])
  const [selectedRoomNum, setSelectedRoomNum] = useState('')
  const [selectedTableNum, setSelectedTableNum] = useState('T-01')
  const [manualGuestName, setManualGuestName] = useState('')
  const [manualGuestPhone, setManualGuestPhone] = useState('')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedItemQuantities, setSelectedItemQuantities] = useState<Record<string, number>>({})
  const [specialNote, setSpecialNote] = useState('')
  const [orderError, setOrderError] = useState('')
  const [submittingOrder, setSubmittingOrder] = useState(false)

  // Billing & Settlement Modal states
  const [billingOrder, setBillingOrder] = useState<OrderHistoryItem | null>(null)
  const [settleMethod, setSettleMethod] = useState<'upi' | 'cash' | 'card'>('upi')
  const [settling, setSettling] = useState(false)

  // ── Realtime WebSocket sync for live incoming orders ──────
  useEffect(() => {
    const channel = supabase
      .channel('reception_orders_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          triggerRefresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [triggerRefresh])

  // Load Orders, Rooms, Tables & Menu items
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // 1. Fetch orders history ordered newest first
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            guest_name,
            guest_phone,
            service_type,
            subtotal,
            tax_amount,
            grand_total,
            payment_status,
            payment_method,
            status,
            created_at,
            items,
            rooms ( room_number ),
            restaurant_tables ( table_number )
          `)
          .eq('resort_id', resortId)
          .order('created_at', { ascending: false })

        if (error) throw error

        let resolved: OrderHistoryItem[] = (data || []).map((o: any) => {
          const subtotal = o.subtotal || 0
          const tax_amount = o.tax_amount != null ? o.tax_amount : Math.round(subtotal * 0.05 * 100) / 100
          const grand_total = o.grand_total != null ? o.grand_total : Math.round((subtotal + tax_amount) * 100) / 100

          return {
            id: o.id,
            order_number: o.order_number,
            guest_name: o.guest_name,
            guest_phone: o.guest_phone,
            room_number: o.rooms?.room_number || '',
            table_number: o.restaurant_tables?.table_number || (o.service_type === 'takeaway' ? 'Takeaway' : ''),
            service_type: o.service_type,
            subtotal,
            tax_amount,
            grand_total,
            payment_status: o.payment_status || (o.rooms?.room_number ? 'folio' : 'pending'),
            payment_method: o.payment_method || (o.rooms?.room_number ? 'folio' : null),
            status: o.status,
            created_at: o.created_at,
            items: o.items || []
          }
        })

        // Client side search
        if (searchRoom) {
          const query = searchRoom.toLowerCase()
          resolved = resolved.filter(o => 
            o.room_number?.toLowerCase().includes(query) ||
            o.table_number?.toLowerCase().includes(query) ||
            o.guest_name?.toLowerCase().includes(query) ||
            o.order_number?.toLowerCase().includes(query)
          )
        }
        if (statusFilter.length > 0) {
          resolved = resolved.filter(o => statusFilter.includes(o.status))
        }

        setOrders(resolved)

        // 2. Fetch occupied rooms for resident desk orders
        const { data: rms } = await supabase
          .from('rooms')
          .select('id, room_number, current_guest_id')
          .eq('resort_id', resortId)
          .eq('is_occupied', true)
        setRooms(rms || [])

        // 3. Fetch restaurant tables
        const { data: tbls } = await supabase
          .from('restaurant_tables')
          .select('id, table_number')
          .eq('resort_id', resortId)
          .order('table_number')
        setRestaurantTables(tbls && tbls.length > 0 ? tbls : Array.from({ length: 12 }, (_, i) => ({ id: `t-${i+1}`, table_number: `T-${String(i+1).padStart(2, '0')}` })))

        // 4. Fetch available menu items
        const { data: menuList } = await supabase
          .from('menu_items')
          .select('id, name, price, is_available')
          .eq('is_available', true)
        setMenuItems(menuList || [])

      } catch (err) {
        console.error('Orders history load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [resortId, searchRoom, statusFilter, refreshKey])

  // Auto-fill guest name & phone when in-house room is picked
  useEffect(() => {
    if (deskOrderType !== 'resident' || !selectedRoomNum) return
    async function getGuestInfo() {
      const selectedRoomObj = rooms.find(r => r.room_number === selectedRoomNum)
      if (selectedRoomObj?.current_guest_id) {
        const { data } = await supabase
          .from('guests')
          .select('guest_name, guest_phone')
          .eq('id', selectedRoomObj.current_guest_id)
          .single()
        if (data) {
          setManualGuestName(data.guest_name)
          setManualGuestPhone(data.guest_phone)
        }
      }
    }
    getGuestInfo()
  }, [selectedRoomNum, rooms, deskOrderType])

  function handleStatusToggle(status: string) {
    if (statusFilter.includes(status)) {
      setStatusFilter(prev => prev.filter(s => s !== status))
    } else {
      setStatusFilter(prev => [...prev, status])
    }
  }

  // Calculate order total
  const calculatedSubtotal = Object.entries(selectedItemQuantities).reduce((sum, [itemId, qty]) => {
    const item = menuItems.find(it => it.id === itemId)
    return sum + (item ? item.price * qty : 0)
  }, 0)
  const calculatedTax = Math.round(calculatedSubtotal * 0.05 * 100) / 100
  const calculatedGrandTotal = Math.round((calculatedSubtotal + calculatedTax) * 100) / 100

  // ── Desk Manual Order Submit ──────────────────────────────
  async function handleManualOrderSubmit(e: React.FormEvent) {
    e.preventDefault()
    setOrderError('')
    
    const selectedItems = Object.entries(selectedItemQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => {
        const item = menuItems.find(it => it.id === itemId)!
        return {
          id: item.id,
          name: item.name,
          qty,
          price: item.price
        }
      })

    if (selectedItems.length === 0) {
      setOrderError('Please select at least 1 menu item.')
      return
    }

    const isResident = deskOrderType === 'resident'
    if (isResident && !selectedRoomNum) {
      setOrderError('Please select an occupied resort room.')
      return
    }
    if (!isResident && !manualGuestName.trim()) {
      setOrderError('Please enter the walk-in customer / party name.')
      return
    }

    setSubmittingOrder(true)
    try {
      const { data, error } = await supabase.rpc('create_order', {
        p_resort_id: resortId,
        p_service_type: isResident ? 'room_service' : (selectedTableNum === 'takeaway' ? 'takeaway' : 'dine_in'),
        p_guest_name: manualGuestName.trim() || (isResident ? `Resident (${selectedRoomNum})` : 'Walk-In Diner'),
        p_guest_phone: manualGuestPhone.trim() || '9876543210',
        p_room_number: isResident ? selectedRoomNum : null,
        p_table_number: !isResident && selectedTableNum !== 'takeaway' ? selectedTableNum : null,
        p_items: selectedItems,
        p_subtotal: calculatedSubtotal,
        p_special_note: specialNote ? `${specialNote} (Desk entry)` : 'Manual order — via reception desk'
      })

      if (error) throw error
      if (data && !data.success) {
        setOrderError(data.error || 'Failed to submit order.')
        return
      }

      setShowManualOrderModal(false)
      setSelectedItemQuantities({})
      setSelectedRoomNum('')
      setManualGuestName('')
      setManualGuestPhone('')
      setSpecialNote('')
      triggerRefresh()
    } catch (err: any) {
      console.error('Manual order entry failed:', err)
      setShowManualOrderModal(false)
      triggerRefresh()
    } finally {
      setSubmittingOrder(false)
    }
  }

  // ── Settle Walk-In Bill ────────────────────────────────────
  async function handleSettleBill(orderId: string, method: 'cash' | 'upi' | 'card') {
    setSettling(true)
    try {
      const { error } = await supabase.rpc('settle_walkin_bill', {
        p_order_id: orderId,
        p_payment_method: method,
        p_settled_by: 'Reception Desk'
      })

      if (error) {
        // Fallback: direct table update if RPC migration not yet applied
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            payment_method: method,
            settled_at: new Date().toISOString(),
            settled_by: 'Reception Desk'
          })
          .eq('id', orderId)
      }

      setBillingOrder(null)
      triggerRefresh()
    } catch (err) {
      console.error('Failed to settle bill:', err)
    } finally {
      setSettling(false)
    }
  }

  return (
    <div>
      {/* Search Ribbon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px', flexWrap: 'wrap' }}>
          
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--sage)' }} />
            <input
              type="text"
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
              placeholder="Search Room, Table, Guest or Order #..."
              className="rcp-input"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Status chips */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {['new', 'confirmed', 'preparing', 'ready', 'served'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusToggle(status)}
                style={{
                  background: statusFilter.includes(status) ? 'var(--forest)' : 'var(--card)',
                  border: '1px solid var(--border)',
                  color: statusFilter.includes(status) ? '#FFF' : 'var(--sage)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {status}
              </button>
            ))}
          </div>

        </div>

        <button
          onClick={() => setShowManualOrderModal(true)}
          className="rcp-btn rcp-btn-primary"
        >
          <Plus size={16} />
          New Desk Order
        </button>
      </div>

      {/* Orders Ledger List */}
      <div className="rcp-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="rcp-empty-state">Loading orders ledger...</div>
        ) : orders.length === 0 ? (
          <div className="rcp-empty-state" style={{ padding: '36px 20px' }}>No orders found matching filters.</div>
        ) : (
          <div className="rcp-table-container">
            <table className="rcp-table">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Destination &amp; Seating</th>
                  <th>Customer Type</th>
                  <th>Guest Name &amp; Phone</th>
                  <th>Items Details</th>
                  <th>Time</th>
                  <th style={{ textAlign: 'right' }}>Total (5% GST)</th>
                  <th style={{ textAlign: 'center' }}>Kitchen Status</th>
                  <th style={{ textAlign: 'center' }}>Billing / Settle</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const isResident = !!o.room_number
                  const isPaid = o.payment_status === 'paid'
                  const isFolio = o.payment_status === 'folio'

                  return (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace' }}>
                        {o.order_number}
                      </td>

                      {/* Destination & Seating */}
                      <td style={{ fontWeight: 700 }}>
                        {isResident ? (
                          <span style={{ color: 'var(--forest)', background: 'rgba(44,74,34,0.1)', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            🛎️ Rm {o.room_number}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--brass)', background: 'rgba(173,138,63,0.15)', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 800 }}>
                            🍽️ {o.table_number ? `Table ${o.table_number}` : 'Takeaway'}
                          </span>
                        )}
                      </td>

                      {/* Customer Type Badge */}
                      <td>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '100px',
                          background: isResident ? 'rgba(44,74,34,0.08)' : 'rgba(173,138,63,0.12)',
                          color: isResident ? 'var(--forest-deep)' : 'var(--brass)',
                          border: `1px solid ${isResident ? 'rgba(44,74,34,0.2)' : 'rgba(173,138,63,0.3)'}`
                        }}>
                          {isResident ? 'Resort Resident' : 'Walk-In Diner'}
                        </span>
                      </td>

                      {/* Guest Details */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{o.guest_name}</div>
                        {o.guest_phone && (
                          <div style={{ fontSize: '11px', color: 'var(--sage)', fontFamily: 'IBM Plex Mono, monospace' }}>
                            {o.guest_phone}
                          </div>
                        )}
                      </td>

                      {/* Items Details */}
                      <td style={{ maxWidth: '240px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {o.items.map((it, idx) => (
                            <span key={idx} style={{ background: 'var(--parchment)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', color: 'var(--ink-soft)' }}>
                              {it.qty}x {it.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Placed Date/Time */}
                      <td style={{ color: 'var(--sage)', fontSize: '12px', fontFamily: 'IBM Plex Mono, monospace' }}>
                        {new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Total */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--forest)', fontSize: '13.5px', fontFamily: 'IBM Plex Mono, monospace' }}>
                          ₹{Number(o.grand_total || o.subtotal).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--sage)' }}>
                          (₹{o.subtotal} + 5% GST)
                        </div>
                      </td>

                      {/* Kitchen Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${o.status === 'served' ? 'badge-success' : o.status === 'ready' ? 'badge-warning' : 'badge-danger'}`}>
                          {o.status}
                        </span>
                      </td>

                      {/* Billing / Settlement */}
                      <td style={{ textAlign: 'center' }}>
                        {isPaid ? (
                          <button
                            type="button"
                            onClick={() => setBillingOrder(o)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: '#E8F5E9',
                              border: '1px solid #A5D6A7',
                              color: '#2E7D32',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            ✓ Paid ({o.payment_method?.toUpperCase() || 'OK'})
                          </button>
                        ) : isFolio ? (
                          <button
                            type="button"
                            onClick={() => setBillingOrder(o)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: '#E3F2FD',
                              border: '1px solid #90CAF9',
                              color: '#1565C0',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Room Folio
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setBillingOrder(o)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              background: 'var(--forest)',
                              border: 'none',
                              color: '#FFF',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(44,74,34,0.2)'
                            }}
                          >
                            🧾 Settle Bill
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── BILLING & SETTLEMENT MODAL ── */}
      {billingOrder && (
        <div className="rcp-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 10000 }}>
          <div className="rcp-card" style={{ maxWidth: '480px', width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--brass)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                  Panache Restaurant · Shivalaya Resorts
                </div>
                <h3 style={{ margin: '2px 0 0', fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 700, color: 'var(--forest-deep)' }}>
                  Tax Invoice / Cash Memo
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--sage)', marginTop: '2px' }}>
                  Order #{billingOrder.order_number} · {new Date(billingOrder.created_at).toLocaleString('en-IN')}
                </div>
              </div>
              <button onClick={() => setBillingOrder(null)} style={{ background: 'transparent', border: 'none', color: 'var(--sage)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Customer Details Pill */}
            <div style={{ background: 'var(--surface-2)', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{billingOrder.guest_name}</div>
                <div style={{ color: 'var(--sage)', fontSize: '11.5px' }}>{billingOrder.guest_phone || 'No phone recorded'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--forest)' }}>
                  {billingOrder.room_number ? `Room ${billingOrder.room_number}` : `Table ${billingOrder.table_number || 'Walk-In'}`}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--brass)' }}>
                  {billingOrder.room_number ? 'Resort In-House' : 'Outside Walk-In'}
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Item</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Rate</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {billingOrder.items.map((it, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--surface-2)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{it.name}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{it.qty}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace' }}>₹{it.price}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace' }}>
                        ₹{(it.price * it.qty).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary with 5% GST */}
            <div style={{ background: 'rgba(44,74,34,0.04)', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(44,74,34,0.15)', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--sage)' }}>
                <span>Food &amp; Beverage Subtotal</span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>₹{billingOrder.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--sage)' }}>
                <span>CGST (2.5%)</span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>₹{(Number(billingOrder.tax_amount || billingOrder.subtotal * 0.05) / 2).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--sage)' }}>
                <span>SGST (2.5%)</span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>₹{(Number(billingOrder.tax_amount || billingOrder.subtotal * 0.05) / 2).toFixed(2)}</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: 'var(--forest-deep)' }}>
                <span>Grand Total</span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--brass)' }}>
                  ₹{Number(billingOrder.grand_total || (billingOrder.subtotal + (billingOrder.tax_amount || billingOrder.subtotal * 0.05))).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Settlement Status / Settlement Actions */}
            {billingOrder.payment_status === 'paid' ? (
              <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32', padding: '12px', borderRadius: '10px', textAlign: 'center', fontWeight: 700, fontSize: '13px', marginBottom: '14px' }}>
                ✓ Bill Settled &amp; Paid via {billingOrder.payment_method?.toUpperCase() || 'DIRECT PAYMENT'}
              </div>
            ) : billingOrder.payment_status === 'folio' ? (
              <div style={{ background: '#E3F2FD', border: '1px solid #90CAF9', color: '#1565C0', padding: '12px', borderRadius: '10px', textAlign: 'center', fontWeight: 700, fontSize: '13px', marginBottom: '14px' }}>
                🏨 Charged directly to Guest Room Folio (Room {billingOrder.room_number})
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--forest-deep)', marginBottom: '8px' }}>
                  Select Settlement Mode for Walk-In Customer:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  {[
                    { key: 'upi', label: '📱 UPI / QR' },
                    { key: 'cash', label: '💵 Cash' },
                    { key: 'card', label: '💳 Card' }
                  ].map(m => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setSettleMethod(m.key as any)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: settleMethod === m.key ? '2px solid var(--forest)' : '1px solid var(--border)',
                        background: settleMethod === m.key ? 'rgba(44,74,34,0.1)' : 'var(--surface-2)',
                        color: settleMethod === m.key ? 'var(--forest-deep)' : 'var(--sage)',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={settling}
                  onClick={() => handleSettleBill(billingOrder.id, settleMethod)}
                  className="rcp-btn rcp-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '13.5px' }}
                >
                  {settling ? 'Recording Settlement…' : `Confirm Payment (₹${Number(billingOrder.grand_total || billingOrder.subtotal * 1.05).toFixed(2)})`}
                </button>
              </div>
            )}

            {/* Print & Close footer */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  color: 'var(--ink)',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                🖨️ Print Tax Invoice
              </button>
              <button
                type="button"
                onClick={() => setBillingOrder(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--surface-3, #E0E0E0)',
                  color: 'var(--ink)',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── NEW MANUAL DESK ORDER MODAL ── */}
      {showManualOrderModal && (
        <div className="rcp-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="rcp-card" style={{ maxWidth: '480px', width: '100%', padding: '24px 20px', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 700, color: 'var(--forest)' }}>
                  New Desk Order Entry
                </h3>
                <span style={{ fontSize: '11.5px', color: 'var(--sage)' }}>Direct dispatch to Panache Kitchen KDS</span>
              </div>
              <button onClick={() => setShowManualOrderModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--sage)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {orderError && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(154,69,48,0.2)', color: 'var(--danger)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '12px' }}>
                {orderError}
              </div>
            )}

            {/* Destination Toggle: Resident Room vs Walk-In Diner */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px', background: 'var(--surface-2)', padding: '4px', borderRadius: '10px' }}>
              <button
                type="button"
                onClick={() => setDeskOrderType('resident')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: deskOrderType === 'resident' ? 'var(--forest)' : 'transparent',
                  color: deskOrderType === 'resident' ? '#FFF' : 'var(--sage)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🛎️ Room Resident
              </button>
              <button
                type="button"
                onClick={() => setDeskOrderType('walk_in')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: deskOrderType === 'walk_in' ? 'var(--brass)' : 'transparent',
                  color: deskOrderType === 'walk_in' ? '#FFF' : 'var(--sage)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🍽️ Walk-In Diner
              </button>
            </div>

            <form onSubmit={handleManualOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
              
              {deskOrderType === 'resident' ? (
                <div>
                  <label className="rcp-label">Select Occupied Room *</label>
                  <select
                    value={selectedRoomNum}
                    onChange={(e) => setSelectedRoomNum(e.target.value)}
                    className="rcp-select"
                  >
                    <option value="">Select room...</option>
                    {rooms.map(rm => (
                      <option key={rm.id} value={rm.room_number}>Room {rm.room_number}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="rcp-label">Select Restaurant Seating *</label>
                    <select
                      value={selectedTableNum}
                      onChange={(e) => setSelectedTableNum(e.target.value)}
                      className="rcp-select"
                    >
                      {restaurantTables.map(tbl => (
                        <option key={tbl.id} value={tbl.table_number}>Table {tbl.table_number}</option>
                      ))}
                      <option value="takeaway">Takeaway Counter Pickup</option>
                    </select>
                  </div>
                  <div>
                    <label className="rcp-label">Customer / Party Name *</label>
                    <input
                      type="text"
                      value={manualGuestName}
                      onChange={(e) => setManualGuestName(e.target.value)}
                      placeholder="e.g. Vikram Malhotra"
                      className="rcp-input"
                    />
                  </div>
                  <div>
                    <label className="rcp-label">Mobile Number (For receipt)</label>
                    <input
                      type="tel"
                      value={manualGuestPhone}
                      onChange={(e) => setManualGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10 digit mobile"
                      className="rcp-input"
                    />
                  </div>
                </div>
              )}

              {deskOrderType === 'resident' && selectedRoomNum && (
                <div style={{ background: 'var(--surface-2)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '12px' }}>
                  <strong>Guest Name:</strong> {manualGuestName || 'Resort Guest'} <br />
                  <strong>Phone:</strong> {manualGuestPhone || 'N/A'}
                </div>
              )}

              {/* Items Picker grid */}
              <div>
                <label className="rcp-label">Select Panache Menu Items</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1.5px solid var(--border-strong)', borderRadius: '8px', padding: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                  {menuItems.map(it => {
                    const currentQty = selectedItemQuantities[it.id] || 0
                    return (
                      <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                        <span>{it.name} (₹{it.price})</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedItemQuantities(prev => ({ ...prev, [it.id]: Math.max(0, currentQty - 1) }))}
                            style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer' }}
                          >-</button>
                          <span style={{ fontWeight: 600, width: '14px', textAlign: 'center' }}>{currentQty}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedItemQuantities(prev => ({ ...prev, [it.id]: currentQty + 1 }))}
                            style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer' }}
                          >+</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="rcp-label">Special Kitchen Instructions</label>
                <input
                  type="text"
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  placeholder="e.g. Less spicy, extra lemons"
                  className="rcp-input"
                />
              </div>

              <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--sage)' }}>
                  <span>Food Subtotal:</span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>₹{calculatedSubtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--sage)' }}>
                  <span>Restaurant GST (5%):</span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>₹{calculatedTax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14.5px', fontWeight: 800, color: 'var(--forest)' }}>
                  <span>Grand Total:</span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>₹{calculatedGrandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingOrder || calculatedSubtotal === 0}
                className="rcp-btn rcp-btn-primary"
                style={{ justifyContent: 'center', padding: '12px', marginTop: '6px' }}
              >
                {submittingOrder ? 'Submitting Order...' : `Dispatch Order to KDS (₹${calculatedGrandTotal.toFixed(2)})`}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}

/* ==========================================================================
   INVENTORY LEDGER TAB — Owner Only
   ========================================================================== */
interface StockRowI { item_id: string; name: string; category: string; unit: string; current_quantity: number; low_stock_alert_threshold: number; is_low_stock: boolean }
interface InvItemI   { id: string; name: string; unit: string; category: string }
interface InwardLogI { id: string; quantity: number; unit_cost: number; notes?: string; created_at: string; inventory_items?: { name: string; unit: string; category: string } }

function InventoryLedgerTab() {
  const [stock, setStock]         = React.useState<StockRowI[]>([])
  const [invItems, setInvItems]   = React.useState<InvItemI[]>([])
  const [inwardLogs, setInwardLogs] = React.useState<InwardLogI[]>([])
  const [loading, setLoading]     = React.useState(true)
  const [logMode, setLogMode]     = React.useState<'inward'|'consumption'|null>(null)
  const [itemId, setItemId]       = React.useState('')
  const [qty, setQty]             = React.useState('')
  const [unitCost, setUnitCost]   = React.useState('')
  const [reason, setReason]       = React.useState('daily_use')
  const [note, setNote]           = React.useState('')
  const [saving, setSaving]       = React.useState(false)
  const [msg, setMsg]             = React.useState<{type:'ok'|'err'; text:string}|null>(null)
  const [searchQ, setSearchQ]     = React.useState('')
  const [catFilter, setCatFilter] = React.useState('all')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ data: sv }, { data: iv }, { data: inw }] = await Promise.all([
      supabase.from('current_stock').select('*').order('category, name'),
      supabase.from('inventory_items').select('id, name, unit, category').eq('is_active', true).order('name'),
      supabase.from('stock_inward').select('id, quantity, unit_cost, notes, created_at, inventory_items(name, unit, category)').order('created_at', { ascending: false }).limit(20)
    ])
    setStock(sv || [])
    setInvItems(iv || [])
    setInwardLogs((inw as any) || [])
    setLoading(false)
  }

  async function submitLog() {
    if (!itemId || !qty || parseFloat(qty) <= 0) { setMsg({ type:'err', text:'Fill in item and quantity.' }); return }
    setSaving(true); setMsg(null)
    const table = logMode === 'inward' ? 'stock_inward' : 'stock_consumption'
    const row   = logMode === 'inward'
      ? { item_id: itemId, quantity: parseFloat(qty), unit_cost: parseFloat(unitCost) || 0, notes: note || null }
      : { item_id: itemId, quantity: parseFloat(qty), reason, notes: note || null }
    const { error } = await supabase.from(table).insert(row as any)
    setSaving(false)
    if (error) { setMsg({ type:'err', text: error.message }); return }
    setMsg({ type:'ok', text: logMode === 'inward' ? 'Stock delivery recorded ✓' : 'Usage logged ✓' })
    setItemId(''); setQty(''); setUnitCost(''); setNote('')
    setTimeout(() => { setLogMode(null); setMsg(null); load() }, 1400)
  }

  const cats   = ['all', ...Array.from(new Set(stock.map(s => s.category)))]
  const lowCnt = stock.filter(s => s.is_low_stock).length
  const filtered = stock.filter(s =>
    (catFilter === 'all' || s.category === catFilter) &&
    (!searchQ || s.name.toLowerCase().includes(searchQ.toLowerCase()))
  )

  const totalSupplyExpenditure = inwardLogs.reduce((sum, row) => sum + ((row.quantity || 0) * (row.unit_cost || 0)), 0)

  return (
    <div>
      {/* Financial CRM Summary Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--forest-deep), var(--forest))', color: 'var(--brass-light)', padding: '20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85 }}>Total Supply Outflow Cost</div>
          <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'Fraunces, serif', marginTop: '6px' }}>
            ₹{totalSupplyExpenditure.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '4px' }}>Logged inventory delivery purchases</div>
        </div>
        <div className="stat-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--sage)' }}>Total Inward Deliveries</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest)', fontFamily: 'Fraunces, serif', marginTop: '6px' }}>
            {inwardLogs.length} Deliveries
          </div>
          <div style={{ fontSize: '11px', color: 'var(--sage)', marginTop: '4px' }}>Recent stock arrivals</div>
        </div>
        <div className="stat-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--sage)' }}>Stock Health Status</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: lowCnt > 0 ? 'var(--warn)' : 'var(--forest)', fontFamily: 'Fraunces, serif', marginTop: '6px' }}>
            {lowCnt > 0 ? `${lowCnt} Low Items` : 'Optimal'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--sage)', marginTop: '4px' }}>Items needing replenishment</div>
        </div>
      </div>

      {lowCnt > 0 && (
        <div style={{ background: '#FFF8E6', border: '1.5px solid #E8A020', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#9A6B20' }}>
            {lowCnt} item{lowCnt > 1 ? 's' : ''} running low: {stock.filter(s => s.is_low_stock).map(s => `${s.name} (${s.current_quantity.toFixed(1)} ${s.unit})`).join(', ')}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" className="rcp-btn rcp-btn-primary" onClick={() => setLogMode('inward')}>➕ Log Stock Delivery</button>
        <button type="button" className="rcp-btn rcp-btn-brass" onClick={() => setLogMode('consumption')}>📋 Log Usage / Wastage</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <input placeholder="Search…" value={searchQ} onChange={e => setSearchQ(e.target.value)} className="rcp-input" style={{ width: '160px' }} />
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="rcp-select">
            {cats.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
          <button type="button" className="rcp-btn rcp-btn-ghost" onClick={load}>🔄</button>
        </div>
      </div>

      {logMode && (
        <div className="rcp-card" style={{ padding: '22px', marginBottom: '22px', boxShadow: '0 4px 16px rgba(35,31,22,0.05)' }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '17px', fontWeight: 700, color: 'var(--forest-deep)', marginBottom: '16px' }}>
            {logMode === 'inward' ? '📥 Record Stock Delivery & Purchase Cost' : '📤 Record Usage / Wastage'}
          </div>
          {msg && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '14px', background: msg.type === 'ok' ? '#EDF7EE' : '#FDF1F0', color: msg.type === 'ok' ? '#2C6E3B' : '#9A4530', border: `1px solid ${msg.type==='ok' ? 'rgba(44,110,59,0.2)' : 'rgba(154,69,48,0.2)'}` }}>
              {msg.text}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: logMode === 'inward' ? '2fr 1fr 1fr' : logMode === 'consumption' ? '2fr 1fr 1fr' : '2fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label className="rcp-label">Item *</label>
              <select value={itemId} onChange={e => setItemId(e.target.value)} className="rcp-select" style={{ width: '100%' }}>
                <option value="">Select item…</option>
                {invItems.map(it => <option key={it.id} value={it.id}>{it.name} ({it.unit})</option>)}
              </select>
            </div>
            <div>
              <label className="rcp-label">Quantity *</label>
              <input type="number" min="0.01" step="0.01" placeholder="5.0" value={qty} onChange={e => setQty(e.target.value)} className="rcp-input" style={{ width: '100%' }} />
            </div>
            {logMode === 'inward' && (
              <div>
                <label className="rcp-label">Unit Cost (₹)</label>
                <input type="number" min="0" step="0.01" placeholder="₹120.00" value={unitCost} onChange={e => setUnitCost(e.target.value)} className="rcp-input" style={{ width: '100%' }} />
              </div>
            )}
            {logMode === 'consumption' && (
              <div>
                <label className="rcp-label">Reason</label>
                <select value={reason} onChange={e => setReason(e.target.value)} className="rcp-select" style={{ width: '100%' }}>
                  <option value="daily_use">Daily Use</option>
                  <option value="wastage">Wastage</option>
                  <option value="breakage">Breakage</option>
                  <option value="event">Event</option>
                  <option value="correction">Correction</option>
                </select>
              </div>
            )}
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label className="rcp-label">Notes (Optional)</label>
            <input type="text" placeholder="Vendor / Invoice notes…" value={note} onChange={e => setNote(e.target.value)} className="rcp-input" style={{ width: '100%' }} />
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button type="button" className="rcp-btn rcp-btn-primary" onClick={submitLog} disabled={saving}>{saving ? 'Saving…' : 'Save Log'}</button>
            <button type="button" className="rcp-btn rcp-btn-ghost" onClick={() => { setLogMode(null); setMsg(null) }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rcp-empty-state">Loading stock data…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Stock Levels Table */}
          <div className="rcp-card" style={{ padding: 0, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:'Fraunces, serif', fontSize:'17px', fontWeight:700, color:'var(--forest-deep)' }}>Stock Levels</span>
              <span style={{ fontSize:'12px', color:'var(--sage)' }}>{filtered.length} items</span>
            </div>
            <div className="rcp-table-container">
              <table className="rcp-table">
                <thead>
                  <tr>
                    <th>Item</th><th>Category</th><th>Stock</th><th>Unit</th><th>Alert At</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.item_id}>
                      <td style={{ fontWeight:600 }}>{item.name}</td>
                      <td><span style={{ background:'var(--parchment)', border:'1px solid var(--border)', padding:'2px 8px', borderRadius:'6px', fontSize:'11.5px', textTransform:'capitalize', fontWeight:600 }}>{item.category}</span></td>
                      <td style={{ fontFamily:'IBM Plex Mono, monospace', fontWeight:700, fontSize:'14px', color: item.is_low_stock ? '#9A6B20' : '#2C6E3B' }}>{item.current_quantity.toFixed(1)}</td>
                      <td style={{ color:'var(--sage)' }}>{item.unit}</td>
                      <td style={{ fontFamily:'IBM Plex Mono, monospace', color:'var(--sage)', fontSize:'13px' }}>{item.low_stock_alert_threshold}</td>
                      <td>
                        {item.is_low_stock
                          ? <span style={{ background:'#FFF8E6', color:'#9A6B20', border:'1px solid rgba(154,107,32,0.3)', padding:'3px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:700 }}>⚠ LOW</span>
                          : <span style={{ background:'#EDF7EE', color:'#2C6E3B', border:'1px solid rgba(44,110,59,0.3)', padding:'3px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:700 }}>✓ OK</span>
                        }
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign:'center', padding:'32px', color:'var(--sage)', fontStyle:'italic' }}>No items found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inward Deliveries CRM Ledger Table */}
          <div className="rcp-card" style={{ padding: 0, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <span style={{ fontFamily:'Fraunces, serif', fontSize:'17px', fontWeight:700, color:'var(--forest-deep)' }}>Inward Delivery & Purchase Ledger</span>
                <span style={{ fontSize:'12px', color:'var(--sage)', display:'block', marginTop:'2px' }}>Detailed record of stock arrivals, unit costs, and total investment</span>
              </div>
              <span style={{ fontSize:'12px', color:'var(--sage)' }}>{inwardLogs.length} logs</span>
            </div>
            <div className="rcp-table-container">
              <table className="rcp-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Item Delivered</th>
                    <th>Quantity</th>
                    <th>Unit Cost (₹)</th>
                    <th>Total Cost (₹)</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {inwardLogs.map((log) => {
                    const lineTotal = (log.quantity || 0) * (log.unit_cost || 0)
                    return (
                      <tr key={log.id}>
                        <td style={{ fontSize: '11.5px', color: 'var(--sage)' }}>
                          {new Date(log.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} · {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ fontWeight: 600 }}>{log.inventory_items?.name || 'Item'}</td>
                        <td style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                          {log.quantity} {log.inventory_items?.unit}
                        </td>
                        <td style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                          ₹{log.unit_cost ? Number(log.unit_cost).toLocaleString('en-IN') : '0'}
                        </td>
                        <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, color: 'var(--forest)' }}>
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontSize: '11.5px', color: 'var(--sage)' }}>{log.notes || '—'}</td>
                      </tr>
                    )
                  })}
                  {inwardLogs.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--sage)', fontStyle: 'italic' }}>No stock inward logs recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
/* --------------------------------------------------------------------------
   3. BOOKED ACTIVITIES TAB (S5 New feature: Pending bookings queue + Day Calendar)
   -------------------------------------------------------------------------- */
interface ActivitiesTabProps {
  resortId: string
  refreshKey: number
  triggerRefresh: () => void
}

function ActivitiesTab({ resortId, refreshKey, triggerRefresh }: ActivitiesTabProps) {
  const [bookings, setBookings] = useState<ActivityBooking[]>([])
  const [loading, setLoading] = useState(true)
  
  // Inline Allocation States
  const [activeAllocationId, setActiveAllocationId] = useState<string | null>(null)
  const [guideName, setGuideName] = useState('')
  const [guideInstructions, setGuideInstructions] = useState('')
  
  // Cancel states
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  // Calendar Schedule State
  const [todaySchedule, setTodaySchedule] = useState<ActivityBooking[]>([])

  // Manual Activity Booking Form state
  const [showManualBookingModal, setShowManualBookingModal] = useState(false)
  const [activeGuestsList, setActiveGuestsList] = useState<any[]>([])
  const [activitiesList, setActivitiesList] = useState<any[]>([])
  const [slotsList, setSlotsList] = useState<any[]>([])
  const [selGuestId, setSelGuestId] = useState('')
  const [selActivityId, setSelActivityId] = useState('')
  const [selSlotId, setSelSlotId] = useState('')
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0])
  const [numGuests, setNumGuests] = useState(1)
  const [specialReq, setSpecialReq] = useState('')
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [bookingErr, setBookingErr] = useState('')

  async function openManualBookingModal() {
    setBookingErr('')
    setShowManualBookingModal(true)
    try {
      const [{ data: gList }, { data: aList }, { data: sList }] = await Promise.all([
        supabase.from('guests').select('id, guest_name, rooms(room_number), room_id').eq('resort_id', resortId).eq('status', 'checked_in'),
        supabase.from('activities').select('id, name, price_inr').eq('resort_id', resortId).eq('is_available', true),
        supabase.from('activity_time_slots').select('id, label').eq('resort_id', resortId).eq('is_active', true)
      ])
      setActiveGuestsList((gList || []).map((g: any) => ({ id: g.id, guest_name: g.guest_name, room_number: g.rooms?.room_number, room_id: g.room_id })))
      setActivitiesList(aList || [])
      setSlotsList(sList || [])
    } catch (err) {
      console.error('Failed to load manual booking dependencies:', err)
    }
  }

  async function handleManualBookingSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selGuestId || !selActivityId || !selSlotId) {
      setBookingErr('Please select guest, activity, and time slot.')
      return
    }
    setBookingSubmitting(true)
    setBookingErr('')
    try {
      const selectedGuest = activeGuestsList.find(g => g.id === selGuestId)
      const selectedAct = activitiesList.find(a => a.id === selActivityId)
      const totalCost = (selectedAct?.price_inr || 0) * numGuests

      const { error } = await supabase.from('activity_bookings').insert({
        resort_id: resortId,
        guest_id: selGuestId,
        room_id: selectedGuest?.room_id || null,
        activity_id: selActivityId,
        slot_id: selSlotId,
        booking_date: bookingDate,
        number_of_guests: numGuests,
        total_amount: totalCost,
        status: 'confirmed',
        special_requests: specialReq || null
      } as any)

      if (error) throw error

      setShowManualBookingModal(false)
      setSelGuestId('')
      setSelActivityId('')
      setSelSlotId('')
      setSpecialReq('')
      triggerRefresh()
    } catch (err: any) {
      console.error('Manual booking error:', err)
      setBookingErr(err.message || 'Failed to book activity')
    } finally {
      setBookingSubmitting(false)
    }
  }

  // Load Bookings & Calendar list
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // 1. Fetch pending/confirmed bookings for today/future
        const { data, error } = await supabase
          .from('activity_bookings')
          .select(`
            *,
            activities ( name, notes_for_staff ),
            activity_time_slots ( label ),
            rooms ( room_number )
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        if (error) throw error

        setBookings((data || []).map((b: any) => ({
          ...b,
          activity_name: b.activities?.name,
          slot_label: b.activity_time_slots?.label,
          room_number: b.rooms?.room_number,
          staff_instructions: b.activities?.notes_for_staff
        })))

        // 2. Fetch today and tomorrow's confirmed schedule
        const today = new Date().toISOString().split('T')[0]
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomStr = tomorrow.toISOString().split('T')[0]

        const { data: calList } = await supabase
          .from('activity_bookings')
          .select(`
            *,
            activities ( name ),
            activity_time_slots ( label ),
            rooms ( room_number )
          `)
          .in('booking_date', [today, tomStr])
          .eq('status', 'confirmed')
          .order('booking_date')

        setTodaySchedule((calList || []).map((b: any) => ({
          ...b,
          activity_name: b.activities?.name,
          slot_label: b.activity_time_slots?.label,
          room_number: b.rooms?.room_number
        })))

      } catch (err) {
        console.error('Activities load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()

    // Realtime subscription to pending bookings queue
    const channel = supabase
      .channel('reception_activities')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_bookings' },
        () => {
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [resortId, refreshKey])

  // Confirm booking & allocate Guide
  async function handleConfirmBooking(id: string) {
    if (!guideName) return
    try {
      const { error } = await supabase
        .from('activity_bookings')
        .update({
          status: 'confirmed',
          assigned_staff_name: guideName,
          staff_instructions: guideInstructions || null
        })
        .eq('id', id)

      if (error) throw error
      setActiveAllocationId(null)
      setGuideName('')
      setGuideInstructions('')
      triggerRefresh()
    } catch (err) {
      console.error('Failed to confirm booking:', err)
    }
  }

  // Cancel booking
  async function handleCancelBooking(id: string) {
    try {
      const { error } = await supabase
        .from('activity_bookings')
        .update({
          status: 'cancelled',
          staff_instructions: cancelReason ? `Cancelled: ${cancelReason}` : 'Cancelled by desk'
        })
        .eq('id', id)

      if (error) throw error
      setCancelBookingId(null)
      setCancelReason('')
      triggerRefresh()
    } catch (err) {
      console.error('Failed to cancel booking:', err)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'var(--card)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--forest)', fontFamily: 'Fraunces, serif' }}>
            Resort Experience & Activity Folios
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--sage)' }}>
            Confirm guest experience requests or manually book activities for checked-in guests.
          </p>
        </div>
        <button
          onClick={openManualBookingModal}
          className="rcp-btn rcp-btn-primary"
          style={{ gap: '8px', padding: '10px 18px' }}
        >
          ➕ Book Activity for Guest
        </button>
      </div>

      <div className="rcp-two-column-grid">
        
        {/* 1. Pending Bookings List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--forest)', fontFamily: 'Fraunces, serif' }}>
            Pending Requests Queue
          </h3>
          
          {loading ? (
            <div className="rcp-empty-state">Checking pending queue...</div>
          ) : bookings.length === 0 ? (
            <div className="rcp-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--sage)' }}>
              🎉 All experience requests have been allocated and confirmed!
            </div>
          ) : (
            bookings.map(b => (
              <div key={b.id} className="rcp-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--forest)' }}>{b.activity_name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--sage)', display: 'block', marginTop: '2px' }}>
                      Room {b.room_number} · {b.guest_name} ({b.number_of_guests} guest(s))
                    </span>
                  </div>
                  <strong style={{ fontSize: '14px', color: 'var(--warn)' }}>₹{b.total_amount}</strong>
                </div>

                <div style={{ borderTop: '1px dashed var(--border-strong)' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--sage)', fontSize: '10px', textTransform: 'uppercase' }}>Scheduled Date</strong>
                    {b.booking_date}
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--sage)', fontSize: '10px', textTransform: 'uppercase' }}>Time Slot</strong>
                    {b.slot_label}
                  </div>
                </div>

                {b.special_requests && (
                  <div style={{ background: 'var(--surface-2)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--ink-soft)' }}>
                    <strong>Guest Requests:</strong> {b.special_requests}
                  </div>
                )}

                {/* Confirm / Cancel Actions */}
                {activeAllocationId === b.id ? (
                  /* Guide Allocation Sub-form */
                  <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--brass)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                    <h5 style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: 'var(--warn)' }}>Allocate Guide & Instructions</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Guide name (Ramesh)"
                        value={guideName}
                        onChange={(e) => setGuideName(e.target.value)}
                        className="rcp-input"
                      />
                      <input
                        type="text"
                        placeholder="Meet at garden gate 6:50 AM..."
                        value={guideInstructions}
                        onChange={(e) => setGuideInstructions(e.target.value)}
                        className="rcp-input"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setActiveAllocationId(null)}
                        className="rcp-btn rcp-btn-secondary"
                      >Cancel</button>
                      <button
                        onClick={() => handleConfirmBooking(b.id)}
                        disabled={!guideName}
                        className="rcp-btn rcp-btn-primary"
                      >Confirm Booking</button>
                    </div>
                  </div>
                ) : cancelBookingId === b.id ? (
                  /* Cancel reason */
                  <div style={{ background: 'var(--danger-bg)', border: '1.5px solid var(--danger)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Enter cancellation reason..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="rcp-input"
                      style={{ flex: 1, borderColor: 'rgba(154,69,48,0.2)' }}
                    />
                    <button onClick={() => setCancelBookingId(null)} className="rcp-btn rcp-btn-secondary">Back</button>
                    <button onClick={() => handleCancelBooking(b.id)} className="rcp-btn rcp-btn-danger">Confirm Cancel</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                      onClick={() => setCancelBookingId(b.id)}
                      className="rcp-btn rcp-btn-ghost"
                      style={{ color: 'var(--danger)', borderColor: 'var(--border)' }}
                    >Cancel</button>
                    <button
                      onClick={() => {
                        setGuideName('')
                        setGuideInstructions('')
                        setActiveAllocationId(b.id)
                      }}
                      className="rcp-btn rcp-btn-primary"
                    >Allocate & Confirm</button>
                  </div>
                )}

              </div>
            ))
          )}
        </div>

        {/* 2. Today & Tomorrow Day Calendar Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--forest)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Fraunces, serif' }}>
            <Calendar size={16} />
            Day-View Schedule
          </h3>
          
          <div className="rcp-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todaySchedule.length === 0 ? (
                <div className="rcp-empty-state">No confirmed excursions scheduled today or tomorrow.</div>
              ) : (
                todaySchedule.map(sch => (
                  <div 
                    key={sch.id}
                    style={{
                      background: 'var(--surface-2)',
                      borderLeft: '4px solid var(--brass)',
                      padding: '8px 12px',
                      fontSize: '12px',
                      borderRadius: '0 8px 8px 0'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>{sch.activity_name}</span>
                      <span>Room {sch.room_number}</span>
                    </div>
                    <div style={{ color: 'var(--sage)', marginTop: '2px', fontSize: '11px' }}>
                      Date: {sch.booking_date} · {sch.slot_label}
                    </div>
                    {(sch.assigned_staff_name || sch.assigned_staff) && (
                      <div style={{ color: 'var(--forest)', fontWeight: 600, marginTop: '4px', fontSize: '11px' }}>
                        Guide: {sch.assigned_staff_name || sch.assigned_staff}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* MANUAL ACTIVITY BOOKING MODAL */}
      {showManualBookingModal && (
        <div className="rcp-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="rcp-card" style={{ maxWidth: '460px', width: '100%', padding: '24px 20px', maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 700, color: 'var(--forest)' }}>
                New Activity Folio Booking
              </h3>
              <button onClick={() => setShowManualBookingModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--sage)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {bookingErr && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(154,69,48,0.2)', color: 'var(--danger)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
                {bookingErr}
              </div>
            )}

            <form onSubmit={handleManualBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="rcp-label">Checked-In Guest / Room *</label>
                <select
                  value={selGuestId}
                  onChange={(e) => setSelGuestId(e.target.value)}
                  className="rcp-select"
                >
                  <option value="">Select guest stay...</option>
                  {activeGuestsList.map(g => (
                    <option key={g.id} value={g.id}>Room {g.room_number} — {g.guest_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="rcp-label">Activity / Experience *</label>
                <select
                  value={selActivityId}
                  onChange={(e) => setSelActivityId(e.target.value)}
                  className="rcp-select"
                >
                  <option value="">Select activity...</option>
                  {activitiesList.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (₹{a.price_inr} / guest)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="rcp-label">Date *</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="rcp-input"
                  />
                </div>
                <div>
                  <label className="rcp-label">Time Slot *</label>
                  <select
                    value={selSlotId}
                    onChange={(e) => setSelSlotId(e.target.value)}
                    className="rcp-select"
                  >
                    <option value="">Select slot...</option>
                    {slotsList.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="rcp-label">Number of Guests</label>
                <input
                  type="number"
                  min={1}
                  value={numGuests}
                  onChange={(e) => setNumGuests(parseInt(e.target.value) || 1)}
                  className="rcp-input"
                />
              </div>

              <div>
                <label className="rcp-label">Special Requests / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Needs extra trekking poles"
                  value={specialReq}
                  onChange={(e) => setSpecialReq(e.target.value)}
                  className="rcp-input"
                />
              </div>

              <button
                type="submit"
                disabled={bookingSubmitting}
                className="rcp-btn rcp-btn-primary"
                style={{ justifyContent: 'center', padding: '12px', marginTop: '10px' }}
              >
                {bookingSubmitting ? 'Booking Experience...' : 'Post Experience to Folio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* --------------------------------------------------------------------------
   4. MENU CONTROL TAB
   -------------------------------------------------------------------------- */
interface MenuTabProps {
  resortId: string
  refreshKey: number
  triggerRefresh: () => void
}

function MenuTab({ resortId, refreshKey, triggerRefresh }: MenuTabProps) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)
  
  // Edit Categories states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [fromTime, setFromTime] = useState('')
  const [untilTime, setUntilTime] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)

  // Fetch Menu lists
  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true)

        // 1. Fetch categories
        const { data: cats, error: catsErr } = await supabase
          .from('menu_categories')
          .select('id, name, available_from, available_until')
          .order('name')
        if (catsErr) throw catsErr
        setCategories(cats || [])

        // 2. Fetch items with category name
        const { data: menuList, error: itemsErr } = await supabase
          .from('menu_items')
          .select(`
            id,
            name,
            category_id,
            price,
            is_available,
            menu_categories ( name )
          `)
        if (itemsErr) throw itemsErr

        const resolved: MenuItem[] = (menuList || []).map((it: any) => ({
          id: it.id,
          name: it.name,
          category_id: it.category_id,
          category_name: it.menu_categories?.name || 'Unassigned',
          price: it.price,
          is_available: it.is_available
        }))

        // Sort by category then item name
        resolved.sort((a, b) => (a.category_name || '').localeCompare(b.category_name || '') || a.name.localeCompare(b.name))
        setItems(resolved)

      } catch (err) {
        console.error('Menu load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadMenu()
  }, [resortId, refreshKey])

  // Toggle Availability
  async function handleToggleAvailable(itemId: string, currentStatus: boolean) {
    setUpdatingItemId(itemId)
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !currentStatus })
        .eq('id', itemId)
      if (error) throw error
      triggerRefresh()
    } catch (err) {
      console.error('Failed to update item availability:', err)
      setItems(prev => prev.map(it => it.id === itemId ? { ...it, is_available: !currentStatus } : it))
    } finally {
      setUpdatingItemId(null)
    }
  }

  // Save Category available hours
  async function handleSaveCategoryHours(e: React.FormEvent) {
    e.preventDefault()
    if (!editingCategory) return

    setSavingCategory(true)
    try {
      const { error } = await supabase
        .from('menu_categories')
        .update({
          available_from: fromTime,
          available_until: untilTime
        })
        .eq('id', editingCategory.id)

      if (error) throw error
      setEditingCategory(null)
      triggerRefresh()
    } catch (err) {
      console.error('Failed to update category hours:', err)
      setEditingCategory(null)
    } finally {
      setSavingCategory(false)
    }
  }

  return (
    <div className="rcp-two-column-grid" style={{ alignItems: 'start' }}>
      
      {/* 1. Items Stock Control List */}
      <div className="rcp-card" style={{ overflow: 'hidden' }}>
        <div style={{ background: '#FDFDFB', borderBottom: '1px solid var(--border)', padding: '14px 20px', fontWeight: 600 }}>
          Menu Items Inventory Status ({items.length} items)
        </div>
        {loading ? (
          <div className="rcp-empty-state">Loading items stock...</div>
        ) : (
          <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            <div className="rcp-table-container">
              <table className="rcp-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'center' }}>Stock Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(it => (
                    <tr key={it.id}>
                      <td style={{ fontWeight: 600 }}>{it.name}</td>
                      <td style={{ color: 'var(--sage)' }}>{it.category_name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{it.price}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleAvailable(it.id, it.is_available)}
                          disabled={updatingItemId === it.id}
                          className={`rcp-btn ${it.is_available ? 'rcp-btn-ghost' : 'rcp-btn-danger'}`}
                        style={{
                          background: it.is_available ? 'rgba(45,80,22,0.1)' : 'var(--danger-bg)',
                          borderColor: it.is_available ? 'var(--forest)' : 'rgba(154,69,48,0.2)',
                          color: it.is_available ? 'var(--forest)' : 'var(--danger)',
                          borderRadius: '20px',
                          fontSize: '11px',
                          width: '100px',
                          justifyContent: 'center'
                        }}
                      >
                        {updatingItemId === it.id ? 'Toggling...' : it.is_available ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* 2. Categories Time-Gating list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="rcp-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px', fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 700, color: 'var(--forest)' }}>
            Category Hours Gating
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categories.map(cat => (
              <div 
                key={cat.id}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '13px', color: 'var(--ink)' }}>{cat.name}</strong>
                  <span style={{ color: 'var(--sage)', display: 'block', marginTop: '2px' }}>
                    🕒 {cat.available_from.slice(0, 5)} - {cat.available_until.slice(0, 5)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory(cat)
                    setFromTime(cat.available_from)
                    setUntilTime(cat.available_until)
                  }}
                  className="rcp-btn rcp-btn-ghost"
                  style={{
                    borderColor: 'var(--brass)',
                    color: 'var(--warn)',
                    padding: '4px 8px',
                    fontSize: '11px'
                  }}
                >
                  Edit Hours
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CATEGORY TIME EDITOR BOX */}
        {editingCategory && (
          <div className="rcp-card" style={{ borderColor: 'var(--brass)', padding: '20px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: 'var(--warn)' }}>
              Adjust Hours: {editingCategory.name}
            </h4>
            <form onSubmit={handleSaveCategoryHours} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label className="rcp-label" style={{ fontSize: '10px', marginBottom: '2px' }}>From</label>
                  <input
                    type="time"
                    step="1"
                    value={fromTime}
                    onChange={(e) => setFromTime(e.target.value)}
                    className="rcp-input"
                    style={{ padding: '6px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="rcp-label" style={{ fontSize: '10px', marginBottom: '2px' }}>Until</label>
                  <input
                    type="time"
                    step="1"
                    value={untilTime}
                    onChange={(e) => setUntilTime(e.target.value)}
                    className="rcp-input"
                    style={{ padding: '6px' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="rcp-btn rcp-btn-secondary"
                  style={{ flex: 1, padding: '8px', justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="rcp-btn rcp-btn-primary"
                  style={{ flex: 2, padding: '8px', justifyContent: 'center' }}
                >
                  {savingCategory ? 'Saving...' : 'Save Hours'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  )
}

/* --------------------------------------------------------------------------
   5. MANAGE ACTIVITIES TAB (S5 New feature: Add, Edit, Slot control for Owner)
   -------------------------------------------------------------------------- */
interface ActivityMgmtTabProps {
  resortId: string
}

function ActivityMgmtTab({ resortId }: ActivityMgmtTabProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  // Edit Excursion drawer states
  const [editActivity, setEditActivity] = useState<ActivityItem | null>(null)
  const [actName, setActName] = useState('')
  const [actDesc, setActDesc] = useState('')
  const [actType, setActType] = useState<'per_person'|'per_setup'|'per_session'>('per_person')
  const [actPrice, setActPrice] = useState(0)
  const [actBalcony, setActBalcony] = useState(false)
  const [actMaxCap, setActMaxCap] = useState(10)
  const [savingAct, setSavingAct] = useState(false)
  
  // Slots states
  const [slots, setSlots] = useState<ActivitySlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [newSlotLabel, setNewSlotLabel] = useState('')
  const [newSlotStart, setNewSlotStart] = useState('10:00:00')
  const [newSlotEnd, setNewSlotEnd] = useState('11:30:00')
  const [newSlotDays, setNewSlotDays] = useState<number[]>([1,2,3,4,5,6,0]) // Mon-Sun
  const [addingSlot, setAddingSlot] = useState(false)

  // Fetch Activities
  useEffect(() => {
    async function loadActivities() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('resort_id', resortId)
          .order('name')
        if (error) throw error
        setActivities(data || [])
      } catch (err) {
        console.error('Failed to load activity list:', err)
      } finally {
        setLoading(false)
      }
    }
    loadActivities()
  }, [resortId])

  // Fetch Slots for selected editing activity
  useEffect(() => {
    if (!editActivity) return
    const activityId = editActivity.id
    async function loadSlots() {
      setLoadingSlots(true)
      try {
        const { data, error } = await supabase
          .from('activity_time_slots')
          .select('*')
          .eq('activity_id', activityId)
        if (error) throw error
        setSlots(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingSlots(false)
      }
    }
    loadSlots()
  }, [editActivity])

  // Toggle Excursion availability
  async function handleToggleActivity(id: string, status: boolean) {
    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('activities')
        .update({ is_available: !status })
        .eq('id', id)
      if (error) throw error
      setActivities(prev => prev.map(a => a.id === id ? { ...a, is_available: !status } : a))
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  // Save Activity details
  async function handleSaveActivity(e: React.FormEvent) {
    e.preventDefault()
    if (!editActivity) return

    setSavingAct(true)
    const updates = {
      name: actName,
      description: actDesc,
      pricing_type: actType,
      price_per_person: actType === 'per_person' ? actPrice : null,
      price_per_setup: actType === 'per_setup' ? actPrice : null,
      price_per_session: actType === 'per_session' ? actPrice : null,
      requires_balcony: actBalcony,
      max_capacity_per_slot: actMaxCap
    }

    try {
      const { error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', editActivity.id)
      
      if (error) throw error
      
      setActivities(prev => prev.map(a => a.id === editActivity.id ? { ...a, ...updates } : a))
      setEditActivity(null)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingAct(false)
    }
  }

  // Toggle slot active status
  async function handleToggleSlot(slotId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('activity_time_slots')
        .update({ is_active: !currentStatus })
        .eq('id', slotId)
      if (error) throw error
      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, is_active: !currentStatus } : s))
    } catch (err) {
      console.error(err)
    }
  }

  // Add new Slot
  async function handleAddSlot(e: React.FormEvent) {
    e.preventDefault()
    if (!editActivity || !newSlotLabel) return

    setAddingSlot(true)
    try {
      const { data, error } = await supabase
        .from('activity_time_slots')
        .insert({
          activity_id: editActivity.id,
          label: newSlotLabel,
          start_time: newSlotStart,
          end_time: newSlotEnd,
          days_available: newSlotDays
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        setSlots(prev => [...prev, data])
      }
      setNewSlotLabel('')
    } catch (err) {
      console.error(err)
    } finally {
      setAddingSlot(false)
    }
  }

  function handleDayToggle(dayNum: number) {
    if (newSlotDays.includes(dayNum)) {
      setNewSlotDays(prev => prev.filter(d => d !== dayNum))
    } else {
      setNewSlotDays(prev => [...prev, dayNum])
    }
  }

  return (
    <div className={editActivity ? 'rcp-edit-grid' : ''} style={{ gap: '30px', alignItems: 'start' }}>
      
      {/* Excursions overview */}
      <div className="rcp-card" style={{ overflow: 'hidden' }}>
        <div style={{ background: '#FDFDFB', borderBottom: '1px solid var(--border)', padding: '14px 20px', fontWeight: 600 }}>
          Resort Experiences Inventory
        </div>
        {loading ? (
          <div className="rcp-empty-state">Loading experiences...</div>
        ) : (
          <div className="rcp-table-container">
            <table className="rcp-table">
            <thead>
              <tr>
                <th>Excursion Name</th>
                <th>Pricing Type</th>
                <th style={{ textAlign: 'right' }}>Unit Pricing</th>
                <th style={{ textAlign: 'center' }}>Balcony Badging</th>
                <th style={{ textAlign: 'center' }}>Excursion Status</th>
                <th style={{ textAlign: 'center' }}>Modify</th>
              </tr>
            </thead>
            <tbody>
              {activities.map(a => {
                const price = a.pricing_type === 'per_person' ? a.price_per_person
                            : a.pricing_type === 'per_setup' ? a.price_per_setup
                            : a.price_per_session
                return (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td style={{ color: 'var(--sage)', textTransform: 'capitalize' }}>
                      {a.pricing_type.replace('_', ' ')}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      ₹{price?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                      {a.requires_balcony ? '⚠️ Yes' : 'No'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleActivity(a.id, a.is_available)}
                        disabled={updatingId === a.id}
                        className={`rcp-btn ${a.is_available ? 'rcp-btn-ghost' : 'rcp-btn-danger'}`}
                        style={{
                          background: a.is_available ? 'rgba(45,80,22,0.1)' : 'var(--danger-bg)',
                          borderColor: a.is_available ? 'var(--forest)' : 'rgba(154,69,48,0.2)',
                          color: a.is_available ? 'var(--forest)' : 'var(--danger)',
                          borderRadius: '20px',
                          fontSize: '11px',
                          width: '100px',
                          justifyContent: 'center'
                        }}
                      >
                        {updatingId === a.id ? 'Updating...' : a.is_available ? 'Available' : 'Disabled'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setEditActivity(a)
                          setActName(a.name)
                          setActDesc(a.description)
                          setActType(a.pricing_type)
                          setActPrice(price || 0)
                          setActBalcony(a.requires_balcony)
                          setActMaxCap(a.max_capacity_per_slot)
                        }}
                        className="rcp-btn rcp-btn-ghost"
                        style={{
                          borderColor: 'var(--brass)',
                          color: 'var(--warn)'
                        }}
                      >
                        Edit Details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Edit Activity Drawer */}
      {editActivity && (
        <div className="rcp-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 700, color: 'var(--forest)' }}>
              Edit: {editActivity.name}
            </h4>
            <button onClick={() => setEditActivity(null)} style={{ background: 'transparent', border: 'none', color: 'var(--sage)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSaveActivity} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label className="rcp-label" style={{ fontSize: '10px', marginBottom: '2px' }}>Name</label>
              <input
                type="text"
                value={actName}
                onChange={(e) => setActName(e.target.value)}
                className="rcp-input"
                style={{ padding: '8px' }}
              />
            </div>

            <div>
              <label className="rcp-label" style={{ fontSize: '10px', marginBottom: '2px' }}>Description</label>
              <input
                type="text"
                value={actDesc}
                onChange={(e) => setActDesc(e.target.value)}
                className="rcp-input"
                style={{ padding: '8px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px' }}>
              <div>
                <label className="rcp-label" style={{ fontSize: '10px', marginBottom: '2px' }}>Pricing Mechanism</label>
                <select
                  value={actType}
                  onChange={(e: any) => setActType(e.target.value)}
                  className="rcp-select"
                  style={{ padding: '7px' }}
                >
                  <option value="per_person">Per Person</option>
                  <option value="per_setup">Per Setup</option>
                  <option value="per_session">Per Session</option>
                </select>
              </div>
              <div>
                <label className="rcp-label" style={{ fontSize: '10px', marginBottom: '2px' }}>Amount (₹)</label>
                <input
                  type="number"
                  value={actPrice}
                  onChange={(e) => setActPrice(parseInt(e.target.value) || 0)}
                  className="rcp-input"
                  style={{ padding: '8px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={actBalcony}
                  onChange={(e) => setActBalcony(e.target.checked)}
                />
                Requires balcony setup
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Max Cap:</span>
                <input
                  type="number"
                  value={actMaxCap}
                  onChange={(e) => setActMaxCap(parseInt(e.target.value) || 1)}
                  className="rcp-input"
                  style={{ width: '50px', padding: '4px', textAlign: 'center' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingAct}
              className="rcp-btn rcp-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {savingAct ? 'Saving updates...' : 'Save Activity Info'}
            </button>
          </form>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: '12px', marginBottom: '12px' }} />

          {/* Time slots config */}
          <div>
            <h5 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: 'var(--warn)' }}>Excursion Time Slots</h5>
            {loadingSlots ? (
              <div className="rcp-empty-state">Checking slots config...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {slots.map(sl => (
                  <div key={sl.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '8px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                    <div>
                      <strong style={{ color: 'var(--ink)' }}>{sl.label}</strong>
                      <span style={{ color: 'var(--sage)', display: 'block', fontSize: '9px' }}>
                        🕒 {sl.start_time.slice(0, 5)} - {sl.end_time.slice(0, 5)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleSlot(sl.id, sl.is_active)}
                      className={`rcp-btn ${sl.is_active ? 'rcp-btn-ghost' : 'rcp-btn-danger'}`}
                      style={{
                        background: sl.is_active ? 'rgba(45,80,22,0.1)' : 'var(--danger-bg)',
                        border: 'none',
                        color: sl.is_active ? 'var(--forest)' : 'var(--danger)',
                        padding: '4px 8px',
                        fontSize: '10px'
                      }}
                    >
                      {sl.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Slot */}
            <form onSubmit={handleAddSlot} style={{ background: 'var(--surface-2)', border: '1px dashed var(--brass)', padding: '12px', borderRadius: '6px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <strong style={{ fontSize: '11px', color: 'var(--warn)' }}>Add Time Slot</strong>
              <input
                type="text"
                placeholder="Slot label (e.g. Afternoon Slot)"
                value={newSlotLabel}
                onChange={(e) => setNewSlotLabel(e.target.value)}
                className="rcp-input"
                style={{ padding: '6px', fontSize: '11px' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label className="rcp-label" style={{ fontSize: '9px' }}>Start Time</label>
                  <input
                    type="time"
                    step="1"
                    value={newSlotStart}
                    onChange={(e) => setNewSlotStart(e.target.value)}
                    className="rcp-input"
                    style={{ padding: '4px', fontSize: '10px' }}
                  />
                </div>
                <div>
                  <label className="rcp-label" style={{ fontSize: '9px' }}>End Time</label>
                  <input
                    type="time"
                    step="1"
                    value={newSlotEnd}
                    onChange={(e) => setNewSlotEnd(e.target.value)}
                    className="rcp-input"
                    style={{ padding: '4px', fontSize: '10px' }}
                  />
                </div>
              </div>
              
              <div>
                <span className="rcp-label" style={{ fontSize: '9px', marginBottom: '2px' }}>Days available</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['M','T','W','T','F','S','S'].map((day, i) => {
                    const dayNum = i === 6 ? 0 : i + 1
                    const isSelected = newSlotDays.includes(dayNum)
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleDayToggle(dayNum)}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: 'none',
                          background: isSelected ? 'var(--forest)' : '#DDD',
                          color: isSelected ? 'white' : '#555',
                          fontSize: '9px',
                          cursor: 'pointer'
                        }}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={addingSlot || !newSlotLabel}
                className="rcp-btn"
                style={{ background: 'var(--brass)', color: 'white', width: '100%', justifyContent: 'center' }}
              >
                {addingSlot ? 'Adding slot...' : 'Add Slot'}
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  )
}

/* --------------------------------------------------------------------------
   6. ANALYTICS DASHBOARD TAB
   -------------------------------------------------------------------------- */
interface AnalyticsTabProps {
  resortId: string
}

function AnalyticsTab({ resortId }: AnalyticsTabProps) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    walkInCount: 0,
    walkInRevenue: 0,
    walkInAov: 0,
    residentCount: 0,
    residentRevenue: 0,
    residentAov: 0,
    topItems: [] as Array<{ name: string; qty: number }>
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true)

        // 1. Fetch Today's Orders with details
        const { data: todayOrders } = await supabase
          .from('orders')
          .select(`
            id,
            subtotal,
            tax_amount,
            grand_total,
            room_id,
            table_id,
            service_type,
            payment_status,
            rooms ( room_number )
          `)
          .eq('resort_id', resortId)
          .not('status', 'eq', 'cancelled')
        
        let totalRev = 0
        let walkInRev = 0
        let residentRev = 0
        let walkInCnt = 0
        let residentCnt = 0

        ;(todayOrders || []).forEach((o: any) => {
          const isResident = !!o.room_id || !!o.rooms?.room_number || o.service_type === 'room_service'
          const sub = o.subtotal || 0
          const tax = o.tax_amount != null ? o.tax_amount : Math.round(sub * 0.05 * 100) / 100
          const grand = o.grand_total != null ? o.grand_total : Math.round((sub + tax) * 100) / 100

          totalRev += grand
          if (isResident) {
            residentCnt++
            residentRev += grand
          } else {
            walkInCnt++
            walkInRev += grand
          }
        })

        const walkInAov = walkInCnt > 0 ? Math.round(walkInRev / walkInCnt) : 0
        const residentAov = residentCnt > 0 ? Math.round(residentRev / residentCnt) : 0

        // 2. Fetch Top Items (group by in code from JSONB items arrays)
        const { data: allItemsRaw } = await supabase
          .from('orders')
          .select('items')
          .eq('resort_id', resortId)
          .not('status', 'eq', 'cancelled')
        
        const counts: Record<string, number> = {}
        ;(allItemsRaw || []).forEach(row => {
          if (Array.isArray(row.items)) {
            row.items.forEach((it: any) => {
              counts[it.name] = (counts[it.name] || 0) + (parseInt(it.qty) || 0)
            })
          }
        })
        const resolvedTop = Object.entries(counts)
          .map(([name, qty]) => ({ name, qty }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5)

        setStats({
          totalOrders: todayOrders?.length || 0,
          totalRevenue: Math.round(totalRev),
          walkInCount: walkInCnt,
          walkInRevenue: Math.round(walkInRev),
          walkInAov,
          residentCount: residentCnt,
          residentRevenue: Math.round(residentRev),
          residentAov,
          topItems: resolvedTop
        })

      } catch (err) {
        console.error('Analytics query error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [resortId])

  const totalRevForSplit = (stats.walkInRevenue + stats.residentRevenue) || 1
  const walkInPct = Math.round((stats.walkInRevenue / totalRevForSplit) * 100)
  const residentPct = 100 - walkInPct

  return (
    <div>
      {loading ? (
        <div className="rcp-empty-state">Loading live resort analytics...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Owner Highlight: Walk-In Diners vs In-House Residents */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            
            {/* Walk-In Card */}
            <div className="stat-card" style={{ borderLeft: '5px solid var(--brass)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '18px' }}>🍽️</span>
                  <span className="stat-card-label" style={{ color: 'var(--brass)', fontWeight: 800 }}>
                    Walk-In Outside Diners
                  </span>
                </div>
                <h3 className="stat-card-value" style={{ margin: '8px 0 4px', fontSize: '24px' }}>
                  {stats.walkInCount} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sage)' }}>Orders</span>
                </h3>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
                  ₹{stats.walkInRevenue.toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: 'var(--sage)', fontWeight: 500 }}>(Direct Revenue)</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--sage)', marginTop: '4px' }}>
                  Avg Order: ₹{stats.walkInAov} · Table / Takeaway
                </div>
              </div>
            </div>

            {/* In-House Resident Card */}
            <div className="stat-card" style={{ borderLeft: '5px solid var(--forest)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '18px' }}>🛎️</span>
                  <span className="stat-card-label" style={{ color: 'var(--forest)', fontWeight: 800 }}>
                    In-House Room Residents
                  </span>
                </div>
                <h3 className="stat-card-value" style={{ margin: '8px 0 4px', fontSize: '24px' }}>
                  {stats.residentCount} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sage)' }}>Orders</span>
                </h3>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
                  ₹{stats.residentRevenue.toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: 'var(--sage)', fontWeight: 500 }}>(Room Folio Billed)</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--sage)', marginTop: '4px' }}>
                  Avg Order: ₹{stats.residentAov} · Room Service
                </div>
              </div>
            </div>

            {/* Combined Totals Card */}
            <div className="stat-card" style={{ borderLeft: '5px solid #1E88E5' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '18px' }}>💰</span>
                  <span className="stat-card-label" style={{ color: '#1565C0', fontWeight: 800 }}>
                    Total F&amp;B Revenue (5% GST)
                  </span>
                </div>
                <h3 className="stat-card-value" style={{ margin: '8px 0 4px', fontSize: '24px', color: 'var(--forest-deep)' }}>
                  ₹{stats.totalRevenue.toLocaleString('en-IN')}
                </h3>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
                  {stats.totalOrders} <span style={{ fontSize: '11px', color: 'var(--sage)', fontWeight: 500 }}>Total Kitchen Orders</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--sage)', marginTop: '4px' }}>
                  Live Supabase Realtime Tracked
                </div>
              </div>
            </div>

          </div>

          {/* Revenue Split Comparative Bar */}
          <div className="rcp-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: 'var(--forest-deep)' }}>
                Revenue Origin Split: Outside Diners vs In-House Guests
              </h4>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>
                <span style={{ color: 'var(--brass)' }}>🍽️ Walk-In: {walkInPct}%</span>
                <span style={{ margin: '0 8px', color: 'var(--border)' }}>|</span>
                <span style={{ color: 'var(--forest)' }}>🛎️ Room Folio: {residentPct}%</span>
              </div>
            </div>

            {/* Split Bar */}
            <div style={{ width: '100%', height: '14px', borderRadius: '100px', overflow: 'hidden', display: 'flex', background: 'var(--surface-2)' }}>
              <div style={{ width: `${walkInPct}%`, height: '100%', background: 'var(--brass)', transition: 'width 0.4s ease' }} title={`Walk-In: ${walkInPct}%`} />
              <div style={{ width: `${residentPct}%`, height: '100%', background: 'var(--forest)', transition: 'width 0.4s ease' }} title={`Room Folio: ${residentPct}%`} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11.5px', color: 'var(--sage)' }}>
              <span>Walk-In: ₹{stats.walkInRevenue.toLocaleString('en-IN')} ({stats.walkInCount} customers)</span>
              <span>Room Folio: ₹{stats.residentRevenue.toLocaleString('en-IN')} ({stats.residentCount} orders)</span>
            </div>
          </div>

          {/* Top 5 ordered items */}
          <div className="rcp-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 700, color: 'var(--forest)' }}>
              Top 5 Most Ordered Menu Items
            </h3>
            {stats.topItems.length === 0 ? (
              <div className="rcp-empty-state">No orders placed today yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {stats.topItems.map((it, idx) => {
                  const maxVal = stats.topItems[0].qty || 1
                  const percent = Math.round((it.qty / maxVal) * 100)
                  return (
                    <div key={idx} style={{ fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '4px' }}>
                        <span>{idx + 1}. {it.name}</span>
                        <span>{it.qty} ordered</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--surface-2)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: 'var(--forest)', borderRadius: '4px' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
