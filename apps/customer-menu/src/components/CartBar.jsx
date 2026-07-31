import { useRef, useEffect } from 'react';

export default function CartBar({ totalItems, total, onCheckout }) {
  const chipRef = useRef(null);
  const prevCount = useRef(totalItems);

  useEffect(() => {
    // Pop animation on chip whenever count increases
    if (totalItems > 0 && totalItems !== prevCount.current && chipRef.current) {
      chipRef.current.classList.remove('pop');
      void chipRef.current.offsetWidth; // force reflow
      chipRef.current.classList.add('pop');
    }
    prevCount.current = totalItems;
  }, [totalItems]);

  return (
    <div
      className={`cart-bar ${totalItems > 0 ? 'show' : ''}`}
      onClick={onCheckout}
      role="button"
      aria-label={`View cart — ${totalItems} items, ₹${total.toLocaleString('en-IN')}`}
    >
      <div className="cart-bar-left">
        <div className="cart-count-chip" ref={chipRef}>{totalItems}</div>
        <div className="cart-bar-text">
          <div className="cart-bar-total">₹{total.toLocaleString('en-IN')}</div>
          <div className="cart-bar-items">{totalItems} {totalItems === 1 ? 'item' : 'items'}</div>
        </div>
      </div>
      <div className="cart-bar-cta">
        View Cart
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </div>
    </div>
  );
}
