/**
 * script.js — Tala Restaurant & Café
 * ────────────────────────────────────
 * Handles all rendering and interactivity.
 * Menu content comes from menu-data.js (categories + dishes arrays).
 *
 * Architecture:
 *  renderCategories() → builds nav tabs + menu sections from `categories`
 *  renderDishes()     → fills each section grid from `dishes`
 *  renderDishCard()   → returns a single <article> DOM node
 *
 * Adding new content = editing menu-data.js only. No HTML changes needed.
 */

let categories = [];
let dishes = [];

/* ══════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════ */
const state = {
  cart:      [],   // { id, name, price, qty, image }
  modalItem: null, // dish object currently open in modal
  modalQty:  1,
};

/* ══════════════════════════════════════════════════════
   STATIC DOM REFERENCES
   (Elements that exist in the HTML before JS runs)
══════════════════════════════════════════════════════ */
const dom = {
  hero:             document.getElementById('hero'),
  heroContent:      document.getElementById('hero-content'),
  navbar:           document.getElementById('navbar'),
  categoryTabsList: document.getElementById('category-tabs'),
  menuMain:         document.getElementById('menu'),

  searchToggle:     document.getElementById('search-toggle'),
  searchBar:        document.getElementById('search-bar'),
  searchInput:      document.getElementById('search-input'),
  searchClear:      document.getElementById('search-clear'),

  cartToggle:       document.getElementById('cart-toggle'),
  cartPanel:        document.getElementById('cart-panel'),
  cartClose:        document.getElementById('cart-close'),
  cartBackdrop:     document.getElementById('cart-backdrop'),
  cartItems:        document.getElementById('cart-items'),
  cartEmpty:        document.getElementById('cart-empty'),
  cartTotal:        document.getElementById('cart-total'),
  cartBadge:        document.getElementById('cart-badge'),

  dishModal:        document.getElementById('dish-modal'),
  modalClose:       document.getElementById('modal-close'),
  modalImg:         document.getElementById('modal-img'),
  modalTitle:       document.getElementById('modal-title'),
  modalPrice:       document.getElementById('modal-price'),
  modalDesc:        document.getElementById('modal-desc'),
  modalQtyMinus:    document.getElementById('qty-minus'),
  modalQtyPlus:     document.getElementById('qty-plus'),
  modalQtyVal:      document.getElementById('qty-value'),
  modalAddBtn:      document.getElementById('modal-add-btn'),

  toast:            document.getElementById('toast'),

  /* Promo Modal */
  promoModal:       document.getElementById('promo-modal'),
  promoClose:       document.getElementById('promo-close'),
  promoBackdrop:    document.getElementById('promo-backdrop'),
  promoImg:         document.getElementById('promo-img'),
  promoTitle:       document.getElementById('promo-title'),
  promoPrice:       document.getElementById('promo-price'),
  promoDesc:        document.getElementById('promo-desc'),
  promoAddBtn:      document.getElementById('promo-add-btn'),
};

/* ══════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════ */
/** Helper for localized properties */
function getLangKey(baseKey) {
  return currentLang === 'ar' ? baseKey : `${baseKey}_${currentLang}`;
}

/** Format a number as IQD price string */
function formatPrice(n) {
  return n.toLocaleString('en-IQ') + ' ' + t('currency');
}

/** Show a brief toast notification */
function showToast(message, duration = 2400) {
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  clearTimeout(dom.toast._timer);
  dom.toast._timer = setTimeout(() => dom.toast.classList.remove('show'), duration);
}

/** Trap keyboard focus inside a modal (accessibility) */
function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  container._focusTrap = (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  };
  container.addEventListener('keydown', container._focusTrap);
  first.focus();
}

function releaseFocus(container) {
  if (container._focusTrap) {
    container.removeEventListener('keydown', container._focusTrap);
    delete container._focusTrap;
  }
}

/* ══════════════════════════════════════════════════════
   RENDER — CATEGORIES
   Reads `categories` from menu-data.js.
   Generates navbar tabs + menu sections.
══════════════════════════════════════════════════════ */
function renderCategories() {
  /* Clear existing content to prevent duplicates on re-render */
  dom.categoryTabsList.innerHTML = '';
  dom.menuMain.innerHTML = '';

  categories.forEach((cat, index) => {
    /* ── Navbar tab ── */
    const li  = document.createElement('li');
    li.setAttribute('role', 'presentation');

    const btn = document.createElement('button');
    btn.className = 'cat-tab' + (index === 0 ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    btn.dataset.category = cat.id;
    btn.textContent = cat[getLangKey('title')] || cat.title;
    btn.setAttribute('translate', 'no');

    li.appendChild(btn);
    dom.categoryTabsList.appendChild(li);

    /* ── Menu section ── */
    const section = document.createElement('section');
    section.className = 'menu-section reveal';
    section.id = `section-${cat.id}`;
    section.dataset.category = cat.id;
    section.setAttribute('aria-labelledby', `cat-heading-${cat.id}`);

    section.innerHTML = `
      <div class="section-header">
        <h2 id="cat-heading-${cat.id}" class="section-title">
          <span class="section-title__icon">${cat.icon}</span> <span translate="no">${cat[getLangKey('title')] || cat.title}</span>
        </h2>
        <div class="section-title__line" aria-hidden="true"></div>
      </div>
      <div class="dishes-grid" id="grid-${cat.id}"></div>
    `;

    dom.menuMain.appendChild(section);
  });
}

/* ══════════════════════════════════════════════════════
   RENDER — SINGLE DISH CARD
   Returns an <article> DOM element.
   Uses event delegation parent instead of inline listeners
   to keep memory footprint low.
══════════════════════════════════════════════════════ */
function renderDishCard(dish) {
  const card = document.createElement('article');
  card.className = 'dish-card';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${dish.name} – ${formatPrice(dish.price)}`);

  /* Data attrs used for search filtering and event delegation */
  card.dataset.id       = dish.id;
  card.dataset.search   = `${dish.name} ${dish.name_en || ''} ${dish.name_ku || ''}`.toLowerCase();
  card.dataset.category = dish.category;

  card.innerHTML = `
    <div class="dish-card__img-wrap">
      <img
        data-src="${dish.image}"
        src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        alt="${dish.name}"
        class="dish-card__img lazy-img"
      />
    </div>
    <div class="dish-card__body">
      <h3 class="dish-card__name" translate="no">${dish[getLangKey('name')] || dish.name}</h3>
      <p class="dish-card__price" translate="no">${formatPrice(dish.price)}</p>
    </div>
  `;

  return card;
}

/* ══════════════════════════════════════════════════════
   RENDER — ALL DISHES
   Reads `dishes` from menu-data.js.
   Groups by category and fills each section grid.
══════════════════════════════════════════════════════ */
function renderDishes() {
  /* Group dishes by category for a single-pass approach */
  const byCategory = dishes.reduce((acc, dish) => {
    if (!acc[dish.category]) acc[dish.category] = [];
    acc[dish.category].push(dish);
    return acc;
  }, {});

  Object.entries(byCategory).forEach(([catId, catDishes]) => {
    const grid = document.getElementById(`grid-${catId}`);
    if (!grid) {
      console.warn(`[Tala Menu] No grid found for category "${catId}". Check menu-data.js.`);
      return;
    }

    /* Clear grid before filling */
    grid.innerHTML = '';

    /* DocumentFragment batches DOM writes — one reflow per category */
    const fragment = document.createDocumentFragment();
    catDishes.forEach(dish => fragment.appendChild(renderDishCard(dish)));
    grid.appendChild(fragment);
  });
}

/* ══════════════════════════════════════════════════════
   PROMO FEATURED DISH MODAL (POP-UP)
══════════════════════════════════════════════════════ */
let promoDish = null;

async function showPromoFeaturedModal() {
  // Load from excellence_items table
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('excellence_items')
      .select('*')
      .limit(1);

    if (error || !data || data.length === 0) return;
    promoDish = data[0];
  } catch (e) {
    // If no excellence_items table yet, silently skip
    return;
  }

  // Populate elements
  dom.promoImg.src = promoDish.image || 'images/default-dish.jpg';
  dom.promoImg.alt = promoDish[getLangKey('name')] || promoDish.name;
  dom.promoTitle.textContent = promoDish[getLangKey('name')] || promoDish.name;
  dom.promoPrice.textContent = formatPrice(promoDish.price);
  dom.promoDesc.textContent = promoDish[getLangKey('description')] || promoDish.description || '';

  // Show modal
  openPromoModal();
}

function openPromoModal() {
  if (!dom.promoModal) return;
  dom.promoModal.classList.add('open');
  dom.promoModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  trapFocus(dom.promoModal);
}

function closePromoModal() {
  if (!dom.promoModal) return;
  dom.promoModal.classList.remove('open');
  dom.promoModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (document.activeElement && dom.promoModal.contains(document.activeElement)) {
    document.activeElement.blur();
  }
  releaseFocus(dom.promoModal);
}

function initPromoModal() {
  if (!dom.promoModal) return;

  // Close actions
  dom.promoClose.addEventListener('click', closePromoModal);
  dom.promoBackdrop.addEventListener('click', closePromoModal);

  // Add to cart action
  dom.promoAddBtn.addEventListener('click', () => {
    if (promoDish) {
      addToCart(promoDish, 1);
      showToast(`${promoDish[getLangKey('name')] || promoDish.name} ${t('added_to_cart')}`);
      closePromoModal();
    }
  });
  let promoShown = false;

  // Listen to CTA Browse Menu click to show promo modal
  const ctaBtn = document.querySelector('.hero__cta');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      if (promoShown) return;
      promoShown = true;
      // Trigger opening when navigating to menu
      setTimeout(showPromoFeaturedModal, 300);
    });
  }

  // Also open if user scrolls manually past hero (only once)
  const onScroll = () => {
    if (promoShown) {
      window.removeEventListener('scroll', onScroll);
      return;
    }
    const heroHeight = dom.hero ? dom.hero.offsetHeight : 500;
    if (window.scrollY > heroHeight - 100) {
      promoShown = true;
      window.removeEventListener('scroll', onScroll);
      setTimeout(showPromoFeaturedModal, 400);
    }
  };
  window.addEventListener('scroll', onScroll);
}

/* ══════════════════════════════════════════════════════
   EVENT DELEGATION — DISH CARDS
   Single listener on the menu container handles all cards.
   Works for dynamically added dishes without re-binding.
══════════════════════════════════════════════════════ */
function initDishCardDelegation() {
  dom.menuMain.addEventListener('click', (e) => {
    const card = e.target.closest('.dish-card');
    if (!card) return;
    const dish = getDishById(card.dataset.id);
    if (dish) openDishModal(dish);
  });

  dom.menuMain.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.dish-card');
    if (!card) return;
    e.preventDefault();
    const dish = getDishById(card.dataset.id);
    if (dish) openDishModal(dish);
  });
}

/** Look up a dish object by id from the global dishes array */
function getDishById(id) {
  return dishes.find(d => d.id === id) || null;
}

/* ══════════════════════════════════════════════════════
   HERO SCROLL BEHAVIOR
══════════════════════════════════════════════════════ */
function initHeroScroll() {
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      if (document.body.classList.contains('menu-mode')) {
        ticking = false;
        return;
      }
      const scrollY = window.scrollY;
      const heroH   = dom.hero.offsetHeight;

      dom.navbar.classList.toggle('visible', scrollY > heroH * 0.6);

      /* Parallax on hero background */
      const bg = dom.hero.querySelector('.hero__bg');
      if (bg) bg.style.transform = `scale(1.06) translateY(${scrollY * 0.2}px)`;

      ticking = false;
    });
    ticking = true;
  });
}

/* ══════════════════════════════════════════════════════
   CATEGORY TABS
   Horizontal scrollable list. Active tab tracks the
   visible menu section via IntersectionObserver.
══════════════════════════════════════════════════════ */

function setActiveTab(activeTab) {
  if (!activeTab) return;
  document.querySelectorAll('.cat-tab').forEach(t => {
    const on = t === activeTab;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', String(on));
  });
  /* Keep active tab visible inside the scrollable track */
  activeTab.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
}

function initCategoryTabs() {
  /* ── Click: activate + smooth-scroll to menu section ── */
  dom.categoryTabsList.addEventListener('click', e => {
    const tab = e.target.closest('.cat-tab');
    if (!tab) return;
    
    const section = document.getElementById(`section-${tab.dataset.category}`);
    if (!section) return;

    /* Use a stable offset for fixed navbar (approx 100px on mobile) */
    const offset = dom.navbar.offsetHeight || 100;
    const top    = section.getBoundingClientRect().top + window.scrollY - offset + 2;
    
    window.scrollTo({ top, behavior: 'smooth' });
    
    /* Active state will be handled by IntersectionObserver during scroll */
  });

  observeCategorySections();
}

let categoryScrollObserver = null;

function observeCategorySections() {
  if (categoryScrollObserver) {
    categoryScrollObserver.disconnect();
  }

  const sections = document.querySelectorAll('.menu-section');
  /* rootMargin adjusted and threshold: 0 to handle very tall sections properly */
  categoryScrollObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const tab = dom.categoryTabsList.querySelector(
        `[data-category="${entry.target.dataset.category}"]`
      );
      if (tab) setActiveTab(tab);
    });
  }, { rootMargin: '-120px 0px -60% 0px', threshold: 0 });

  sections.forEach(s => categoryScrollObserver.observe(s));

  /* Activate first tab on load if visible */
  requestAnimationFrame(() => {
    const firstTab = dom.categoryTabsList.querySelector('.cat-tab');
    if (firstTab && window.scrollY < 300) setActiveTab(firstTab);
  });
}

/* ══════════════════════════════════════════════════════
   REVEAL ON SCROLL
   Must run AFTER renderCategories() has created sections.
══════════════════════════════════════════════════════ */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -50px 0px', threshold: 0.05 });

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
    /* Safety: if it's already in viewport (e.g. mobile reload), reveal it */
    if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('revealed');
    }
  });
}

/* ══════════════════════════════════════════════════════
   SEARCH
══════════════════════════════════════════════════════ */
function initSearch() {
  dom.searchToggle.addEventListener('click', () => {
    const isOpen = dom.searchBar.classList.toggle('open');
    dom.searchToggle.setAttribute('aria-expanded', String(isOpen));
    dom.searchBar.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) {
      setTimeout(() => dom.searchInput.focus(), 340);
    } else {
      clearSearch();
    }
  });

  dom.searchClear.addEventListener('click', () => {
    clearSearch();
    dom.searchInput.focus();
  });

  dom.searchInput.addEventListener('input', filterDishes);

  dom.searchInput.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    dom.searchBar.classList.remove('open');
    dom.searchToggle.setAttribute('aria-expanded', 'false');
    dom.searchBar.setAttribute('aria-hidden', 'true');
    clearSearch();
  });
}

function filterDishes() {
  const query = dom.searchInput.value.trim().toLowerCase();
  const cards = document.querySelectorAll('.dish-card');

  cards.forEach(card => {
    card.classList.toggle('hidden', Boolean(query) && !card.dataset.search.includes(query));
  });

  /* Show/hide "no results" message per grid */
  document.querySelectorAll('.dishes-grid').forEach(grid => {
    const hasVisible = [...grid.querySelectorAll('.dish-card')].some(c => !c.classList.contains('hidden'));
    let noRes = grid.querySelector('.no-results');

    if (!hasVisible && query) {
      if (!noRes) {
        noRes = document.createElement('p');
        noRes.className = 'no-results';
        noRes.textContent = t('no_results');
        grid.appendChild(noRes);
      }
    } else if (noRes) {
      noRes.remove();
    }
  });
}

function clearSearch() {
  dom.searchInput.value = '';
  filterDishes();
}

/* ══════════════════════════════════════════════════════
   DISH MODAL
══════════════════════════════════════════════════════ */
function openDishModal(dish) {
  state.modalItem = dish;
  state.modalQty  = 1;

  dom.modalImg.src            = dish.image;
  dom.modalImg.alt            = dish[getLangKey('name')] || dish.name;
  dom.modalTitle.textContent  = dish[getLangKey('name')] || dish.name;
  dom.modalPrice.textContent  = formatPrice(dish.price).replace(t('currency'), '').trim();
  dom.modalDesc.textContent   = dish[getLangKey('description')] || dish.description;
  dom.modalQtyVal.textContent = '1';

  dom.dishModal.classList.add('open');
  dom.dishModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  trapFocus(dom.dishModal);
}

function closeDishModal() {
  dom.dishModal.classList.remove('open');
  dom.dishModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  releaseFocus(dom.dishModal);
  state.modalItem = null;
}

function initDishModal() {
  dom.modalClose.addEventListener('click', closeDishModal);
  dom.dishModal.querySelector('.modal__backdrop').addEventListener('click', closeDishModal);

  dom.modalQtyMinus.addEventListener('click', () => {
    if (state.modalQty > 1) {
      state.modalQty--;
      dom.modalQtyVal.textContent = state.modalQty;
    }
  });

  dom.modalQtyPlus.addEventListener('click', () => {
    state.modalQty++;
    dom.modalQtyVal.textContent = state.modalQty;
  });

  dom.modalAddBtn.addEventListener('click', () => {
    if (!state.modalItem) return;
    const item = state.modalItem;
    addToCart(item, state.modalQty);
    closeDishModal();
    showToast(`${item[getLangKey('name')] || item.name} ${t('added_to_cart')}`);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && dom.dishModal.classList.contains('open')) closeDishModal();
  });
}

/* ══════════════════════════════════════════════════════
   CART
══════════════════════════════════════════════════════ */
function loadCart() {
  // مسح السلة القديمة من التخزين الدائم إن وجدت
  localStorage.removeItem('tala_cart');
  try {
    const saved = sessionStorage.getItem('tala_cart');
    if (saved) state.cart = JSON.parse(saved);
  } catch (_) {
    state.cart = [];
  }
}

function saveCart() {
  sessionStorage.setItem('tala_cart', JSON.stringify(state.cart));
}

function addToCart(dish, qty = 1) {
  const existing = state.cart.find(i => i.id === dish.id);
  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({ 
      id: dish.id, 
      name: dish.name, 
      name_en: dish.name_en, 
      name_ku: dish.name_ku, 
      price: dish.price, 
      qty, 
      image: dish.image 
    });
  }
  saveCart();
  renderCart();
  animateBadge();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function changeCartQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
  } else {
    saveCart();
    renderCart();
  }
}

function animateBadge() {
  dom.cartBadge.classList.remove('pop');
  void dom.cartBadge.offsetWidth; /* force reflow to restart animation */
  dom.cartBadge.classList.add('pop');
}

function renderCart() {
  const total   = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count   = state.cart.reduce((s, i) => s + i.qty, 0);
  const isEmpty = state.cart.length === 0;

  dom.cartBadge.textContent = count;
  dom.cartTotal.textContent = formatPrice(total);
  dom.cartEmpty.classList.toggle('visible', isEmpty);
  dom.cartItems.style.display = isEmpty ? 'none' : 'flex';
  dom.cartItems.innerHTML = '';

  const fragment = document.createDocumentFragment();

  state.cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div>
        <p class="cart-item__name">${item[getLangKey('name')] || item.name}</p>
        <div class="cart-item__meta">
          <div class="cart-item__qty-controls">
            <button class="cart-item__qty-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <span class="cart-item__qty">${item.qty}</span>
            <button class="cart-item__qty-btn" data-action="inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
          <span class="cart-item__price">${formatPrice(item.price * item.qty)}</span>
        </div>
      </div>
      <button class="cart-item__remove" data-id="${item.id}" aria-label="Remove ${item.name}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
      </button>
    `;

    /* Event delegation on cart items panel */
    el.querySelector('.cart-item__remove').addEventListener('click', () => removeFromCart(item.id));
    el.querySelectorAll('.cart-item__qty-btn').forEach(btn => {
      btn.addEventListener('click', () => changeCartQty(item.id, btn.dataset.action === 'inc' ? 1 : -1));
    });

    fragment.appendChild(el);
  });

  dom.cartItems.appendChild(fragment);
}

function initCart() {
  loadCart();
  renderCart();

  dom.cartToggle.addEventListener('click', openCart);
  dom.cartClose.addEventListener('click', closeCart);
  dom.cartBackdrop.addEventListener('click', closeCart);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && dom.cartPanel.classList.contains('open')) closeCart();
  });

  document.querySelector('.cart-order-btn').addEventListener('click', () => {
    if (!state.cart.length) { showToast(t('cart_empty')); return; }
    showToast(t('order_received'), 3200);
    state.cart = [];
    saveCart();
    renderCart();
    closeCart();
  });
}

function openCart() {
  dom.cartPanel.classList.add('open');
  dom.cartPanel.setAttribute('aria-hidden', 'false');
  dom.cartBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  dom.cartPanel.classList.remove('open');
  dom.cartPanel.setAttribute('aria-hidden', 'true');
  dom.cartBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════════════════════
   LANGUAGE SWITCHER
══════════════════════════════════════════════════════ */
function updateStaticTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    // If it has children (like the location SVG), we only replace the text node
    // or just assume we wrapped what we needed in a span.
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}

function initLanguageSwitch() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });

  window.addEventListener('languagechange', () => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
    
    // Dir and lang handle in i18n but re-applied here if needed
    updateStaticTranslations();
    
    // Re-render dynamic components
    dom.categoryTabsList.innerHTML = '';
    dom.menuMain.innerHTML = '';
    renderCategories();
    renderDishes();
    if (state.modalItem) {
      openDishModal(state.modalItem);
    }
    renderCart();
    filterDishes();
    
    // Keep active tab visible
    const activeTab = document.querySelector('.cat-tab.active');
    if (activeTab) setActiveTab(activeTab);

    // Re-observe newly rendered sections to fix missing ray
    observeCategorySections();
  });
  
  updateStaticTranslations();
}

/* ══════════════════════════════════════════════════════
   LAZY IMAGES
══════════════════════════════════════════════════════ */
function initLazyImages() {
  const lazyObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px 0px' });

  document.querySelectorAll('img.lazy-img').forEach(img => {
    lazyObserver.observe(img);
  });
}

/* ══════════════════════════════════════════════════════
   PARTICLES (HERO)
══════════════════════════════════════════════════════ */
function initParticles() {
  return; // Disabled for better performance
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, running = true;

  const resize = () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  const COUNT = window.innerWidth < 600 ? 28 : 55;

  const createParticle = () => ({
    x:      Math.random() * W,
    y:      Math.random() * H,
    r:      Math.random() * 1.6 + 0.4,
    dx:     (Math.random() - 0.5) * 0.28,
    dy:    -(Math.random() * 0.5 + 0.15),
    alpha:  Math.random() * 0.6 + 0.15,
    dAlpha: (Math.random() * 0.004 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
  });

  const particles = Array.from({ length: COUNT }, createParticle);

  const draw = () => {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x     += p.dx;
      p.y     += p.dy;
      p.alpha += p.dAlpha;
      if (p.alpha <= 0.08 || p.alpha >= 0.78) p.dAlpha *= -1;
      if (p.y < -10)    { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10)    p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(198,167,94,${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };

  draw();

  /* Pause when hero is off-screen to save GPU */
  new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting;
    if (running) draw();
  }).observe(dom.hero);
}

/* ══════════════════════════════════════════════════════
   QR / HASH ROUTING
   example.com/#menu → skip hero, go straight to menu
══════════════════════════════════════════════════════ */
function enterMenuMode() {
  document.body.classList.add('menu-mode');
  dom.navbar.classList.add('visible');
  
  /* Ensure dishes are rendered if they somehow weren't */
  if (dom.menuMain.children.length === 0) {
    renderCategories();
    renderDishes();
    initReveal();
  }

  /* Force immediate reveal for sections since the hero is now gone */
  document.querySelectorAll('.menu-section').forEach(s => s.classList.add('revealed'));
  
  window.scrollTo(0, 0);
}

function exitMenuMode() {
  document.body.classList.remove('menu-mode');
  dom.navbar.classList.remove('visible');
  window.scrollTo(0, 0);
}

function handleHashRouting() {
  const cta = document.querySelector('.hero__cta');
  if (cta) {
    cta.addEventListener('click', e => {
      e.preventDefault();
      history.pushState(null, '', '#menu');
      enterMenuMode();
    });
  }

  const brand = document.querySelector('.navbar__brand');
  if (brand) {
    brand.addEventListener('click', e => {
      e.preventDefault();
      history.pushState(null, '', '#');
      exitMenuMode();
    });
  }

  if (window.location.hash === '#menu') {
    enterMenuMode();
  }
}

/* ══════════════════════════════════════════════════════
   INIT
   Order matters:
   1. renderCategories() — creates DOM nodes
   2. renderDishes()     — fills the nodes
   3. All init*()        — wire up events on existing nodes
══════════════════════════════════════════════════════ */
/**
 * Helper to get or create a single Supabase client instance
 */
let sharedSupabaseClient = null;
function getSupabaseClient() {
  if (sharedSupabaseClient) return sharedSupabaseClient;
  
  let url = (typeof supabaseConfig !== 'undefined') ? supabaseConfig.url : '';
  let anonKey = (typeof supabaseConfig !== 'undefined') ? supabaseConfig.anonKey : '';

  if (!url || !anonKey) {
    url = localStorage.getItem('tala_supabase_url') || '';
    anonKey = localStorage.getItem('tala_supabase_anon_key') || '';
  }

  if (!url || !anonKey) {
    throw new Error('Supabase configuration credentials are missing.');
  }

  sharedSupabaseClient = window.supabase.createClient(url, anonKey);
  return sharedSupabaseClient;
}

/**
 * Loads the menu from Supabase if credentials are provided.
 */
async function loadMenuFromSupabase() {
  const supabaseClient = getSupabaseClient();


  // Fetch categories ordered by sort_order
  const { data: catData, error: catError } = await supabaseClient
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (catError) throw catError;

  // Fetch dishes
  const { data: dishData, error: dishError } = await supabaseClient
    .from('dishes')
    .select('*');

  if (dishError) throw dishError;

  if (catData && catData.length > 0) {
    categories = catData;
  }
  if (dishData && dishData.length > 0) {
    dishes = dishData;
  }

  console.log('Menu successfully loaded from Supabase database.');
}

/* ══════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  /* Setup Language Switcher first to get currentLang */
  initLanguageSwitch();

  // Show a loading spinner in the menu container while fetching
  const menuContainer = document.getElementById('menu');
  if (menuContainer) {
    menuContainer.innerHTML = `
      <div style="text-align:center; padding: 100px 20px; color:var(--clr-gold-start);">
        <span class="spinner" style="border-width: 3px; width: 40px; height: 40px; border-color: var(--clr-gold-start) transparent var(--clr-gold-start) var(--clr-gold-start);"></span>
        <p style="margin-top: 15px; font-size: 1.1rem; letter-spacing: 0.05em;" data-i18n="loading_menu">جاري تحميل قائمة الطعام...</p>
      </div>
    `;
  }

  /* Wire static elements immediately */
  initHeroScroll();
  initSearch();
  initCart();
  initParticles();
  initDishModal();
  initPromoModal();
  handleHashRouting();

  /* Load menu from database asynchronously in the background */
  loadMenuFromSupabase()
    .then(() => {
      // Clear loading and build the menu
      renderCategories();
      renderDishes();

      // Bind dynamic elements
      initCategoryTabs();
      initDishCardDelegation();
      initReveal();
      initLazyImages();
    })
    .catch(error => {
      console.error('Failed to load menu from Supabase:', error);
      if (menuContainer) {
        menuContainer.innerHTML = `
          <div style="text-align:center; padding: 80px 20px; color:#ff4d4d; font-size:1.15rem; font-weight:bold;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:15px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p>فشل الاتصال بقاعدة البيانات. الرجاء التحقق من إعدادات الاتصال.</p>
          </div>
        `;
      }
    });

  /* Register Service Worker for PWA */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(registration => {
          console.log('ServiceWorker registered:', registration.scope);
        })
        .catch(err => {
          console.log('ServiceWorker failed:', err);
        });
    });
  }
});
