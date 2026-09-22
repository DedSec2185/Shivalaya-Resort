export type Language = 'en' | 'hi'

export interface TranslationDict {
  brand_title: string
  brand_tagline: string
  kds_subtitle: string
  
  // Navigation Tabs
  tab_orders: string
  tab_completed: string
  tab_cancelled: string
  tab_stock: string
  tab_profile: string
  nav_operations: string
  nav_records: string
  nav_inventory: string
  nav_account: string

  // Kanban Columns & Filters
  filter_all: string
  filter_new: string
  filter_preparing: string
  filter_ready: string
  col_new_title: string
  col_prep_title: string
  col_ready_title: string
  no_new_orders: string
  no_prep_orders: string
  no_ready_orders: string

  // Subtitles & Stats
  live_board_title: string
  live_board_desc: string
  total_orders_today: string
  completed_history_title: string
  cancelled_history_title: string
  stock_ledger_title: string
  staff_profile_title: string

  // Order Card Badges & Types
  type_room_resident: string
  type_walkin_table: string
  type_walkin_takeaway: string
  in_house_label: string
  walk_in_label: string

  // Action Buttons
  btn_accept: string
  btn_start_prep: string
  btn_mark_ready: string
  btn_serve: string
  btn_print_kot: string
  btn_sign_out: string
  btn_inward_stock: string
  btn_log_usage: string

  // Timers & Alerts
  timer_just_now: string
  timer_min_ago: string
  timer_delayed: string
  alert_note: string
  sound_alert_on: string
  sound_alert_off: string

  // Common & Status
  status_new: string
  status_preparing: string
  status_ready: string
  status_served: string
  status_cancelled: string
  search_placeholder: string
  shift_active: string
  system_info: string
  property_name: string
  realtime_connected: string

  // Login
  login_title: string
  login_subtitle: string
  select_profile: string
  enter_pin: string
  invalid_pin: string
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    brand_title: 'Panache',
    brand_tagline: 'KITCHEN PANEL · SHIVALAYA RESORTS',
    kds_subtitle: 'KITCHEN PANEL · SHIVALAYA RESORTS, BHIMTAL',

    // Navigation Tabs
    tab_orders: 'Active KDS Board',
    tab_completed: 'Completed Orders',
    tab_cancelled: 'Cancelled Log',
    tab_stock: 'Stock Ledger',
    tab_profile: 'Staff Profile',
    nav_operations: 'KITCHEN OPERATIONS',
    nav_records: 'RECORDS & AUDIT',
    nav_inventory: 'INVENTORY MANAGEMENT',
    nav_account: 'STAFF ACCOUNT',

    // Kanban Columns & Filters
    filter_all: 'All Tickets',
    filter_new: 'New Orders',
    filter_preparing: 'In Preparation',
    filter_ready: 'Ready / Pick Up',
    col_new_title: 'New Orders',
    col_prep_title: 'In Preparation',
    col_ready_title: 'Ready / Pick Up',
    no_new_orders: 'No pending new orders',
    no_prep_orders: 'No orders currently cooking',
    no_ready_orders: 'No orders awaiting server pick up',

    // Subtitles & Stats
    live_board_title: 'Live Kitchen Preparation Kanban',
    live_board_desc: 'Real-time incoming KOT orders across room service & dining tables',
    total_orders_today: 'total orders today',
    completed_history_title: 'Completed Orders History',
    cancelled_history_title: 'Cancelled & Voided Orders Log',
    stock_ledger_title: 'Stock & Inventory Ledger',
    staff_profile_title: 'Staff Profile & Shift Desk',

    // Order Card Badges & Types
    type_room_resident: 'Room',
    type_walkin_table: 'Table',
    type_walkin_takeaway: 'Walk-In Takeaway',
    in_house_label: '(In-House)',
    walk_in_label: '(Walk-In)',

    // Action Buttons
    btn_accept: 'Accept Order',
    btn_start_prep: 'Start Prep',
    btn_mark_ready: 'Mark Ready',
    btn_serve: 'Serve Order',
    btn_print_kot: 'Print KOT',
    btn_sign_out: 'Sign Out',
    btn_inward_stock: '+ Inward Stock',
    btn_log_usage: 'Log Usage',

    // Timers & Alerts
    timer_just_now: 'Just now',
    timer_min_ago: 'm ago',
    timer_delayed: 'Delayed',
    alert_note: 'Note',
    sound_alert_on: 'Chime Sound Active',
    sound_alert_off: 'Chime Sound Muted',

    // Common & Status
    status_new: 'New',
    status_preparing: 'Preparing',
    status_ready: 'Ready',
    status_served: 'Served',
    status_cancelled: 'Cancelled',
    search_placeholder: 'Search by order #, guest name, or room...',
    shift_active: 'Active On Duty',
    system_info: 'System Information',
    property_name: 'Shivalaya Resorts, Bhimtal',
    realtime_connected: 'Supabase Postgres Connected',

    // Login
    login_title: 'Kitchen Access Pass',
    login_subtitle: 'Panache Restaurant · Shivalaya Resorts',
    select_profile: 'Select Staff Member',
    enter_pin: 'Enter 4-Digit Security PIN',
    invalid_pin: 'Invalid PIN. Try again.'
  },

  hi: {
    brand_title: 'पनाश',
    brand_tagline: 'किचन पैनल · शिवालय रिसॉर्ट्स',
    kds_subtitle: 'किचन पैनल · शिवालय रिसॉर्ट्स, भीमताल',

    // Navigation Tabs
    tab_orders: 'सक्रिय KDS बोर्ड',
    tab_completed: 'पूर्ण ऑर्डर्स',
    tab_cancelled: 'रद्द ऑर्डर्स',
    tab_stock: 'स्टॉक लेजर',
    tab_profile: 'स्टाफ प्रोफ़ाइल',
    nav_operations: 'किचन संचालन',
    nav_records: 'रिकॉर्ड एवं ऑडिट',
    nav_inventory: 'इन्वेंट्री प्रबंधन',
    nav_account: 'स्टाफ खाता',

    // Kanban Columns & Filters
    filter_all: 'सभी ऑर्डर्स',
    filter_new: 'नये ऑर्डर्स',
    filter_preparing: 'तैयारी में',
    filter_ready: 'तैयार / उठाएं',
    col_new_title: 'नये ऑर्डर्स',
    col_prep_title: 'तैयारी में',
    col_ready_title: 'तैयार / उठाएं',
    no_new_orders: 'कोई नया ऑर्डर लंबित नहीं है',
    no_prep_orders: 'वर्तमान में कोई ऑर्डर पक नहीं रहा है',
    no_ready_orders: 'उठाने के लिए कोई तैयार ऑर्डर नहीं है',

    // Subtitles & Stats
    live_board_title: 'लाइव किचन तैयारी कानबान बोर्ड',
    live_board_desc: 'कमरा सेवा एवं डाइनिंग टेबल से सीधे आने वाले लाइव KOT ऑर्डर्स',
    total_orders_today: 'आज के कुल ऑर्डर्स',
    completed_history_title: 'पूर्ण ऑर्डर्स का इतिहास',
    cancelled_history_title: 'रद्द एवं अमान्य ऑर्डर्स लॉग',
    stock_ledger_title: 'स्टॉक एवं इन्वेंट्री लेजर',
    staff_profile_title: 'स्टाफ प्रोफ़ाइल एवं शिफ्ट डेस्क',

    // Order Card Badges & Types
    type_room_resident: 'कमरा',
    type_walkin_table: 'टेबल',
    type_walkin_takeaway: 'टेकअवे काउंटर',
    in_house_label: '(इन-हाउस अतिथि)',
    walk_in_label: '(बाहरी ग्राहक)',

    // Action Buttons
    btn_accept: 'ऑर्डर स्वीकार करें',
    btn_start_prep: 'तैयारी शुरू करें',
    btn_mark_ready: 'तैयार चिह्नित करें',
    btn_serve: 'परोसें / समाप्त',
    btn_print_kot: 'KOT प्रिंट करें',
    btn_sign_out: 'लॉग आउट',
    btn_inward_stock: '+ स्टॉक आवक',
    btn_log_usage: 'खपत दर्ज करें',

    // Timers & Alerts
    timer_just_now: 'अभी-अभी',
    timer_min_ago: 'मिनट पहले',
    timer_delayed: 'विलंबित',
    alert_note: 'विशेष निर्देश',
    sound_alert_on: 'ध्वनि अलर्ट चालू',
    sound_alert_off: 'ध्वनि अलर्ट म्यूट',

    // Common & Status
    status_new: 'नया',
    status_preparing: 'तैयारी में',
    status_ready: 'तैयार',
    status_served: 'परोसा गया',
    status_cancelled: 'रद्द',
    search_placeholder: 'ऑर्डर नंबर, अतिथि या कमरा नंबर से खोजें...',
    shift_active: 'ड्यूटी पर सक्रिय',
    system_info: 'सिस्टम जानकारी',
    property_name: 'शिवालय रिसॉर्ट्स, भीमताल',
    realtime_connected: 'सुपाबेस रियल-टाइम कनेक्टेड',

    // Login
    login_title: 'किचन एक्सेस पास',
    login_subtitle: 'पनाश रेस्टोरेंट · शिवालय रिसॉर्ट्स',
    select_profile: 'स्टाफ सदस्य चुनें',
    enter_pin: '4-अंकों का सुरक्षा पिन दर्ज करें',
    invalid_pin: 'अमान्य पिन। पुनः प्रयास करें।'
  }
}
