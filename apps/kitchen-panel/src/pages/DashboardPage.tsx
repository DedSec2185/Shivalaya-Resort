import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  Package,
  User,
  Printer,
  Clock,
  LogOut,
  Plus,
  Search,
  AlertTriangle,
  ChefHat,
  RotateCcw,
  TrendingDown,
  ShieldCheck,
  Flame,
  Bell,
  Volume2,
  VolumeX,
  Square,
  Sparkles,
  ArrowUpDown,
  X
} from 'lucide-react'
import { useOrders } from '../hooks/useOrders'
import type { Order } from '../hooks/useOrders'
import { useOrderActions } from '../hooks/useOrderActions'
import { OrderAge } from '../components/OrderAge'
import PrintTicketModal from '../components/PrintTicketModal'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'
import MobileKitchenHeader from '../components/MobileKitchenHeader'
import KitchenBottomNav from '../components/KitchenBottomNav'
import { playKitchenOrderChime, playItemCheckTick, isKitchenSoundMuted, setKitchenSoundMuted } from '../lib/audioChime'

type Tab = 'orders' | 'completed' | 'cancelled' | 'stock' | 'profile'

// ─── Stock types ─────────────────────────────────────────────
interface StockItem {
  item_id: string
  name: string
  category: string
  unit: string
  current_quantity: number
  low_stock_alert_threshold: number
  is_low_stock: boolean
}

interface InventoryItem { id: string; name: string; unit: string; category: string }

export default function DashboardPage() {
  const navigate = useNavigate()
  const { t, lang } = useLanguage()
  const { newOrders, inProgress, readyOrders, totalToday, loading, error, updateLocalStatus } = useOrders()
  const actions = useOrderActions(updateLocalStatus)
  const [selectedOrderForKOT, setSelectedOrderForKOT] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('orders')

  // Live Historical Orders directly from Supabase
  const [completedOrders, setCompletedOrders] = useState<Order[]>([])
  const [cancelledOrders, setCancelledOrders] = useState<Order[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Mobile drawer & stage filter state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<'all' | 'new' | 'preparing' | 'ready'>('all')

  // Live Clock state
  const [now, setNow] = useState(new Date())

  // Audio chime & sound state
  const [soundMuted, setSoundMuted] = useState(isKitchenSoundMuted())

  function handleToggleSound() {
    const next = !soundMuted
    setSoundMuted(next)
    setKitchenSoundMuted(next)
    if (!next) {
      playKitchenOrderChime()
    }
  }

  // Active Orders Search, Channel & Urgency Filter State
  const [orderSearch, setOrderSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState<'all' | 'room' | 'table' | 'takeaway'>('all')
  const [delayedOnly, setDelayedOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState<'fifo' | 'newest'>('fifo')

  // Interactive Dish Checklist State (orderId__itemIndex -> boolean)
  const [checkedDishes, setCheckedDishes] = useState<Record<string, boolean>>({})

  function handleToggleDish(orderId: string, itemIdx: number) {
    const key = `${orderId}__${itemIdx}`
    setCheckedDishes(prev => {
      const nextVal = !prev[key]
      if (nextVal) playItemCheckTick()
      return { ...prev, [key]: nextVal }
    })
  }

  // Audio chime on incoming new orders
  const prevOrdersCountRef = useRef(newOrders.length)
  useEffect(() => {
    if (newOrders.length > prevOrdersCountRef.current) {
      playKitchenOrderChime()
    }
    prevOrdersCountRef.current = newOrders.length
  }, [newOrders.length])

  // Kitchen Telemetry & HUD metrics
  const nowMs = now.getTime()
  function getOrderAgeMinutes(createdAt: string): number {
    return Math.max(0, Math.floor((nowMs - new Date(createdAt).getTime()) / 60000))
  }

  const allActiveOrders = [...newOrders, ...inProgress, ...readyOrders]
  const delayedOrdersCount = allActiveOrders.filter(o => getOrderAgeMinutes(o.created_at) >= 20).length
  const avgWaitMinutes = allActiveOrders.length > 0
    ? Math.round(allActiveOrders.reduce((sum, o) => sum + getOrderAgeMinutes(o.created_at), 0) / allActiveOrders.length)
    : 0

  function matchesActiveFilter(o: Order): boolean {
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim()
      const matchNum = o.order_number.toLowerCase().includes(q)
      const matchGuest = o.guest_name && o.guest_name.toLowerCase().includes(q)
      const matchRoom = o.room_number && o.room_number.toLowerCase().includes(q)
      const matchTable = o.table_number && o.table_number.toLowerCase().includes(q)
      const matchItem = o.items && o.items.some(it => it.name.toLowerCase().includes(q))
      if (!matchNum && !matchGuest && !matchRoom && !matchTable && !matchItem) return false
    }

    if (channelFilter === 'room') {
      if (o.service_type !== 'room_service' && (!o.room_number || o.table_number)) return false
    } else if (channelFilter === 'table') {
      if (o.service_type !== 'dine_in' && !o.table_number) return false
    } else if (channelFilter === 'takeaway') {
      if (o.service_type !== 'takeaway') return false
    }

    if (delayedOnly) {
      if (getOrderAgeMinutes(o.created_at) < 20) return false
    }

    return true
  }

  function sortActiveOrders(a: Order, b: Order): number {
    const timeA = new Date(a.created_at).getTime()
    const timeB = new Date(b.created_at).getTime()
    return sortOrder === 'fifo' ? (timeA - timeB) : (timeB - timeA)
  }

  const filteredNew = newOrders.filter(matchesActiveFilter).sort(sortActiveOrders)
  const filteredPrep = inProgress.filter(matchesActiveFilter).sort(sortActiveOrders)
  const filteredReady = readyOrders.filter(matchesActiveFilter).sort(sortActiveOrders)
  const totalFilteredCount = filteredNew.length + filteredPrep.length + filteredReady.length

  // Stock state
  const [stockItems, setStockItems]       = useState<StockItem[]>([])
  const [invItems, setInvItems]           = useState<InventoryItem[]>([])
  const [stockLoading, setStockLoading]   = useState(false)
  const [logMode, setLogMode]             = useState<'inward' | 'consumption' | null>(null)
  const [logItemId, setLogItemId]         = useState('')
  const [logQty, setLogQty]               = useState('')
  const [logReason, setLogReason]         = useState('daily_use')
  const [logNote, setLogNote]             = useState('')
  const [logSaving, setLogSaving]         = useState(false)
  const [logMsg, setLogMsg]               = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Search state for historical tables
  const [completedSearch, setCompletedSearch] = useState('')
  const [cancelledSearch, setCancelledSearch] = useState('')

  const { logout, staff } = useAuth()
  
  const staffName = staff?.name || localStorage.getItem('staffName') || 'Chef Aakash'
  const staffRole = staff?.role || localStorage.getItem('staffRole') || 'Head Chef & Kitchen Lead'
  const staffId   = staff?.id || localStorage.getItem('staffId') || 'KIT-201'
  const initials  = staffName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  useEffect(() => {
    if (!localStorage.getItem('staffName')) navigate('/login')
  }, [navigate])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (activeTab === 'stock') loadStock()
  }, [activeTab])

  async function loadStock() {
    setStockLoading(true)
    const [{ data: sv }, { data: iv }] = await Promise.all([
      supabase.from('current_stock').select('*').order('category'),
      supabase.from('inventory_items').select('id, name, unit, category').eq('is_active', true).order('name'),
    ])
    setStockItems(sv || [])
    setInvItems(iv || [])
    setStockLoading(false)
  }

  async function submitLog() {
    if (!logItemId || !logQty || parseFloat(logQty) <= 0) return
    setLogSaving(true)
    setLogMsg(null)

    const table = logMode === 'inward' ? 'stock_inward' : 'stock_consumption'
    const row = logMode === 'inward'
      ? { item_id: logItemId, quantity: parseFloat(logQty), notes: logNote || null, logged_by: staffId || null }
      : { item_id: logItemId, quantity: parseFloat(logQty), reason: logReason, notes: logNote || null, logged_by: staffId || null }

    const { error } = await supabase.from(table).insert(row as any)
    setLogSaving(false)

    if (error) {
      setLogMsg({ type: 'err', text: error.message })
    } else {
      setLogMsg({ type: 'ok', text: logMode === 'inward' ? 'Stock inward logged successfully' : 'Usage logged successfully' })
      setLogItemId(''); setLogQty(''); setLogNote('')
      setTimeout(() => { setLogMode(null); setLogMsg(null); loadStock() }, 1400)
    }
  }

  async function loadHistoricalOrders() {
    setHistoryLoading(true)
    try {
      const [{ data: compData }, { data: cancData }] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .in('status', ['served', 'completed'])
          .order('updated_at', { ascending: false })
          .limit(50),
        supabase
          .from('orders')
          .select('*')
          .eq('status', 'cancelled')
          .order('updated_at', { ascending: false })
          .limit(50)
      ])

      const resolveOrders = async (rawOrders: any[] | null): Promise<Order[]> => {
        if (!rawOrders || rawOrders.length === 0) return []
        return Promise.all(
          rawOrders.map(async (order) => {
            let room_number = ''
            let table_number = ''
            if (order.room_id) {
              const { data: rm } = await supabase.from('rooms').select('room_number').eq('id', order.room_id).single()
              if (rm) room_number = rm.room_number
            }
            if (order.table_id) {
              const { data: tbl } = await supabase.from('restaurant_tables').select('table_number').eq('id', order.table_id).single()
              if (tbl) table_number = tbl.table_number
            }
            return {
              ...order,
              room_number,
              table_number
            } as Order
          })
        )
      }

      const [resolvedComp, resolvedCanc] = await Promise.all([
        resolveOrders(compData),
        resolveOrders(cancData)
      ])

      setCompletedOrders(resolvedComp)
      setCancelledOrders(resolvedCanc)
    } catch (err) {
      console.error('Failed to load historical orders from Supabase:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadHistoricalOrders()
  }, [])

  useEffect(() => {
    if (activeTab === 'completed' || activeTab === 'cancelled') {
      loadHistoricalOrders()
    }
  }, [activeTab])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const filteredCompleted = completedOrders.filter(o =>
    o.order_number.toLowerCase().includes(completedSearch.toLowerCase()) ||
    (o.guest_name && o.guest_name.toLowerCase().includes(completedSearch.toLowerCase())) ||
    (o.room_number && o.room_number.includes(completedSearch))
  )

  const filteredCancelled = cancelledOrders.filter(o =>
    o.order_number.toLowerCase().includes(cancelledSearch.toLowerCase()) ||
    (o.guest_name && o.guest_name.toLowerCase().includes(cancelledSearch.toLowerCase())) ||
    (o.room_number && o.room_number.includes(cancelledSearch))
  )

  const formattedTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const formattedDate = now.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()

  const navSections = [
    {
      label: t('nav_operations'),
      items: [
        { id: 'orders', label: t('tab_orders'), icon: <UtensilsCrossed size={19} />, badge: newOrders.length > 0 ? newOrders.length : null },
        { id: 'completed', label: t('tab_completed'), icon: <CheckCircle2 size={19} />, badge: null }
      ]
    },
    {
      label: t('nav_records'),
      items: [
        { id: 'cancelled', label: t('tab_cancelled'), icon: <XCircle size={19} />, badge: null }
      ]
    },
    {
      label: t('nav_inventory'),
      items: [
        { id: 'stock', label: t('tab_stock'), icon: <Package size={19} />, badge: null }
      ]
    },
    {
      label: t('nav_account'),
      items: [
        { id: 'profile', label: t('tab_profile'), icon: <User size={19} />, badge: null }
      ]
    }
  ]

  /* ─── RENDER ─────────────────────────────────────────── */
  return (
    <div className="kds-shell">

      {/* ── MOBILE HEADER (< 1024px) ── */}
      <MobileKitchenHeader
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        newOrdersCount={newOrders.length}
        staffName={staffName}
        initials={initials}
      />

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div className="kds-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`kds-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-wordmark">{t('brand_title')}<span className="accent">.</span></div>
          <div className="sidebar-tagline">{t('brand_tagline')}</div>
        </div>

        <nav className="sidebar-nav">
          {navSections.map(sec => (
            <div key={sec.label}>
              <div className="nav-section-label">{sec.label}</div>
              {sec.items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id as Tab)
                    setSidebarOpen(false)
                  }}
                >
                  {item.icon}
                  <span className="nav-item-text">{item.label}</span>
                  {item.badge !== null && (
                    <span className="nav-item-badge">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
            <LanguageToggle />
          </div>

          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{staffName}</div>
              <div className="user-role">{staffRole}</div>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="sidebar-logout-btn">
            <LogOut size={15} />
            <span>{t('btn_sign_out')}</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT CONTAINER ────────────────────────── */}
      <main className="kds-main">

        {/* ── CURSIVE HERO TOP BANNER ── */}
        <header className="kds-hero-banner">
          <div className="hero-left-content">
            <div className="hero-subtitle">{t('kds_subtitle')}</div>
            <h1 className="hero-title">
              {activeTab === 'orders' && <>{t('tab_orders')}</>}
              {activeTab === 'completed' && <>{t('completed_history_title')}</>}
              {activeTab === 'cancelled' && <>{t('cancelled_history_title')}</>}
              {activeTab === 'stock' && <>{t('stock_ledger_title')}</>}
              {activeTab === 'profile' && <>{t('staff_profile_title')}</>}
            </h1>
          </div>

          <div className="hero-right-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <LanguageToggle />
              <div className="hero-clock">
                <div className="hero-time">{formattedTime}</div>
                <div className="hero-date">{formattedDate}</div>
              </div>
            </div>
            <div className="hero-avatar-badge">{initials}</div>
          </div>
        </header>

        {/* ── TAB 1: ACTIVE KDS BOARD ─────────────────────── */}
        {activeTab === 'orders' && (
          <div>
            {/* Top Section Header with Live Stream Indicator */}
            <div className="section-header" style={{ marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div className="section-title">{t('live_board_title')}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(44, 74, 34, 0.12)', border: '1px solid rgba(44, 74, 34, 0.3)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: 'var(--forest-deep)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--forest)', animation: 'pulseGlow 2s infinite' }} />
                    Live Kitchen Stream
                  </div>
                </div>
                <div className="section-desc">
                  Real-time incoming KOT orders across room service &amp; dining tables · Tap dishes to strike off as plated
                </div>
              </div>

              {/* Sound alert test & mute control */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className="kds-sound-toggle-btn"
                  title={soundMuted ? 'Kitchen sound chime is muted. Click to enable sound alerts.' : 'Kitchen sound chime is active. Click to mute.'}
                >
                  {soundMuted ? <VolumeX size={16} style={{ color: 'var(--rust)' }} /> : <Volume2 size={16} style={{ color: 'var(--forest)' }} />}
                  <span>{soundMuted ? 'Audio: Muted' : 'Audio: Active'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => playKitchenOrderChime()}
                  className="btn-action-secondary"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                  title="Test kitchen chime bell"
                >
                  <Bell size={14} />
                  <span>Test Chime</span>
                </button>
              </div>
            </div>

            {/* ── 1. KITCHEN COMMAND HUD (Head-Up Display) ── */}
            <div className="kds-hud-bar">
              <div className="kds-hud-stat">
                <div className="kds-hud-icon-wrap" style={{ background: 'rgba(173,138,63,0.18)', color: 'var(--brass)' }}>
                  <Flame size={22} />
                </div>
                <div>
                  <div className="kds-hud-val">{allActiveOrders.length}</div>
                  <div className="kds-hud-label">Active Tickets</div>
                </div>
              </div>

              <div className="kds-hud-stat">
                <div className="kds-hud-icon-wrap" style={{ background: 'var(--new-bg)', color: 'var(--rust)' }}>
                  <Clock size={22} />
                </div>
                <div>
                  <div className="kds-hud-val" style={{ color: 'var(--rust)' }}>{newOrders.length}</div>
                  <div className="kds-hud-label">New / Queued</div>
                </div>
              </div>

              <div className="kds-hud-stat">
                <div className="kds-hud-icon-wrap" style={{ background: 'var(--preparing-bg)', color: '#8A6008' }}>
                  <ChefHat size={22} />
                </div>
                <div>
                  <div className="kds-hud-val" style={{ color: '#8A6008' }}>{inProgress.length}</div>
                  <div className="kds-hud-label">On Stoves / Cooking</div>
                </div>
              </div>

              <div className="kds-hud-stat">
                <div className="kds-hud-icon-wrap" style={{ background: 'var(--ready-bg)', color: 'var(--forest-deep)' }}>
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div className="kds-hud-val" style={{ color: 'var(--forest-deep)' }}>{readyOrders.length}</div>
                  <div className="kds-hud-label">Plated for Runner</div>
                </div>
              </div>

              <div className={`kds-hud-stat ${delayedOrdersCount > 0 ? 'urgent-active' : ''}`}>
                <div className="kds-hud-icon-wrap" style={{ background: delayedOrdersCount > 0 ? 'var(--rust)' : 'rgba(35,31,22,0.06)', color: delayedOrdersCount > 0 ? '#FFFFFF' : 'var(--sage)' }}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <div className="kds-hud-val" style={{ color: delayedOrdersCount > 0 ? 'var(--rust)' : 'var(--sage)' }}>
                    {delayedOrdersCount}
                  </div>
                  <div className="kds-hud-label" style={{ color: delayedOrdersCount > 0 ? 'var(--rust)' : 'var(--sage)' }}>
                    Delayed (&gt;20m)
                  </div>
                </div>
              </div>

              <div className="kds-hud-stat">
                <div className="kds-hud-icon-wrap" style={{ background: 'rgba(58, 90, 64, 0.12)', color: 'var(--forest)' }}>
                  <TrendingDown size={22} />
                </div>
                <div>
                  <div className="kds-hud-val" style={{ color: 'var(--forest)' }}>{avgWaitMinutes}m</div>
                  <div className="kds-hud-label">Avg Wait Time</div>
                </div>
              </div>
            </div>

            {/* ── 2. MASTER RAPID SEARCH & FILTER TOOLBAR ── */}
            <div className="kds-toolbar">
              <div className="kds-toolbar-top">
                <div className="kds-search-box">
                  <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--sage)' }} />
                  <input
                    type="text"
                    className="kds-search-input"
                    placeholder="Search by Order # (PAN-00101), Room #, Table, Guest, or Dish name…"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                  {orderSearch && (
                    <button
                      type="button"
                      className="kds-search-clear"
                      onClick={() => setOrderSearch('')}
                      title="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Sort Mode Toggle (FIFO vs Newest) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    Sort:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSortOrder(prev => prev === 'fifo' ? 'newest' : 'fifo')}
                    className="kds-filter-pill"
                    style={{ fontSize: 12 }}
                    title="Toggle First-In-First-Out or Newest First"
                  >
                    <ArrowUpDown size={14} />
                    <span>{sortOrder === 'fifo' ? 'FIFO (Oldest First)' : 'Newest First'}</span>
                  </button>
                </div>
              </div>

              {/* Service Channel Filter Pills & Urgency Quick Filter */}
              <div className="kds-toolbar-actions">
                <div className="kds-filter-pills">
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: 0.6, marginRight: 4 }}>
                    Channels:
                  </span>
                  <button
                    type="button"
                    className={`kds-filter-pill ${channelFilter === 'all' && !delayedOnly ? 'active' : ''}`}
                    onClick={() => { setChannelFilter('all'); setDelayedOnly(false); }}
                  >
                    <span>All Channels</span>
                    <span className="kds-pill-badge">{allActiveOrders.length}</span>
                  </button>
                  <button
                    type="button"
                    className={`kds-filter-pill ${channelFilter === 'room' ? 'active' : ''}`}
                    onClick={() => setChannelFilter('room')}
                  >
                    <span>🛎️ Room Service</span>
                    <span className="kds-pill-badge">
                      {allActiveOrders.filter(o => o.service_type === 'room_service' || (o.room_number && !o.table_number)).length}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`kds-filter-pill ${channelFilter === 'table' ? 'active' : ''}`}
                    onClick={() => setChannelFilter('table')}
                  >
                    <span>🍽️ Dining Tables</span>
                    <span className="kds-pill-badge">
                      {allActiveOrders.filter(o => o.service_type === 'dine_in' || !!o.table_number).length}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`kds-filter-pill ${channelFilter === 'takeaway' ? 'active' : ''}`}
                    onClick={() => setChannelFilter('takeaway')}
                  >
                    <span>🛍️ Takeaway</span>
                    <span className="kds-pill-badge">
                      {allActiveOrders.filter(o => o.service_type === 'takeaway').length}
                    </span>
                  </button>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    className={`kds-filter-pill ${delayedOnly ? 'active-urgent' : ''}`}
                    onClick={() => setDelayedOnly(prev => !prev)}
                    title="Filter only orders delayed longer than 20 minutes"
                  >
                    <AlertTriangle size={14} style={{ color: delayedOnly ? '#FFF' : 'var(--rust)' }} />
                    <span>Delayed Only (&gt;20m)</span>
                    <span className="kds-pill-badge" style={{ background: delayedOnly ? 'rgba(255,255,255,0.3)' : undefined, color: delayedOnly ? '#FFF' : undefined }}>
                      {delayedOrdersCount}
                    </span>
                  </button>

                  {(orderSearch || channelFilter !== 'all' || delayedOnly) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--forest-deep)', background: 'rgba(44, 74, 34, 0.1)', padding: '4px 8px', borderRadius: 6 }}>
                        {totalFilteredCount} matching
                      </span>
                      <button
                        type="button"
                        onClick={() => { setOrderSearch(''); setChannelFilter('all'); setDelayedOnly(false); }}
                        className="btn-action-secondary"
                        style={{ padding: '6px 10px', fontSize: 11.5 }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error ? (
              <div className="kds-card" style={{ borderLeft: '6px solid var(--rust)', color: 'var(--rust)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertTriangle size={24} />
                <div style={{ fontWeight: 700 }}>{error}</div>
              </div>
            ) : loading ? (
              <div className="kds-card" style={{ textAlign: 'center', color: 'var(--sage)', padding: 48 }}>
                Loading live kitchen preparation board…
              </div>
            ) : (
              <>
                {/* ── STAGE FILTER TABS (Mobile & Tablet) ── */}
                <div className="kanban-stage-tabs">
                  <button
                    type="button"
                    className={`stage-pill ${selectedStage === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedStage('all')}
                  >
                    <span>{t('filter_all')}</span>
                    <span className="stage-pill-count">{filteredNew.length + filteredPrep.length + filteredReady.length}</span>
                  </button>
                  <button
                    type="button"
                    className={`stage-pill ${selectedStage === 'new' ? 'active' : ''}`}
                    onClick={() => setSelectedStage('new')}
                  >
                    <Clock size={14} style={{ color: 'var(--rust)' }} />
                    <span>{t('filter_new')}</span>
                    <span className="stage-pill-count">{filteredNew.length}</span>
                  </button>
                  <button
                    type="button"
                    className={`stage-pill ${selectedStage === 'preparing' ? 'active' : ''}`}
                    onClick={() => setSelectedStage('preparing')}
                  >
                    <ChefHat size={14} style={{ color: 'var(--brass)' }} />
                    <span>{t('filter_preparing')}</span>
                    <span className="stage-pill-count">{filteredPrep.length}</span>
                  </button>
                  <button
                    type="button"
                    className={`stage-pill ${selectedStage === 'ready' ? 'active' : ''}`}
                    onClick={() => setSelectedStage('ready')}
                  >
                    <CheckCircle2 size={14} style={{ color: 'var(--forest)' }} />
                    <span>{t('filter_ready')}</span>
                    <span className="stage-pill-count">{filteredReady.length}</span>
                  </button>
                </div>

                <div className="kanban-grid">
                  {/* Column 1: New Orders */}
                  {(selectedStage === 'all' || selectedStage === 'new') && (
                    <div className="kanban-col col-new">
                      <div className="kanban-col-head" style={{ borderLeft: '4px solid var(--rust)' }}>
                        <div className="kanban-col-title">
                          <Clock size={18} style={{ color: 'var(--rust)' }} />
                          {t('col_new_title')}
                        </div>
                        <span className="kanban-col-count" style={{ background: 'var(--new-bg)', color: 'var(--rust)' }}>
                          {filteredNew.length}
                        </span>
                      </div>
                      <div className="kanban-col-body">
                        {filteredNew.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--sage)', fontSize: 14 }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>🛎️</div>
                            <div style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>{t('no_new_orders')}</div>
                            <div style={{ fontSize: 12, marginTop: 4 }}>Awaiting incoming tickets from resident rooms &amp; dining tables</div>
                          </div>
                        ) : (
                          filteredNew.map(o => (
                            <OrderCard
                              key={o.id}
                              order={o}
                              actions={actions}
                              onPrint={() => setSelectedOrderForKOT(o)}
                              t={t}
                              checkedDishes={checkedDishes}
                              onToggleDish={handleToggleDish}
                              nowMs={nowMs}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Column 2: In Progress / Cooking */}
                  {(selectedStage === 'all' || selectedStage === 'preparing') && (
                    <div className="kanban-col col-prep">
                      <div className="kanban-col-head" style={{ borderLeft: '4px solid var(--brass)' }}>
                        <div className="kanban-col-title">
                          <ChefHat size={18} style={{ color: 'var(--brass)' }} />
                          {t('col_prep_title')}
                        </div>
                        <span className="kanban-col-count" style={{ background: 'var(--preparing-bg)', color: '#6B4E12' }}>
                          {filteredPrep.length}
                        </span>
                      </div>
                      <div className="kanban-col-body">
                        {filteredPrep.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--sage)', fontSize: 14 }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>👨‍🍳</div>
                            <div style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>{t('no_prep_orders')}</div>
                            <div style={{ fontSize: 12, marginTop: 4 }}>Stoves clear. Tap "Start Cooking" on new orders to bump here.</div>
                          </div>
                        ) : (
                          filteredPrep.map(o => (
                            <OrderCard
                              key={o.id}
                              order={o}
                              actions={actions}
                              onPrint={() => setSelectedOrderForKOT(o)}
                              t={t}
                              checkedDishes={checkedDishes}
                              onToggleDish={handleToggleDish}
                              nowMs={nowMs}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Column 3: Ready / Pick Up */}
                  {(selectedStage === 'all' || selectedStage === 'ready') && (
                    <div className="kanban-col col-ready">
                      <div className="kanban-col-head" style={{ borderLeft: '4px solid var(--forest)' }}>
                        <div className="kanban-col-title">
                          <CheckCircle2 size={18} style={{ color: 'var(--forest)' }} />
                          {t('col_ready_title')}
                        </div>
                        <span className="kanban-col-count" style={{ background: 'var(--ready-bg)', color: 'var(--forest-deep)' }}>
                          {filteredReady.length}
                        </span>
                      </div>
                      <div className="kanban-col-body">
                        {filteredReady.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--sage)', fontSize: 14 }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                            <div style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>{t('no_ready_orders')}</div>
                            <div style={{ fontSize: 12, marginTop: 4 }}>No orders awaiting runner dispatch right now.</div>
                          </div>
                        ) : (
                          filteredReady.map(o => (
                            <OrderCard
                              key={o.id}
                              order={o}
                              actions={actions}
                              onPrint={() => setSelectedOrderForKOT(o)}
                              t={t}
                              checkedDishes={checkedDishes}
                              onToggleDish={handleToggleDish}
                              nowMs={nowMs}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB 2: COMPLETED ORDERS HISTORY ────────────────── */}
        {activeTab === 'completed' && (
          <div>
            <div className="section-header">
              <div>
                <div className="section-title">Fulfilled Food <span className="ampersand">&amp;</span> Beverage Orders</div>
                <div className="section-desc">Log of completed orders served at dining tables or delivered to guest rooms</div>
              </div>
              <span className="type-pill type-dinein" style={{ fontSize: 13, padding: '8px 16px' }}>
                {filteredCompleted.length} Orders Fulfilled
              </span>
            </div>

            <div className="kds-card">
              <div style={{ position: 'relative', marginBottom: 24 }}>
                <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--sage)' }} />
                <input
                  type="text"
                  style={{ width: '100%', padding: '14px 16px 14px 50px', background: '#FFFFFF', border: '1.5px solid var(--line)', borderRadius: 14, fontSize: 15, outline: 'none', fontWeight: 600, color: 'var(--ink)' }}
                  placeholder="Search completed orders by Order ID, Guest Name, or Room Number…"
                  value={completedSearch}
                  onChange={e => setCompletedSearch(e.target.value)}
                />
              </div>

              <table className="kds-table">
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>ORDER ID</th>
                    <th style={{ width: '18%' }}>LOCATION &amp; TYPE</th>
                    <th style={{ width: '22%' }}>GUEST NAME</th>
                    <th style={{ width: '28%' }}>ITEMS PREPARED</th>
                    <th style={{ width: '12%' }}>SUBTOTAL</th>
                    <th style={{ width: '5%', textAlign: 'center' }}>RECEIPT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompleted.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--sage)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={32} style={{ color: 'var(--forest)' }} />
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                            {historyLoading ? 'Loading completed orders…' : 'No Completed Orders Recorded Yet'}
                          </div>
                          <div style={{ fontSize: '12.5px', color: 'var(--sage)' }}>
                            Orders marked as served will automatically appear in this permanent record.
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCompleted.map(order => (
                      <tr key={order.id}>
                        <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, color: 'var(--brass)', fontSize: '16px' }}>
                          {order.order_number}
                        </td>
                        <td>
                          {order.service_type === 'room_service' ? (
                            <span className="type-pill type-room">Room {order.room_number || 'Resident'}</span>
                          ) : (
                            <span className="type-pill type-dinein">Table {order.table_number || 'T-01'}</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '15px' }}>
                          {order.guest_name || 'Walk-in Customer'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {order.items.map((it, idx) => (
                              <div key={idx} style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
                                <strong style={{ color: 'var(--brass)' }}>{it.qty}×</strong> {it.name}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, color: 'var(--forest-deep)', fontSize: '17px' }}>
                          ₹{(order.subtotal ?? 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn-action-secondary"
                            onClick={() => setSelectedOrderForKOT(order)}
                            title="Re-print KOT or Customer Bill"
                          >
                            <Printer size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: CANCELLED ORDERS LOG ──────────────────── */}
        {activeTab === 'cancelled' && (
          <div>
            <div className="section-header">
              <div>
                <div className="section-title">Cancelled <span className="ampersand">&amp;</span> Voided Orders Log</div>
                <div className="section-desc">Audit trail of voided kitchen orders and recorded cancellation reasons</div>
              </div>
              <span className="type-pill type-pickup" style={{ fontSize: 13, padding: '8px 16px' }}>
                {filteredCancelled.length} Voided Orders
              </span>
            </div>

            <div className="kds-card">
              <div style={{ position: 'relative', marginBottom: 24 }}>
                <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--sage)' }} />
                <input
                  type="text"
                  style={{ width: '100%', padding: '14px 16px 14px 50px', background: '#FFFFFF', border: '1.5px solid var(--line)', borderRadius: 14, fontSize: 15, outline: 'none', fontWeight: 600, color: 'var(--ink)' }}
                  placeholder="Search cancelled orders by Order ID or Guest Name…"
                  value={cancelledSearch}
                  onChange={e => setCancelledSearch(e.target.value)}
                />
              </div>

              <table className="kds-table">
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>ORDER ID</th>
                    <th style={{ width: '18%' }}>LOCATION &amp; TYPE</th>
                    <th style={{ width: '20%' }}>GUEST NAME</th>
                    <th style={{ width: '32%' }}>CANCELLATION REASON &amp; NOTES</th>
                    <th style={{ width: '15%' }}>VOIDED AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCancelled.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--sage)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <XCircle size={32} style={{ color: 'var(--rust)' }} />
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                            {historyLoading ? 'Loading cancelled orders…' : 'No Cancelled Orders Recorded'}
                          </div>
                          <div style={{ fontSize: '12.5px', color: 'var(--sage)' }}>
                            Any orders voided or cancelled by guest/staff will be archived here.
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCancelled.map(order => (
                      <tr key={order.id}>
                        <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, color: 'var(--rust)', fontSize: '16px' }}>
                          {order.order_number}
                        </td>
                        <td>
                          {order.service_type === 'room_service' ? (
                            <span className="type-pill type-room">Room {order.room_number || 'Resident'}</span>
                          ) : (
                            <span className="type-pill type-dinein">Table {order.table_number || 'T-05'}</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '15px' }}>
                          {order.guest_name || 'Walk-in Customer'}
                        </td>
                        <td>
                          <div style={{ background: 'var(--new-bg)', border: '1px solid var(--rust)', padding: '10px 14px', borderRadius: 10, fontSize: '13px', color: 'var(--rust)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertTriangle size={16} />
                            <span>{order.special_note || 'Order voided'}</span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, color: 'var(--rust)', fontSize: '16px' }}>
                          ₹{(order.subtotal ?? 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 4: KITCHEN STOCK & INVENTORY ───────────────── */}
        {activeTab === 'stock' && (
          <div>
            <div className="section-header">
              <div>
                <div className="section-title">Kitchen <span className="ampersand">&amp;</span> Resort Inventory Ledger</div>
                <div className="section-desc">Live ingredient stock levels, low-stock warnings, inward deliveries &amp; consumption logs</div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn-action-primary" onClick={() => setLogMode('inward')}>
                  <Plus size={18} />
                  Log Inward Delivery
                </button>
                <button type="button" className="btn-action-brass" onClick={() => setLogMode('consumption')}>
                  <TrendingDown size={18} />
                  Log Daily Usage / Wastage
                </button>
                <button type="button" className="btn-action-secondary" onClick={loadStock}>
                  <RotateCcw size={16} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Log Entry Form Modal Box */}
            {logMode && (
              <div className="kds-card" style={{ marginBottom: 28, border: '2px solid var(--brass)' }}>
                <div style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 22, fontWeight: 700, color: 'var(--forest-deep)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Package size={22} style={{ color: 'var(--brass)' }} />
                  {logMode === 'inward' ? 'Log Inward Stock Delivery' : 'Log Daily Usage / Wastage'}
                </div>

                {logMsg && (
                  <div style={{ padding: '14px 18px', borderRadius: '12px', fontSize: '14px', marginBottom: '18px', background: logMsg.type === 'ok' ? 'var(--ready-bg)' : 'var(--new-bg)', color: logMsg.type === 'ok' ? 'var(--forest-deep)' : 'var(--rust)', fontWeight: 700, border: `1.5px solid ${logMsg.type === 'ok' ? 'var(--forest)' : 'var(--rust)'}` }}>
                    {logMsg.text}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: logMode === 'consumption' ? '2fr 1fr 1fr' : '2fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--sage)', display: 'block', marginBottom: 8 }}>Stock Item *</label>
                    <select style={{ width: '100%', padding: '13px 16px', background: '#FFFFFF', border: '1.5px solid var(--line)', borderRadius: 12, fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }} value={logItemId} onChange={e => setLogItemId(e.target.value)}>
                      <option value="">Select inventory item…</option>
                      {invItems.map(it => <option key={it.id} value={it.id}>{it.name} ({it.unit})</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--sage)', display: 'block', marginBottom: 8 }}>Quantity *</label>
                    <input type="number" min="0.01" step="0.01" style={{ width: '100%', padding: '13px 16px', background: '#FFFFFF', border: '1.5px solid var(--line)', borderRadius: 12, fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }} placeholder="e.g. 5.0" value={logQty} onChange={e => setLogQty(e.target.value)} />
                  </div>

                  {logMode === 'consumption' && (
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--sage)', display: 'block', marginBottom: 8 }}>Reason</label>
                      <select style={{ width: '100%', padding: '13px 16px', background: '#FFFFFF', border: '1.5px solid var(--line)', borderRadius: 12, fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }} value={logReason} onChange={e => setLogReason(e.target.value)}>
                        <option value="daily_use">Daily Use</option>
                        <option value="wastage">Wastage</option>
                        <option value="breakage">Breakage</option>
                        <option value="event">Event</option>
                        <option value="correction">Correction</option>
                      </select>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--sage)', display: 'block', marginBottom: 8 }}>Notes (Optional)</label>
                  <input type="text" style={{ width: '100%', padding: '13px 16px', background: '#FFFFFF', border: '1.5px solid var(--line)', borderRadius: 12, fontSize: 14.5 }} placeholder="Additional details or vendor invoice reference…" value={logNote} onChange={e => setLogNote(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn-action-primary" onClick={submitLog} disabled={logSaving}>
                    {logSaving ? 'Saving Entry…' : 'Save Stock Record'}
                  </button>
                  <button type="button" className="btn-action-secondary" onClick={() => { setLogMode(null); setLogMsg(null) }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Low stock alerts block */}
            {stockItems.filter(s => s.is_low_stock).length > 0 && (
              <div style={{ background: 'var(--new-bg)', border: '1.5px solid var(--rust)', borderRadius: 20, padding: '20px 28px', marginBottom: 28, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <AlertTriangle size={26} style={{ color: 'var(--rust)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--rust)', fontSize: 13.5, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8 }}>
                    Low Stock Warning Alerts — {stockItems.filter(s => s.is_low_stock).length} Item(s) Below Threshold
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {stockItems.filter(s => s.is_low_stock).map(s => (
                      <span key={s.item_id} className="type-pill type-pickup" style={{ fontSize: 13, padding: '6px 14px', fontWeight: 800 }}>
                        {s.name} — Current: {s.current_quantity.toFixed(1)} {s.unit} (Alert at {s.low_stock_alert_threshold})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stock Table */}
            <div className="kds-card">
              <table className="kds-table">
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>STOCK ITEM NAME</th>
                    <th style={{ width: '15%' }}>CATEGORY</th>
                    <th style={{ width: '16%' }}>CURRENT LEVEL</th>
                    <th style={{ width: '15%' }}>UNIT</th>
                    <th style={{ width: '14%' }}>ALERT THRESHOLD</th>
                    <th style={{ width: '12%' }}>STOCK STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {stockItems.map((item) => (
                    <tr key={item.item_id}>
                      <td style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '15.5px' }}>{item.name}</td>
                      <td>
                        <span className="type-pill type-room" style={{ fontSize: '12px', padding: '4px 12px', fontWeight: 700, textTransform: 'capitalize' }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 800, fontSize: '16px', color: item.is_low_stock ? 'var(--rust)' : 'var(--forest-deep)' }}>
                        {item.current_quantity.toFixed(1)}
                      </td>
                      <td style={{ color: 'var(--sage)', fontWeight: 600 }}>{item.unit}</td>
                      <td style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--sage)', fontWeight: 600 }}>
                        {item.low_stock_alert_threshold}
                      </td>
                      <td>
                        {item.is_low_stock ? (
                          <span className="type-pill type-pickup" style={{ fontSize: '12px', padding: '5px 12px', fontWeight: 800 }}>LOW STOCK</span>
                        ) : (
                          <span className="type-pill type-dinein" style={{ fontSize: '12px', padding: '5px 12px', fontWeight: 800 }}>IN STOCK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stockItems.length === 0 && !stockLoading && (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--sage)', fontSize: '15px', fontWeight: 500 }}>
                  No stock items recorded in database.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 5: KITCHEN STAFF PROFILE ───────────────────── */}
        {activeTab === 'profile' && (
          <div>
            <div className="section-header">
              <div>
                <div className="section-title">Kitchen Staff Profile <span className="ampersand">&amp;</span> Shift Desk</div>
                <div className="section-desc">Manage authenticated chef account, active duty status, and session</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 28 }}>

              {/* Profile Card */}
              <div className="kds-card" style={{ textAlign: 'center' }}>
                <div className="user-avatar" style={{ width: 92, height: 92, fontSize: 34, margin: '0 auto 20px auto', border: '3.5px solid var(--brass)' }}>
                  {initials}
                </div>
                <h2 style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 26, color: 'var(--forest-deep)', margin: 0 }}>
                  {staffName}
                </h2>
                <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 800, color: 'var(--brass)', marginTop: 6 }}>
                  {staffRole}
                </div>
                <div style={{ fontSize: 12.5, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--sage)', marginTop: 6, fontWeight: 700 }}>
                  STAFF ID: {staffId}
                </div>

                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px dashed var(--line)' }}>
                  <button type="button" onClick={handleLogout} className="sidebar-logout-btn" style={{ padding: '14px', fontSize: 14.5 }}>
                    <LogOut size={18} />
                    <span>Sign Out of Kitchen Panel</span>
                  </button>
                </div>
              </div>

              {/* Shift Stats & Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="kds-card">
                  <div style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 22, fontWeight: 700, color: 'var(--forest-deep)', marginBottom: 18 }}>
                    Shift Activity Summary
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 18, border: '1.5px solid var(--line)' }}>
                      <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--forest-deep)', fontFamily: 'IBM Plex Mono, monospace' }}>
                        {totalToday}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--sage)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: 6 }}>
                        Orders Served Today
                      </div>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 18, border: '1.5px solid var(--line)' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ready-border)', display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6 }}>
                        <ShieldCheck size={22} />
                        Active On Duty
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--sage)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: 12 }}>
                        Kitchen Shift Status
                      </div>
                    </div>
                  </div>
                </div>

                <div className="kds-card">
                  <div style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 22, fontWeight: 700, color: 'var(--forest-deep)', marginBottom: 16 }}>
                    System Information
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: 'var(--ink-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--sage)' }}>Resort Property</span>
                      <span style={{ fontWeight: 700, color: 'var(--ink)' }}>Shivalaya Resorts, Bhimtal</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--sage)' }}>App Interface</span>
                      <span style={{ fontWeight: 700, color: 'var(--ink)' }}>Panache Kitchen KDS v2.0</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: 'var(--sage)' }}>Realtime Sync</span>
                      <span style={{ fontWeight: 700, color: 'var(--forest)' }}>Supabase Postgres Connected</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ── MOBILE BOTTOM NAVIGATION (< 768px) ── */}
      <KitchenBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab)
          setSidebarOpen(false)
        }}
        newOrdersCount={newOrders.length}
      />

      {/* ── COMMERCIAL 80MM THERMAL RECEIPT & TAX INVOICE PRINT MODAL ── */}
      {selectedOrderForKOT && (
        <PrintTicketModal
          order={selectedOrderForKOT}
          onClose={() => setSelectedOrderForKOT(null)}
        />
      )}
    </div>
  )
}

/* ── Order Card Component ───────────────────────────────────── */
interface OrderCardProps {
  order: Order
  actions: ReturnType<typeof useOrderActions>
  onPrint: () => void
  t: (key: any) => string
  checkedDishes: Record<string, boolean>
  onToggleDish: (orderId: string, itemIdx: number) => void
  nowMs: number
}

function OrderCard({ order, actions, onPrint, t, checkedDishes, onToggleDish, nowMs }: OrderCardProps) {
  const [updating, setUpdating] = useState(false)

  async function handleAction(fn: (id: string) => Promise<{ success: boolean }>) {
    setUpdating(true)
    await fn(order.id)
    setUpdating(false)
  }

  const ageMinutes = Math.max(0, Math.floor((nowMs - new Date(order.created_at).getTime()) / 60000))
  const isDelayed = ageMinutes >= 20

  const totalItemsCount = order.items ? order.items.length : 0
  const completedCount = order.items
    ? order.items.reduce((acc, _, idx) => acc + (checkedDishes[`${order.id}__${idx}`] ? 1 : 0), 0)
    : 0
  const isAllPlated = totalItemsCount > 0 && completedCount === totalItemsCount
  const progressPercent = totalItemsCount > 0 ? Math.round((completedCount / totalItemsCount) * 100) : 0

  function renderServiceBadge(type: string, room?: string, table?: string) {
    if (type === 'room_service' || (room && !table)) {
      return (
        <span className="type-pill type-room" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          🛎️ {t('type_room_resident')} {room || 'Resident'} · {t('in_house_label')}
        </span>
      )
    }
    if (type === 'takeaway') {
      return (
        <span className="type-pill type-pickup" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(33,150,243,0.12)', color: '#1565C0', fontWeight: 800 }}>
          🛍️ {t('type_walkin_takeaway')}
        </span>
      )
    }
    return (
      <span className="type-pill type-dinein" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(173,138,63,0.2)', color: 'var(--brass)', borderColor: 'rgba(173,138,63,0.4)', fontWeight: 800 }}>
        🍽️ {t('type_walkin_table')} {table || '—'} · {t('walk_in_label')}
      </span>
    )
  }

  const borderClass = order.status === 'new' ? 'border-new' : order.status === 'preparing' ? 'border-preparing' : 'border-ready'
  const overdueClass = isDelayed ? 'ticket-overdue' : ''

  return (
    <div className={`order-card-v2 ${borderClass} ${overdueClass}`}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brass)', fontFamily: 'IBM Plex Mono, monospace' }}>
              {order.order_number}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--sage)', fontWeight: 600, fontFamily: 'IBM Plex Mono, monospace' }}>
              {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isDelayed ? (
              <span className="kds-overdue-tag">
                <AlertTriangle size={12} />
                {ageMinutes}m DELAYED
              </span>
            ) : ageMinutes >= 10 ? (
              <span style={{ background: '#FFF3D6', color: '#8A6008', padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                ⏱️ {ageMinutes}m in kitchen
              </span>
            ) : (
              <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                ⏱️ {ageMinutes}m fresh
              </span>
            )}
          </div>

          <div style={{ marginTop: 8 }}>
            {renderServiceBadge(order.service_type, order.room_number, order.table_number)}
          </div>

          {order.guest_name && (
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{order.guest_name}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: order.room_number ? 'var(--forest)' : 'var(--brass)' }}>
                {order.room_number ? t('in_house_label') : t('walk_in_label')}
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onPrint}
          title={t('btn_print_kot')}
          className="btn-action-secondary"
          style={{ padding: '8px 12px' }}
        >
          <Printer size={16} />
        </button>
      </div>

      <div style={{ borderTop: '1px dashed var(--line)' }} />

      {/* Interactive Dish Checklist */}
      <div className="kds-checklist-box">
        <div className="kds-checklist-header">
          <span>Items to Prepare ({totalItemsCount})</span>
          <span style={{ color: isAllPlated ? 'var(--forest)' : 'var(--brass)', fontWeight: 800 }}>
            {completedCount}/{totalItemsCount} Plated ({progressPercent}%)
          </span>
        </div>

        <div className="kds-progress-track">
          <div className="kds-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          {order.items.map((it, idx) => {
            const isChecked = !!checkedDishes[`${order.id}__${idx}`]
            return (
              <div
                key={idx}
                className={`kds-dish-row ${isChecked ? 'completed' : ''}`}
                onClick={() => onToggleDish(order.id, idx)}
                title="Tap to mark this dish as plated"
              >
                <div className="kds-dish-info">
                  <div className="kds-checkbox">
                    {isChecked ? <CheckCircle2 size={15} style={{ color: '#FFFFFF' }} /> : <Square size={13} style={{ color: 'var(--sage)' }} />}
                  </div>
                  <div>
                    <span className="kds-dish-name">{it.name}</span>
                    {it.variant_label && (
                      <div style={{ fontSize: '11.5px', color: 'var(--sage)', fontStyle: 'italic', marginTop: 1 }}>
                        ↳ {it.variant_label}
                      </div>
                    )}
                  </div>
                </div>
                <span className="kds-dish-qty">{it.qty}×</span>
              </div>
            )
          })}
        </div>

        {isAllPlated && (
          <div className="kds-all-plated-banner">
            <Sparkles size={16} />
            <span>All {totalItemsCount} dishes plated! Ready to bump forward.</span>
          </div>
        )}
      </div>

      {/* Chef Special Preparation Note Callout */}
      {order.special_note && (
        <div className="kds-chef-note">
          <AlertTriangle size={18} style={{ color: '#B47806', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div className="kds-chef-note-title">Chef Preparation Note</div>
            <div className="kds-chef-note-text">“{order.special_note}”</div>
          </div>
        </div>
      )}

      {/* Footer Age & Tactile Bump Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--line)', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sage)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={14} />
          <OrderAge createdAt={order.created_at} />
        </div>

        <div className="kds-card-actions">
          {/* Revert / Step Back button if in preparing or ready */}
          {order.status === 'preparing' && (
            <button
              type="button"
              className="btn-action-revert"
              disabled={updating}
              onClick={() => handleAction(actions.revertToNew)}
              title="Move back to New Orders"
            >
              <RotateCcw size={13} />
              <span>Back</span>
            </button>
          )}

          {order.status === 'ready' && (
            <button
              type="button"
              className="btn-action-revert"
              disabled={updating}
              onClick={() => handleAction(actions.revertToPrep)}
              title="Move back to Cooking on Stoves"
            >
              <RotateCcw size={13} />
              <span>Back</span>
            </button>
          )}

          {/* Primary Forward Bump Action */}
          {order.status === 'new' && (
            <button
              type="button"
              className="btn-action-primary"
              disabled={updating}
              onClick={() => handleAction(actions.startPrep)}
            >
              <ChefHat size={16} />
              <span>{t('btn_start_prep')}</span>
            </button>
          )}

          {order.status === 'confirmed' && (
            <button
              type="button"
              className="btn-action-brass"
              disabled={updating}
              onClick={() => handleAction(actions.startPrep)}
            >
              <ChefHat size={16} />
              <span>{t('btn_start_prep')}</span>
            </button>
          )}

          {order.status === 'preparing' && (
            <button
              type="button"
              className="btn-action-primary"
              disabled={updating}
              onClick={() => handleAction(actions.markReady)}
            >
              <CheckCircle2 size={16} />
              <span>{t('btn_mark_ready')}</span>
            </button>
          )}

          {order.status === 'ready' && (
            <button
              type="button"
              className="btn-action-primary"
              disabled={updating}
              onClick={() => handleAction(actions.markServed)}
              style={{ background: 'linear-gradient(135deg, #1A4D1A, #0F330F)' }}
            >
              <span>🚀 Dispatch Order</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


