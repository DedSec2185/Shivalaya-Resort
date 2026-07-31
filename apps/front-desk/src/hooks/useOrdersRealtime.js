import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RESTAURANT_SLUG } from '@panache/supabase-schema';
import { getRuntimeEnv } from '@panache/shared-types';

/* ============================================================
   MOCK DATA — used when Supabase env vars are absent (MVP demo)
   Covers all active statuses and two completed states.
   ============================================================ */
function minutesAgo(n) {
  return new Date(Date.now() - n * 60 * 1000).toISOString();
}

const MOCK_ORDERS = [
  // ---- NEW ----
  {
    id: 'mock-ord-001',
    guest_name: 'Mr. Arun Sharma',
    guest_phone: '98765-43210',
    room_number: '204',
    service_type: 'room_service',
    status: 'new',
    total: 850,
    created_at: minutesAgo(4),
    note: 'Extra spicy please',
    items: [
      { name: 'Dal Makhani',  qty: 1, price: 320 },
      { name: 'Butter Naan',  qty: 3, price: 60  },
      { name: 'Raita',        qty: 1, price: 110 },
    ],
  },
  {
    id: 'mock-ord-002',
    guest_name: 'Ms. Priya Verma',
    guest_phone: '87654-32109',
    room_number: '308',
    service_type: 'room_service',
    status: 'new',
    total: 1240,
    created_at: minutesAgo(8),
    note: '',
    items: [
      { name: 'Chicken Biryani', qty: 2, price: 420 },
      { name: 'Gulab Jamun',     qty: 1, price: 160 },
      { name: 'Mineral Water',   qty: 2, price: 40  },
    ],
  },
  // ---- CONFIRMED ----
  {
    id: 'mock-ord-003',
    guest_name: 'Mr. Rajesh Kumar',
    guest_phone: '76543-21098',
    room_number: '115',
    table_number: 'Table 4',
    service_type: 'dine_in',
    status: 'confirmed',
    total: 2100,
    created_at: minutesAgo(15),
    note: '[Table 4] Birthday celebration – please arrange a candle',
    items: [
      { name: 'Paneer Tikka',   qty: 2, price: 380 },
      { name: 'Butter Chicken', qty: 1, price: 480 },
      { name: 'Garlic Naan',    qty: 4, price: 80  },
      { name: 'Mango Lassi',    qty: 2, price: 150 },
    ],
  },
  // ---- PREPARING ----
  {
    id: 'mock-ord-004',
    guest_name: 'Mrs. Sunita Patel',
    guest_phone: '65432-10987',
    room_number: '212',
    service_type: 'room_service',
    status: 'preparing',
    total: 680,
    created_at: minutesAgo(22),
    note: '',
    items: [
      { name: 'Veg Fried Rice', qty: 1, price: 280 },
      { name: 'Manchurian',     qty: 1, price: 260 },
      { name: 'Cold Coffee',    qty: 1, price: 140 },
    ],
  },
  // ---- READY ----
  {
    id: 'mock-ord-005',
    guest_name: 'Mr. Vikram Singh',
    guest_phone: '54321-09876',
    room_number: '301',
    service_type: 'room_service',
    status: 'ready',
    total: 1560,
    created_at: minutesAgo(35),
    note: '',
    items: [
      { name: 'Fish Curry',    qty: 1, price: 520 },
      { name: 'Steamed Rice',  qty: 1, price: 180 },
      { name: 'Papad',         qty: 2, price: 40  },
      { name: 'Gulab Jamun',   qty: 2, price: 160 },
    ],
  },
  // ---- SERVED (completed) ----
  {
    id: 'mock-ord-006',
    guest_name: 'Ms. Ananya Roy',
    guest_phone: '43210-98765',
    room_number: '209',
    service_type: 'room_service',
    status: 'served',
    total: 920,
    created_at: minutesAgo(70),
    note: '',
    items: [
      { name: 'Club Sandwich',    qty: 2, price: 280 },
      { name: 'French Fries',     qty: 1, price: 200 },
      { name: 'Cold Brew Coffee', qty: 1, price: 160 },
    ],
  },
  // ---- CANCELLED ----
  {
    id: 'mock-ord-007',
    guest_name: 'Mr. Deepak Joshi',
    guest_phone: '32109-87654',
    room_number: '102',
    service_type: 'dine_in',
    status: 'cancelled',
    total: 450,
    created_at: minutesAgo(90),
    note: 'Guest checked out early',
    items: [
      { name: 'Masala Chai', qty: 2, price: 80 },
      { name: 'Samosa',      qty: 4, price: 60 },
    ],
  },
];

/* ============================================================
   HOOK
   ============================================================ */
export function useOrdersRealtime({ onNewOrder } = {}) {
  const { isDemoMode } = getRuntimeEnv(import.meta.env);

  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);
  const mockInitRef = useRef(false);

  const fetchOrders = useCallback(async (restId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restId)
      .order('created_at', { ascending: false });

    if (!error && data) setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // ---- DEMO / MOCK MODE ----
    if (isDemoMode) {
      if (!mockInitRef.current) {
        mockInitRef.current = true;
        // Stagger the mock data appearance for visual effect
        setTimeout(() => {
          setOrders(MOCK_ORDERS);
          setLoading(false);
          // Notify parent about new orders in mock set
          MOCK_ORDERS.filter(o => o.status === 'new').forEach(o => onNewOrder?.(o));
        }, 600);
      }
      return;
    }

    // ---- LIVE SUPABASE MODE ----
    let channel;
    async function init() {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', RESTAURANT_SLUG)
        .single();

      if (!restaurant) { setLoading(false); return; }

      setRestaurantId(restaurant.id);
      await fetchOrders(restaurant.id);

      channel = supabase
        .channel('orders-realtime')
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'orders',
          filter: `restaurant_id=eq.${restaurant.id}`,
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [payload.new, ...prev]);
            onNewOrder?.(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
          }
        })
        .subscribe();
    }

    init();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [fetchOrders, onNewOrder, isDemoMode]);

  // MOCK STATUS UPDATE — updates local state directly
  const mockUpdateStatus = useCallback((orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    return Promise.resolve(true);
  }, []);

  const updateStatus = useCallback(async (orderId, status, staffName) => {
    if (isDemoMode) return mockUpdateStatus(orderId, status);

    const { error } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_status: status,
      p_staff_name: staffName,
    });
    if (error) {
      const { error: fbErr } = await supabase.from('orders').update({ status }).eq('id', orderId);
      return !fbErr;
    }
    return true;
  }, [isDemoMode, mockUpdateStatus]);

  const activeOrders    = orders.filter(o => !['served', 'cancelled'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'served');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');
  const newOrderCount   = orders.filter(o => o.status === 'new').length;

  return { orders, activeOrders, completedOrders, cancelledOrders, newOrderCount, loading, updateStatus, restaurantId };
}
