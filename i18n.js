const translations = {
  ar: {
    // General
    "explore_menu": "طالع القائمة",
    "search_placeholder": "ابحث عن طبق...",
    "cart_title": "طلبك",
    "cart_empty": "سلتك فارغة",
    "cart_total": "المجموع",
    "place_order": "تأكيد الطلب",
    "story_title": "قصة الطبق",
    "add_to_cart": "أضف للسلة",
    "no_results": "لا توجد أطباق.",
    "order_received": "تم استلام طلبك! سنتواصل معك قريباً. 🎉",
    "added_to_cart": "تمت إضافته لطلبك",
    "currency": "د.ع",
    "location": "الأنبار، الفلوجة — قرب الجسر المعلق",
    "tagline": "حيث يحكي كل طبق قصة.",
    "copy": "© 2026 مطعم وكافيه تالة. جميع الحقوق محفوظة."
  },
  en: {
    // General
    "explore_menu": "Explore Menu",
    "search_placeholder": "Search dishes...",
    "cart_title": "Your Order",
    "cart_empty": "Your cart is empty",
    "cart_total": "Total",
    "place_order": "Place Order",
    "story_title": "The Story of the Dish",
    "add_to_cart": "Add to Cart",
    "no_results": "No dishes found.",
    "order_received": "Order received! We will contact you shortly. 🎉",
    "added_to_cart": "added to your order",
    "currency": "IQD",
    "location": "Anbar, Fallujah — Near the Suspension Bridge",
    "tagline": "Where every meal tells a story.",
    "copy": "© 2026 Tala Restaurant & Café. All rights reserved."
  },
  ku: {
    // General
    "explore_menu": "مینیو ببینە",
    "search_placeholder": "بگەڕێ بۆ خواردن...",
    "cart_title": "داواکاریەکەت",
    "cart_empty": "سەبەتەکەت بەتاڵە",
    "cart_total": "کۆی گشتی",
    "place_order": "دووپاتکردنەوەی داواکاری",
    "story_title": "چیرۆکی خواردنەکە",
    "add_to_cart": "زیادکردن بۆ سەبەتە",
    "no_results": "هیچ خواردنێک نەدۆزرایەوە.",
    "order_received": "داواکاریەکەت وەرگیرا! بە زوویی پەیوەندیمان پێوە دەکەین. 🎉",
    "added_to_cart": "زیادکرا بۆ داواکاریەکەت",
    "currency": "د.ع",
    "location": "ئەنبار، فەلوجە — نزیک پردی هەڵواسراو",
    "tagline": "لەوێدا کە هەر ژەمێک چیرۆکێک دەگێڕێتەوە.",
    "copy": "© 2026 چێشتخانە و کافێی تالا. هەموو مافەکان پارێزراون."
  }
};

let currentLang = localStorage.getItem('tala_lang') || 'ar'; // Default Arabic

function t(key) {
  return translations[currentLang][key] || key;
}

function setLanguage(lang) {
  if (['ar', 'en', 'ku'].includes(lang)) {
    currentLang = lang;
    localStorage.setItem('tala_lang', lang);
    
    // Dispatch event to re-render dynamic content
    window.dispatchEvent(new Event('languagechange'));
  }
}

// Ensure the HTML dir attribute matches the language immediately
document.documentElement.lang = currentLang;
document.documentElement.dir = currentLang === 'en' ? 'ltr' : 'rtl';
