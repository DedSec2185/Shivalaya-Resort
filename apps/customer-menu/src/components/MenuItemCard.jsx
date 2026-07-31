import { useRef } from 'react';

export default function MenuItemCard({ item, qty, onAdd, onRemove, rowIndex = 0 }) {
  const isUnavailable = item.available === false;
  const qtyRef = useRef(null);

  function handleAdd() {
    onAdd();
    // Re-trigger qty flip animation
    if (qtyRef.current) {
      qtyRef.current.style.animation = 'none';
      // force reflow
      void qtyRef.current.offsetWidth;
      qtyRef.current.style.animation = '';
    }
  }

  function handleRemove() {
    onRemove();
    if (qtyRef.current) {
      qtyRef.current.style.animation = 'none';
      void qtyRef.current.offsetWidth;
      qtyRef.current.style.animation = '';
    }
  }

  return (
    <div
      className="item-row"
      style={{
        '--row-index': rowIndex,
        ...(isUnavailable ? { opacity: 0.48, pointerEvents: 'none' } : {})
      }}
    >
      <div className={`veg-mark ${item.veg ? '' : 'nonveg'}`} />
      <div className="item-info">
        <div className="item-name-row">
          <span className="item-name">{item.name}</span>
          {item.special && <span className="special-tag">Chef's Special</span>}
        </div>
        {item.description && <div className="item-desc">{item.description}</div>}
        <div className="item-price">₹{item.price.toLocaleString('en-IN')}</div>
      </div>
      <div className="item-action">
        {isUnavailable ? (
          <span style={{ fontSize: '11px', color: 'var(--sage)', fontFamily: 'Inter, sans-serif' }}>Unavailable</span>
        ) : qty > 0 ? (
          <div className="stepper">
            <button type="button" onClick={handleRemove} aria-label="Remove one">−</button>
            <span className="qty" ref={qtyRef}>{qty}</span>
            <button type="button" onClick={handleAdd} aria-label="Add one">+</button>
          </div>
        ) : (
          <button type="button" className="add-btn" onClick={onAdd}>Add</button>
        )}
      </div>
    </div>
  );
}
