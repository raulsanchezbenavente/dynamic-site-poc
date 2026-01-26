# ✈️ Dynamic Flight Site (Angular + CMS)

This project is a proof of concept for a **dynamic flight booking website**, built with **Angular**, where each page is composed dynamically based on a **declarative configuration** (simulating integration with a CMS like Umbraco).

---

## 🚀 Features

* ✨ Dynamic architecture driven by configuration (`siteConfig endpoint`)
* 📄 Page composition via reusable components
* 📍 Dynamic routing based on JSON config
* 🎯 Visual components styled with Bootstrap 5
* ✅ Full flow: search → results → baggage → seat → payment → confirmation

---

## 📁 Project Structure

```
src/
├── app/
│   ├── site-config.ts           # Declarative site structure
│   ├── dynamic-page.component.ts# Renders each page dynamically
│   ├── component-map.ts         # Maps component names to Angular components
│   ├── fake-blocks-components/
│   │   ├── header.component.ts
│   │   ├── banner.component.ts
│   │   ├── search.component.ts
│   │   ├── results.component.ts
│   │   ├── baggage-selection.component.ts
│   │   ├── seatmap.component.ts
│   │   ├── payment-methods.component.ts
│   │   ├── payment-success.component.ts
│   │   └── footer.component.ts
└── ...
```

---

## 🧪 Requirements

* Node.js (v16+ recommended)
* Angular CLI (`npm install -g @angular/cli`)

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

1. The file `site-config.ts` defines the site's structure and routing:

```ts
{
  path: 'home',
  name: 'Home',
  components: ['header', 'banner', 'search', 'footer']
}
```

2. The `DynamicPageComponent` reads this config and renders the corresponding components.

3. Each component is visually styled and stateless (page logic is fully driven by the config).

---

## 📦 Potential Improvements

* Real CMS integration (Umbraco Delivery API, Contentful, etc.)
* Shared service to persist user selections (search, baggage, seat)
* Internationalization support (i18n)
* Page transition animations

---

## 📝 License

MIT © \[raulshred]
