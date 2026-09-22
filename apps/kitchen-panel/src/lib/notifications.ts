// Request notification permission on login
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    await Notification.requestPermission()
  }
}

// Play a beep using Web Audio API (no audio file needed)
export const playBeep = () => {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioCtx) return

  const ctx = new AudioCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'sine'
  osc.frequency.value = 880 // A5 tone

  gain.gain.setValueAtTime(0.4, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.6)
}

// Browser notification (shows even when tab is in background)
export const showBrowserNotification = (order: any) => {
  if (Notification.permission !== 'granted') return
  
  new Notification(`🍽️ New Order — ${order.order_number}`, {
    body: `${order.guest_name} · ${order.service_type.replace('_', ' ').toUpperCase()} · ${order.room_id ? 'Room' : 'Table'}`,
    icon: '/favicon.ico',
    tag: order.id // prevents duplicate notifications for same order
  })
}
