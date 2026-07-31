import { createContext, useContext, useState, useEffect } from 'react';

export const TRANSLATIONS = {
  en: {
    // Topbar & Nav
    brandSub: 'Front Desk',
    activeOrders: 'Active Orders',
    completed: 'Completed',
    cancelled: 'Cancelled',
    staffProfile: 'Staff Profile',
    allActive: 'All Active',
    newOrders: 'New Orders',
    confirmed: 'Confirmed',
    inKitchen: 'In Kitchen',
    ready: 'Ready',
    served: 'Served',

    // Table Headers
    orderId: 'ORDER ID',
    guest: 'GUEST',
    service: 'SERVICE',
    status: 'STATUS',
    time: 'TIME',

    // Status Badges & Actions
    confirmOrder: '✓ Confirm Order',
    sendToKitchen: '→ Send to Kitchen',
    markReady: '✓ Mark Ready',
    markServed: '🍽 Mark Served',
    kitchenTicket: 'Kitchen Ticket',
    guestBill: 'Guest Bill',
    cancelOrder: 'Cancel Order',

    // Service & Room
    roomService: 'Room Service',
    dineIn: 'Dine In',
    takeaway: 'Takeaway',
    room: 'Room',
    billing: 'Billing',
    table: 'Table',

    // Details & Cards
    orderItems: 'Order Items',
    totalAmount: 'Total Amount',
    specialNote: 'Special Instructions',
    noNote: 'No special instructions',
    itemsCount: 'items',
    itemCountSingular: 'item',
    noActiveOrders: 'No active orders right now 🎉',
    noCompletedOrders: 'No completed orders yet today',
    noCancelledOrders: 'No cancelled orders',

    // Profile Page
    personalDetails: 'Personal Details',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    emailAddress: 'Email Address',
    savePersonalDetails: 'Save Personal Details',
    securityPinChange: 'Security & PIN Change',
    currentPin: 'Current 4-Digit PIN',
    newPin: 'New 4-Digit PIN',
    confirmNewPin: 'Confirm New PIN',
    updateSecurityPin: 'Update Security PIN',
    dutyStatus: 'Duty Status',
    onDuty: 'On Duty',
    onBreak: 'On Break',
    offDuty: 'Off Duty',

    // Notifications & Stats
    notifications: 'Notifications',
    newOrderArrived: 'New Order Arrived!',
    noNewNotifications: 'No new notifications',
    statNew: 'New',
    statActive: 'Active',
    statToday: 'Today',
    logOut: 'Log out',
    timeAgo: 'ago',
    justNow: 'Just now',
    minsAgo: 'm ago',
  },

  hi: {
    // Topbar & Nav
    brandSub: 'रिसेप्शन डेस्क',
    activeOrders: 'सक्रिय आर्डर',
    completed: 'पूर्ण आर्डर',
    cancelled: 'रद्द आर्डर',
    staffProfile: 'स्टाफ प्रोफाइल',
    allActive: 'सभी आर्डर',
    newOrders: 'नये आर्डर',
    confirmed: 'स्वीकृत',
    inKitchen: 'किचन में',
    ready: 'तैयार',
    served: 'परोसा गया',

    // Table Headers
    orderId: 'ऑर्डर आईडी',
    guest: 'अतिथि',
    service: 'सेवा प्रकार',
    status: 'स्थिति',
    time: 'समय',

    // Status Badges & Actions
    confirmOrder: '✓ आर्डर स्वीकार करें',
    sendToKitchen: '→ किचन भेजें',
    markReady: '✓ भोजन तैयार है',
    markServed: '🍽 परोसा गया दर्ज करें',
    kitchenTicket: 'किचन टिकट',
    guestBill: 'अतिथि बिल',
    cancelOrder: 'आर्डर रद्द करें',

    // Service & Room
    roomService: 'कमरा सेवा',
    dineIn: 'डाइन-इन',
    takeaway: 'टेकअवे',
    room: 'कमरा सं.',
    billing: 'बिलिंग',
    table: 'टेबल सं.',

    // Details & Cards
    orderItems: 'आर्डर किए गए व्यंजन',
    totalAmount: 'कुल राशि',
    specialNote: 'विशेष निर्देश',
    noNote: 'कोई विशेष निर्देश नहीं',
    itemsCount: 'व्यंजन',
    itemCountSingular: 'व्यंजन',
    noActiveOrders: 'फिलहाल कोई नया आर्डर नहीं है 🎉',
    noCompletedOrders: 'आज अभी तक कोई पूर्ण आर्डर नहीं है',
    noCancelledOrders: 'कोई रद्द आर्डर नहीं है',

    // Profile Page
    personalDetails: 'व्यक्तिगत विवरण',
    fullName: 'पूरा नाम',
    phoneNumber: 'फोन नंबर',
    emailAddress: 'ईमेल पता',
    savePersonalDetails: 'विवरण सुरक्षित करें',
    securityPinChange: 'सुरक्षा एवं पिन बदलें',
    currentPin: 'वर्तमान 4-अंकों का पिन',
    newPin: 'नया 4-अंकों का पिन',
    confirmNewPin: 'नए पिन की पुष्टि करें',
    updateSecurityPin: 'सुरक्षा पिन अपडेट करें',
    dutyStatus: 'ड्यूटी स्थिति',
    onDuty: 'ड्यूटी पर',
    onBreak: 'ब्रेक पर',
    offDuty: 'ड्यूटी समाप्त',

    // Notifications & Stats
    notifications: 'सूचनाएं',
    newOrderArrived: 'नया आर्डर आया!',
    noNewNotifications: 'कोई नई सूचना नहीं',
    statNew: 'नया',
    statActive: 'सक्रिय',
    statToday: 'आज',
    logOut: 'लॉग आउट',
    timeAgo: 'पहले',
    justNow: 'अभी-अभी',
    minsAgo: ' मि. पहले',
  }
};

export const FOOD_TRANSLATIONS = {
  'Dal Makhani': 'दाल मखनी',
  'Butter Naan': 'बटर नान',
  'Paneer Tikka Masala': 'पनीर टिक्का मसाला',
  'Chicken Biryani': 'चिकन बिरयानी',
  'Gulab Jamun': 'गुलाब जामुन',
  'Mineral Water': 'मिनरल वाटर',
  'Raita': 'रायता',
  'Mix Veg': 'मिक्स वेज',
  'Steamed Rice': 'स्टीम्ड राइस',
  'Jeera Rice': 'जीरा राइस',
  'Kadahi Paneer': 'कड़ाही पनीर',
  'Shahi Paneer': 'शाही पनीर',
  'Butter Chicken': 'बटर चिकन',
  'Chicken Curry': 'चिकन करी',
  'Tandoori Roti': 'तंदूरी रोटी',
  'Garlic Naan': 'गार्लिक नान',
  'French Fries': 'फ्रेंच फ्राइज',
  'Chilli Paneer': 'चिल्ली पनीर',
  'Veg Momos': 'वेज मोमोज',
  'Chicken Momos': 'चिकन मोमोज',
  'Tea': 'चाय',
  'Coffee': 'कॉफी',
  'Cold Coffee': 'कोल्ड कॉफी',
  'Panache Chicken (Chef Special)': 'पानाश चिकन (शेफ स्पेशल)',
  'Mutton Biryani': 'मटन बिरयानी',
  'Paneer Butter Masala': 'पनीर बटर मसाला',
  'Veg Fried Rice': 'वेज फ्राइड राइस',
  'Manchurian': 'मंचूरियन',
  'Fish Curry': 'फिश करी',
  'Papad': 'पापड़',
  'Club Sandwich': 'क्लब सैंडविच',
  'Cold Brew Coffee': 'कोल्ड ब्रू कॉफी',
  'Chilli Chicken': 'चिल्ली चिकन',
  'Spring Roll': 'स्प्रिंग रोल',
  'Veg Spring Roll': 'वेज स्प्रिंग रोल',
  'Manchow Soup': 'मान्चो सूप',
  'Tomato Soup': 'टमाटर सूप',
  'Green Salad': 'ग्रीन सलाद',
};

export const NAME_TRANSLATIONS = {
  'Mrs. Sunita Patel': 'श्रीमती सुनिता पटेल',
  'Mr. Vikram Singh': 'श्री विक्रम सिंह',
  'Ms. Ananya Roy': 'सुश्री अनन्या रॉय',
  'Mr. Rajesh Kumar': 'श्री राजेश कुमार',
  'Mr. Amit Sharma': 'श्री अमित शर्मा',
  'Sunita Patel': 'सुनिता पटेल',
  'Vikram Singh': 'विक्रम सिंह',
  'Ananya Roy': 'अनन्या रॉय',
  'Rajesh Kumar': 'राजेश कुमार',
  'Amit Sharma': 'अमित शर्मा',
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('panache_frontdesk_lang') || 'en';
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('panache_frontdesk_lang', newLang);
  };

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  };

  const translateFood = (foodName) => {
    if (lang === 'hi' && FOOD_TRANSLATIONS[foodName]) {
      return FOOD_TRANSLATIONS[foodName];
    }
    return foodName;
  };

  const translateName = (name) => {
    if (lang === 'hi' && NAME_TRANSLATIONS[name]) {
      return NAME_TRANSLATIONS[name];
    }
    return name;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translateFood, translateName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
