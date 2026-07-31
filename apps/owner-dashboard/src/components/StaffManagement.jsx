import { useState } from 'react';
import { createPortal } from 'react-dom';
import { DEMO_STAFF } from '../utils/demoData';

const ROLE_LABEL = {
  receptionist: 'Receptionist',
  kitchen:      'Kitchen Staff',
  manager:      'Manager',
  owner:        'Owner',
};

function StaffModal({ staff, onClose, onSave }) {
  const isEdit = !!staff;
  const [form, setForm] = useState({
    name:      staff?.name      ?? '',
    role:      staff?.role      ?? 'receptionist',
    phone:     staff?.phone     ?? '',
    email:     staff?.email     ?? '',
    pin:       '',
    confirmPin:'',
  });
  const [err, setErr] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleSave() {
    if (!form.name.trim()) { setErr('Name is required'); return; }
    if (!isEdit || form.pin) {
      if (!/^\d{4}$/.test(form.pin)) { setErr('PIN must be 4 digits'); return; }
      if (form.pin !== form.confirmPin) { setErr('PINs do not match'); return; }
    }
    onSave({ ...form });
  }

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-box">
        <div className="modal-title">{isEdit ? 'Edit Staff Member' : 'Add New Staff Member'}</div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Priya Sharma" />
          </div>
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select className="form-select" value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="receptionist">Receptionist</option>
              <option value="kitchen">Kitchen Staff</option>
              <option value="manager">Manager</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@shivalayaresort.com" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{isEdit ? 'New PIN (leave blank to keep)' : 'PIN *'}</label>
            <input className="form-input" type="password" maxLength={4} value={form.pin} onChange={e => set('pin', e.target.value)} placeholder="4 digits" style={{ letterSpacing: '0.3em' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm PIN</label>
            <input className="form-input" type="password" maxLength={4} value={form.confirmPin} onChange={e => set('confirmPin', e.target.value)} placeholder="4 digits" style={{ letterSpacing: '0.3em' }} />
          </div>
        </div>

        {err && <div style={{ color: 'var(--rust)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{err}</div>}

        <div className="modal-actions">
          <button type="button" className="btn-action ghost-action" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-action" onClick={handleSave}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M20 6L9 17l-5-5"/></svg>
            {isEdit ? 'Save Changes' : 'Add Staff Member'}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function StaffManagement({ showToast }) {
  const [staff, setStaff]     = useState(DEMO_STAFF);
  const [modal, setModal]     = useState(null); // null | 'add' | staffId
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const editingStaff = modal && modal !== 'add' ? staff.find(s => s.id === modal) : null;
  const filtered = staff.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'all' || s.role === roleFilter;
    return matchSearch && matchRole;
  });

  function handleSave(form) {
    if (editingStaff) {
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...form } : s));
      showToast(`${form.name}'s details updated`);
    } else {
      const newMember = {
        ...form,
        id:          `REC-${Date.now()}`,
        joinedDate:  new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        status:      'active',
        dutyStatus:  'Off Duty',
      };
      setStaff(prev => [...prev, newMember]);
      showToast(`${form.name} added to staff`);
    }
    setModal(null);
  }

  function handleDelete(id) {
    const member = staff.find(s => s.id === id);
    if (!window.confirm(`Remove ${member?.name} from staff? This cannot be undone.`)) return;
    setStaff(prev => prev.filter(s => s.id !== id));
    showToast(`${member.name} removed from staff`);
  }

  function handleToggleStatus(id) {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
    const member = staff.find(s => s.id === id);
    showToast(`${member.name} ${member.status === 'active' ? 'deactivated' : 'activated'}`);
  }

  const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="mgmt-view">
      <div className="mgmt-header">
        <div>
          <div className="mgmt-title">Staff Accounts</div>
          <div className="mgmt-subtitle">{staff.filter(s => s.status === 'active').length} active staff members</div>
        </div>
        <button type="button" className="btn-action" onClick={() => setModal('add')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4"/><path d="M20 21v-1a8 8 0 00-16 0v1"/>
            <path d="M16 11h6M19 8v6" strokeLinecap="round"/>
          </svg>
          Add Staff Member
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          className="search-input"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="receptionist">Receptionist</option>
          <option value="kitchen">Kitchen Staff</option>
          <option value="manager">Manager</option>
        </select>
      </div>

      {/* Staff Cards Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="7" r="4"/><path d="M2 21v-1a7 7 0 0114 0v1"/></svg>
          <h3>No staff found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="staff-grid">
          {filtered.map((member, idx) => (
            <div key={member.id} className={`staff-card ${member.status === 'inactive' ? 'inactive' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="staff-card-top">
                <div className="staff-avatar">{initials(member.name)}</div>
                <div className="staff-info">
                  <div className="staff-name">{member.name}</div>
                  <div className={`staff-role-badge role-${member.role}`}>{ROLE_LABEL[member.role] ?? member.role}</div>
                </div>
              </div>

              <div className="staff-detail-row">
                {member.phone && (
                  <div className="staff-detail-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.07 12 19.79 19.79 0 011 3.18 2 2 0 013 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                    {member.phone}
                  </div>
                )}
                {member.email && (
                  <div className="staff-detail-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/></svg>
                    {member.email}
                  </div>
                )}
                <div className="staff-detail-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  Joined {member.joinedDate}
                </div>
              </div>

              <div className="staff-status-row">
                <div className="staff-status-chip">
                  <span className="dot-live" style={{ background: member.status === 'active' ? 'var(--forest)' : 'var(--sage)', animation: member.status === 'active' ? undefined : 'none' }} />
                  {member.dutyStatus}
                </div>
                <button type="button" className="btn-action ghost-action" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => handleToggleStatus(member.id)}>
                  {member.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              <div className="staff-card-actions">
                <button type="button" className="btn-staff" onClick={() => setModal(member.id)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  Edit
                </button>
                <button type="button" className="btn-staff danger" onClick={() => handleDelete(member.id)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/></svg>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <StaffModal
          staff={editingStaff}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
