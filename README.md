# ✈️ Dynamic Flight Site PoC (Angular + CMS)

Proof of concept for a **dynamic flight booking website** built with **Angular**. Each page is assembled at runtime from a **declarative configuration** (simulating a CMS like Umbraco).

---

## 🚀 Features

- ✨ Dynamic architecture driven by configuration (`assets/config-site`)
- 📄 Page composition via reusable blocks
- 📍 Dynamic routing based on JSON site config
- ⚡ Route-level lazy loading (`loadComponent`) for dynamic pages
- ⚡ Block-level lazy loading with dynamic `import()` per CMS component
- 🚦 Route asset preloading guard to reduce navigation flicker
- 🛫 Initial boot loader (plane GIF) rendered from `index.html`
- 🎯 Visual components styled with Bootstrap 5 + custom Avianca UI
- 🌍 i18n with per-language site configs (ngx-translate)
- 🔎 SEO service with dynamic title, description, canonical, Open Graph/Twitter tags, and robots policy by page/language
- 🧭 Language-aware navigation using `pageId` → path mapping
- 🧭 Centralized navigation service (`PageNavigationService`) for `pageId` and direct-path navigation
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
- 🔗 Main header top navigation wired to real external URLs (opens in new tab)
- 🔄 Home logo + Home menu option + Thank You CTA can be configured to force full page reload

---

## 📁 Project Structure

```
server/
└── index.js                     # Booking flow API (token + steps)
public/
├── favicon-32x32.png
├── favicon.png
├── robots.txt
└── sitemap.xml                  # Public static assets
apache/
└── .htaccess                    # Optional Apache config
src/
├── app/
│   ├── app.component.ts
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── component-map.ts         # Maps block names to lazy component loaders
│   ├── dynamic-composite/
│   │   ├── dynamic-blocks/
│   │   │   ├── dynamic-blocks.component.ts
│   │   │   └── dynamic-blocks.component.html
│   │   └── dynamic-page/
│   │       ├── block-outlet.component.ts
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
│   │   │   ├── lounge-selection/
│   │   │   ├── loyalty-card/
│   │   │   ├── main-footer/
│   │   │   ├── main-header/
│   │   │   ├── extra/
│   │   │   ├── baggage-selection/
│   │   │   ├── assist-selection/
│   │   │   ├── payment/
│   │   │   ├── personal-data/
│   │   │   ├── priority-selection/
│   │   │   ├── results/
│   │   │   ├── search/
│   │   │   ├── seat-selection/
│   │   │   ├── sports-selection/
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
│   │   ├── progress-async.guard.ts
│   │   └── route-assets-preload.guard.ts
│   └── services/
│       ├── booking-progress/
│       ├── page-navigation/
│       ├── router-helper/
│       ├── seo/
│       └── site-config/
├── environments/
│   ├── environment.ts            # Development config (boot loader min: 0ms)
│   └── environment.prod.ts       # Production config (boot loader min: 1000ms)
├── assets/
│   ├── config-site/              # CMS-like JSON site config
│   ├── i18n/                      # Translations (en/es/fr/pt)
│   ├── illustrations/             # UI SVGs (extras, payment)
│   └── loader/                    # Local boot loader GIF
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
# Install client deps
npm install

# Install API deps (server uses Express)
npm install express cors uuid

# Terminal 1: booking flow API (port 3000)
node server/index.js

# Terminal 2: Angular app (port 4200)
npm start
```

Then visit:
📍 [http://localhost:4200](http://localhost:4200)

API runs on:
📍 http://localhost:3000

---

## ✅ Useful Scripts

```bash
npm start         # Dev server
npm run build     # Production build
npm run watch     # Development build in watch mode
npm test          # Unit tests (Karma)
npm run lint      # ESLint for TS/HTML
npm run lint:styles # Stylelint for SCSS/CSS
npm run format    # Prettier formatting
```

---

## 🧰 How it Works

1. JSON files in `assets/config-site/` define the site's structure, routing, and tabs per language. Page IDs are consistent across languages to enable language-aware navigation.
2. `AppComponent` builds routes from config and uses route-level lazy loading (`loadComponent`).
3. `route-assets-preload.guard.ts` preloads required dynamic blocks before route activation to avoid flicker.
4. `DynamicPageComponent` renders page rows/cols dynamically via `block-outlet`, and each block resolves from `component-map.ts` using lazy imports with cache.
5. Booking progress is tracked locally and validated against the API on port 3000.
6. `SeoService` updates metadata per page transition (title, description, canonical, OG/Twitter and robots).

---

## 🧭 Navigation Service

- `PageNavigationService` centralizes route resolution by `pageId` and language.
- `navigateByPageId(pageId, lang?, external?, targetBlank?, queryParams?)` resolves path from config and navigates internally (SPA) by default.
- `navigateByPath(path, external?, targetBlank?, queryParams?)` navigates with a direct path.
- `queryParams` accepts key/value pairs and appends them to the final URL.
- Query params are applied for internal SPA navigation, external same-tab navigation, and target-blank navigation.
- `external = true` forces full page reload in the same tab.
- `targetBlank = true` opens a new tab/window and is independent from `external`.
- In header menu items, external-link icon is shown only when `targetBlank = true`.
- If a `pageId` is not found in config, fallback route is `/en/home`.

---

## 🛫 Initial Loader

- The first paint loader is rendered directly in `src/index.html` (outside Angular) for immediate display.
- Loader image is served locally from `src/assets/loader/plane-loader.gif`.
- `AppComponent` removes `#boot-loader` after the first navigation event is completed.
- The minimum display time is environment-based:
  - `development`: `0ms` (`src/environments/environment.ts`)
  - `production`: `1000ms` (`src/environments/environment.prod.ts`)

---

## 🏗️ Build Configurations

- `npm start` / `ng serve` uses the `development` build target.
- `ng build` uses `production` by default (`build.defaultConfiguration = production` in `angular.json`).
- You can force development build output with:

```bash
ng build --configuration development
```

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
