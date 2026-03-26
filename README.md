# ✈️ Dynamic Flight Site PoC (Angular + CMS)

Proof of concept for a **dynamic flight booking website** built with **Angular**. Each page is assembled at runtime from a **declarative configuration** (simulating a CMS like Umbraco).

---

## 🚀 Features

- ✨ Dynamic architecture driven by configuration (`assets/config-site`)
- 📄 Page composition via reusable blocks
- 📍 Dynamic routing based on JSON site config
- 🧭 Router initialization centralized in `RouterInitService`
- 🧩 Strict tab contract based on `layout.rows[].cols[]` with span support inside tabs
- ⚡ Route-level lazy loading (`loadComponent`) for dynamic pages
- ⚡ Block-level lazy loading with dynamic `import()` per CMS component
- 🚦 Route asset preloading guard to reduce navigation flicker
- 🛫 Initial boot loader (plane GIF) rendered from `index.html`
- 🎯 Visual components styled with Bootstrap 5 + custom Avianca UI
- 🌍 i18n with per-language site configs (ngx-translate)
- 🌍 i18n language switch hardened to preload target translations before navigation to reduce UI flicker
- 🔎 SEO service with dynamic title, description, canonical, Open Graph/Twitter tags, and robots policy by page/language
- 🧠 Optional SEO proxy shell (`server/index-proxy.js`) that renders dynamic SEO tags on the server using `src/index.html` as template
- 📊 Optional dynamic analytics scripts injection in proxy mode via `<!-- DYNAMIC_ANALYTICS_SCRIPTS -->` placeholder
- 🌐 Fake SSO login form localization (EN/ES/FR/PT) with language detection from OIDC params and redirect path
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
- 🎨 Loyalty card resolves per-page config from `assets/config-site`, loads its tone from `assets/config/loyalty/{lang}`, and syncs that color with the main header badge/button
- 🛡️ Loyalty card and main header no longer apply a default accent/gradient fallback color when no valid tone is provided
- 🧱 `rte-injector` keeps the last rendered HTML and reuses cached remote fragment content/stylesheet URLs across language switches to reduce flicker and duplicate requests
- 🧩 `rte-injector` config contract supports `string | string[]` for all entries and uses renamed keys in `config-site`: `htmlContent`, `htmlContentURLs`, `styles`, `cssURLs`
- 🎮 Mini-games module: **Icon Hunter** (tap-to-catch with combo scoring) and **Tetris** (classic falling-block puzzle)
- 🧩 Shared `GenericTabsComponent` in `fake-libs` module for reusable tab UIs
- 📐 Dynamic Composite responsive stacking: at `<= 766px` each grid cell expands to full width (rows with multiple columns are stacked)
- 🧱 RTE layout rules in Dynamic Composite: proportional `max-width` by `span` using a 1200px base, mirrored left/right alignment on desktop rows, and full-width centered RTE on mobile
- 🧾 Per-component config contracts moved to dedicated `models` files (e.g., `main-header`, `loyalty-card`, `rte-injector`)
- 🧭 Dangerous goods route slug localized by language while preserving `check-in` prefix (e.g., `es/check-in/articulos-peligrosos`, `fr/check-in/articles-dangereux`, `pt/check-in/artigos-perigosos`)
- 🧭 Main header user menu now includes a localized Dangerous Goods entry (removed previous “Book a flight with LM” item)
- 🎨 Dangerous goods RTE style extraction available at `src/assets/rte-fragments/allowed-cabin/dangerous-goods-extracted.css` (scoped version for fragment rendering)
- 🌍 `allowed-cellar` RTE fragment localized in all supported languages (`en/es/fr/pt`)
- 🌍 `prohibited-luggage` RTE fragment localized in all supported languages (`en/es/fr/pt`)

---

## 📁 Project Structure

```text
server/
├── api.js                     # Booking flow API (token + steps)
├── index-proxy.js             # Composition root for index proxy (port 4300)
└── index-rendering/
    ├── analytics-provider.js  # Reads analytics scripts from src/assets/analytics/scripts
    ├── index-renderer.js      # Applies dynamic replacements over src/index.html template
    ├── proxy-middleware.js    # HTML-vs-asset routing and pass-through proxy to Angular dev server
    └── seo-renderer.js        # Resolves page SEO from config-site and renders SEO tags
public/
├── favicon-32x32.png
├── favicon.png
├── robots.txt
└── sitemap.xml                # Public static assets
apache/
└── .htaccess                  # Optional Apache config
src/
├── app/
│   ├── app.component.ts
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── component-map.ts       # Maps block names to lazy component loaders
│   ├── router-init/
│   │   └── router-init.service.ts # Centralized router initialization orchestration
│   ├── guards/
│   │   └── route-assets-preload.guard.ts
│   └── modules/               # All feature and shared modules
│       ├── dynamic-composite/ # (@dynamic-composite) Dynamic page/block/tabs infrastructure
│       │   ├── dynamic-blocks/
│       │   ├── dynamic-page/
│       │   └── dynamic-tabs/
│       ├── navigation/        # (@navigation) All app services + barrel index
│       │   ├── guards/
│       │   │   ├── progress.guard.ts
│       │   │   └── progress-async.guard.ts
│       │   └── services/
│       │       ├── auth/
│       │       ├── booking-progress/
│       │       ├── page-navigation/
│       │       ├── router-helper/
│       │       ├── seo/
│       │       └── site-config/
│       ├── fake-libs/         # (fake-libs) Shared reusable UI components
│       │   ├── generic-tabs.component.ts
│       │   └── index.ts
│       ├── fake-blocks-avianca/ # (@fake-blocks-avianca) Avianca CMS block components
│       │   ├── account-profile/
│       │   ├── account-settings/
│       │   ├── ads/
│       │   ├── assist-selection/
│       │   ├── baggage-selection/
│       │   ├── booking-footer/
│       │   ├── booking-header/
│       │   ├── elite-status/
│       │   ├── extra/
│       │   ├── find-bookings/
│       │   ├── lounge-selection/
│       │   ├── loyalty-card/
│       │   ├── main-footer/
│       │   ├── main-header/
│       │   ├── payment/
│       │   ├── personal-data/
│       │   ├── priority-selection/
│       │   ├── results/
│       │   ├── search/
│       │   ├── seat-selection/
│       │   ├── sports-selection/
│       │   ├── thank-you/
│       │   └── index.ts
│       ├── fake-blocks-test/  # (@fake-blocks-test) Generic demo block components
│       │   ├── banner.component.ts
│       │   ├── baggage-selection/
│       │   ├── customer-login/
│       │   ├── explanation.component.ts
│       │   ├── footer.component.ts
│       │   ├── header.component.ts
│       │   ├── payment-methods.component.ts
│       │   ├── payment-success.component.ts
│       │   ├── results.component.ts
│       │   ├── search.component.ts
│       │   ├── seatmap.component.ts
│       │   └── index.ts
│       └── games/             # (@games) Mini-games
│           ├── icon-hunter/   # Tap-to-catch icon game with combo scoring
│           ├── tetris/        # Classic falling-block puzzle
│           └── index.ts
├── environments/
│   ├── environment.ts         # Development config (boot loader min: 0ms)
│   └── environment.prod.ts    # Production config (boot loader min: 1000ms)
├── assets/
│   ├── config-site/           # CMS-like JSON site config
│   ├── config/                # Runtime payloads consumed by dynamic blocks
│   ├── i18n/                  # Translations (en/es/fr/pt)
│   ├── illustrations/         # UI SVGs (extras, payment)
│   ├── rte-fragments/         # HTML/CSS fragments consumed by rte-injector (en/es/fr/pt)
│   └── loader/                # Local boot loader GIF
└── styles.scss
```

### Module Aliases (tsconfig `paths`)

| Alias                  | Module                              |
| ---------------------- | ----------------------------------- |
| `@navigation`          | `modules/navigation` (all services) |
| `@dynamic-composite`   | `modules/dynamic-composite`         |
| `@fake-blocks-avianca` | `modules/fake-blocks-avianca`       |
| `@fake-blocks-test`    | `modules/fake-blocks-test`          |
| `@games`               | `modules/games`                     |
| `fake-libs`            | `modules/fake-libs`                 |

> **Note:** Dynamic `import()` paths in `component-map.ts` always use direct relative paths (not aliases) to ensure Webpack creates separate lazy chunks per component.

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
npm run start:serve:bypass # Dev server with fake SSO environment
npm run start:api         # Booking flow API (port 3000)
npm run start:backend     # Backend server (port 3000)
npm run start:proxy       # SEO proxy shell (port 4300)
npm run start:sso-bypass  # Fake local SSO server (port 4500)
npm run start:serve-proxy # Angular + proxy concurrently (recommended)
npm run start:serve-proxy-bypass # Angular bypass + proxy + fake SSO
npm run build             # Production build
npm run watch             # Development build in watch mode
npm run test              # Unit tests (Karma)
npm run lint              # ESLint for TS/HTML
npm run lint:styles       # Stylelint for SCSS/CSS
npm run format            # Prettier formatting
```

### Script Reference

Each script includes a short description in `package.json` under `scriptDescriptions`.
The Electron launcher uses these descriptions as a custom tooltip when you hover or focus a script name.
That tooltip is anchored from the left edge of the script title for easier reading.

| Script                     | Description                                                                |
| -------------------------- | -------------------------------------------------------------------------- |
| `ng`                       | Executes Angular CLI directly.                                             |
| `start:serve`              | Starts Angular dev server with the default environment.                    |
| `start:serve:bypass`       | Starts Angular dev server using the bypass environment (fake SSO setup).   |
| `start:proxy`              | Starts the local index/SEO proxy server on port 4300.                      |
| `start:sso-bypass`         | Starts the fake local SSO/OIDC server on port 4500.                        |
| `start:serve-proxy`        | Runs Angular dev server and proxy together.                                |
| `start:serve-proxy-bypass` | Runs Angular bypass mode, proxy, and fake SSO together.                    |
| `linux:enable-port-443`    | Enables Linux capability to bind port 443 without running the app as root. |
| `build`                    | Builds the Angular application for production.                             |
| `start:backend`            | Starts the backend server entrypoint.                                      |
| `start:api`                | Starts the booking flow API service on port 3000.                          |
| `launcher:open`            | Opens the Electron launcher in development mode.                           |
| `launcher:build:win`       | Builds the Windows launcher installer (NSIS).                              |
| `launcher:build:mac`       | Builds the macOS launcher artifacts (DMG and ZIP).                         |
| `launcher:build:linux`     | Builds Linux launcher artifacts (AppImage and DEB).                        |
| `launcher:build:all`       | Builds launcher artifacts for Windows, macOS, and Linux.                   |
| `launcher:build:run`       | Builds (or reuses) the launcher artifact for the current OS and runs it.   |
| `watch`                    | Builds Angular in watch mode using the development configuration.          |
| `test`                     | Runs unit tests once in headless Chrome.                                   |
| `test:watch`               | Runs unit tests in watch mode.                                             |
| `lint`                     | Runs ESLint on TypeScript and Angular HTML templates.                      |
| `lint:styles`              | Runs Stylelint on SCSS and CSS source files.                               |
| `format`                   | Formats source files with Prettier.                                        |

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

### Fake SSO Login i18n

The fake SSO login page (`/auth/dev-login`) supports localized UI copy for `en`, `es`, `fr`, and `pt`.

Language resolution priority:

1. `ui_locales`
2. `kc_locale`
3. language segment in `redirect_uri` path (for example `/es/...`)
4. `Accept-Language` header
5. fallback to `en`

Translation keys are stored in:

- `server/templates/sso-login.i18n.json`

Template used by the fake SSO login form:

- `server/templates/sso-login.html`

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
- ⭐ **Favorites**: Mark/unmark scripts directly from the UI; favorites are persisted locally. On first launch (when no favorites key exists), defaults are initialized to `start:serve-proxy`, `start:serve-proxy-bypass`, `build`, `start:backend`, and `test`.
- 🔎 **Script Filters**: Filter by Running and Favorites with persisted state across relaunches. On first launch (when no filter-state key exists), the Favorites filter is initialized as enabled.
- 💬 **Script Description Tooltips**: Script names show a custom launcher tooltip (from `scriptDescriptions`) on hover/focus, aligned from the left edge of the title text.
- 🎯 **Project Source Switching**: Change between dev/prod/custom project sources
- 🖥️ **Interactive Terminal Sessions**: Create Session tabs with isolated working directory and history
- 🪟 **Adaptive Terminal Type Selector**: Choose `cmd`, `powershell`, `pwsh`, or `git-bash` for new sessions (selection is persisted). When multiple engines are available, the selector is visually joined with the `+` New Session action; when only one engine is available, the standalone `+` button is shown.
- 🧭 **Per-Session Shell Identity**: Session tabs show shell type icon and each session executes in its selected shell
- 🎨 **ANSI Color Parsing Across Platforms**: Script/session logs render ANSI SGR colors and styles from the real process output (including standard, 256-color, and RGB sequences) instead of hardcoded keyword rules
- ⚡ **Windows Startup Optimizations**: Terminal capability detection is cached to reduce command startup overhead
- 🧷 **Session Quick Actions**: Toolbar button to close the active terminal session (same behavior as the tab close `x`)
- ➕ **Updated Session Icons**: New Session uses a larger `+`, and Close Session uses a larger plain `x` icon (without box outline) for better legibility
- 📐 **Taller Workspace Panels**: Scripts and Terminal panels use a taller layout to show more content with less scrolling
- 💾 **Export Logs to File**: Save the active log tab (script, `All scripts`, or terminal session) with a toolbar button and native save dialog
- 🔔 **Visual Export Feedback**: Export success/errors are shown as non-blocking toast notifications in the launcher UI (visible for 5 seconds)
- 🚪 **Closing State Overlay**: On app exit, a transparent blocker with `Closing launcher...` and a loading icon is shown so users get immediate feedback during shutdown delays
- ⌨️ **Terminal Autocomplete**: Use `Tab` to complete and cycle suggestions, `Shift+Tab` to cycle backward
- 🔠 **Terminal Font Size Controls**: Compact toolbar dropdown with `Aa` indicator and current size value; open it to increase, decrease, or reset terminal font size (persisted between launches)
- 🎨 **Terminal Theme Selector**: Switch terminal colors from the launcher (Light, Tokion Night Light, Solarized Light, Red, Ocean, Solarized Dark, Kimbie Dark, Dark). The selected theme is saved locally.
- 🎛️ **Hover Refresh (Border Accent)**: Launcher button and tab hover feedback uses border/background emphasis (no vertical jump), while semantic actions like Start/Stop keep their green/red identity on hover
- 🖥️ **Terminal Fullscreen**: Expand the terminal panel to fill the whole app; icon changes to indicate collapse
- 💾 **Active Tab Persistence**: The last active log tab is saved to local storage and restored automatically on next launch
- 🧰 **Unclipped Tab Tooltips**: Terminal tab shell tooltips (including the session close `x`) are rendered in a floating portal outside the tabs container so they are never cut by overflow
- 🖱️ **Horizontal Tab Scrolling**: The terminal tabs strip supports horizontal scrolling with mouse wheel/trackpad gestures
- ⌨️ **Keyboard Tab Navigation**: Use `Ctrl + Tab` to move to the next log tab and `Ctrl + Shift + Tab` to move to the previous one
- 🛑 **Zero Terminal Usage**: Everything via the Launcher UI—no command-line needed

### Terminal Sessions in Launcher

- Use **New Terminal** in the launcher to create independent Session tabs.
- Each session keeps its own current directory (`cwd`) and command history.
- Built-in command handling supports directory navigation (`cd`) without leaving the launcher.
- Built-in command handling supports `clear` and `cls` to clear the current session output.
- Git Bash sessions on Windows are launched with a faster startup profile (`--noprofile --norc`) to reduce command latency.
- **Send SIGINT button behavior**: Enabled on terminal session tabs and disabled on script tabs or the `All scripts` tab.
- Press `Tab` for autocomplete suggestions and `Shift+Tab` to go in reverse.
- **`sudo` password support**: when a running command outputs a password prompt (e.g. `sudo`), the terminal input automatically switches to password mode (masked input). Type the password and press Enter or click Run to send it to the process via stdin. Input returns to normal mode once the prompt is gone.
- While a command is running, the terminal input remains editable, but command submission is blocked until the current command finishes (Run button disabled and Enter ignored). The exception is when a `sudo` password prompt is active: in that case Enter and Run are allowed to submit the password.
- Terminal font size defaults to `17.6px` on first launch or after clearing local storage; this matches the value applied by the Reset font button.
- `Ctrl + C` respects copy behavior: if text is selected, it copies selection; if nothing is selected and a terminal session is running, it sends interrupt.
- Closing a session tab stops active child processes for that session.
- Closing the launcher app also stops active terminal session child processes before exit.
- Press the **Expand** button (right of the theme selector) to make the terminal panel fill the app. Press it again to return to the split layout. The expanded/collapsed state is saved and restored automatically on next launch.

### ANSI Colors in Script Logs

- Launcher script logs are rendered from the ANSI escape sequences emitted by each process (`stdout`/`stderr`).
- The launcher forces color-capable environment variables for spawned scripts (for example `FORCE_COLOR`, `CLICOLOR_FORCE`, and npm color settings) so tools do not disable colors just because output is piped.
- ANSI styling remains active for colored lines, including lines that contain URLs.
- URL tokens are normalized when ANSI SGR codes are injected inside the URL itself, so links like `http://localhost:4200/` stay clickable as a single link (host + port).
- When a tool emits plain text without ANSI, launcher shows default stream colors (`stdout`/`stderr`) by theme.

Troubleshooting:

- If a specific script still shows no ANSI colors, that script/tool is likely disabling colors internally; run that command with its own color flag (for example `--color=always`) or set equivalent tool-specific env vars.
- Restart the launcher after changing script/env color settings so new child processes inherit the updated environment.

### Launcher Shortcuts

- `Ctrl + S`: Refresh scripts list
- `Ctrl + N`: Create new terminal session
- `Ctrl + W`: Close active terminal session
- `Ctrl + D`: Clear current logs view
- `Ctrl + E`: Export active logs to file
- `Ctrl + X`: Send SIGINT to active terminal session
- `Ctrl + Tab`: Focus next log tab
- `Ctrl + Shift + Tab`: Focus previous log tab
- `Ctrl + Enter`: Toggle terminal fullscreen
- `Ctrl + +`: Increase terminal font size
- `Ctrl + -`: Decrease terminal font size
- `Ctrl + 0`: Reset terminal font size

### Tab Ordering

- Log tabs (scripts and terminal sessions) can be reordered via drag and drop.
- The tab order is saved in local storage and restored on next launcher start.
- The `All scripts` tab remains fixed at the beginning.

### macOS App Icon

- The launcher uses a custom icon for Dock and App Switcher (`Cmd + Tab`).
- The icon is a rounded macOS-style square with the full blue background and white airplane (`electron-launcher/assets/mac/avianca-icon.icns` / `electron-launcher/assets/mac/avianca-icon.png`).
- In dev mode (`npm run launcher:open`), the icon is applied via `app.dock.setIcon()` using a `nativeImage` built from `electron-launcher/assets/mac/avianca-icon.png` to bypass potential ICNS caching.
- In packaged mode, the icon is embedded in the app bundle (`dist-electron/mac/Dynamic Site Launcher.app/Contents/Resources/icon.icns`).
- The app name shown in `Cmd + Tab` is `Dynamic Site Launcher` when running the packaged executable. In dev mode it shows `Electron` — this is a macOS limitation: the app switcher name is taken from the bundle metadata, which belongs to the generic Electron binary, and cannot be overridden in JS at runtime.

### Windows App Icon

- The Windows build icon is configured from `electron-launcher/assets/windows/avianca-icon.png` (see `package.json` > `build.win.icon`).

### Linux App Icon

- The Linux build/runtime icon is configured from `electron-launcher/assets/linux/avianca-icon.png`.

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
2. Tabs now use the same layout contract as pages: each tab declares `layout.rows[].cols[]`, so nested tab content supports the same `span` behavior as normal page composition.
3. `RouterInitService` (invoked by `AppComponent`) builds routes from config and uses route-level lazy loading (`loadComponent`).
4. `route-assets-preload.guard.ts` preloads required dynamic blocks before route activation to avoid flicker.
5. `DynamicPageComponent` renders page rows/cols dynamically via `block-outlet`, and each block resolves from `component-map.ts` using lazy imports with cache.
6. `DsTabsComponent` renders tab layouts with the same row/column grid as page layouts, including per-column spans.
7. Booking progress is tracked locally and validated against the API on port 3000.
8. `SeoService` updates metadata per page transition (title, description, canonical, OG/Twitter and robots).
9. Some blocks also fetch runtime payloads outside the main site config. Example: `loyaltyOverviewCard_uiplus` resolves its block config by `pageId` + language, fetches `/assets/config/loyalty/{lang}`, and publishes the resulting tone through `LoyaltyToneService` so the main header stays visually aligned.
10. Language-switch rendering is hardened to reduce flicker: loyalty/header keep the previous valid tone until fresh data is available, and `rte-injector` keeps previously fetched remote HTML visible while localized fragments are being refreshed.

---

## 🧩 Tabs Contract

- Tab content is defined strictly with `layout.rows[].cols[]`.
- The previous `tab.components` shape is no longer supported.
- Each tab column supports the same `span` semantics as page layout columns.

Example:

```json
{
  "component": "tabs",
  "span": 12,
  "tabs": [
    {
      "tabId": "22",
      "name": "Personal data",
      "title": "Personal data",
      "layout": {
        "rows": [
          {
            "cols": [
              {
                "component": "accountProfile_uiplus",
                "span": 12
              }
            ]
          }
        ]
      }
    }
  ]
}
```

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
- `RouterInitService` removes `#boot-loader` after the first navigation event is completed.
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

- **Home / Search**: landing page with header, loyalty card, banner, and the flight search form.
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
