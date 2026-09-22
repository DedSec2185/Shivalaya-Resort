import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAvailableSlots, AvailableSlot } from '../hooks/useAvailableSlots';
import { useBookActivity } from '../hooks/useBookActivity';
import { useGuestAuth } from '../contexts/GuestAuthContext';

interface BookingModalProps {
  activity: {
    id: string;
    name: string;
    description: string;
    pricing_type: string;
    price_per_person: number;
    price_per_setup: number;
    price_per_session: number;
    duration_minutes: number;
  };
  onClose: () => void;
  onSuccess: (booking: any) => void;
}

export default function BookingModal({ activity, onClose, onSuccess }: BookingModalProps) {
  const { guest, isLoggedIn, isResortGuest } = useGuestAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  const { slots, loading: slotsLoading, error: slotsError } = useAvailableSlots(
    selectedDate ? activity.id : null,
    selectedDate || null
  );

  const { book, status: bookingStatus, booking: confirmedBooking, errorMessage: bookingError } = useBookActivity();

  const handleNextStep = () => {
    if (step === 1 && selectedDate && selectedSlot) {
      setStep(2);
    }
  };

  // Sync hook status to step transitions
  useEffect(() => {
    if (bookingStatus === 'success') {
      setStep(3);
    }
  }, [bookingStatus]);

  const handleBook = async () => {
    if (!selectedSlot || !guest) return;
    await book({
      activityId: activity.id,
      slotId: selectedSlot.slot_id,
      date: selectedDate,
      numberOfGuests: guests,
      guestName: guest.name || '',
      guestPhone: guest.phone || '',
      roomNumber: guest.roomNumber || '',
      specialRequests: specialRequests || null,
    });
  };

  const calculatePrice = () => {
    if (activity.pricing_type === 'per_person') {
      return activity.price_per_person * guests;
    }
    if (activity.pricing_type === 'per_setup') {
      return activity.price_per_setup;
    }
    if (activity.pricing_type === 'per_session') {
      return activity.price_per_session;
    }
    return 0;
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="backdrop" 
        onClick={onClose} 
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100 }}
      />
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--parchment)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 101,
          maxWidth: '480px',
          margin: '0 auto',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ width: '40px', height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', margin: '12px auto' }} />
        
        {step === 1 && (
          <>
            <div className="sheet-head">
              <h2 style={{ margin: 0, fontFamily: 'Fraunces', color: 'var(--ink)' }}>Select Time</h2>
              <button type="button" className="sheet-close" onClick={onClose} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="sheet-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                />
              </div>
              
              {selectedDate && (
                <div>
                  <label className="form-label">Available Slots</label>
                  {slotsLoading && <div style={{ color: 'var(--ink-soft)' }}>Loading slots...</div>}
                  {slotsError && <div style={{ color: 'var(--rust)' }}>Error loading slots.</div>}
                  {!slotsLoading && !slotsError && slots.length === 0 && (
                    <div style={{ color: 'var(--ink-soft)' }}>No slots available for this date.</div>
                  )}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {slots.map(slot => {
                      const disabled = slot.remaining_capacity <= 0;
                      const isSelected = selectedSlot?.slot_id === slot.slot_id;
                      return (
                        <div 
                          key={slot.slot_id}
                          onClick={() => !disabled && setSelectedSlot(slot)}
                          style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: `1px solid ${isSelected ? 'var(--forest)' : 'var(--line)'}`,
                            backgroundColor: isSelected ? 'rgba(44, 74, 34, 0.05)' : 'var(--card)',
                            opacity: disabled ? 0.5 : 1,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{slot.label}</div>
                            <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                              {slot.start_time} - {slot.end_time}
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: disabled ? 'var(--rust)' : 'var(--sage)' }}>
                            {slot.remaining_capacity} spots left
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="sheet-footer">
              <button 
                className="btn-main"
                disabled={!selectedDate || !selectedSlot}
                onClick={handleNextStep}
                style={{ width: '100%' }}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="sheet-head">
              <h2 style={{ margin: 0, fontFamily: 'Fraunces', color: 'var(--ink)' }}>Guest Details</h2>
              <button type="button" className="sheet-close" onClick={onClose} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="sheet-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Number of Guests</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    style={{ background: 'var(--parchment-deep)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >-</button>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, color: 'var(--ink)', minWidth: '24px', textAlign: 'center' }}>{guests}</span>
                  <button 
                    onClick={() => setGuests(Math.min(selectedSlot?.remaining_capacity || 1, guests + 1))}
                    style={{ background: 'var(--parchment-deep)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '8px' }}>
                <label className="form-label">Special Requests</label>
                <textarea 
                  className="form-input" 
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                />
              </div>

              {(bookingStatus === 'error' || bookingStatus === 'slot_full') && (
                <div style={{ color: 'var(--rust)', fontSize: '14px', padding: '8px', backgroundColor: 'rgba(154, 69, 48, 0.1)', borderRadius: '8px' }}>
                  {bookingStatus === 'slot_full' ? 'Sorry, this slot is now full.' : bookingError || 'Failed to book activity.'}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--line)', marginTop: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Total</span>
                <span style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, color: 'var(--forest)' }}>
                  ₹{calculatePrice().toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            
            <div className="sheet-footer" style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--line)', borderRadius: '8px', cursor: 'pointer', color: 'var(--ink)', fontWeight: 600 }}
              >
                Back
              </button>
              <button 
                className="btn-main"
                onClick={handleBook}
                disabled={bookingStatus === 'loading' || !guest?.name || !guest?.phone}
                style={{ flex: 2 }}
              >
                {bookingStatus === 'loading' ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '32px 16px', textAlign: 'center' }}>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(46, 204, 113, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2ecc71' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </motion.div>
            <h2 style={{ margin: 0, fontFamily: 'Fraunces, serif', color: 'var(--forest-deep)', fontSize: '24px' }}>Booking Confirmed!</h2>
            <p style={{ color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
              Your booking for <strong style={{ color: 'var(--forest-deep)' }}>{activity.name}</strong> on <strong style={{ color: 'var(--forest-deep)' }}>{selectedDate}</strong> at <strong style={{ color: 'var(--forest-deep)' }}>{selectedSlot?.start_time}</strong> is confirmed.
            </p>
            <div style={{ marginTop: '24px', width: '100%', padding: '0 20px' }}>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="btn-main"
                onClick={() => {
                  onSuccess(confirmedBooking);
                  onClose();
                }}
                style={{ width: '100%', padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: 600, background: 'var(--forest-deep)' }}
              >
                Done
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
