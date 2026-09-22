import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { ChevronLeft, Maximize, Users } from 'lucide-react'

const ROOMS = [
  {
    id: 'executive',
    name: 'Executive Room',
    price: 4500,
    image: 'https://shivalayaresort.com/wp-content/uploads/2024/11/Executive-Room1.jpeg',
    description: 'Elegant comfort with panoramic mountain views. Wake up to birdsong and misty hills from your private balcony.',
    amenities: ['King Bed', 'Mountain View', 'Private Balcony', 'En-suite Bathroom', 'Room Service', 'Wi-Fi'],
    size: '320 sq ft',
    maxGuests: 2
  },
  {
    id: 'deluxe',
    name: 'Deluxe Valley Suite',
    price: 6500,
    image: 'https://shivalayaresort.com/wp-content/uploads/2026/02/IMG_20260130_170524__01-1024x768.jpg',
    description: 'Spacious luxury with a sitting area overlooking the valley. Perfect for those who want extra space to breathe.',
    amenities: ['King Bed', 'Valley View', 'Sitting Area', 'Premium Amenities', 'Mini Bar', 'Smart TV'],
    size: '480 sq ft',
    maxGuests: 3
  },
  {
    id: 'honeymoon',
    name: 'Honeymoon Suite',
    price: 8500,
    image: 'https://shivalayaresort.com/wp-content/uploads/2026/02/Shivalaya-Resort-Nature.jpg',
    description: 'An intimate escape with a private deck, jacuzzi, and champagne on arrival. Where love meets the mountains.',
    amenities: ['King Bed', 'Private Deck', 'Jacuzzi', 'Champagne', 'Breakfast in Bed', 'Candlelight Dinner'],
    size: '560 sq ft',
    maxGuests: 2
  }
]

function RoomCard({ room, index }: { room: typeof ROOMS[0], index: number }) {
  const revealRef = useScrollReveal(0.1)
  
  return (
    <div 
      className="room-card reveal" 
      ref={revealRef} 
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="room-image-wrapper">
        <img src={room.image} alt={room.name} className="room-image" />
      </div>
      <div className="room-details">
        <div className="room-name-row">
          <h3 className="room-name">{room.name}</h3>
          <div className="room-price">₹{room.price.toLocaleString()} / night</div>
        </div>
        <p className="room-desc">{room.description}</p>
        
        <div className="room-amenities">
          {room.amenities.map(amenity => (
            <span key={amenity} className="room-amenity-pill">{amenity}</span>
          ))}
        </div>
        
        <div className="room-meta">
          <div className="room-meta-item">
            <Maximize size={16} />
            <span>{room.size}</span>
          </div>
          <div className="room-meta-item">
            <Users size={16} />
            <span>Up to {room.maxGuests} Guests</span>
          </div>
        </div>
        
        <a 
          href={`https://api.whatsapp.com/send?phone=917838223010&text=I%20would%20like%20to%20reserve%20the%20${encodeURIComponent(room.name)}`}
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-main"
          style={{ marginTop: 'auto', textDecoration: 'none' }}
        >
          Reserve This Room
        </a>
      </div>
    </div>
  )
}

export default function RoomsPage() {
  const navigate = useNavigate()

  return (
    <div className="app-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav className="resort-nav">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label="Go back">
          <ChevronLeft />
        </button>
        <span className="brand-mini-text">Shivalaya</span>
      </nav>

      <header className="resort-hero">
        <div className="resort-hero-bg" style={{backgroundImage: `url('https://shivalayaresort.com/wp-content/uploads/2024/11/IMG_1811.jpg')`}}></div>
        <div className="resort-hero-content">
          <h1>Your Mountain Sanctuary</h1>
          <p>Each room is a retreat, where the mountains are your morning view and silence is your companion</p>
        </div>
      </header>

      <main className="resort-content">
        <div className="rooms-grid">
          {ROOMS.map((room, index) => (
            <RoomCard key={room.id} room={room} index={index} />
          ))}
        </div>
      </main>

      <footer className="resort-footer">
        <h2>Ready to Reserve?</h2>
        <a 
          href="https://api.whatsapp.com/send?phone=917838223010&text=I%20would%20like%20to%20reserve%20a%20room"
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-main"
          style={{ maxWidth: '280px', textDecoration: 'none', background: 'var(--brass)', color: 'var(--forest-deep)' }}
        >
          WhatsApp Us
        </a>
        <div style={{ marginTop: '16px' }}>
          <p>+91-7668-009-400</p>
          <p>reservations@shivalayaresort.com</p>
        </div>
      </footer>
    </div>
  )
}
