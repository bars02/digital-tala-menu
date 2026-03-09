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

'use strict';

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
};

/* ══════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════ */

/** Format a number as IQD price string */
function formatPrice(n) {
  return n.toLocaleString('en-IQ') + ' IQD';
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
  categories.forEach((cat, index) => {

    /* ── Navbar tab ── */
    const li  = document.createElement('li');
    li.setAttribute('role', 'presentation');

    const btn = document.createElement('button');
    btn.className = 'cat-tab' + (index === 0 ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    btn.dataset.category = cat.id;
    btn.textContent = cat.title;
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
          <span class="section-title__icon">${cat.icon}</span> <span translate="no">${cat.title}</span>
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
  card.dataset.name     = dish.name.toLowerCase();
  card.dataset.category = dish.category;

  card.innerHTML = `
    <div class="dish-card__img-wrap">
      <img
        src="${dish.image}"
        alt="${dish.name}"
        class="dish-card__img"
        loading="lazy"
      />
    </div>
    <div class="dish-card__body">
      <h3 class="dish-card__name" translate="no">${dish.name}</h3>
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

    /* DocumentFragment batches DOM writes — one reflow per category */
    const fragment = document.createDocumentFragment();
    catDishes.forEach(dish => fragment.appendChild(renderDishCard(dish)));
    grid.appendChild(fragment);
  });
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
    setActiveTab(tab);
    const section = document.getElementById(`section-${tab.dataset.category}`);
    if (!section) return;
    const offset = dom.navbar.offsetHeight + 12;
    const top    = section.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  /* ── IntersectionObserver: sync active tab on page scroll ── */
  const sections = document.querySelectorAll('.menu-section');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const tab = dom.categoryTabsList.querySelector(
        `[data-category="${entry.target.dataset.category}"]`
      );
      if (tab) setActiveTab(tab);
    });
  }, { rootMargin: `-${dom.navbar.offsetHeight + 20}px 0px -55% 0px` });

  sections.forEach(s => observer.observe(s));

  /* Activate first tab on load */
  requestAnimationFrame(() => {
    const first = dom.categoryTabsList.querySelector('.cat-tab');
    if (first) setActiveTab(first);
  });
}

/* ══════════════════════════════════════════════════════
   REVEAL ON SCROLL
   Must run AFTER renderCategories() has created sections.
══════════════════════════════════════════════════════ */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
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
    card.classList.toggle('hidden', Boolean(query) && !card.dataset.name.includes(query));
  });

  /* Show/hide "no results" message per grid */
  document.querySelectorAll('.dishes-grid').forEach(grid => {
    const hasVisible = [...grid.querySelectorAll('.dish-card')].some(c => !c.classList.contains('hidden'));
    let noRes = grid.querySelector('.no-results');

    if (!hasVisible && query) {
      if (!noRes) {
        noRes = document.createElement('p');
        noRes.className = 'no-results';
        noRes.textContent = 'No dishes found.';
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
  dom.modalImg.alt            = dish.name;
  dom.modalTitle.textContent  = dish.name;
  dom.modalPrice.textContent  = formatPrice(dish.price);
  dom.modalDesc.textContent   = dish.description;
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
    showToast(`${item.name} added to your order`);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && dom.dishModal.classList.contains('open')) closeDishModal();
  });
}

/* ══════════════════════════════════════════════════════
   CART
══════════════════════════════════════════════════════ */
function loadCart() {
  try {
    const saved = localStorage.getItem('tala_cart');
    if (saved) state.cart = JSON.parse(saved);
  } catch (_) {
    state.cart = [];
  }
}

function saveCart() {
  localStorage.setItem('tala_cart', JSON.stringify(state.cart));
}

function addToCart(dish, qty = 1) {
  const existing = state.cart.find(i => i.id === dish.id);
  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({ id: dish.id, name: dish.name, price: dish.price, qty, image: dish.image });
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
        <p class="cart-item__name">${item.name}</p>
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
    if (!state.cart.length) { showToast('Your cart is empty'); return; }
    showToast('Order received! We will contact you shortly. 🎉', 3200);
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
   PARTICLES (HERO)
══════════════════════════════════════════════════════ */
function initParticles() {
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
function handleHashRouting() {
  if (window.location.hash !== '#menu') return;
  dom.navbar.classList.add('visible');
  setTimeout(() => {
    dom.menuMain.scrollIntoView({ behavior: 'instant' });
  }, 50);

  /* Restore hero content when user scrolls back to top */
  const restoreHero = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      dom.heroContent.style.opacity   = '';
      dom.heroContent.style.animation = '';
    } else {
      dom.heroContent.style.opacity   = '0';
      dom.heroContent.style.animation = 'none';
    }
  }, { threshold: 0.1 });
  restoreHero.observe(dom.hero);
}

/* ══════════════════════════════════════════════════════
   INIT
   Order matters:
   1. renderCategories() — creates DOM nodes
   2. renderDishes()     — fills the nodes
   3. All init*()        — wire up events on existing nodes
══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  handleHashRouting();

  /* Build the menu from menu-data.js */
  renderCategories();
  renderDishes();

  /* Wire all interactions */
  initHeroScroll();
  initCategoryTabs();
  initReveal();
  initSearch();
  initDishCardDelegation();
  initDishModal();
  initCart();
  initParticles();
});
