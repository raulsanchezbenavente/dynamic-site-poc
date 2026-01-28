# ✈️ Dynamic Flight Site (Angular + CMS)

This project is a proof of concept for a **dynamic flight booking website**, built with **Angular**, where each page is composed dynamically based on a **declarative configuration** (simulating integration with a CMS like Umbraco).

---

## 🚀 Features

- ✨ Dynamic architecture driven by configuration (`site-config` endpoint)
- 📄 Page composition via reusable blocks
- 📍 Dynamic routing based on JSON
- 🎯 Visual components styled with Bootstrap 5
- ✅ Full flow: search → results → baggage → seat → payment → confirmation

---

## 📁 Project Structure

```
server/
└── index.js                     # Mock server for site config
src/
├── app/
│   ├── app.component.ts
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── component-map.ts         # Maps block names to Angular components
│   ├── dynamic-composite/
│   │   ├── dynamic-blocks.component.ts
│   │   └── dynamic-page/
│   │       ├── ds-block-outlet.component.ts
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
│   │   │   ├── main-header/
│   │   │   ├── account-profile.component.ts
│   │   │   ├── find-bookings.component.ts
│   │   │   ├── loyalty-card.component.ts
│   │   │   └── main-footer.component.ts
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
│   └── i18n/                      # Translations (en/es/fr/pt)
└── styles.scss
```

---

## 🧪 Requirements

- Node.js (v16+ recommended)
- Angular CLI (`npm install -g @angular/cli`)

---

## 🛠️ Installation

```bash
git clone https://github.com/your-user/dynamic-flight-site.git
cd dynamic-flight-site
npm install
```

---

## ▶️ Run the App

```bash
cd server
node index
cd ..
ng serve
```

Then visit:
📍 [http://localhost:4200](http://localhost:4200)

---

## 🧰 How it Works

1. JSON files in `assets/config-site/` define the site's structure and routing.

2. `DynamicPageComponent` reads that config and renders the corresponding blocks.

3. Visual blocks are stateless and page logic is driven by config.

---

## 📄 Pages Overview

- **Home / Search**: landing page with header, banner, and the flight search form.
- **Results**: shows available flight options and fare cards.
- **Baggage**: lets the user select baggage allowances per passenger.
- **Seatmap**: seat selection step with a visual layout.
- **Payment**: captures payment method and traveler details.
- **Confirmation**: displays booking summary and success state.

---

## 📦 Potential Improvements

- Real CMS integration (Umbraco Delivery API, Contentful, etc.)
- Shared service to persist selections (search, baggage, seat)
- i18n improvements (validation/translation automation)
- Page transition animations

---

## 📝 License

MIT © \[raulshred]
