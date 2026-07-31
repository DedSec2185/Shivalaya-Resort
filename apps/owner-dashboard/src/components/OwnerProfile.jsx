import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function OwnerProfile({ owner, onUpdateProfile, onUpdatePin, showToast }) {
  const [editMode, setEditMode] = useState(false);
  const [pinModal, setPinModal] = useState(false);

  const [form, setForm] = useState({
    name:   owner.name   ?? '',
    email:  owner.email  ?? '',
    phone:  owner.phone  ?? '',
    resort: owner.resort ?? '',
  });

  const [pinForm, setPinForm] = useState({ current: '', next: '', confirm: '' });
  const [pinErr, setPinErr]   = useState('');

  function set(k, v)    { setForm(f => ({ ...f, [k]: v })); }
  function setPin(k, v) { setPinForm(f => ({ ...f, [k]: v })); }

  function handleSaveProfile() {
    if (!form.name.trim()) return;
    onUpdateProfile(form);
    setEditMode(false);
    showToast('Profile updated successfully');
  }

  function handleSavePin() {
    setPinErr('');
    const result = onUpdatePin(pinForm.current, pinForm.next);
    if (!result.ok) { setPinErr(result.msg); return; }
    if (pinForm.next !== pinForm.confirm) { setPinErr('New PINs do not match'); return; }
    setPinModal(false);
    setPinForm({ current: '', next: '', confirm: '' });
    showToast('PIN updated successfully');
  }

  const initials = owner.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() ?? 'OW';

  // Calculate rough stats from demo data
  const memberSince = owner.joinedDate ?? 'Jan 2024';

  return (
    <div className="mgmt-view">
      <div className="mgmt-header">
        <div>
          <div className="mgmt-title">Owner Profile</div>
          <div className="mgmt-subtitle">Manage your account and resort settings</div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left card */}
        <div className="profile-card">
          <div className="profile-avatar-lg">{initials}</div>
          <div className="profile-name">{owner.name}</div>
          <div className="profile-title">Owner · Shivalaya Resorts</div>

          <div className="profile-stats">
            <div>
              <div className="profile-stat-value">₹4.98L</div>
              <div className="profile-stat-label">This Month</div>
            </div>
            <div>
              <div className="profile-stat-value">1,150</div>
              <div className="profile-stat-label">Orders / Mo</div>
            </div>
            <div>
              <div className="profile-stat-value">6</div>
              <div className="profile-stat-label">Staff Members</div>
            </div>
            <div>
              <div className="profile-stat-value">{memberSince}</div>
              <div className="profile-stat-label">Member Since</div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <button type="button" className="btn-action" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setPinModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Change PIN
            </button>
          </div>
        </div>

        {/* Right settings panel */}
        <div>
          <div className="settings-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
              <div className="settings-section-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Personal Information</div>
              {!editMode ? (
                <button type="button" className="btn-action ghost-action" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => setEditMode(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn-action ghost-action" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => { setEditMode(false); setForm({ name: owner.name, email: owner.email, phone: owner.phone, resort: owner.resort }); }}>Cancel</button>
                  <button type="button" className="btn-action" style={{ padding: '8px 14px', fontSize: 12 }} onClick={handleSaveProfile}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M20 6L9 17l-5-5"/></svg>
                    Save
                  </button>
                </div>
              )}
            </div>

            <div style={{ height: 1, background: 'var(--line)', margin: '16px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Full Name',      key: 'name',   type: 'text',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><circle cx="12" cy="8" r="4"/><path d="M4 20v-1a8 8 0 0116 0v1"/></svg> },
                { label: 'Email Address',  key: 'email',  type: 'email', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/></svg> },
                { label: 'Phone Number',   key: 'phone',  type: 'text',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.07 12 19.79 19.79 0 011 3.18 2 2 0 013 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6z"/></svg> },
                { label: 'Resort / Property', key: 'resort', type: 'text', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
              ].map(field => (
                <div key={field.key}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--sage)' }}>{field.icon}</span>
                    {field.label}
                  </label>
                  {editMode ? (
                    <input
                      className="form-input"
                      type={field.type}
                      value={form[field.key]}
                      onChange={e => set(field.key, e.target.value)}
                    />
                  ) : (
                    <div style={{ padding: '12px 16px', background: '#FFFFFF', borderRadius: 12, fontSize: 15, fontWeight: 600, color: 'var(--ink)', border: '1.5px solid rgba(35,31,22,0.15)' }}>
                      {owner[field.key] || <span style={{ color: 'var(--sage)' }}>Not set</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resort settings */}
          <div className="settings-panel" style={{ marginTop: 16 }}>
            <div className="settings-section-title">System Information</div>
            {[
              { label: 'Staff ID',          value: owner.id },
              { label: 'Dashboard Version', value: 'Owner v1.0 — MVP' },
              { label: 'Database',           value: 'Demo Mode (localStorage)' },
              { label: 'Supabase Connection',value: 'Not configured — Phase 2' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px dashed var(--line)' }}>
                <span style={{ fontSize: 13, color: 'var(--sage)', fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontSize: 13, fontFamily: 'IBM Plex Mono', color: 'var(--ink-soft)' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PIN Change Modal using createPortal */}
      {pinModal && createPortal(
        <>
          <div className="modal-backdrop" onClick={() => { setPinModal(false); setPinErr(''); }} />
          <div className="modal-box">
            <div className="modal-title">Change Owner PIN</div>
            <div className="form-group">
              <label className="form-label">Current PIN</label>
              <input className="form-input" type="password" maxLength={4} value={pinForm.current} onChange={e => setPin('current', e.target.value)} placeholder="Enter current PIN" style={{ letterSpacing: '0.4em', textAlign: 'center', fontSize: 18 }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">New PIN</label>
                <input className="form-input" type="password" maxLength={4} value={pinForm.next} onChange={e => setPin('next', e.target.value)} placeholder="4 digits" style={{ letterSpacing: '0.4em', textAlign: 'center', fontSize: 18 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New PIN</label>
                <input className="form-input" type="password" maxLength={4} value={pinForm.confirm} onChange={e => setPin('confirm', e.target.value)} placeholder="4 digits" style={{ letterSpacing: '0.4em', textAlign: 'center', fontSize: 18 }} />
              </div>
            </div>
            {pinErr && <div style={{ color: 'var(--rust)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{pinErr}</div>}
            <div className="modal-actions">
              <button type="button" className="btn-action ghost-action" onClick={() => { setPinModal(false); setPinErr(''); }}>Cancel</button>
              <button type="button" className="btn-action" onClick={handleSavePin}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M20 6L9 17l-5-5"/></svg>
                Update PIN
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
