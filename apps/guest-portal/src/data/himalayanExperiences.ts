export interface HimalayanExpedition {
  id: string
  name: string
  tagline: string
  category: 'birdcage' | 'bonfire' | 'gaming' | 'camping' | 'trek' | 'excursion'
  categoryLabel: string
  elevation: string
  duration: string
  groupSize: string
  difficulty: 'Gentle' | 'Easy' | 'Moderate'
  pricing_type: 'per_person' | 'per_setup' | 'per_session'
  price_per_person: number
  price_per_setup: number
  price_per_session: number
  duration_minutes: number
  image_url: string
  gallery_images: string[]
  badge: string
  highlights: string[]
  itinerary: { time: string; title: string; desc: string }[]
  inclusions: string[]
  whatToBring: string[]
  sensoryNote: string
}

export const HIMALAYAN_EXPEDITIONS: HimalayanExpedition[] = [
  {
    id: 'exp-bird-cage',
    name: 'The Iconic Bird Cage Dining Experience',
    tagline: 'Private fairy-lit wrought-iron Bird Cage cabana on the lawn with panoramic mountain views & candlelight dinner',
    category: 'birdcage',
    categoryLabel: 'Signature Cabana Dining',
    elevation: '1,450m (4,750 ft)',
    duration: '2.5 Hours',
    groupSize: 'Couple or Family (Up to 4 guests)',
    difficulty: 'Gentle',
    pricing_type: 'per_setup',
    price_per_person: 0,
    price_per_setup: 2500,
    price_per_session: 2500,
    duration_minutes: 150,
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80',
      'https://shivalayaresort.com/wp-content/uploads/2026/03/IMG_20260221_175556-1-scaled.jpg',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80'
    ],
    badge: 'Iconic Shivalaya Experience',
    highlights: [
      'Exclusive reservation of the illuminated wrought-iron Bird Cage pavilion',
      'Romantic fairy light canopy, table candlelights & fragrant pine surroundings',
      'Curated 4-course menu served course-by-course by private butler from Panache',
      'Warm pashmina throws and gentle mountain music of your choice'
    ],
    itinerary: [
      { time: 'Arrival', title: 'Welcome to the Bird Cage', desc: 'Step into the private illuminated cabana with chilled rhododendron cooler or warm kahwa.' },
      { time: 'Appetizers', title: 'Clay Sigri Starters', desc: 'Savor piping hot tandoori kebabs and paneer skewers served directly to your table.' },
      { time: 'Main Course', title: 'Panache Signature Feast', desc: 'Slow-cooked Himalayan specialties served with fragrant breads under the night sky.' },
      { time: 'Dessert', title: 'Sweet Twilight Finish', desc: 'Warm walnut brownies with vanilla bean glaze as the valley lights twinkle below.' }
    ],
    inclusions: [
      'Exclusive 2.5-hour private Bird Cage cabana reservation',
      'Full fairy-light & candlelight table decoration',
      'Dedicated private butler service',
      'Complimentary welcome elixir and artisanal dessert'
    ],
    whatToBring: [
      'Camera or smartphone for iconic evening photos',
      'Cozy evening wear for the crisp mountain air'
    ],
    sensoryNote: 'Warm glow of amber fairy lights, gentle mountain breeze whispering through the pines, and romantic clinking of glasses.'
  },
  {
    id: 'exp-bonfire-bbq',
    name: 'Evening Pine Bonfire & Live Barbecue',
    tagline: 'Crackling mountain timber bonfire on the open lawn with live sigri skewers, music & starry sky',
    category: 'bonfire',
    categoryLabel: 'Night Lawn Rituals',
    elevation: '1,450m (4,750 ft)',
    duration: '2 Hours',
    groupSize: '1 to 8 Guests',
    difficulty: 'Gentle',
    pricing_type: 'per_setup',
    price_per_person: 0,
    price_per_setup: 1500,
    price_per_session: 1500,
    duration_minutes: 120,
    image_url: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?w=1200&auto=format&fit=crop&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1470246973918-29a93221c455?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1525253086316-d0c936c81488?w=1200&auto=format&fit=crop&q=80'
    ],
    badge: 'Guest Favorite',
    highlights: [
      'Personal charcoal & oak timber bonfire pit set up on the resort lawn',
      'Live sigri tandoor barbecue skewers (chargrilled tikka, corn cobs & marshmallows)',
      'Acoustic speaker hookup to play your favorite mountain playlists',
      'Plush outdoor lounge chairs, warm blankets & hot spiced beverages'
    ],
    itinerary: [
      { time: '07:30 PM', title: 'Bonfire Lighting & Gathering', desc: 'Resort team lights the scented pine wood bonfire as dusk blankets the valley.' },
      { time: '08:00 PM', title: 'Live Barbecue Service', desc: 'Chef serves sizzling skewers and roasted spiced nuts directly around the flames.' },
      { time: '09:00 PM', title: 'Stargazing & Marshmallow Roasting', desc: 'Roast sweet marshmallows over glowing embers while spotting constellations.' }
    ],
    inclusions: [
      'Full firewood logs, charcoal setup & safe fireplace attendant',
      'Marshmallow skewers with chocolate dip',
      'Fleece blankets and lawn seating setup',
      'Bluetooth speaker for private group music'
    ],
    whatToBring: [
      'Warm jackets or sweaters (mountain evenings drop to 15°C)',
      'Your favorite story or acoustic songs to share'
    ],
    sensoryNote: 'Earthy scent of burning pine logs, warmth of the dancing flames against your hands, and sizzling spices on hot coals.'
  },
  {
    id: 'exp-ps5-gaming',
    name: 'PlayStation 5 (PS5) 4K Ultra Gaming Lounge',
    tagline: 'High-octane console gaming on a 65" 4K HDR display with FIFA 24, Gran Turismo, Tekken & beanbag chill',
    category: 'gaming',
    categoryLabel: 'Indoor Entertainment',
    elevation: '1,450m (Indoor Lounge)',
    duration: '60 Mins',
    groupSize: '1 to 4 Players',
    difficulty: 'Easy',
    pricing_type: 'per_session',
    price_per_person: 0,
    price_per_setup: 0,
    price_per_session: 600,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1200&auto=format&fit=crop&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop&q=80'
    ],
    badge: 'Kids, Teens & Gamers',
    highlights: [
      'Latest Sony PlayStation 5 console with DualSense wireless haptic controllers',
      '65-inch 4K HDR television with surround sound audio',
      'Top titles: EA Sports FC (FIFA), Gran Turismo 7, Spider-Man 2, Mortal Kombat 1, It Takes Two',
      'Comfy oversized beanbags, ambient RGB lounge lighting, and Panache snack service'
    ],
    itinerary: [
      { time: '00 - 05 min', title: 'Game Selection & Setup', desc: 'Pick your title and pair up DualSense controllers for solo or multiplayer battle.' },
      { time: '05 - 55 min', title: 'Epic Gameplay Session', desc: 'Go head-to-head in football tournaments, high-speed racing, or story adventures.' },
      { time: '55 - 60 min', title: 'Wrap Up & Trophy Check', desc: 'Check leaderboard scores or extend for another session if slots permit.' }
    ],
    inclusions: [
      '1 Full hour of exclusive PS5 lounge access',
      'Up to 4 DualSense wireless controllers',
      'Complimentary popcorn bowl & chilled soda cans',
      'Staff assistance for game setup and co-op configuration'
    ],
    whatToBring: [
      'Competitive spirit with family or friends'
    ],
    sensoryNote: 'Rumbling haptic feedback in your hands, crisp 4K graphics, dramatic surround sound, and triumphant celebration cheers.'
  },
  {
    id: 'exp-resort-camping',
    name: 'Resort Lawn Starlit Camping',
    tagline: 'Sleep beneath thousands of Himalayan stars in luxury waterproof canvas dome tents pitched on the green lawn',
    category: 'camping',
    categoryLabel: 'Open Air Living',
    elevation: '1,450m (4,750 ft)',
    duration: 'Overnight',
    groupSize: '1 to 3 Guests per Tent',
    difficulty: 'Easy',
    pricing_type: 'per_setup',
    price_per_person: 0,
    price_per_setup: 3500,
    price_per_session: 3500,
    duration_minutes: 720,
    image_url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1200&auto=format&fit=crop&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80'
    ],
    badge: 'Under The Himalayan Sky',
    highlights: [
      'Waterproof high-grade canvas alpine tent pitched on the resort green meadow',
      'Plush foam mattress, warm duck-down quilts, fleece sleeping bags & lanterns',
      'Wake to dew drops on the grass, heavy morning fog, and birds singing at sunrise',
      'Complete safety within the resort premises with access to luxury washroom facilities'
    ],
    itinerary: [
      { time: '08:00 PM', title: 'Tent Check-in & Lantern Lit', desc: 'Settle into your cozy pitched tent with warm bedside lanterns and soft pillows.' },
      { time: '10:30 PM', title: 'Starlight Silence', desc: 'Unzip the mesh window to view the moonlit mountain ridge and constellations.' },
      { time: '06:30 AM', title: 'Morning Mist Wake-Up', desc: 'Hot ginger lemon tea or fresh coffee served right outside your tent door.' }
    ],
    inclusions: [
      'Complete high-end alpine dome tent setup for 2 persons',
      'Thermal sleeping pads, clean linen, down quilts & pillows',
      'LED ambient lantern & emergency power bank',
      'Morning hot beverage and resort breakfast'
    ],
    whatToBring: [
      'Night-time thermal clothing and cozy socks',
      'Personal toiletries (full resort washrooms available)'
    ],
    sensoryNote: 'Cool night air brushing your cheek, sound of crickets and nocturnal mountain birds, and the absolute peace of sleeping outdoors.'
  },
  {
    id: 'exp-pine-trek',
    name: 'Gethia Pine Forest Nature Walk & Trek',
    tagline: 'Guided morning walk through whispering deodar trails, birds singing & panoramic Bhimtal valley view',
    category: 'trek',
    categoryLabel: 'Forest Trails',
    elevation: '1,620m Peak Viewpoint',
    duration: '2 Hours',
    groupSize: '1 to 8 Guests',
    difficulty: 'Easy',
    pricing_type: 'per_person',
    price_per_person: 500,
    price_per_setup: 0,
    price_per_session: 500,
    duration_minutes: 120,
    image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80',
      'https://shivalayaresort.com/wp-content/uploads/2026/02/Shivalaya-Resort-Nature.jpg'
    ],
    badge: 'Refreshing Morning Air',
    highlights: [
      'Gentle pine and oak forest trail starting right beside the resort grounds',
      'Led by a friendly resort guide who shares local Kumaon flora & folklore',
      'Spot blue whistling thrushes, woodpeckers, and mountain barbets',
      'Rest at the cliff overlook with panoramic views of the hills and lake basin below'
    ],
    itinerary: [
      { time: '07:30 AM', title: 'Trailhead Briefing', desc: 'Meet with wooden walking stick and mineral water bottle at resort reception.' },
      { time: '08:15 AM', title: 'The Pine Needle Ridge', desc: 'Walk along the soft deodar needle carpet inhaling crisp, ozone-rich air.' },
      { time: '09:00 AM', title: 'Valley Vista Point', desc: 'Rest stop for sweeping photos of Mehragaon valley and distant Himalayan ridges.' },
      { time: '09:30 AM', title: 'Return & Herbal Tea', desc: 'Return to Panache Restaurant for warm herbal tea and a hearty breakfast.' }
    ],
    inclusions: [
      'Local resort guide and walking escort',
      'Wooden mountain walking sticks',
      'Fresh mineral water and energy bars',
      'Post-walk Kumaoni herbal tea at Panache'
    ],
    whatToBring: [
      'Comfortable sneakers or walking shoes',
      'Light windcheater or morning fleece',
      'Camera or phone for scenic valley photos'
    ],
    sensoryNote: 'Crisp pine-resin scent, crunch of dry deodar cones underfoot, and the sweet morning symphony of mountain birds.'
  },
  {
    id: 'exp-kasar-waterfall',
    name: 'Kasar Devi & Secret Waterfall Excursion',
    tagline: 'Chauffeured scenic trip to the sacred Kasar Devi ridge and a hidden mountain waterfall plunge pool',
    category: 'excursion',
    categoryLabel: 'Scenic Day Outing',
    elevation: '2,116m (6,940 ft)',
    duration: '4.5 Hours',
    groupSize: 'Up to 4 Guests per Car',
    difficulty: 'Moderate',
    pricing_type: 'per_setup',
    price_per_person: 0,
    price_per_setup: 3200,
    price_per_session: 3200,
    duration_minutes: 270,
    image_url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&auto=format&fit=crop&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80'
    ],
    badge: 'Popular Day Outing',
    highlights: [
      'Comfortable private resort cab with experienced mountain chauffeur',
      'Visit the world-renowned Kasar Devi geomagnetic ridge and ancient temple',
      'Descend a short pine trail to a hidden cold-water cascading mountain spring pool',
      'Picnic hamper with sandwiches, fresh fruit, and cookies from Panache'
    ],
    itinerary: [
      { time: '09:00 AM', title: 'Scenic Departure', desc: 'Depart Shivalaya through winding pine roads with sweeping valley vistas.' },
      { time: '10:15 AM', title: 'Kasar Devi Ridge & Meditation', desc: 'Visit the sacred magnetic spot where Swami Vivekananda and artists stayed.' },
      { time: '11:45 AM', title: 'Waterfall Spring Plunge', desc: 'Short walk down to the gushing natural spring; dip your feet in icy clear water.' },
      { time: '01:30 PM', title: 'Scenic Return', desc: 'Drive back to the resort in time for afternoon tea or lunch.' }
    ],
    inclusions: [
      'Private resort SUV with chauffeur for 4.5 hours',
      'Panache picnic snack hamper and mineral water',
      'All toll, fuel, and parking expenses included'
    ],
    whatToBring: [
      'Comfortable walking shoes and sunglasses',
      'Light towel if you plan to dip your feet in the mountain spring'
    ],
    sensoryNote: 'Cool spray of falling mountain spring water, sacred temple bells ringing in the wind, and breathtaking panoramic mountain views.'
  }
]
