# 🚀 Full Prompt for Replicating the Luxury Digital Menu Application

**Instructions:** Copy the text below the separator and paste it into a new AI conversation (e.g., with Claude, ChatGPT, or Gemini) to generate the new brand's project. You only need to replace `[ENTER BRAND NAME HERE]` and `[ENTER BRAND COLORS]`.

---

**Act as an Expert Senior Frontend Developer and UI/UX Designer.** 

I need you to build a fully responsive, modern, luxury digital menu web application, Progressive Web App (PWA), for a restaurant/brand named `[ENTER BRAND NAME HERE]`. The primary color scheme should be `[ENTER BRAND COLORS, e.g., Dark theme with Gold accents #C6A75E]`.

### 1. Architecture & Tech Stack (Strictly Vanilla)
- **Core:** Vanilla HTML5, CSS3, JavaScript (ES6+). Do NOT use any heavy frameworks like React, Vue, or Tailwind.
- **Data Architecture:** Strictly separate data, logic, and translations:
  - `menu-data.js`: Contains global arrays for `categories` and `dishes`.
  - `i18n.js`: Contains the translation dictionary and language switching logic.
  - `script.js`: Core logic, DOM manipulation, observers, and event handling.
  - `style.css`: All styling utilizing CSS variables and BEM methodology.
- **PWA:** Fully offline-capable using `manifest.json` and a Service Worker (`sw.js`) with cache-busting mechanisms.

### 2. Core Features Required
1. **Trilingual Support (i18n):** Support Arabic (Default, RTL), English (LTR), and Sorani Kurdish (RTL). Dynamic language switching via navbar/hero buttons *without* page reloads.
2. **Hero Section:** Parallax background effect, dynamic particle canvas overlay (Micro-animations), and brand logo/info.
3. **Sticky Category Navigation:** 
   - A horizontal, scrollable frozen-glass tab bar that sticks to the top of the viewport.
   - Use `IntersectionObserver` to automatically track scrolling and highlight the active menu category tab dynamically.
4. **Excellence Carousel:** A premium auto-scrolling hero carousel for featured/exclusive dishes with side navigation buttons and pagination dots. Pauses on hover.
5. **Real-time Search:** Expandable search bar that filters dish cards instantly by matching names across all three languages. Shows "No results" if blank.
6. **Shopping Cart System:**
   - Slide-out side panel cart with a dark backdrop overlay.
   - Add/Remove items, increase/decrease quantities.
   - Persist cart data across sessions using `sessionStorage` (or `localStorage`).
   - Floating cart icon/badge on the navbar with a CSS "pop" animation when an item is added.
7. **Dish Details Modal:**
   - Opens when a dish card is clicked.
   - Displays HD image, localized name, formatted price (IQD), "Story of the Dish" description, quantity selector, and "Add to Cart".
   - **Accessibility:** Must trap keyboard focus inside the modal when open and close on 'Escape'.
8. **Toast Notifications:** Brief pop-up alerts (e.g., "Added to cart") that auto-dismiss.

### 3. UI/UX & Aesthetics (Luxury & Premium)
- **Theme:** High-end, premium feel. Vibrant imagery, smooth gradients, and glassmorphism (frosted glass) effects on the sticky navbar and modals.
- **Typography:** Modern Google Fonts (e.g., *Playfair Display* for classy headings, *Inter* for clean body text).
- **Animations:** Smooth CSS transitions for hover states, CSS visual reveals on scroll (`IntersectionObserver` adding a `.revealed` class), and micro-animations for buttons.

### 4. Technical Problems Solved & Best Practices (MANDATORY)
- **DOM Rendering Optimization:** Use `DocumentFragment` to batch DOM insertions when rendering the menu recursively. Group dishes by category in a single pass to eliminate unnecessary reflows.
- **Memory Efficiency:** Use **Event Delegation** on the main menu container for dish clicks and cart interactions. Do *not* attach individual event listeners to hundreds of dish cards.
- **Advanced Scroll Tracking:** Use `IntersectionObserver` with a carefully calculated `rootMargin` (e.g., `-120px 0px -60% 0px`) to track which category section is currently in view, ensuring smooth tracking even for very tall or very short sections.
- **Accessibility (a11y):** Implement ARIA roles (`role="tablist"`, `aria-expanded`, etc.), `translate="no"` on specific brand identifiers, and focus trapping functions for the modals.
- **PWA Integrity:** Properly configure the service worker to cache core assets but implement cache-busting or network-first strategies for menu data to prevent "blank page" bugs on updates.

### 5. File Structure to Generate
Please generate the following files with complete, production-ready code. Ensure all JS logic is rigorously implemented as described:
1. `index.html` (Semantic, accessible HTML structure)
2. `style.css` (CSS variables, BEM, responsive queries, keyframes)
3. `menu-data.js` (Provide robust mock data with at least 3 categories and 6 dishes to demonstrate structure)
4. `i18n.js` (Complete translation state manager and dictionary)
5. `script.js` (All rendering functions, observers, event delegation, carousel timers, cart logic, and search filtering)
6. `manifest.json` & `sw.js` (PWA Service worker setup)

Provide the code sequentially, starting with the HTML and CSS. Do not use placeholders for main logic; ensure the event delegation and intersection observers are fully written out.
