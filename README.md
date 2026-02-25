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
.
├── .editorconfig
├── .gitignore
├── .prettierrc
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   ├── settings.json
│   └── tasks.json
├── README.md
├── angular.json
├── apache/
│   └── .htaccess
├── eslint.config.mjs
├── lintrules/
│   └── stylelint/
│       ├── selector-class-pattern.mjs
│       ├── stylelint-plugin-check-calculate-rem.mjs
│       └── validate-prefix-interpolation.mjs
├── package-lock.json
├── package.json
├── public/
│   ├── favicon-32x32.png
│   └── favicon.png
├── server/
│   └── index.js
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── component-map.ts
│   │   ├── dynamic-composite/
│   │   │   ├── block-outlet/
│   │   │   │   ├── block-outlet.component.html
│   │   │   │   ├── block-outlet.component.scss
│   │   │   │   └── block-outlet.component.ts
│   │   │   ├── dynamic-blocks/
│   │   │   │   ├── dynamic-blocks.component.html
│   │   │   │   └── dynamic-blocks.component.ts
│   │   │   ├── dynamic-page/
│   │   │   │   ├── dynamic-page.component.html
│   │   │   │   └── dynamic-page.component.ts
│   │   │   ├── dynamic-tabs/
│   │   │   │   ├── models/
│   │   │   │   │   └── cms-tab-contract.model.ts
│   │   │   │   ├── tabs.component.html
│   │   │   │   ├── tabs.component.scss
│   │   │   │   └── tabs.component.ts
│   │   │   └── models/
│   │   │       └── page-layout-models.ts
│   │   ├── fake-blocks-components/
│   │   │   ├── avianca/
│   │   │   │   ├── account-profile/
│   │   │   │   │   ├── account-profile.component.html
│   │   │   │   │   ├── account-profile.component.scss
│   │   │   │   │   └── account-profile.component.ts
│   │   │   │   ├── account-settings/
│   │   │   │   │   ├── account-settings.component.html
│   │   │   │   │   ├── account-settings.component.scss
│   │   │   │   │   └── account-settings.component.ts
│   │   │   │   ├── ads/
│   │   │   │   │   ├── ads.component.html
│   │   │   │   │   ├── ads.component.scss
│   │   │   │   │   └── ads.component.ts
│   │   │   │   ├── assist-selection/
│   │   │   │   │   ├── assist-selection.component.html
│   │   │   │   │   ├── assist-selection.component.scss
│   │   │   │   │   └── assist-selection.component.ts
│   │   │   │   ├── baggage-selection/
│   │   │   │   │   ├── baggage-selection.component.html
│   │   │   │   │   ├── baggage-selection.component.scss
│   │   │   │   │   └── baggage-selection.component.ts
│   │   │   │   ├── booking-footer/
│   │   │   │   │   ├── booking-footer.component.html
│   │   │   │   │   ├── booking-footer.component.scss
│   │   │   │   │   └── booking-footer.component.ts
│   │   │   │   ├── booking-header/
│   │   │   │   │   ├── booking-header.component.html
│   │   │   │   │   ├── booking-header.component.scss
│   │   │   │   │   └── booking-header.component.ts
│   │   │   │   ├── elite-status/
│   │   │   │   │   ├── elite-status.component.html
│   │   │   │   │   ├── elite-status.component.scss
│   │   │   │   │   └── elite-status.component.ts
│   │   │   │   ├── extra/
│   │   │   │   │   ├── extra.component.html
│   │   │   │   │   ├── extra.component.scss
│   │   │   │   │   └── extra.component.ts
│   │   │   │   ├── find-bookings/
│   │   │   │   │   ├── find-bookings.component.html
│   │   │   │   │   ├── find-bookings.component.scss
│   │   │   │   │   └── find-bookings.component.ts
│   │   │   │   ├── lounge-selection/
│   │   │   │   │   ├── lounge-selection.component.html
│   │   │   │   │   ├── lounge-selection.component.scss
│   │   │   │   │   └── lounge-selection.component.ts
│   │   │   │   ├── loyalty-card/
│   │   │   │   │   ├── loyalty-card.component.html
│   │   │   │   │   ├── loyalty-card.component.scss
│   │   │   │   │   └── loyalty-card.component.ts
│   │   │   │   ├── main-footer/
│   │   │   │   │   ├── main-footer.component.html
│   │   │   │   │   ├── main-footer.component.scss
│   │   │   │   │   └── main-footer.component.ts
│   │   │   │   ├── main-header/
│   │   │   │   │   ├── main-header.component.html
│   │   │   │   │   ├── main-header.component.scss
│   │   │   │   │   ├── main-header.component.ts
│   │   │   │   │   ├── models/
│   │   │   │   │   │   └── main-header.models.ts
│   │   │   │   │   └── translations/
│   │   │   │   │       └── main-header.constants.ts
│   │   │   │   ├── payment/
│   │   │   │   │   ├── payment.component.html
│   │   │   │   │   ├── payment.component.scss
│   │   │   │   │   └── payment.component.ts
│   │   │   │   ├── personal-data/
│   │   │   │   │   ├── personal-data.component.html
│   │   │   │   │   ├── personal-data.component.scss
│   │   │   │   │   └── personal-data.component.ts
│   │   │   │   ├── priority-selection/
│   │   │   │   │   ├── priority-selection.component.html
│   │   │   │   │   ├── priority-selection.component.scss
│   │   │   │   │   └── priority-selection.component.ts
│   │   │   │   ├── results/
│   │   │   │   │   ├── results.component.html
│   │   │   │   │   ├── results.component.scss
│   │   │   │   │   └── results.component.ts
│   │   │   │   ├── search/
│   │   │   │   │   ├── search.component.html
│   │   │   │   │   ├── search.component.scss
│   │   │   │   │   └── search.component.ts
│   │   │   │   ├── seat-selection/
│   │   │   │   │   ├── seat-selection.component.html
│   │   │   │   │   ├── seat-selection.component.scss
│   │   │   │   │   └── seat-selection.component.ts
│   │   │   │   ├── sports-selection/
│   │   │   │   │   ├── sports-selection.component.html
│   │   │   │   │   ├── sports-selection.component.scss
│   │   │   │   │   └── sports-selection.component.ts
│   │   │   │   └── thank-you/
│   │   │   │       ├── thank-you.component.html
│   │   │   │       ├── thank-you.component.scss
│   │   │   │       └── thank-you.component.ts
│   │   │   └── test/
│   │   │       ├── baggage-selection.ts
│   │   │       ├── banner.component.ts
│   │   │       ├── customer-login.ts
│   │   │       ├── explanation.component.ts
│   │   │       ├── footer.component.ts
│   │   │       ├── header.component.ts
│   │   │       ├── payment-methods.component.ts
│   │   │       ├── payment-success.component.ts
│   │   │       ├── results.component.ts
│   │   │       ├── search.component.ts
│   │   │       └── seatmap.component.ts
│   │   ├── guards/
│   │   │   ├── progress-async.guard.ts
│   │   │   └── progress.guard.ts
│   │   └── services/
│   │       ├── booking-progress/
│   │       │   └── booking-progress.service.ts
│   │       ├── router-helper/
│   │       │   └── router-helper.service.ts
│   │       └── site-config/
│   │           ├── models/
│   │           │   └── langs.model.ts
│   │           └── site-config.service.ts
│   ├── assets/
│   │   ├── config-site/
│   │   │   ├── config-site
│   │   │   ├── en
│   │   │   ├── es
│   │   │   ├── fr
│   │   │   └── pt
│   │   ├── i18n/
│   │   │   ├── en
│   │   │   ├── es
│   │   │   ├── fr
│   │   │   └── pt
│   │   └── illustrations/
│   │       ├── extras/
│   │       │   ├── assist.svg
│   │       │   ├── baggage-cabin.svg
│   │       │   ├── baggage-checked.svg
│   │       │   ├── baggage-extra.svg
│   │       │   ├── baggage-large.svg
│   │       │   ├── baggage-medium.svg
│   │       │   ├── baggage-small.svg
│   │       │   ├── baggage.svg
│   │       │   ├── bike.svg
│   │       │   ├── golf.svg
│   │       │   ├── hang-gliding.svg
│   │       │   ├── kitesurfing.svg
│   │       │   ├── lounge.svg
│   │       │   ├── priority.svg
│   │       │   ├── seat.svg
│   │       │   ├── ski.svg
│   │       │   ├── sports.svg
│   │       │   └── surf.svg
│   │       └── payment/
│   │           ├── applepay.svg
│   │           ├── card.svg
│   │           ├── gpay.svg
│   │           └── paypal.svg
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── stylelint.config.mjs
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json
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
