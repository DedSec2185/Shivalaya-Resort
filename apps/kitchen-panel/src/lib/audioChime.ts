// Native Web Audio API Chime for Kitchen KOT Alerts
// Dual-tone harmonic bell (880Hz -> 1320Hz) with exponential gain decay

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function isKitchenSoundMuted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('panache_kitchen_sound_muted') === 'true'
}

export function setKitchenSoundMuted(muted: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('panache_kitchen_sound_muted', muted ? 'true' : 'false')
}

export function playKitchenOrderChime(): void {
  if (isKitchenSoundMuted()) return

  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // First tone (A5 - 880Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, now)

    gain1.gain.setValueAtTime(0, now)
    gain1.gain.linearRampToValueAtTime(0.28, now + 0.02)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.5)

    // Second higher harmonic tone (E6 - 1318.5Hz) with slight delay
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(1318.5, now + 0.12)

    gain2.gain.setValueAtTime(0, now + 0.12)
    gain2.gain.linearRampToValueAtTime(0.35, now + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9)

    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.95)
  } catch (err) {
    console.warn('Unable to play kitchen audio chime:', err)
  }
}

export function playItemCheckTick(): void {
  if (isKitchenSoundMuted()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1760, now) // High pleasant tap (A6)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.09)
  } catch {}
}

