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
- 🧠 Optional SEO proxy shell (`server/index-proxy.js`) that renders dynamic SEO tags on the server using `src/index.html` as template
- 📊 Optional dynamic analytics scripts injection in proxy mode via `<!-- DYNAMIC_ANALYTICS_SCRIPTS -->` placeholder
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
├── api.js                     # Booking flow API (token + steps)
├── index-proxy.js               # Composition root for index proxy (port 4300)
└── index-rendering/
  ├── analytics-provider.js    # Reads analytics scripts from src/assets/analytics/scripts
  ├── index-renderer.js        # Applies dynamic replacements over src/index.html template
  ├── proxy-middleware.js      # HTML-vs-asset routing and pass-through proxy to Angular dev server
  └── seo-renderer.js          # Resolves page SEO from config-site and renders SEO tags
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
# Install deps
npm install

# Terminal 1: booking flow API (port 3000)
npm run start:api

# Terminal 2: Angular app (port 4200 by default)
npm run start:serve

# Terminal 3 (optional): SEO proxy shell (port 4300)
npm run start:proxy

# Optional: start Angular + proxy together
npm run start:serve-proxy
```

Then visit:
📍 [http://localhost:4200](http://localhost:4200)

API runs on:
📍 http://localhost:3000

SEO proxy shell runs on:
📍 http://localhost:4300

---

## ✅ Useful Scripts

```bash
npm run start:serve # Dev server
npm run start:api # Booking flow API server (port 3000)
npm run start:backend # Backend server (port 3000)
npm run start:proxy # SEO proxy shell (port 4300)
npm run start:serve-proxy # Angular + proxy concurrently
npm run build     # Production build
npm run watch     # Development build in watch mode
npm test          # Unit tests (Karma)
npm run lint      # ESLint for TS/HTML
npm run lint:styles # Stylelint for SCSS/CSS
npm run format    # Prettier formatting
npm run launcher:open # Open Electron launcher in dev mode
npm run launcher:build # Build Windows launcher
npm run launcher:build:win # Build Windows launcher (NSIS)
npm run launcher:build:mac # Build macOS launcher (DMG + ZIP)
npm run launcher:build:linux # Build Linux launcher (AppImage + DEB)
npm run launcher:build:all # Build all launcher targets
npm run launcher:build:run # Install deps + build for current OS + run built launcher
```

---

## 🚀 Electron Launcher

This project includes an **Electron launcher** for Windows, macOS, and Linux.

Launcher UI highlights:

- Favorite scripts are marked with a yellow star icon (`★`) for quick identification.
- Current default favorites: `build`, `start:serve-proxy`, `start:backend`.

Build commands:

```bash
# Windows (NSIS)
npm run launcher:build:win

# macOS (DMG + ZIP)
npm run launcher:build:mac

# Linux (AppImage + DEB)
npm run launcher:build:linux
```

Cross-platform one-click build + run:

```bash
npm run launcher:build:run
```

Double-click launchers (repo root):

- macOS: `install-and-launch-mac.command`
- Linux: `install-and-launch-linux.sh`
- Windows: `install-and-launch-windows.bat`

What this automation does:

1. Runs `npm install`.
2. Executes the OS-specific launcher build command:
  - Windows: `npm run launcher:build:win`
  - macOS: `npm run launcher:build:mac`
  - Linux: `npm run launcher:build:linux`
3. Starts the generated launcher executable automatically.

Output files are generated in `dist-electron/`.

Examples:

- Windows executable: `dist-electron/win-unpacked/Dynamic Site Launcher.exe`
- macOS app bundle: `dist-electron/mac/Dynamic Site Launcher.app`
- Linux unpacked app: `dist-electron/linux-unpacked/`

Note: `dist-electron/` is a generated artifacts folder and is ignored by git.

---

## 🧰 How it Works

1. JSON files in `assets/config-site/` define the site's structure, routing, and tabs per language. Page IDs are consistent across languages to enable language-aware navigation.
2. `AppComponent` builds routes from config and uses route-level lazy loading (`loadComponent`).
3. `route-assets-preload.guard.ts` preloads required dynamic blocks before route activation to avoid flicker.
4. `DynamicPageComponent` renders page rows/cols dynamically via `block-outlet`, and each block resolves from `component-map.ts` using lazy imports with cache.
5. Booking progress is tracked locally and validated against the API on port 3000.
6. `SeoService` updates metadata per page transition (title, description, canonical, OG/Twitter and robots).

---

## 🌐 SEO Proxy Mode

`server/index-proxy.js` is the composition root for the proxy and wires specialized modules under `server/index-rendering/`.

Responsibilities are split as follows:

- `seo-renderer.js`: reads `src/assets/config-site/*`, resolves page metadata by request path, and returns `<title>` + SEO tags.
- `analytics-provider.js`: reads analytics snippet content from `src/assets/analytics/scripts`.
- `index-renderer.js`: uses `src/index.html` as template and applies dynamic replacements.
- `proxy-middleware.js`: serves rendered HTML for document navigation and proxies assets/chunks to Angular dev server (`http://localhost:4200`).

`index-renderer.js` injects/replaces:

- `<title>` based on page SEO config.
- `<!-- DYNAMIC_ANALYTICS_SCRIPTS -->` placeholder with the raw contents of `src/assets/analytics/scripts`.
- `<!-- DYNAMIC_SEO_TAGS_SSR -->` placeholder with meta/link tags (description, robots, canonical, alternates, OG, Twitter).
- `<meta name="enable-dynamic-seo" content="false" />` when serving through proxy/backend, so front-side SEO rewriting is disabled while server SEO is already applied.
- `<link rel="stylesheet" href="styles.css">` to ensure global styles (including Bootstrap) are loaded in proxy mode.
- Keeps module script tags provided by Angular dev server and only falls back to `<script src="main.js" type="module"></script>` when needed.

Notes:

- The analytics file is read on each HTML request while running the proxy, so changes to `src/assets/analytics/scripts` are reflected without rebuilding.
- If `src/assets/analytics/scripts` does not exist, the analytics placeholder is replaced with an empty string.

For non-document requests (assets/chunks), it proxies directly to Angular dev server on `http://localhost:4200`.

---

## 🧾 About Inline CSS in dist/index.html

In production builds (`dist/dynamic-site/browser/index.html`), Angular may inline critical CSS in a `<style>` block (you may see `data-beasties-container`).

This is expected optimization behavior:

- Improves first paint by inlining critical styles.
- Defers the full stylesheet via generated `styles-*.css` link.
- `dist/` files are generated artifacts and should not be edited manually.

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

- `npm run start:serve` / `ng serve` uses the `development` build target.
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
