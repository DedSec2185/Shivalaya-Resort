import { useState, useCallback, useMemo } from 'react';

export function useCart() {
  const [cart, setCart] = useState({});

  const addItem = useCallback((item) => {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: {
          id: item.id,
          name: item.name,
          price: item.price,
          veg: item.veg,
          qty: (existing?.qty || 0) + 1,
        },
      };
    });
  }, []);

  const removeItem = useCallback((itemId) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      if (existing.qty <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: { ...existing, qty: existing.qty - 1 },
      };
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  const lines = useMemo(() => Object.values(cart), [cart]);

  const totalItems = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines]
  );

  const total = useMemo(
    () => lines.reduce((sum, l) => sum + l.price * l.qty, 0),
    [lines]
  );

  const getQty = useCallback((itemId) => cart[itemId]?.qty || 0, [cart]);

  return { lines, totalItems, total, addItem, removeItem, clearCart, getQty };
}
