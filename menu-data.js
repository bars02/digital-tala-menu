/**
 * menu-data.js — Tala Restaurant & Café
 * ─────────────────────────────────────
 * Single source of truth for the entire menu.
 *
 * HOW TO ADD A NEW CATEGORY:
 *   Push a new object to `categories` → section + nav tab appear automatically.
 *
 * HOW TO ADD A NEW DISH:
 *   Push a new object to `dishes` with the correct `category` id
 *   → it appears in the right section automatically.
 *
 * Ready for backend integration: replace these arrays with
 * a fetch() call that returns the same shape.
 */

/* ══════════════════════════════════════════════════════
   CATEGORIES
   Each entry generates: a navbar tab + a full menu section.
══════════════════════════════════════════════════════ */
const categories = [
  { id: 'grills',    title: 'Grills',         icon: '🔥' },
  { id: 'eastern',   title: 'Eastern Dishes',  icon: '🍲' },
  { id: 'western',   title: 'Western Dishes',  icon: '🍽️' },
  { id: 'beverages', title: 'Beverages',       icon: '🥤' },
  { id: 'juices',    title: 'Juices',          icon: '🍹' },
  { id: 'vegetables',    title: 'Vegetables',          icon: '🥬' },
  { id: 'desserts',    title: 'Desserts',          icon: '🍰' },
  { id: 'coffee',    title: 'Coffee',          icon: '🍵' },
];

/* ══════════════════════════════════════════════════════
   DISHES
   `category` must match a category id above.
   `image` can be a local path (images/dish.jpg) or a URL.
══════════════════════════════════════════════════════ */
const dishes = [

  /* ── Grills ──────────────────────────────────────── */
  {
    id: 'g1',
    name: 'لحم مشوي',
    category: 'grills',
    price: 18500,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    description: 'A generous selection of slow-charcoal-grilled meats — seasoned lamb kofta, tender chicken skewers, and marinated beef ribs, served with saffron rice and grilled vegetables.',
  },
  {
    id: 'g3',
    name: 'تكة دجاج',
    category: 'grills',
    price: 12500,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80',
    description: 'Boneless chicken marinated overnight in yoghurt, tandoori spices, and lemon. Grilled over open flame for a smoky char with a tender, juicy interior.',
  },
  {
    id: 'g4',
    name: 'دجاج مشوي',
    category: 'grills',
    price: 11000,
    image: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=600&q=80',
    description: 'Classic Lebanese-style cubed chicken, marinated in garlic, tomato paste, and lemon juice, skewered and grilled to golden perfection.',
  },

  /* ── Eastern Dishes ──────────────────────────────── */
  {
    id: 'e1',
    name: 'برياني',
    category: 'eastern',
    price: 14000,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80',
    description: 'A traditional Iraqi biryani prepared with long-grain basmati rice, slow-cooked lamb, caramelised onions, and aromatic baharat spice blend — garnished with raisins and toasted almonds.',
  },
  {
    id: 'e6',
    name: 'ستيك مدخن',
    category: 'eastern',
    price: 19500,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    description: 'Whole slow-roasted lamb cooked for hours until the meat falls from the bone, served on a mountain of aromatic rice with crispy toasted nuts and sweet raisins.',
  },

  /* ── Western Dishes ──────────────────────────────── */
  {
    id: 'w1',
    name: 'Wagyu Beef Burger',
    category: 'western',
    price: 16000,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    description: 'A premium wagyu beef patty seasoned with smoked salt, aged cheddar, caramelised onions, truffle aioli, and house pickles in a brioche bun — served with skin-on fries.',
  },
  {
    id: 'w2',
    name: 'Grilled Salmon',
    category: 'western',
    price: 21000,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80',
    description: 'Atlantic salmon fillet pan-seared to a crispy skin, resting on lemon-caper beurre blanc with blanched asparagus and garden herb risotto.',
  },
  {
    id: 'w3',
    name: 'Pasta Carbonara',
    category: 'western',
    price: 11500,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80',
    description: 'Silky fresh pasta tossed in a classic Roman carbonara of free-range egg yolks, guanciale, Pecorino Romano, and a generous crack of black pepper.',
  },
  {
    id: 'w4',
    name: 'Club Sandwich',
    category: 'western',
    price: 9000,
    image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&q=80',
    description: 'Triple-decker toasted sourdough with roasted turkey, crispy bacon, fresh lettuce, heirloom tomato, and herb mayo — served with a side of French fries.',
  },

  /* ── Beverages ────────────────────────────────────── */
  {
    id: 'b1',
    name: 'Virgin Mojito',
    category: 'beverages',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80',
    description: 'Refreshing blend of fresh lime juice, muddled mint leaves, cane sugar, and sparkling water served over crushed ice — light, crisp, and utterly refreshing.',
  },
  {
    id: 'b2',
    name: 'Lemon Mint Cooler',
    category: 'beverages',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
    description: 'Freshly squeezed lemons blended with garden mint, a touch of honey, and chilled sparkling water. The perfect companion for warm riverside evenings.',
  },

  /* ── Juices ───────────────────────────────────────── */
  {
    id: 'j1',
    name: 'Fresh Orange Juice',
    category: 'juices',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80',
    description: 'Six freshly squeezed Valencia oranges — nothing added, nothing taken away. Pure liquid sunshine, pressed to order.',
  },
  {
    id: 'j2',
    name: 'Watermelon Juice',
    category: 'juices',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80',
    description: 'Cold-pressed fresh watermelon with a hint of lime zest and a light sprinkle of sea salt — hydrating, sweet, and brilliantly pink.',
  },
  {
    id: 'j4',
    name: 'Green Detox',
    category: 'juices',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=600&q=80',
    description: 'Spinach, cucumber, apple, ginger, and lemon cold-pressed into a lively green juice — clean, crisp, and energising.',
  },

   /* ── desserts ───────────────────────────────────────── */
   

 /* ── vegetables ───────────────────────────────────────── */
 
 
  /* ── Coffee ───────────────────────────────────────── */
  {
    id: 'c2',
    name: 'Specialty Espresso',
    category: 'coffee',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&q=80',
    description: 'A double-shot of single-origin Ethiopian Yirgacheffe beans, precision-extracted at 93°C — bright citrus notes, floral aroma, silky crema.',
  },
  {
    id: 'c4',
    name: 'Cold Brew',
    category: 'coffee',
    price: 4000,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',
    description: '18-hour cold-steeped Colombian beans, low-acid, smooth, and intensely rich — served over hand-chiselled ice with a splash of fresh cream.',
  },
  {
    id: 'c5',
    name: 'Saffron Cappuccino',
    category: 'coffee',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80',
    description: 'A luxurious blend of espresso and micro-foam infused with a genuine Persian saffron essence, finished with a dusting of cinnamon and gold-edible flakes.',
  },

];
