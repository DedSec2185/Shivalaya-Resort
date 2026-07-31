// ============================================================
// DEMO DATA — mirrors the HTML prototype exactly
// Will be replaced with real Supabase data in Phase 4
// ============================================================

export const DEMO_OWNER = {
  id:         'OWN-001',
  name:       'Aditya Sharma',
  email:      'owner@shivalayaresort.com',
  phone:      '+91 94120 00001',
  resort:     'Shivalaya Resorts, Bhimtal',
  joinedDate: 'Jan 2024',
  pin:        '0000',
};

export const PERIOD_DATA = {
  today: {
    revenue: 18450, orders: 42, avg: 439, prep: 18,
    deltas: { revenue: { dir: 'up', val: '8%' }, orders: { dir: 'up', val: '12%' }, avg: { dir: 'down', val: '2%' }, prep: { dir: 'down', val: '3 min' } },
    trend: [
      { l: '8am',  v: 500  },
      { l: '10am', v: 1200 },
      { l: '12pm', v: 3400 },
      { l: '2pm',  v: 4200 },
      { l: '4pm',  v: 2100 },
      { l: '6pm',  v: 3800 },
      { l: '8pm',  v: 2650 },
      { l: '10pm', v: 600  },
    ],
    items: [
      { n: 'Panache Chicken (Chef Special)', c: 18 },
      { n: 'Butter Chicken',                c: 15 },
      { n: 'Paneer Tikka Masala',           c: 13 },
      { n: 'Chicken Biryani',               c: 11 },
      { n: 'Garlic Naan',                   c: 9  },
    ],
    service: { room: 18, dinein: 18, pickup: 6 },
    subLabel: 'Hourly · Today',
    orders_list: [
      { id: 'PAN-0001', name: 'Rajesh Kumar',  type: 'room',   typeLabel: 'Room 302', items: 5, amount: 1850, status: 'served',    time: '2:15 PM' },
      { id: 'PAN-0002', name: 'Sarah Miller',  type: 'dinein', typeLabel: 'Table 5',  items: 3, amount: 1240, status: 'served',    time: '2:12 PM' },
      { id: 'PAN-0003', name: 'Priya Singh',   type: 'dinein', typeLabel: 'Table 8',  items: 4, amount: 1650, status: 'served',    time: '2:10 PM' },
      { id: 'PAN-0004', name: 'John Doe',      type: 'pickup', typeLabel: 'Counter',  items: 2, amount:  850, status: 'ready',     time: '2:08 PM' },
      { id: 'PAN-0005', name: 'Anjali Patel',  type: 'room',   typeLabel: 'Room 405', items: 6, amount: 2100, status: 'preparing', time: '2:05 PM' },
      { id: 'PAN-0006', name: 'Mike Wilson',   type: 'pickup', typeLabel: 'Counter',  items: 3, amount:  780, status: 'new',       time: '2:02 PM' },
    ],
  },
  week: {
    revenue: 121550, orders: 274, avg: 443, prep: 17,
    deltas: { revenue: { dir: 'up', val: '6%' }, orders: { dir: 'up', val: '9%' }, avg: { dir: 'up', val: '1%' }, prep: { dir: 'down', val: '1 min' } },
    trend: [
      { l: 'Mon', v: 16500 }, { l: 'Tue', v: 14200 }, { l: 'Wed', v: 18900 },
      { l: 'Thu', v: 16800 }, { l: 'Fri', v: 17500 }, { l: 'Sat', v: 19200 }, { l: 'Sun', v: 18450 },
    ],
    items: [
      { n: 'Butter Chicken',                c: 96 },
      { n: 'Panache Chicken (Chef Special)', c: 88 },
      { n: 'Chicken Biryani',               c: 74 },
      { n: 'Paneer Tikka Masala',           c: 69 },
      { n: 'Kadhai Chicken',                c: 55 },
    ],
    service: { room: 112, dinein: 120, pickup: 42 },
    subLabel: 'Daily · This Week',
    orders_list: [
      { id: 'PAN-0298', name: 'Kabir Anand',   type: 'dinein', typeLabel: 'Table 3',  items: 4, amount: 1620, status: 'served', time: 'Sun 9:40 PM' },
      { id: 'PAN-0287', name: 'Emma Watson',   type: 'room',   typeLabel: 'Room 503', items: 3, amount: 1140, status: 'served', time: 'Sun 8:05 PM' },
      { id: 'PAN-0271', name: 'David Brown',   type: 'dinein', typeLabel: 'Table 11', items: 5, amount: 1980, status: 'served', time: 'Sat 9:12 PM' },
      { id: 'PAN-0260', name: 'Lisa Chen',     type: 'room',   typeLabel: 'Room 201', items: 2, amount:  640, status: 'served', time: 'Sat 7:44 PM' },
      { id: 'PAN-0244', name: 'Alex Kumar',    type: 'dinein', typeLabel: 'Table 6',  items: 3, amount: 1120, status: 'served', time: 'Fri 8:30 PM' },
      { id: 'PAN-0231', name: 'Meera Joshi',   type: 'pickup', typeLabel: 'Counter',  items: 2, amount:  560, status: 'served', time: 'Thu 6:15 PM' },
    ],
  },
  month: {
    revenue: 498950, orders: 1150, avg: 434, prep: 16,
    deltas: { revenue: { dir: 'up', val: '14%' }, orders: { dir: 'up', val: '18%' }, avg: { dir: 'down', val: '1%' }, prep: { dir: 'down', val: '2 min' } },
    trend: [
      { l: 'Wk 1', v: 121550 }, { l: 'Wk 2', v: 118200 },
      { l: 'Wk 3', v: 132400 }, { l: 'Wk 4', v: 126800 },
    ],
    items: [
      { n: 'Butter Chicken',                c: 382 },
      { n: 'Panache Chicken (Chef Special)', c: 349 },
      { n: 'Chicken Biryani',               c: 298 },
      { n: 'Paneer Tikka Masala',           c: 271 },
      { n: 'Dal Makhani',                   c: 230 },
    ],
    service: { room: 471, dinein: 503, pickup: 176 },
    subLabel: 'Weekly · This Month',
    orders_list: [
      { id: 'PAN-1148', name: 'Rohan Verma',   type: 'dinein', typeLabel: 'Table 9',  items: 6, amount: 2340, status: 'served', time: 'Jul 27, 9:05 PM' },
      { id: 'PAN-1122', name: 'Sara Ali',       type: 'room',   typeLabel: 'Room 108', items: 4, amount: 1580, status: 'served', time: 'Jul 25, 8:12 PM' },
      { id: 'PAN-1098', name: 'Vikram Rathi',   type: 'pickup', typeLabel: 'Counter',  items: 2, amount:  620, status: 'served', time: 'Jul 23, 1:40 PM' },
      { id: 'PAN-1061', name: 'Neha Kapoor',    type: 'dinein', typeLabel: 'Table 4',  items: 5, amount: 1990, status: 'served', time: 'Jul 20, 8:50 PM' },
      { id: 'PAN-1030', name: 'Tom Richards',   type: 'room',   typeLabel: 'Room 310', items: 3, amount: 1150, status: 'served', time: 'Jul 17, 7:20 PM' },
      { id: 'PAN-0989', name: 'Ira Bhatt',      type: 'dinein', typeLabel: 'Table 2',  items: 4, amount: 1480, status: 'served', time: 'Jul 13, 9:30 PM' },
    ],
  },
};

export const DEMO_STAFF = [
  { id: 'REC-101', name: 'Priya Sharma',   role: 'receptionist', phone: '+91 98765 43210', email: 'priya@shivalayaresort.com',   joinedDate: '15 Jan 2025', status: 'active', dutyStatus: 'On Duty'  },
  { id: 'REC-102', name: 'Rajan Mehta',    role: 'receptionist', phone: '+91 91234 56789', email: 'rajan@shivalayaresort.com',   joinedDate: '03 Mar 2025', status: 'active', dutyStatus: 'On Duty'  },
  { id: 'KIT-201', name: 'Chef Aakash',    role: 'kitchen',      phone: '+91 99887 76655', email: 'aakash@shivalayaresort.com',  joinedDate: '10 Feb 2024', status: 'active', dutyStatus: 'On Duty'  },
  { id: 'KIT-202', name: 'Sunita Devi',    role: 'kitchen',      phone: '+91 97654 32101', email: 'sunita@shivalayaresort.com',  joinedDate: '22 Apr 2024', status: 'active', dutyStatus: 'Off Duty' },
  { id: 'MGR-301', name: 'Vikram Nair',    role: 'manager',      phone: '+91 93210 98765', email: 'vikram@shivalayaresort.com',  joinedDate: '01 Jan 2024', status: 'active', dutyStatus: 'On Duty'  },
  { id: 'REC-103', name: 'Asha Kumari',    role: 'receptionist', phone: '+91 98001 23456', email: 'asha@shivalayaresort.com',    joinedDate: '30 Jun 2025', status: 'inactive', dutyStatus: 'Off Duty' },
];

export const MENU_CATEGORIES = ['All', 'Starters', 'Main Course', 'Breads', 'Rice & Biryani', 'Beverages', 'Desserts'];

export const DEMO_MENU = [
  { id: 'M001', name: 'Panache Chicken (Chef Special)', category: 'Main Course',   price: 450, emoji: '🍗', available: true  },
  { id: 'M002', name: 'Butter Chicken',                 category: 'Main Course',   price: 380, emoji: '🍛', available: true  },
  { id: 'M003', name: 'Paneer Tikka Masala',            category: 'Main Course',   price: 320, emoji: '🧀', available: true  },
  { id: 'M004', name: 'Chicken Biryani',                category: 'Rice & Biryani',price: 420, emoji: '🍚', available: true  },
  { id: 'M005', name: 'Garlic Naan',                   category: 'Breads',        price:  60, emoji: '🫓', available: true  },
  { id: 'M006', name: 'Kadhai Chicken',                 category: 'Main Course',   price: 380, emoji: '🍲', available: true  },
  { id: 'M007', name: 'Dal Makhani',                   category: 'Main Course',   price: 250, emoji: '🫕', available: true  },
  { id: 'M008', name: 'Paneer Tikka',                   category: 'Starters',      price: 280, emoji: '🧀', available: true  },
  { id: 'M009', name: 'Chicken Tikka',                  category: 'Starters',      price: 320, emoji: '🍗', available: true  },
  { id: 'M010', name: 'Gulab Jamun',                    category: 'Desserts',      price: 120, emoji: '🟤', available: false },
  { id: 'M011', name: 'Masala Chai',                    category: 'Beverages',     price:  60, emoji: '☕', available: true  },
  { id: 'M012', name: 'Fresh Lime Soda',                category: 'Beverages',     price:  80, emoji: '🍋', available: true  },
  { id: 'M013', name: 'Laccha Paratha',                 category: 'Breads',        price:  70, emoji: '🫓', available: true  },
  { id: 'M014', name: 'Veg Biryani',                    category: 'Rice & Biryani',price: 320, emoji: '🍚', available: true  },
  { id: 'M015', name: 'Shahi Tukda',                    category: 'Desserts',      price: 150, emoji: '🍮', available: false },
];

export const DEMO_FOLIOS = {
  '302': {
    room: '302',
    guestName: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    checkIn: '20 Jul 2026',
    checkOut: '29 Jul 2026',
    status: 'Checked In',
    orders: [
      {
        id: 'PAN-0001',
        date: '28 Jul 2026, 2:15 PM',
        serviceType: 'room_service',
        serviceLabel: 'Room Service',
        status: 'served',
        items: [
          { name: 'Panache Chicken (Chef Special)', qty: 2, price: 450 },
          { name: 'Butter Chicken', qty: 1, price: 380 },
          { name: 'Garlic Naan', qty: 4, price: 60 },
          { name: 'Masala Chai', qty: 2, price: 60 }
        ],
        amount: 1850
      },
      {
        id: 'PAN-0142',
        date: '26 Jul 2026, 8:40 PM',
        serviceType: 'dine_in',
        serviceLabel: 'Dine-In (Table 4)',
        status: 'served',
        items: [
          { name: 'Paneer Tikka Masala', qty: 2, price: 320 },
          { name: 'Dal Makhani', qty: 1, price: 250 },
          { name: 'Laccha Paratha', qty: 4, price: 70 },
          { name: 'Fresh Lime Soda', qty: 3, price: 80 }
        ],
        amount: 1410
      },
      {
        id: 'PAN-0089',
        date: '24 Jul 2026, 1:15 PM',
        serviceType: 'pickup',
        serviceLabel: 'Counter Pickup',
        status: 'served',
        items: [
          { name: 'Chicken Biryani', qty: 3, price: 420 },
          { name: 'Fresh Lime Soda', qty: 3, price: 80 }
        ],
        amount: 1500
      },
      {
        id: 'PAN-0023',
        date: '21 Jul 2026, 9:10 PM',
        serviceType: 'room_service',
        serviceLabel: 'Room Service',
        status: 'served',
        items: [
          { name: 'Kadhai Chicken', qty: 1, price: 380 },
          { name: 'Garlic Naan', qty: 3, price: 60 },
          { name: 'Gulab Jamun', qty: 2, price: 120 }
        ],
        amount: 800
      }
    ]
  },
  '108': {
    room: '108',
    guestName: 'Sara Ali',
    phone: '+91 91234 56789',
    checkIn: '24 Jul 2026',
    checkOut: '29 Jul 2026',
    status: 'Checked In',
    orders: [
      {
        id: 'PAN-1122',
        date: '25 Jul 2026, 8:12 PM',
        serviceType: 'room_service',
        serviceLabel: 'Room Service',
        status: 'served',
        items: [
          { name: 'Butter Chicken', qty: 2, price: 380 },
          { name: 'Garlic Naan', qty: 5, price: 60 },
          { name: 'Fresh Lime Soda', qty: 2, price: 80 }
        ],
        amount: 1220
      },
      {
        id: 'PAN-1180',
        date: '27 Jul 2026, 1:30 PM',
        serviceType: 'dine_in',
        serviceLabel: 'Dine-In (Table 2)',
        status: 'served',
        items: [
          { name: 'Paneer Tikka', qty: 2, price: 280 },
          { name: 'Veg Biryani', qty: 2, price: 320 },
          { name: 'Masala Chai', qty: 2, price: 60 }
        ],
        amount: 1320
      }
    ]
  },
  '405': {
    room: '405',
    guestName: 'Anjali Patel',
    phone: '+91 99887 76655',
    checkIn: '26 Jul 2026',
    checkOut: '30 Jul 2026',
    status: 'Checked In',
    orders: [
      {
        id: 'PAN-0005',
        date: '28 Jul 2026, 2:05 PM',
        serviceType: 'room_service',
        serviceLabel: 'Room Service',
        status: 'preparing',
        items: [
          { name: 'Panache Chicken (Chef Special)', qty: 3, price: 450 },
          { name: 'Chicken Biryani', qty: 1, price: 420 },
          { name: 'Garlic Naan', qty: 5, price: 60 },
          { name: 'Shahi Tukda', qty: 2, price: 150 }
        ],
        amount: 2370
      }
    ]
  },
  '201': {
    room: '201',
    guestName: 'Lisa Chen',
    phone: '+91 97654 32101',
    checkIn: '22 Jul 2026',
    checkOut: '28 Jul 2026',
    status: 'Checked Out',
    orders: [
      {
        id: 'PAN-0260',
        date: '27 Jul 2026, 7:44 PM',
        serviceType: 'room_service',
        serviceLabel: 'Room Service',
        status: 'served',
        items: [
          { name: 'Dal Makhani', qty: 1, price: 250 },
          { name: 'Garlic Naan', qty: 2, price: 60 },
          { name: 'Masala Chai', qty: 2, price: 60 }
        ],
        amount: 490
      },
      {
        id: 'PAN-0190',
        date: '25 Jul 2026, 8:20 PM',
        serviceType: 'dine_in',
        serviceLabel: 'Dine-In (Table 9)',
        status: 'served',
        items: [
          { name: 'Butter Chicken', qty: 1, price: 380 },
          { name: 'Chicken Tikka', qty: 1, price: 320 },
          { name: 'Laccha Paratha', qty: 3, price: 70 }
        ],
        amount: 910
      }
    ]
  }
};

