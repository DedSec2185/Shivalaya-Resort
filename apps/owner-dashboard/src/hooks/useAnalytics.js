import { useMemo } from 'react';

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date) {
  const d = startOfDay(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

function filterByPeriod(orders, period) {
  const now = new Date();
  if (period === 'all') return orders;

  const cutoff =
    period === 'today'
      ? startOfDay(now)
      : period === 'week'
        ? startOfWeek(now)
        : startOfDay(now);

  return orders.filter((o) => new Date(o.created_at) >= cutoff);
}

export function useAnalytics(orders, period = 'today') {
  return useMemo(() => {
    const filtered = filterByPeriod(orders, period);
    const served = filtered.filter((o) => o.status === 'served');
    const cancelled = filtered.filter((o) => o.status === 'cancelled');

    const revenue = served.reduce((sum, o) => sum + o.total, 0);
    const orderCount = filtered.length;
    const servedCount = served.length;
    const aov = servedCount > 0 ? Math.round(revenue / servedCount) : 0;

    const itemCounts = {};
    for (const order of served) {
      for (const item of order.items || []) {
        const key = item.name;
        itemCounts[key] = (itemCounts[key] || 0) + item.qty;
      }
    }

    const topItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const maxItemCount = topItems[0]?.count || 1;

    const byService = {
      room_service: served.filter((o) => o.service_type === 'room_service').length,
      dine_in: served.filter((o) => o.service_type === 'dine_in').length,
      pickup: served.filter((o) => o.service_type === 'pickup').length,
    };

    return {
      filtered,
      revenue,
      orderCount,
      servedCount,
      cancelledCount: cancelled.length,
      aov,
      topItems,
      maxItemCount,
      byService,
    };
  }, [orders, period]);
}

export function filterOrders(orders, { status, serviceType, search, date }) {
  return orders.filter((o) => {
    if (status && status !== 'all' && o.status !== status) return false;
    if (serviceType && serviceType !== 'all' && o.service_type !== serviceType) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        o.guest_name?.toLowerCase().includes(q) ||
        o.guest_phone?.includes(q) ||
        o.room_number?.includes(q) ||
        o.id.slice(0, 8).toLowerCase().includes(q);
      if (!match) return false;
    }
    if (date) {
      const orderDate = new Date(o.created_at).toISOString().slice(0, 10);
      if (orderDate !== date) return false;
    }
    return true;
  });
}

export function getEODReport(orders, date) {
  const dayOrders = orders.filter((o) => {
    const orderDate = new Date(o.created_at).toISOString().slice(0, 10);
    return orderDate === date;
  });

  const served = dayOrders.filter((o) => o.status === 'served');
  const revenue = served.reduce((sum, o) => sum + o.total, 0);

  return {
    date,
    totalOrders: dayOrders.length,
    servedOrders: served.length,
    cancelledOrders: dayOrders.filter((o) => o.status === 'cancelled').length,
    revenue,
    orders: dayOrders,
  };
}
