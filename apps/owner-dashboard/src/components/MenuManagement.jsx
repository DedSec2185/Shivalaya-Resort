import { useState } from 'react';
import { createPortal } from 'react-dom';
import { DEMO_MENU, MENU_CATEGORIES } from '../utils/demoData';

function MenuItemModal({ item, onClose, onSave }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    name:     item?.name     ?? '',
    category: item?.category ?? 'Main Course',
    price:    item?.price    ?? '',
    emoji:    item?.emoji    ?? '🍽️',
    available:item?.available ?? true,
  });
  const [err, setErr] = useState('');
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleSave() {
    if (!form.name.trim()) { setErr('Item name is required'); return; }
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) { setErr('Enter a valid price'); return; }
    onSave({ ...form, price: Number(form.price) });
  }

  const categories = MENU_CATEGORIES.filter(c => c !== 'All');

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-box">
        <div className="modal-title">{isEdit ? 'Edit Menu Item' : 'Add New Item'}</div>

        <div className="form-group">
          <label className="form-label">Item Name *</label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Butter Chicken" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Price (₹) *</label>
            <input className="form-input" type="number" min="1" value={form.price} onChange={e => set('price', e.target.value)} placeholder="350" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Emoji Icon</label>
            <input className="form-input" value={form.emoji} onChange={e => set('emoji', e.target.value)} placeholder="🍛" style={{ fontSize: 20 }} maxLength={2} />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <label className="form-label">Availability</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8 }}>
              <label className="toggle-switch">
                <input type="checkbox" checked={form.available} onChange={e => set('available', e.target.checked)} />
                <span className="toggle-slider" />
              </label>
              <span style={{ fontSize: 13, fontWeight: 600, color: form.available ? 'var(--forest)' : 'var(--sage)' }}>
                {form.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        </div>

        {err && <div style={{ color: 'var(--rust)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{err}</div>}

        <div className="modal-actions">
          <button type="button" className="btn-action ghost-action" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-action" onClick={handleSave}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M20 6L9 17l-5-5"/></svg>
            {isEdit ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function MenuManagement({ showToast }) {
  const [menu, setMenu]         = useState(DEMO_MENU);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null); // null | 'add' | itemId

  const editingItem = modal && modal !== 'add' ? menu.find(m => m.id === modal) : null;

  const filtered = menu.filter(m => {
    const matchCat    = activeCategory === 'All' || m.category === activeCategory;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function handleSave(form) {
    if (editingItem) {
      setMenu(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...form } : m));
      showToast(`"${form.name}" updated`);
    } else {
      const newItem = { ...form, id: `M${Date.now()}` };
      setMenu(prev => [...prev, newItem]);
      showToast(`"${form.name}" added to menu`);
    }
    setModal(null);
  }

  function handleToggle(id) {
    const item = menu.find(m => m.id === id);
    setMenu(prev => prev.map(m => m.id === id ? { ...m, available: !m.available } : m));
    showToast(`"${item.name}" marked as ${item.available ? 'unavailable' : 'available'}`);
  }

  function handleDelete(id) {
    const item = menu.find(m => m.id === id);
    if (!window.confirm(`Remove "${item?.name}" from the menu?`)) return;
    setMenu(prev => prev.filter(m => m.id !== id));
    showToast(`"${item.name}" removed from menu`);
  }

  const availableCount = menu.filter(m => m.available).length;

  return (
    <div className="mgmt-view">
      <div className="mgmt-header">
        <div>
          <div className="mgmt-title">Menu & Prices</div>
          <div className="mgmt-subtitle">{menu.length} items · {availableCount} available</div>
        </div>
        <button type="button" className="btn-action" onClick={() => setModal('add')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
          </svg>
          Add Menu Item
        </button>
      </div>

      {/* Search */}
      <div className="filter-bar">
        <input
          className="search-input"
          placeholder="Search menu items…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category pills */}
      <div className="menu-categories">
        {MENU_CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >{cat}</button>
        ))}
      </div>

      {/* Menu grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 15c2-6 5-9 8-9s6 3 8 9"/></svg>
          <h3>No items found</h3>
          <p>Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="menu-grid">
          {filtered.map((item, idx) => (
            <div key={item.id} className={`menu-item-card ${!item.available ? 'unavailable' : ''}`} style={{ animationDelay: `${idx * 0.04}s` }}>
              <div className="menu-item-emoji">{item.emoji}</div>
              <div className="menu-item-info">
                <div className="menu-item-name">{item.name}</div>
                <div className="menu-item-cat">{item.category}</div>
                <div className="menu-item-price"><span className="cur">₹</span>{item.price.toLocaleString('en-IN')}</div>
              </div>
              <div className="menu-item-actions">
                <label className="toggle-switch" title={item.available ? 'Mark unavailable' : 'Mark available'}>
                  <input type="checkbox" checked={item.available} onChange={() => handleToggle(item.id)} />
                  <span className="toggle-slider" />
                </label>
                <button type="button" className="btn-icon-sm" title="Edit item" onClick={() => setModal(item.id)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button type="button" className="btn-icon-sm" title="Remove item" onClick={() => handleDelete(item.id)} style={{ borderColor: 'rgba(154,69,48,0.25)', color: 'var(--rust)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <MenuItemModal
          item={editingItem}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
