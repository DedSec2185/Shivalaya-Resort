import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function ProfilePanel({ staff, onUpdateProfile, onUpdatePin }) {
  const { t } = useLanguage();
  // Edit Profile Form state
  const [name, setName] = useState(staff?.name || 'Demo Receptionist');
  const [phone, setPhone] = useState(staff?.phone || '+91 98765 43210');
  const [email, setEmail] = useState(staff?.email || 'reception@shivalayaresort.com');
  const [profileMsg, setProfileMsg] = useState('');

  // PIN Form state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMsg, setPinMsg] = useState({ type: '', text: '' });

  // Initials for Avatar
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  function handleSaveProfile(e) {
    e.preventDefault();
    onUpdateProfile({ name, phone, email });
    setProfileMsg('Profile updated successfully!');
    setTimeout(() => setProfileMsg(''), 3000);
  }

  function handleDutyToggle(newStatus) {
    onUpdateProfile({ dutyStatus: newStatus });
  }

  function handleSavePin(e) {
    e.preventDefault();
    setPinMsg({ type: '', text: '' });

    if (newPin !== confirmPin) {
      setPinMsg({ type: 'error', text: 'New PIN and Confirm PIN do not match' });
      return;
    }

    const res = onUpdatePin(currentPin, newPin);
    if (res.success) {
      setPinMsg({ type: 'success', text: res.message });
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => setPinMsg({ type: '', text: '' }), 3500);
    } else {
      setPinMsg({ type: 'error', text: res.message });
    }
  }

  const dutyStatus = staff?.dutyStatus || 'On Duty';

  const DUTY_STATUSES = [
    { id: 'On Duty', key: 'onDuty' },
    { id: 'On Break', key: 'onBreak' },
    { id: 'Off Duty', key: 'offDuty' },
  ];

  return (
    <div className="profile-container">
      {/* ── Top Header Banner Card ─────────────────── */}
      <div className="profile-card profile-banner">
        <div className="profile-banner-left">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-banner-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{staff?.name || name}</h1>
              <span className="profile-badge-role">Front Desk Receptionist</span>
            </div>
            <div className="profile-meta-line">
              <span>Staff ID: <strong>{staff?.id || 'REC-101'}</strong></span>
              <span>Joined: <strong>{staff?.joinedDate || '15 Jan 2025'}</strong></span>
            </div>
          </div>
        </div>

        {/* Duty Status Switcher */}
        <div className="profile-duty-box">
          <div className="duty-box-label">{t('dutyStatus')}:</div>
          <div className="duty-options">
            {DUTY_STATUSES.map(item => (
              <button
                key={item.id}
                type="button"
                className={`btn-duty-pill ${item.id.toLowerCase().replace(' ', '-')} ${dutyStatus === item.id ? 'active' : ''}`}
                onClick={() => handleDutyToggle(item.id)}
              >
                <span className="duty-dot" />
                {t(item.key)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid Layout for Profile Forms ────── */}
      <div className="profile-grid">

        {/* 1. Edit Profile Form */}
        <div className="profile-card">
          <div className="profile-card-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <h2>{t('personalDetails')}</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="form-group">
              <label className="form-label">{t('fullName')}</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">{t('phoneNumber')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('emailAddress')}</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {profileMsg && <div className="form-alert success">{profileMsg}</div>}

            <button type="submit" className="btn-profile-save">
              {t('savePersonalDetails')}
            </button>
          </form>
        </div>

        {/* 2. Security & PIN Change */}
        <div className="profile-card">
          <div className="profile-card-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            <h2>{t('securityPinChange')}</h2>
          </div>

          <form onSubmit={handleSavePin} className="profile-form">
            <div className="form-group">
              <label className="form-label">{t('currentPin')}</label>
              <input
                type="password"
                maxLength={4}
                className="form-input pin-input"
                placeholder="••••"
                value={currentPin}
                onChange={e => setCurrentPin(e.target.value)}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">{t('newPin')}</label>
                <input
                  type="password"
                  maxLength={4}
                  className="form-input pin-input"
                  placeholder="••••"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('confirmNewPin')}</label>
                <input
                  type="password"
                  maxLength={4}
                  className="form-input pin-input"
                  placeholder="••••"
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value)}
                  required
                />
              </div>
            </div>

            {pinMsg.text && (
              <div className={`form-alert ${pinMsg.type}`}>
                {pinMsg.text}
              </div>
            )}

            <button type="submit" className="btn-profile-save">
              {t('updateSecurityPin')}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
