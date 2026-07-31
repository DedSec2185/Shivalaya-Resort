import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RESTAURANT_SLUG } from '@panache/supabase-schema';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', RESTAURANT_SLUG)
        .single();

      if (!restaurant) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false });

      setOrders(data || []);
      setLoading(false);
    }

    fetchOrders();
  }, []);

  return { orders, loading };
}
