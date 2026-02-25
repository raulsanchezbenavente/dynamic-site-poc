# ✈️ Dynamic Flight Site PoC (Angular + CMS)

Proof of concept for a **dynamic flight booking website** built with **Angular**. Each page is assembled at runtime from a **declarative configuration** (simulating a CMS like Umbraco).

---

## 🚀 Features

- ✨ Dynamic architecture driven by configuration (`assets/config-site`)
- 📄 Page composition via reusable blocks
- 📍 Dynamic routing based on JSON site config
- 💤 Lazy block loading via dynamic component imports
- 🎯 Visual components styled with Bootstrap 5 + custom Avianca UI
- 🌍 i18n with per-language site configs (ngx-translate)
- 🧭 Language-aware navigation using `pageId` → path mapping
- 🧭 Booking flow guard with local progress + API token
- 🗓️ Selectable date carousel in results
- 🗺️ Results page localized (EN/ES/FR/PT)
- ✅ Full flow: search → results → personal data → extras → payment → thank you
- 🧩 Extras modals: seat, baggage, lounges, sports equipment, assistance, priority boarding
- 🔒 Modal body scroll lock for extras
- ⌨️ ESC closes extras modals
- 📱 Mobile-friendly modals (responsive images, seat map without scroll on small screens, safe viewport spacing)
- 🧭 Booking header stepper with active state (responsive for small screens)
- 🧾 Booking footer summary (itinerary, passengers, total, CTA)
- 🌐 Booking header/footer mapped in config-site for all locales (EN/ES/FR/PT)
- 💳 Payment methods: card, PayPal, Apple Pay, Google Pay
- 🎨 Custom SVG illustrations for extras and payments (non-official logos)
- ⚡ Demo autofill on double click (desktop) / double tap (mobile) for search, personal data, and payment

---

## 📁 Project Structure

```
server/
└── index.js                     # Booking flow API (token + steps)
public/
└── favicon.png                  # Static assets
apache/
└── .htaccess                    # Optional Apache config
src/
├── app/
│   ├── app.component.ts
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── component-map.ts         # Maps block names to Angular components
│   ├── dynamic-composite/
│   │   ├── block-outlet/
│   │   │   ├── block-outlet.component.ts
│   │   │   ├── block-outlet.component.html
│   │   │   └── block-outlet.component.scss
│   │   ├── dynamic-blocks.component.ts
│   │   ├── dynamic-blocks.component.html
│   │   └── dynamic-page/
│   │       ├── dynamic-page.component.ts
│   │       ├── dynamic-page.component.html
│   │       └── models/
│   │           └── page-layout-models.ts
│   ├── dynamic-composite/dynamic-tabs/
│   │   ├── tabs.component.ts
│   │   ├── tabs.component.html
│   │   ├── tabs.component.scss
│   │   └── models/
│   │       └── cms-tab-contract.model.ts
│   ├── fake-blocks-components/
│   │   ├── avianca/
│   │   │   ├── account-settings/
│   │   │   ├── account-profile/
│   │   │   ├── ads/
│   │   │   ├── elite-status/
│   │   │   ├── find-bookings/
│   │   │   ├── loyalty-card/
│   │   │   ├── main-footer/
│   │   │   ├── main-header/
│   │   │   ├── results/
│   │   │   ├── search/
│   │   │   ├── personal-data/
│   │   │   ├── extra/
│   │   │   ├── seat-selection/
│   │   │   ├── baggage-selection/
│   │   │   ├── lounge-selection/
│   │   │   ├── sports-selection/
│   │   │   ├── assist-selection/
│   │   │   ├── priority-selection/
│   │   │   ├── payment/
│   │   │   └── thank-you/
│   │   └── test/
│   │       ├── banner.component.ts
│   │       ├── search.component.ts
│   │       ├── results.component.ts
│   │       ├── baggage-selection.ts
│   │       ├── seatmap.component.ts
│   │       ├── payment-methods.component.ts
│   │       ├── payment-success.component.ts
│   │       └── footer.component.ts
│   ├── guards/
│   │   ├── progress.guard.ts
│   │   └── progress-async.guard.ts
│   └── services/
│       ├── booking-progress/
│       ├── router-helper/
│       └── site-config/
├── assets/
│   ├── config-site/              # CMS-like JSON site config
│   ├── i18n/                      # Translations (en/es/fr/pt)
│   └── illustrations/             # UI SVGs (extras, payments)
└── styles.scss
```

---

## 🧪 Requirements

- Node.js (v18+ recommended)
- npm (comes with Node)
- Angular CLI (`npm install -g @angular/cli`)

---

## 🛠️ Installation

```bash
git clone https://github.com/your-user/dynamic-site-poc.git
cd dynamic-site-poc
npm install
```

---

## ▶️ Run the App

```bash
# Terminal 1: booking flow API (port 3000)
node server/index.js

# Terminal 2: Angular app (port 4200)
npm start
```

Then visit:
📍 [http://localhost:4200](http://localhost:4200)

API runs on:
📍 http://localhost:3000

> If you see missing module errors when starting the API, install the server deps:
> `npm install express cors uuid`

---

## 🧰 How it Works

1. JSON files in `assets/config-site/` define the site's structure, routing, and tabs per language. Page IDs are consistent across languages to enable language-aware navigation.
2. `DynamicPageComponent` renders pages dynamically via `block-outlet` with lazy-loaded block components.
3. Booking progress is tracked locally and validated against the API on port 3000.

---

## 📄 Pages Overview

- **Home / Search**: landing page with header, banner, and the flight search form.
- **Results**: shows available flight options, fare cards, and a selectable date carousel (localized).
- **Personal data**: traveler and holder details with validation.
- **Extras**: seat, baggage, lounges, sports equipment, assistance, and priority boarding (modals).
- **Payment**: card, PayPal, Apple Pay, Google Pay.
- **Thank you**: confirmation state and CTA.

---

## 📦 Potential Improvements

- Real CMS integration (Umbraco Delivery API, Contentful, etc.)
- Shared service to persist selections (search, baggage, seat)
- i18n improvements (validation/translation automation)
- Page transition animations

---

## 📝 License

MIT © raulshred
