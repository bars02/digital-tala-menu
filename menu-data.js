/**
 * menu-data.js — Tala Restaurant & Café
 * ─────────────────────────────────────
 * Single source of truth for the entire menu.
 * Now supporting Trilingual translations (AR, EN, KU).
 */

/* ══════════════════════════════════════════════════════
   CATEGORIES
   Each entry generates: a navbar tab + a full menu section.
══════════════════════════════════════════════════════ */
const categories = [
  { id: 'soups', title: 'شوربات', title_en: 'Soups', title_ku: 'شۆربا', icon: '🔥' },
  { id: 'salads', title: 'السلطات', title_en: 'Salads', title_ku: 'زەڵاتەکان', icon: '🍲' },
  { id: 'cold_appetizers', title: 'المقبلات الباردة', title_en: 'Cold Appetizers', title_ku: 'پێشخواردنی سارد', icon: '🍽️' },
  { id: 'hot_appetizers', title: 'مقبلات ساخنة', title_en: 'Hot Appetizers', title_ku: 'پێشخواردنی گەرم', icon: '🥤' },
  { id: 'breakfast', title: 'فطور صباحي', title_en: 'Breakfast', title_ku: 'نانی بەیانیان', icon: '🍹' },
  { id: 'eastern', title: 'اكلات شرقية', title_en: 'Eastern Dishes', title_ku: 'خواردنی ڕۆژهەڵاتی', icon: '🥬' },
  { id: 'sandwiches', title: 'ساندوش', title_en: 'Sandwiches', title_ku: 'ساندویچ', icon: '🍰' },
  { id: 'pasta', title: 'الباستا', title_en: 'Pasta', title_ku: 'پاستا', icon: '🍵' },
  { id: 'western', title: 'اطباق غربية', title_en: 'Western Dishes', title_ku: 'خواردنی ڕۆژئاوایی', icon: '🍵' },
  { id: 'grills', title: 'مشاوي', title_en: 'Grills', title_ku: 'مشاوی (گۆشتی برژاو)', icon: '🍵' },
  { id: 'coffee', title: 'البارستا', title_en: 'Barista', title_ku: 'باریستا', icon: '🍵' },
  { id: 'desserts',  title: 'حلويات', title_en: 'Desserts', title_ku: 'شیرینییەکان', icon: '🍵' },
  { id: 'beverages', title: 'مشروبات', title_en: 'Beverages', title_ku: 'خواردنەوەکان', icon: '🍹' },
  { id: 'juices', title: 'عصائر طازجة', title_en: 'Fresh Juices', title_ku: 'شەربەتی فرێش', icon: '🥤' }
];

/* ══════════════════════════════════════════════════════
   DISHES
   `category` must match a category id above.
══════════════════════════════════════════════════════ */
const dishes = [

  /* ── Grills ──────────────────────────────────────── */
  {
    id: 'g1',
    category: 'grills',
    price: 18500,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    name: 'لحم مشوي',
    name_en: 'Grilled Meat',
    name_ku: 'گۆشتی برژاو',
    description: 'تشكيلة سخية من اللحوم المشوية على الفحم ببطء - كفتة لحم ضأن متبلة، وأسياخ دجاج طرية، وأضلاع لحم بقري متبلة، تقدم مع أرز الزعفران والخضروات المشوية.',
    description_en: 'A generous selection of slow-charcoal-grilled meats — seasoned lamb kofta, tender chicken skewers, and marinated beef ribs, served with saffron rice and grilled vegetables.',
    description_ku: 'هەڵبژاردنێکی دەوڵەمەند لە گۆشتی برژاو لەسەر خەڵووز بە هێواشی کۆفتەی مەڕی بەهاراتدار، شیشی مریشکی نەرم، و پەراسووی گوێرەکەی خۆشکراو، پێشکەش دەکرێت لەگەڵ برنجی زەعفەران و سەوزەی برژاو.',
  },
  {
    id: 'g3',
    category: 'grills',
    price: 12500,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80',
    name: 'تكة دجاج',
    name_en: 'Chicken Tikka',
    name_ku: 'تیکەی مریشک',
    description: 'دجاج بدون عظم منقوع طوال الليل في الزبادي والليمون مع بهارات التندوري. مشوي على نار مكشوفة ليكتسب طعماً مدخناً.',
    description_en: 'Boneless chicken marinated overnight in yoghurt, tandoori spices, and lemon. Grilled over open flame for a smoky char with a tender, juicy interior.',
    description_ku: 'مریشکی بێ ئێسک شەوێک لە ماست و، بەهاراتی تەندووری و لیمۆدا خۆشدەکرێت. لەسەر ئاگرێکی کراوە دەبرژێنرێت بۆ ئەوەی تامێکی دووکەڵاوی و ناوەوەیەکی ناسکی هەبێت.',
  },
  {
    id: 'g4',
    category: 'grills',
    price: 11000,
    image: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=600&q=80',
    name: 'دجاج مشوي',
    name_en: 'Grilled Chicken',
    name_ku: 'مریشکی برژاو',
    description: 'دجاج كلاسيكي مقطع، متبل بمعجون الثوم والطماطم وعصير الليمون، مشوي لدرجة الكمال الذهبي.',
    description_en: 'Classic Lebanese-style cubed chicken, marinated in garlic, tomato paste, and lemon juice, skewered and grilled to golden perfection.',
    description_ku: 'مریشکی پارچەکراوی کلاسیكی، متبەلكراو لەگەڵ دۆشاوی تەماتە و سیر و ئاوی لیمۆ، و بە شێوەیەکی زێڕین برژاوە.',
  },

  /* ── Eastern Dishes ──────────────────────────────── */
  {
    id: 'e1',
    category: 'eastern',
    price: 14000,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80',
    name: 'برياني',
    name_en: 'Biryani',
    name_ku: 'بریانی',
    description: 'برياني عراقي تقليدي محضر من أرز بسمتي طويل الحبة، لحم ضأن مطبوخ ببطء، بصل مكرمل، ومزيج بهارات عطرية - مزين بالزبيب واللوز المحمص.',
    description_en: 'A traditional Iraqi biryani prepared with long-grain basmati rice, slow-cooked lamb, caramelised onions, and aromatic baharat spice blend — garnished with raisins and toasted almonds.',
    description_ku: 'بریانییەکی نەریتی عێراقی کە لە برنجی بەسمەتی دەنک درێژ، گۆشتی مەڕ کە بە هێواشی لێندراوە، پیازی کەرەمەلکراو و تێکەڵەی بەهاراتی بۆنخۆش ئامادەکراوە.',
  },
  {
    id: 'e6',
    category: 'eastern',
    price: 19500,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    name: 'ستيك مدخن',
    name_en: 'Smoked Lamb',
    name_ku: 'گۆشتی مەڕی دووکەڵاوی',
    description: 'لحم ضأن محمر ببطء مطبوخ لساعات حتى يتساقط اللحم من العظم، يقدم على جبل من الأرز العطري مع المكسرات المقرمشة المحمصة والزبيب الحلو.',
    description_en: 'Whole slow-roasted lamb cooked for hours until the meat falls from the bone, served on a mountain of aromatic rice with crispy toasted nuts and sweet raisins.',
    description_ku: 'گۆشتی مەڕی بە هێواشی برژاو بۆ چەندین کاتژمێر دەکرێت، لەسەر چیایەک لە برنجی بۆنخۆش بە چەرەزات و کشمیشی شیرین پێشکەش دەکرێت.',
  },

  /* ── Western Dishes ──────────────────────────────── */
  {
    id: 'w1',
    category: 'western',
    price: 16000,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    name: 'برجر لحم واغيو',
    name_en: 'Wagyu Beef Burger',
    name_ku: 'بەرگری گۆشتی واگیو',
    description: 'شريحة لحم بقر واغيو الممتازة المتبلة بالملح المدخن، جبن الشيدر المعتق، بصل مكرمل، مايونيز الكمأة، والمخلل في خبز البريوش، تقدم مع البطاطا المقلية.',
    description_en: 'A premium wagyu beef patty seasoned with smoked salt, aged cheddar, caramelised onions, truffle aioli, and house pickles in a brioche bun — served with skin-on fries.',
    description_ku: 'گۆشتی واگیوی نایاب کە بە خوێی دووکەڵاوی، پەنیر، پیازی کەرەمەل،مایۆنیزی تروفل، لە نانی بریۆشدا بەهارات کراوە.',
  },
  {
    id: 'w2',
    category: 'western',
    price: 21000,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80',
    name: 'سلمون مشوي',
    name_en: 'Grilled Salmon',
    name_ku: 'سەلەمۆنی برژاو',
    description: 'فيليه السلمون الأطلسي المحمر في المقلاة بجلد مقرمش، يستقر على زبدة الليمون مع الهليون المسلوق وريزوتو أعشاب الحديقة.',
    description_en: 'Atlantic salmon fillet pan-seared to a crispy skin, resting on lemon-caper beurre blanc with blanched asparagus and garden herb risotto.',
    description_ku: 'ماسی سەلەمۆن کە لە تاوەیەکی برژاو کراوە و پێستێکی کریسپی هەیە، لەگەڵ ڕیزۆتۆی گژوگیای باخچە پێشکەش دەکرێت.',
  },
  {
    id: 'w3',
    category: 'western',
    price: 11500,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80',
    name: 'باستا كاربونارا',
    name_en: 'Pasta Carbonara',
    name_ku: 'پاستا کاربۆنارا',
    description: 'معكرونة طازجة حريرية ممزوجة بصلصة الكاربونارا الرومانية الكلاسيكية من صفار البيض، جبن بيكورينو رومانو، ورشة سخية من الفلفل الأسود.',
    description_en: 'Silky fresh pasta tossed in a classic Roman carbonara of free-range egg yolks, guanciale, Pecorino Romano, and a generous crack of black pepper.',
    description_ku: 'پاستای تازە تێکەڵ بە کاربۆنارای ڕۆمانی کلاسیک، پەنیر، و بیبەری ڕەش.',
  },
  {
    id: 'w4',
    category: 'western',
    price: 9000,
    image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&q=80',
    name: 'كلوب ساندويتش',
    name_en: 'Club Sandwich',
    name_ku: 'کلاب ساندویچ',
    description: 'ساندويتش خبز العجين المخمر المحمص من ثلاث طبقات مع ديك رومي محمص، خس مقرمش، طماطم ومايونيز بالأعشاب، تقدم مع بطاطا مقلية.',
    description_en: 'Triple-decker toasted sourdough with roasted turkey, crispy bacon, fresh lettuce, heirloom tomato, and herb mayo — served with a side of French fries.',
    description_ku: 'ساندویچی سێ نهۆمی نانی برژاو لەگەڵ قەل، کاهوو، تەماتە، و مایۆنیز.',
  },

  /* ── Beverages ────────────────────────────────────── */
  {
    id: 'b1',
    category: 'beverages',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80',
    name: 'فيرجن موهيتو',
    name_en: 'Virgin Mojito',
    name_ku: 'مۆجیتۆ',
    description: 'مزيج منعش من عصير الليمون الطازج، أوراق النعناع المهروسة، قصب السكر، والمياه الفوارة تقدم فوق الثلج المجروش.',
    description_en: 'Refreshing blend of fresh lime juice, muddled mint leaves, cane sugar, and sparkling water served over crushed ice — light, crisp, and utterly refreshing.',
    description_ku: 'تێکەڵەیەکی فرێش لە ئاوی لیمۆی تازە، گەڵای نەعنا، شەکر، و ئاوی گازی لەگەڵ سەهۆڵ.',
  },
  {
    id: 'b2',
    category: 'beverages',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
    name: 'ليمون نعناع كولر',
    name_en: 'Lemon Mint Cooler',
    name_ku: 'لیمۆ و نەعنا',
    description: 'ليمون معصور طازج ممزوج بالنعناع وقليل من العسل والمياه الفوارة الباردة.',
    description_en: 'Freshly squeezed lemons blended with garden mint, a touch of honey, and chilled sparkling water. The perfect companion for warm riverside evenings.',
    description_ku: 'لیمۆی تازە گووشراو لەگەڵ نەعنای باخچە، کەمێک هەنگوین، و ئاوی گازی سارد تێکەڵ دەکرێت.',
  },

  /* ── Juices ───────────────────────────────────────── */
  {
    id: 'j1',
    category: 'juices',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80',
    name: 'عصير برتقال طازج',
    name_en: 'Fresh Orange Juice',
    name_ku: 'شەربەتی پڕتەقاڵی فرێش',
    description: 'عصير برتقال فالنسيا المعصور طازجاً، إشراقة شمس سائلة نقية وبدون أية إضافات.',
    description_en: 'Six freshly squeezed Valencia oranges — nothing added, nothing taken away. Pure liquid sunshine, pressed to order.',
    description_ku: 'شەربەتی پڕتەقاڵی تازە گووشراو، هیچ شتێکی بۆ زیاد نەکراوە، تەنها شەربەتی تەواوی پڕتەقاڵ.',
  },
  {
    id: 'j2',
    category: 'juices',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80',
    name: 'عصير رقي (بطيخ)',
    name_en: 'Watermelon Juice',
    name_ku: 'شەربەتی شووتی',
    description: 'عصير بطيخ أحمر (رقي) طازج مع لمسة من الليمون، منعش وحلو المذاق.',
    description_en: 'Cold-pressed fresh watermelon with a hint of lime zest and a light sprinkle of sea salt — hydrating, sweet, and brilliantly pink.',
    description_ku: 'شەربەتی شووتی فرێش لەگەڵ کەمێک لیمۆ، شیرین و تامبەخش.',
  },
  {
    id: 'j4',
    category: 'juices',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=600&q=80',
    name: 'ديتوكس أخضر',
    name_en: 'Green Detox',
    name_ku: 'دیتۆکسی سەوز',
    description: 'سبانخ، خيار، تفاح، زنجبيل، وليمون معصور على البارد في عصير أخضر حيوي - نظيف ومنعش ويمنح الطاقة.',
    description_en: 'Spinach, cucumber, apple, ginger, and lemon cold-pressed into a lively green juice — clean, crisp, and energising.',
    description_ku: 'سپێناخ، خەیار، سێو، زەنجەبیل، و لیمۆ تێکەڵەیەک لە شەربەتی سەوزی تەندروست.',
  },

  /* ── Coffee ───────────────────────────────────────── */
  {
    id: 'c2',
    category: 'coffee',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&q=80',
    name: 'اسبريسو مختص',
    name_en: 'Specialty Espresso',
    name_ku: 'ئێسپرێسۆ',
    description: 'شوت مزدوج من حبوب القهوة الإثيوبية، مستخلصة بدقة لتبرز نكهات الحمضيات المشرقة والرائحة الزهرية.',
    description_en: 'A double-shot of single-origin Ethiopian Yirgacheffe beans, precision-extracted at 93°C — bright citrus notes, floral aroma, silky crema.',
    description_ku: 'دوو شۆت لە قاوەی ئەسیوبی، بە تامێکی نایاب و بۆنخۆش.',
  },
  {
    id: 'c4',
    category: 'coffee',
    price: 4000,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',
    name: 'كولد برو',
    name_en: 'Cold Brew',
    name_ku: 'کۆڵد برو',
    description: 'قهوة كولومبية منقوعة على البارد لمدة 18 ساعة، قليلة الحموضة، ناعمة، وغنية بشكل مكثف - تقدم على الثلج المجروش المقطوع يدوياً مع رشة من الكريمة الطازجة.',
    description_en: '18-hour cold-steeped Colombian beans, low-acid, smooth, and intensely rich — served over hand-chiselled ice with a splash of fresh cream.',
    description_ku: 'قاوەی کۆڵۆمبی بۆ ماوەی 18 کاتژمێر لە ئاوی سارددا دەمێندرێتەوە، بە سەهۆڵ و کەمێک کرێم پێشکەش دەکرێت.',
  },
  {
    id: 'c5',
    category: 'coffee',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80',
    name: 'كابتشينو بالزعفران',
    name_en: 'Saffron Cappuccino',
    name_ku: 'کاپوچینۆ بە زەعفەران',
    description: 'مزيج فاخر من الإسبريسو ورغوة الحليب الدقيقة الممزوجة بخلاصة الزعفران الفارسي الأصلي، ويزين برشة من القرفة ورقائق الذهب الصالحة للأكل.',
    description_en: 'A luxurious blend of espresso and micro-foam infused with a genuine Persian saffron essence, finished with a dusting of cinnamon and gold-edible flakes.',
    description_ku: 'تێکەڵەیەکی نایاب لە ئێسپرێسۆ و کەفی شیرین لەگەڵ تامی زەعفەرانی ئەسڵی، لەگەڵ کەمێک دارچین.',
  },

  /* ── Soups ────────────────────────────────────────── */
  {
    id: 's1',
    category: 'soups',
    price: 6000,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
    name: 'شوربة عدس',
    name_en: 'Lentil Soup',
    name_ku: 'شۆربای نیسک',
    description: 'شوربة عدس تقليدية بالبهارات الدافئة، تقدم مع قطع الخبز المحمص والليمون.',
    description_en: 'Traditional lentil soup with warm spices, served with toasted bread crisps and a wedge of lemon.',
    description_ku: 'شۆربای نیسکی نەریتی بە بەهاراتی گەرم، لەگەڵ نانی برژاو و لیمۆ پێشکەش دەکرێت.',
  },

  /* ── Salads ───────────────────────────────────────── */
  {
    id: 'sl1',
    category: 'salads',
    price: 7500,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    name: 'سلطة السيزر',
    name_en: 'Caesar Salad',
    name_ku: 'زەڵاتەی قەیسەر',
    description: 'خس روماني مقرمش، خبز محمص، وجبنة بارميزان مع صلصة السيزر الغنية.',
    description_en: 'Crisp romaine lettuce, croutons, and parmesan cheese tossed in a rich Caesar dressing.',
    description_ku: 'کاهووی ڕۆمانی، نانی برژاو، و پەنیری پارمەزان لەگەڵ سۆسی قەیسەری دەوڵەمەند.',
  },

  /* ── Cold Appetizers ──────────────────────────────── */
  {
    id: 'ca1',
    category: 'cold_appetizers',
    price: 5000,
    image: 'https://images.unsplash.com/photo-1633321586523-2895fbc99014?w=600&q=80',
    name: 'حمص بالطحينة',
    name_en: 'Hummus',
    name_ku: 'حوموس',
    description: 'حمص كريمي مهروس مع طحينة، ليمون، وزيت زيتون بكر فائق الجودة.',
    description_en: 'Creamy mashed chickpeas blended with tahini, lemon juice, and extra virgin olive oil.',
    description_ku: 'نۆکی کوڵاو تێکەڵ بە تەحین، ئاوی لیمۆ، و زەیتی زەیتوونی نایاب.',
  },

  /* ── Hot Appetizers ───────────────────────────────── */
  {
    id: 'ha1',
    category: 'hot_appetizers',
    price: 6500,
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&q=80',
    name: 'بطاطا مقلية',
    name_en: 'French Fries',
    name_ku: 'پەتاتەی سوورکراوە',
    description: 'بطاطا مقلية ذهبية ومقرمشة، تقدم مع تشكيلة من الصلصات اللذيذة.',
    description_en: 'Golden, crispy French fries served with a variety of delicious dipping sauces.',
    description_ku: 'پەتاتەی سوورکراوەی زێڕین و کریسپی، لەگەڵ جۆرەها سۆسی تامدار پێشکەش دەکرێت.',
  },

  /* ── Breakfast ────────────────────────────────────── */
  {
    id: 'br1',
    category: 'breakfast',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1533089859715-db1c521eb282?w=600&q=80',
    name: 'فطور تالة المميز',
    name_en: 'Tala Special Breakfast',
    name_ku: 'نانی بەیانی تایبەتی تالە',
    description: 'فطور متكامل يضم البيض، الأجبان، الزيتون، والعسل الطازج، مع خبز التنور الساخن وشاي عراقي.',
    description_en: 'A complete breakfast featuring eggs, artisanal cheeses, olives, and fresh honey, served with hot tandoor bread and Iraqi tea.',
    description_ku: 'نانی بەیانییەکی تەواو کە هێلکە، پەنیر، زەیتون و هەنگوینی فرێش لەخۆدەگرێت، لەگەڵ نانی تەنوور و چای عێراقی گەرم پێشکەش دەکرێت.',
  },

  /* ── Sandwiches ───────────────────────────────────── */
  {
    id: 'sw1',
    category: 'sandwiches',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=600&q=80',
    name: 'شاورما دجاج',
    name_en: 'Chicken Shawarma',
    name_ku: 'شاورمەی مریشک',
    description: 'قطع دجاج متبلة مشوية على السيخ، ملفوفة بخبز الصاج الطازج مع صلصة الثوم والمخللات.',
    description_en: 'Marinated chicken pieces roasted on a spit, wrapped in fresh saj bread with garlic sauce and pickles.',
    description_ku: 'پارچە مریشکی بەهاراتدارکراو لەسەر شیش دەبرژێنرێت، بە نانی ساجی فرێش لەگەڵ سۆسی سیر و ترشیات دەپێچرێتەوە.',
  },

  /* ── Pasta ────────────────────────────────────────── */
  {
    id: 'p1',
    category: 'pasta',
    price: 13000,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80',
    name: 'معكرونة بينا ارابياتا',
    name_en: 'Penne Arrabbiata',
    name_ku: 'پاستا پێنێ ئارابیاتا',
    description: 'معكرونة بصلصة الطماطم الغنية بالثوم ورقائق الفلفل الحار والريحان الطازج.',
    description_en: 'Penne pasta tossed in a robust tomato sauce with garlic, chili flakes, and fresh basil.',
    description_ku: 'پاستای پێنێ تێکەڵ بە سۆسی تەماتەی بەهێز لەگەڵ سیر، وردە بیبەری توون، و توورەکەی فرێش.',
  },

  /* ── Desserts ─────────────────────────────────────── */
  {
    id: 'd1',
    category: 'desserts',
    price: 9000,
    image: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=600&q=80',
    name: 'بقلاوة تركية',
    name_en: 'Turkish Baklava',
    name_ku: 'بەقلاوەی تورکی',
    description: 'طبقات مقرمشة من عجينة الفيلو المحشوة بالفستق الحلبي، والمحلاة بقطر الفانيليا.',
    description_en: 'Crispy layers of phyllo dough generously filled with pistachios and sweetened with fragrant vanilla syrup.',
    description_ku: 'چینە کریسپییەکانی هەویری فیلۆ کە پڕکراوە لە فستق و بە شرووبی ڤانێلای بۆنخۆش شیرین کراوە.',
  }
];

/* ══════════════════════════════════════════════════════
   EXCELLENCE CAROUSEL ITEMS
   Special highlighted items for the top carousel.
══════════════════════════════════════════════════════ */
const excellenceItems = [
  'g1', // Grilled Meat
  'w1', // Wagyu Burger
  'w2', // Grilled Salmon
  'c5'  // Saffron Cappuccino
];

