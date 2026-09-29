import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Wind, X } from 'lucide-react'

export default function MountainSoundscape() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [showPanel, setShowPanel] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const windGainRef = useRef<GainNode | null>(null)
  const birdTimerRef = useRef<number | null>(null)
  const chimeTimerRef = useRef<number | null>(null)

  // Initialize Web Audio graph
  const initAudio = () => {
    if (audioCtxRef.current) return

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    audioCtxRef.current = ctx

    // Master gain
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(volume * 0.4, ctx.currentTime)
    masterGain.connect(ctx.destination)
    masterGainRef.current = masterGain

    // ── 1. PINE FOREST MOUNTAIN BREEZE (FILTERED NOISE SYNTHESIS) ──
    const bufferSize = ctx.sampleRate * 3
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    let lastOut = 0.0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      lastOut = (lastOut * 0.95) + (white * 0.05)
      output[i] = lastOut * 3.5
    }

    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = noiseBuffer
    noiseSource.loop = true

    const bandpass = ctx.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.setValueAtTime(480, ctx.currentTime)
    bandpass.Q.setValueAtTime(1.8, ctx.currentTime)

    const lfo = ctx.createOscillator()
    lfo.frequency.setValueAtTime(0.18, ctx.currentTime)
    const lfoGain = ctx.createGain()
    lfoGain.gain.setValueAtTime(160, ctx.currentTime)
    lfo.connect(lfoGain)
    lfoGain.connect(bandpass.frequency)

    const windGain = ctx.createGain()
    windGain.gain.setValueAtTime(0.28, ctx.currentTime)
    windGainRef.current = windGain

    noiseSource.connect(bandpass)
    bandpass.connect(windGain)
    windGain.connect(masterGain)

    noiseSource.start()
    lfo.start()

    // ── 2. HIMALAYAN SONGBIRDS GENERATOR ──
    const triggerBirdSong = () => {
      if (!audioCtxRef.current || !masterGainRef.current) return
      const actx = audioCtxRef.current
      if (actx.state !== 'running') return

      const now = actx.currentTime
      const birdGain = actx.createGain()
      birdGain.gain.setValueAtTime(0, now)

      const baseFreq = 2200 + Math.random() * 900
      const chirps = 2 + Math.floor(Math.random() * 3)

      for (let c = 0; c < chirps; c++) {
        const osc = actx.createOscillator()
        osc.type = 'sine'
        const startTime = now + (c * 0.14)
        const duration = 0.09 + Math.random() * 0.05

        osc.frequency.setValueAtTime(baseFreq, startTime)
        osc.frequency.exponentialRampToValueAtTime(baseFreq + 600 + Math.random() * 400, startTime + duration * 0.4)
        osc.frequency.exponentialRampToValueAtTime(baseFreq - 200, startTime + duration)

        const chirpGain = actx.createGain()
        chirpGain.gain.setValueAtTime(0.001, startTime)
        chirpGain.gain.linearRampToValueAtTime(0.08, startTime + duration * 0.2)
        chirpGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

        osc.connect(chirpGain)
        chirpGain.connect(birdGain)

        osc.start(startTime)
        osc.stop(startTime + duration + 0.05)
      }

      birdGain.connect(masterGainRef.current)

      const nextDelay = 3500 + Math.random() * 4000
      birdTimerRef.current = window.setTimeout(triggerBirdSong, nextDelay)
    }

    // ── 3. DISTANT TIBETAN PRAYER BELL RESONANCE ──
    const triggerSingingBowl = () => {
      if (!audioCtxRef.current || !masterGainRef.current) return
      const actx = audioCtxRef.current
      if (actx.state !== 'running') return

      const now = actx.currentTime
      const fundamental = 528
      const harmonics = [fundamental, fundamental * 2.02, fundamental * 3.01]

      harmonics.forEach((freq, idx) => {
        const osc = actx.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)

        const bellGain = actx.createGain()
        const initialVol = idx === 0 ? 0.06 : 0.02
        bellGain.gain.setValueAtTime(initialVol, now)
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5)

        osc.connect(bellGain)
        bellGain.connect(masterGainRef.current!)

        osc.start(now)
        osc.stop(now + 6.0)
      })

      const nextDelay = 28000 + Math.random() * 18000
      chimeTimerRef.current = window.setTimeout(triggerSingingBowl, nextDelay)
    }

    birdTimerRef.current = window.setTimeout(triggerBirdSong, 1500)
    chimeTimerRef.current = window.setTimeout(triggerSingingBowl, 6000)
  }

  const toggleSound = async () => {
    initAudio()
    if (!audioCtxRef.current) return

    if (isPlaying) {
      if (masterGainRef.current) {
        masterGainRef.current.gain.linearRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.4)
      }
      setTimeout(() => {
        audioCtxRef.current?.suspend()
        setIsPlaying(false)
      }, 400)
    } else {
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume()
      }
      if (masterGainRef.current) {
        masterGainRef.current.gain.setValueAtTime(0.001, audioCtxRef.current.currentTime)
        masterGainRef.current.gain.linearRampToValueAtTime(volume * 0.4, audioCtxRef.current.currentTime + 0.8)
      }
      setIsPlaying(true)
    }
  }

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol)
    if (masterGainRef.current && audioCtxRef.current && isPlaying) {
      masterGainRef.current.gain.linearRampToValueAtTime(newVol * 0.4, audioCtxRef.current.currentTime + 0.1)
    }
  }

  useEffect(() => {
    return () => {
      if (birdTimerRef.current) clearTimeout(birdTimerRef.current)
      if (chimeTimerRef.current) clearTimeout(chimeTimerRef.current)
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [])

  return (
    <>
      {/* ── MOBILE BOTTOM SHEET / DESKTOP DRAWER ── */}
      <AnimatePresence>
        {showPanel && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPanel(false)}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
              }}
            />

            {/* Panel Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'relative',
                zIndex: 10,
                background: 'linear-gradient(180deg, #1F3018 0%, #152210 100%)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                borderBottomLeftRadius: '24px',
                borderBottomRightRadius: '24px',
                padding: '22px 20px',
                width: 'calc(100% - 24px)',
                maxWidth: '340px',
                marginBottom: '84px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                color: '#fff',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wind size={16} color="var(--brass)" />
                  <span style={{ fontSize: '13.5px', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--brass-light)' }}>
                    Himalayan Soundscape
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPanel(false)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                >
                  <X size={16} />
                </button>
              </div>

              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, margin: '0 0 16px' }}>
                Gentle pine breeze, whistling mountain songbirds & distant temple singing bowls synthesized in real time.
              </p>

              {/* Volume Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <VolumeX size={15} color="rgba(255,255,255,0.5)" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: 'var(--brass)',
                    height: '6px',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                />
                <Volume2 size={16} color="var(--brass)" />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={toggleSound}
                style={{
                  width: '100%',
                  background: isPlaying ? 'linear-gradient(135deg, #AD8A3F 0%, #D9BD75 100%)' : 'rgba(255,255,255,0.12)',
                  color: isPlaying ? '#1A2E13' : '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '11px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>{isPlaying ? 'Mute Mountain Sounds' : 'Play Mountain Atmosphere'}</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FLOATING LUXURY TRIGGER BUTTON (MOBILE-TUNED) ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(70px + env(safe-area-inset-bottom, 0px))',
          right: '12px',
          zIndex: 95
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            if (!isPlaying) {
              toggleSound()
            }
            setShowPanel(prev => !prev)
          }}
          style={{
            background: isPlaying 
              ? 'linear-gradient(135deg, #1A2E13 0%, #2C4A22 100%)' 
              : 'rgba(247, 244, 238, 0.95)',
            color: isPlaying ? '#D9BD75' : '#1A2E13',
            border: isPlaying ? '1.5px solid #AD8A3F' : '1px solid rgba(173, 138, 63, 0.35)',
            boxShadow: isPlaying ? '0 4px 18px rgba(173, 138, 63, 0.45)' : '0 3px 12px rgba(0,0,0,0.15)',
            borderRadius: '100px',
            padding: '7px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            transition: 'all 0.25s ease'
          }}
        >
          {isPlaying ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <motion.span
                animate={{ height: ['3px', '12px', '5px', '10px', '3px'] }}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                style={{ width: '2px', background: '#D9BD75', borderRadius: '2px', display: 'inline-block' }}
              />
              <motion.span
                animate={{ height: ['7px', '3px', '14px', '5px', '7px'] }}
                transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
                style={{ width: '2px', background: '#D9BD75', borderRadius: '2px', display: 'inline-block' }}
              />
              <motion.span
                animate={{ height: ['10px', '5px', '8px', '14px', '10px'] }}
                transition={{ repeat: Infinity, duration: 1.3, ease: 'easeInOut' }}
                style={{ width: '2px', background: '#D9BD75', borderRadius: '2px', display: 'inline-block' }}
              />
            </div>
          ) : (
            <Volume2 size={15} color="var(--forest-deep)" />
          )}

          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.02em' }}>
            {isPlaying ? 'Ambience' : '🍃 Sound'}
          </span>
        </motion.button>
      </div>
    </>
  )
}
