import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Compass, Clock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface StoryItem {
  id: string
  title: string
  tag: string
  image: string
  time: string
  description: string
  actionRoute: string
  actionLabel: string
}

const RESORT_STORIES: StoryItem[] = [
  {
    id: 'bonfire',
    title: 'Starlight Bonfire',
    tag: 'Evening Vibe',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=700&q=80',
    time: '7:30 PM Tonight',
    description: 'Gather around crackling cedar logs under a blanket of Himalayan stars. Enjoy roasted marshmallows, live acoustic tunes, and hot spiced mountain cider.',
    actionRoute: '/experiences',
    actionLabel: 'Reserve Bonfire Spot'
  },
  {
    id: 'hightea',
    title: 'Kumaoni High Tea',
    tag: 'Terrace Special',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&q=80',
    time: '4:30 PM - 6:30 PM',
    description: 'Savor freshly plucked Kangra & Kumaon artisanal teas paired with regional hill sweets and handcrafted savories overlooking the pine ridge.',
    actionRoute: '/menu',
    actionLabel: 'View High Tea Menu'
  },
  {
    id: 'trek',
    title: 'Pine Ridge Trek',
    tag: 'Morning Adventure',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=700&q=80',
    time: '7:00 AM Tomorrow',
    description: 'A gentle guided walk through fragrant deodar and oak forests. Spot Himalayan barbets, monals, and take in the morning sun over Bhimtal valley.',
    actionRoute: '/experiences',
    actionLabel: 'Book Guided Trek'
  },
  {
    id: 'pool',
    title: 'Heated Valley Pool',
    tag: 'Serene Waters',
    image: 'https://shivalayaresort.com/wp-content/uploads/2026/02/IMG_1869.jpg',
    time: 'Open All Day',
    description: 'Immerse yourself in our temperature-controlled infinity pool reflecting the sky, surrounded by whispering pines and stone terraces.',
    actionRoute: '/experiences',
    actionLabel: 'Explore Poolside Cabanas'
  },
  {
    id: 'stargaze',
    title: 'Sattal Stargazing',
    tag: 'Dark Sky',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=80',
    time: '9:00 PM Tonight',
    description: 'With virtually zero light pollution, peer through our high-powered telescope to view the rings of Saturn and the Milky Way core.',
    actionRoute: '/experiences',
    actionLabel: 'Book Stargazing'
  }
]

export default function ResortStoriesReel() {
  const navigate = useNavigate()
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null)

  return (
    <>
      <div style={{ margin: '18px 0 6px' }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} color="var(--brass)" />
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--brass)'
            }}>
              Resort Highlights
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--sage)', fontWeight: 600 }}>Tap to explore</span>
        </div>

        {/* Stories Horizontal Reel */}
        <div
          className="hide-scrollbar"
          style={{
            display: 'flex',
            gap: '14px',
            overflowX: 'auto',
            padding: '4px 20px 12px',
            scrollSnapType: 'x mandatory'
          }}
        >
          {RESORT_STORIES.map((story, i) => (
            <motion.div
              key={story.id}
              whileTap={{ scale: 0.94 }}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedStory(story)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                flexShrink: 0,
                scrollSnapAlign: 'start',
                width: '74px'
              }}
            >
              {/* Ring Avatar */}
              <div style={{
                width: '66px',
                height: '66px',
                borderRadius: '50%',
                padding: '2.5px',
                background: 'linear-gradient(135deg, var(--brass), var(--forest), var(--brass-light))',
                boxShadow: '0 4px 14px rgba(44, 74, 34, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#fff',
                  border: '2px solid var(--parchment)'
                }}>
                  <img
                    src={story.image}
                    alt={story.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>

              {/* Title */}
              <span style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: 'var(--forest-deep)',
                textAlign: 'center',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '74px'
              }}>
                {story.title}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Story Preview Modal */}
      <AnimatePresence>
        {selectedStory && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(18, 22, 16, 0.75)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              style={{
                width: '100%',
                maxWidth: '380px',
                background: 'var(--parchment)',
                borderRadius: '28px',
                overflow: 'hidden',
                boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.4)',
                position: 'relative'
              }}
            >
              {/* Image banner */}
              <div style={{ position: 'relative', height: '220px', width: '100%' }}>
                <img
                  src={selectedStory.image}
                  alt={selectedStory.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(18, 22, 16, 0.8) 0%, transparent 60%)'
                }} />

                {/* Close button */}
                <button
                  onClick={() => setSelectedStory(null)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>

                {/* Tag */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  background: 'rgba(173, 138, 63, 0.9)',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}>
                  {selectedStory.tag}
                </div>

                {/* Bottom title on image */}
                <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px' }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '22px',
                    color: '#fff',
                    fontFamily: 'Fraunces, serif',
                    fontWeight: 700
                  }}>
                    {selectedStory.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.85)', fontSize: '11px', marginTop: '4px' }}>
                    <Clock size={12} color="var(--brass-light)" />
                    <span>{selectedStory.time}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '20px 22px 24px' }}>
                <p style={{
                  fontSize: '13.5px',
                  color: 'var(--ink-soft)',
                  lineHeight: 1.6,
                  margin: '0 0 20px 0'
                }}>
                  {selectedStory.description}
                </p>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    const route = selectedStory.actionRoute
                    setSelectedStory(null)
                    navigate(route)
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--forest-deep), var(--forest))',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(26, 46, 19, 0.25)'
                  }}
                >
                  <span>{selectedStory.actionLabel}</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
