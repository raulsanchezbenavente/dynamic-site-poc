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

```text
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

## ⚡ Quickstart (Recommended)

### 🖱️ One-Click Installation & Launch

The easiest way to get started is to **double-click** the installer script for your operating system. This will:

1. ✅ Install all dependencies automatically (only if needed)
2. ⚙️ Choose launcher mode from a boolean toggle in `build-launcher-and-run.js`
3. 🚀 Run the selected flow (dev `launcher:open` or build+run executable)

From the repository root, double-click the appropriate file:

| OS          | File                             | Action                                             |
| ----------- | -------------------------------- | -------------------------------------------------- |
| **Windows** | `install-and-launch-windows.bat` | Double-click to run                                |
| **macOS**   | `install-and-launch-mac.command` | Double-click to run                                |
| **Linux**   | `install-and-launch-linux.sh`    | Double-click or `bash install-and-launch-linux.sh` |

The Launcher UI opens automatically and provides:

- 📋 One-click script execution (API, Angular dev server, proxy, etc.)
- 📊 Real-time logs for each script
- ⭐ Favorite scripts for quick access
- 🛑 Easy stop/restart controls

Build behavior in one-click mode:

- 🧠 Smart dependency install: runs `npm install` only when `package.json` / `package-lock.json` changes or `node_modules` is missing
- 🔀 Selectable flow via `USE_DEV_LAUNCHER_OPEN_FLOW` in `build-launcher-and-run.js`:
  - `true`: runs `npm run launcher:open` (development launcher mode)
  - `false`: uses smart build+run executable flow (with build cache metadata)
- ⚡ Smart launcher rebuild (build mode only): the first successful build stores launcher metadata, and later runs reuse the existing artifact when launcher sources are unchanged
- 🪟 Windows-specific safe output (build mode only): when rebuilding on Windows, uses `dist-electron/runs/win-<timestamp>/` to avoid locked-file conflicts

**Terminal close behavior:**

- ✅ Success: Auto-closes terminal after 5 seconds
- ❌ Error: Stays open so you can read error details
- 💡 macOS tip: Set Terminal profile option `When the shell exits` to `Close if the shell exited cleanly`

---

## 🛠️ Manual Installation (Alternative)

If you prefer command-line setup:

```bash
git clone https://github.com/your-user/dynamic-site-poc.git
cd dynamic-site-poc
npm install
```

---

## ▶️ Manual App Launch (Alternative)

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
📍 [http://localhost:3000](http://localhost:3000)

SEO proxy shell runs on:
📍 [http://localhost:4300](http://localhost:4300)

---

## ✅ Useful Scripts

### Development Scripts

```bash
npm run start:serve       # Dev server (port 4200)
npm run start:api         # Booking flow API (port 3000)
npm run start:backend     # Backend server (port 3000)
npm run start:proxy       # SEO proxy shell (port 4300)
npm run start:serve-proxy # Angular + proxy concurrently (recommended)
npm run build             # Production build
npm run watch             # Development build in watch mode
npm run test              # Unit tests (Karma)
npm run lint              # ESLint for TS/HTML
npm run lint:styles       # Stylelint for SCSS/CSS
npm run format            # Prettier formatting
```

### Launcher Scripts

For launcher builds and deployment, see **🚀 Electron Launcher** section below.

```bash
npm run launcher:open         # Open Electron launcher in dev mode
npm run launcher:build:run    # Build or reuse current-OS launcher, then run
npm run launcher:build:win    # Build Windows installer (NSIS)
npm run launcher:build:mac    # Build macOS (DMG + ZIP)
npm run launcher:build:linux  # Build Linux (AppImage + DEB)
npm run launcher:build:all    # Build all OS targets
```

---

## 🚀 Electron Launcher

### What is it?

An interactive **GUI launcher** (built with Electron) that lets you run all npm scripts without opening a terminal. Simply double-click `install-and-launch-mac.command` (macOS), `install-and-launch-linux.sh` (Linux), or `install-and-launch-windows.bat` (Windows) to install dependencies and run the configured launcher flow automatically.

### Select One-Click Flow (New)

In `build-launcher-and-run.js`, configure this constant:

```js
const USE_DEV_LAUNCHER_OPEN_FLOW = true;
```

To switch launcher mode between **dev** and **prod/build**, change only this constant in `build-launcher-and-run.js`.

- `true` → one-click scripts run `npm run launcher:open` (development mode)
- `false` → one-click scripts keep the previous smart build-and-run executable behavior

This keeps both flows in code, so you can switch by changing only one boolean value.

### Launcher Features

- 📋 **Script Management**: List and execute any npm script with one click
- ▶️ **Start/Stop**: Launch or stop running scripts easily
- 📊 **Real-time Logs**: Stream output from each script in dedicated tabs
- ↔️ **Drag & Drop Tabs**: Reorder script/session log tabs by dragging (order is persisted)
- ⭐ **Favorites**: Mark/unmark scripts directly from the UI; favorites are persisted locally
- 🔎 **Script Filters**: Filter by Running and Favorites with persisted state across relaunches
- 🎯 **Project Source Switching**: Change between dev/prod/custom project sources
- 🖥️ **Interactive Terminal Sessions**: Create Session tabs with isolated working directory and history
- 🪟 **Windows Terminal Type Selector**: Choose `cmd`, `powershell`, `pwsh`, or `git-bash` for new sessions (selection is persisted)
- 🧭 **Per-Session Shell Identity**: Session tabs show shell type icon and each session executes in its selected shell
- 🧷 **Session Quick Actions**: Toolbar button to close the active terminal session (same behavior as the tab close `x`)
- ➕ **Updated Session Icons**: New Session uses a larger `+`, and Close Session uses a larger plain `x` icon (without box outline) for better legibility
- 📐 **Taller Workspace Panels**: Scripts and Terminal panels use a taller layout to show more content with less scrolling
- ⌨️ **Terminal Autocomplete**: Use `Tab` to complete and cycle suggestions, `Shift+Tab` to cycle backward
- 🔠 **Terminal Font Size Controls**: Increase, decrease, or reset terminal font size directly from the toolbar (persisted between launches)
- 🎨 **Terminal Theme Selector**: Switch terminal colors from the launcher (Light, Tokion Night Light, Solarized Light, Red, Ocean, Solarized Dark, Kimbie Dark, Dark). The selected theme is saved locally.
- � **Terminal Fullscreen**: Expand the terminal panel to fill the whole app; icon changes to indicate collapse
- �🛑 **Zero Terminal Usage**: Everything via the Launcher UI—no command-line needed

### Terminal Sessions in Launcher

- Use **New Terminal** in the launcher to create independent Session tabs.
- Each session keeps its own current directory (`cwd`) and command history.
- Built-in command handling supports directory navigation (`cd`) without leaving the launcher.
- Built-in command handling supports `clear` and `cls` to clear the current session output.
- **Send SIGINT button behavior**: Enabled on terminal session tabs and disabled on script tabs or the `all` tab.
- Press `Tab` for autocomplete suggestions and `Shift+Tab` to go in reverse.
- `Ctrl + C` respects copy behavior: if text is selected, it copies selection; if nothing is selected and a terminal session is running, it sends interrupt.
- Closing a session tab stops active child processes for that session.
- Press the **Expand** button (right of the theme selector) to make the terminal panel fill the app. Press it again to return to the split layout. The expanded/collapsed state is saved and restored automatically on next launch.

### Launcher Shortcuts

- `Ctrl + S`: Refresh scripts list
- `Ctrl + N`: Create new terminal session
- `Ctrl + Q`: Close active terminal session
- `Ctrl + D`: Clear current logs view
- `Ctrl + X`: Send SIGINT to active terminal session
- `Ctrl + Enter`: Toggle terminal fullscreen
- `Ctrl + +`: Increase terminal font size
- `Ctrl + -`: Decrease terminal font size
- `Ctrl + 0`: Reset terminal font size

### Tab Ordering

- Log tabs (scripts and terminal sessions) can be reordered via drag and drop.
- The tab order is saved in local storage and restored on next launcher start.
- The `all` tab remains fixed at the beginning.

### macOS Dev Icon Note

- In dev mode (`npm run launcher:open`), the launcher applies a custom app icon for Dock/App Switcher.
- The launcher tries `electron-launcher/assets/avianca-icon.icns` first and falls back to `electron-launcher/assets/avianca-icon.png` if needed.

### Build & Deploy the Launcher

```bash
# Quick build + run for your current OS
npm run launcher:build:run

# Build specific targets
npm run launcher:build:win      # Windows (NSIS installer)
npm run launcher:build:mac      # macOS (DMG + ZIP)
npm run launcher:build:linux    # Linux (AppImage + DEB)

# Build all OS targets
npm run launcher:build:all
```

Output artifacts:

- `npm run launcher:build:run`:
  - Windows: `dist-electron/runs/win-<timestamp>/win-unpacked/Dynamic Site Launcher.exe`
  - macOS: `dist-electron/mac/*.app` (or latest cached artifact if unchanged)
  - Linux: `dist-electron/*.AppImage` or `dist-electron/linux-unpacked/` (or latest cached artifact if unchanged)
- `npm run launcher:build:win`:
  - Executable: `dist-electron/win-unpacked/Dynamic Site Launcher.exe`
  - Installer: `dist-electron/Dynamic Site Launcher Setup <version>.exe`

### How the Install Scripts Work

The double-click installers at the repo root handle everything:

1. ✅ **Check Dependencies**: Compares `package.json` + `package-lock.json` fingerprint
1. 📦 **Smart Install**: Runs `npm install` only if needed (or if `node_modules` is missing)
1. 🔀 **Flow Switch**: Reads `USE_DEV_LAUNCHER_OPEN_FLOW` in `build-launcher-and-run.js`
1. 🚀 **Auto-Launch**: If `true`, runs `npm run launcher:open`; if `false`, applies smart build decision (reuse existing launcher if unchanged, otherwise build for current OS) and launches executable
1. ⏱️ **Auto-Exit**: Terminal closes after 5 seconds on success (or stays open on error)

**Tip for macOS**: Set Terminal preference `When the shell exits` to `Close if the shell exited cleanly` for seamless auto-close.

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
