# Tala Restaurant & Café 🍽️

A modern, interactive digital menu website for **Tala Restaurant & Café** — located in Fallujah, Anbar, Iraq.

## 🌐 Live Preview

Open `index.html` in any browser, or run the dev server:

```bash
npm run dev
```

Then visit: `http://localhost:3000`

---

## 📁 Project Structure

```
مطعم تالة/
├── index.html       # Main HTML page
├── style.css        # Full stylesheet (luxury dark theme)
├── script.js        # All interactivity & rendering logic
├── menu-data.js     # Menu categories & dishes (edit this to update the menu)
├── images/
│   ├── logo.png     # Restaurant logo
│   └── hero-bg.png  # Hero section background
└── package.json
```

---

## ✨ Features

- **Full interactive menu** — categories, dish cards, search
- **Dish detail modal** — image, description, quantity selector
- **Shopping cart** — add/remove items, live total
- **Smooth animations** — hero parallax, particle canvas, scroll effects
- **Fully responsive** — mobile, tablet, and desktop
- **Easy to update** — edit `menu-data.js` only to add/remove dishes

---

## 🍴 Menu Categories

| Category | Icon |
|----------|------|
| Grills | 🔥 |
| Eastern Dishes | 🍲 |
| Western Dishes | 🍽️ |
| Beverages | 🥤 |
| Juices | 🍹 |
| Vegetables | 🥬 |
| Desserts | 🍰 |
| Coffee | 🍵 |

---

## 📞 Contact

- **Phone:** 0784-988-4433 / 0774-988-4433
- **Location:** Fallujah, Anbar — Near the Suspension Bridge
- **Google Maps:** [View on Maps](https://maps.app.goo.gl/PAYF5MqiZDENgYCg9)

---

## 🚀 How to Add a New Dish

Open `menu-data.js` and add an object to the `dishes` array:

```js
{
  id: 'unique-id',
  name: 'Dish Name',
  category: 'grills',   // must match a category id
  price: 15000,         // price in IQD
  image: 'https://...' // image URL or local path
  description: 'A short description of the dish.',
},
```

---

## 🛠️ Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- No frameworks, no dependencies
- Google Fonts (Playfair Display + Inter)

---

© 2026 Tala Restaurant & Café. All rights reserved.
