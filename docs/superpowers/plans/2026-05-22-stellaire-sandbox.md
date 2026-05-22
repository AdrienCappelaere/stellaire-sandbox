# Stellaire Sandbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static e-commerce site "Stellaire" (astronomy boutique) with pre-wired GA4 dataLayer pushes, a plugin-like single-file integration mechanism, intentionally planted SEO issues, an 8-step exercise booklet, and a private reference solution — so a non-developer SEO candidate can train end-to-end on audit + GTM + GA4 + Axeptio CMP + Looker Studio before her interview.

**Architecture:** Pure static HTML/CSS/JS, no build step. Tailwind via CDN. All pages share a hand-duplicated shell (header/footer). Catalog and rendering driven by JS modules loaded as globals (no ES modules — keeps everything compatible with file:// and unsophisticated tooling). Tracking pushes use `window.stellaire.track()` which wraps `dataLayer.push` per GA4 e-commerce schema. All GTM/Axeptio integration lives in one editable file `integrations.js` with placeholders. SEO issues are planted across pages and documented in a private answer key in `reference/`.

**Tech Stack:** HTML5, CSS3, vanilla JS (ES2017+, no bundler), Tailwind CSS 3 via CDN, Vercel static hosting, GitHub for source. Reference NASA image URLs used directly (no local image downloads). Markdown for all docs and exercises.

**Reference spec:** `docs/superpowers/specs/2026-05-22-stellaire-sandbox-design.md`

---

## File Structure

```
stellaire-sandbox/
├── .gitignore
├── README.md
├── vercel.json
├── site/
│   ├── index.html
│   ├── catalogue.html
│   ├── produit.html
│   ├── panier.html
│   ├── checkout.html
│   ├── confirmation.html
│   ├── contact.html
│   ├── mentions-legales.html
│   ├── politique-cookies.html
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── blog/
│   │   ├── index.html
│   │   ├── choisir-premier-telescope.html
│   │   └── objets-celestes-du-mois.html
│   └── assets/
│       ├── css/styles.css
│       └── js/
│           ├── data.js
│           ├── tracking.js
│           ├── cart.js
│           ├── app.js
│           └── integrations.js
├── exercises/
│   ├── README.md
│   ├── 01-audit-seo.md
│   ├── 02-installer-gtm.md
│   ├── 03-configurer-ga4.md
│   ├── 04-events-ecommerce.md
│   ├── 05-event-custom.md
│   ├── 06-cmp-axeptio.md
│   ├── 07-verification.md
│   └── 08-dashboard-looker-studio.md
├── reference/            (gitignored)
│   ├── README.md
│   ├── audit-issues.md
│   ├── gtm-container-blueprint.md
│   ├── looker-studio-template.md
│   └── notes-debrief.md
└── docs/superpowers/{specs,plans}/   (this plan and the spec live here)
```

**Responsibilities:**

- `data.js` — single source of truth for the 12-product catalog (id, slug, name, category, price, image URL, short description, full description, JSON-LD attributes)
- `tracking.js` — exposes `window.stellaire.track(name, payload)` and helper builders (`buildItem(productId, qty)`, `buildItemsFromCart()`); does NOT load GTM, only pushes to `dataLayer`
- `cart.js` — LocalStorage-backed cart (add/remove/update/clear/get); pure data layer, no DOM
- `app.js` — DOM hookup per page (detects `data-page` on `<body>`, calls the right initializer); orchestrates rendering and wires events to `stellaire.track()` calls
- `integrations.js` — the ONE file the candidate edits; placeholders for GTM ID and Axeptio clientId
- `styles.css` — minimal custom CSS on top of Tailwind utility classes (mostly cosmic palette overrides)

---

## Implementation Phases

1. **Scaffolding** (tasks 1–2): repo skeleton, shared assets
2. **Core JS modules** (tasks 3–7): data, tracking, cart, app, integrations
3. **Clean HTML pages** (tasks 8–16): each page wired with correct dataLayer pushes
4. **SEO assets** (task 17): robots.txt + sitemap.xml
5. **Plant SEO issues** (task 18): inject the ~20 issues from spec §4.6 across pages
6. **Exercise booklet** (tasks 19–27): 8 exercises + README
7. **Reference solution** (tasks 28–31): audit answer key + debrief notes
8. **Finalisation** (tasks 32–33): root README + manual deployment

---

## Task 1: Repo scaffolding (folders, .gitignore, vercel.json)

**Files:**
- Create: `.gitignore`
- Create: `vercel.json`
- Create: `site/assets/css/.gitkeep`
- Create: `site/assets/js/.gitkeep`
- Create: `site/blog/.gitkeep`
- Create: `exercises/.gitkeep`
- Create: `reference/.gitkeep` (will be gitignored by content, dir kept for clarity)

- [ ] **Step 1: Create `.gitignore`**

```
# Reference solution — private, do not commit
reference/*
!reference/.gitkeep

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp
```

- [ ] **Step 2: Create `vercel.json`**

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/produit/:slug", "destination": "/produit.html" }
  ]
}
```

`cleanUrls: true` lets `/contact` work without `.html`. The rewrite makes `/produit/telescope-debutant` map to `produit.html` (which reads the slug from `location.pathname`).

- [ ] **Step 3: Create placeholder .gitkeep files**

```bash
mkdir -p site/assets/css site/assets/js site/blog exercises reference
touch site/assets/css/.gitkeep site/assets/js/.gitkeep site/blog/.gitkeep exercises/.gitkeep reference/.gitkeep
```

- [ ] **Step 4: Verify .gitignore excludes reference/ but keeps the dir**

```bash
echo "test" > reference/test.md
git status --short reference/
# Expected: empty output (test.md is ignored)
rm reference/test.md
git status --short reference/
# Expected: empty output (.gitkeep is tracked from previous touch)
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore vercel.json site/ exercises/ reference/.gitkeep
git commit -m "Scaffold project structure"
```

---

## Task 2: Shared HTML shell + CSS

**Files:**
- Create: `site/assets/css/styles.css`

**Shared HTML shell** (referenced by every page task as "Shell A"):

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{PAGE_TITLE}}</title>
  <meta name="description" content="{{META_DESCRIPTION}}" />

  <!-- ====== integrations.js (GTM + Axeptio) — édité par la candidate ====== -->
  <script src="/assets/js/integrations.js"></script>

  <!-- Tailwind via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/assets/css/styles.css" />

  <!-- dataLayer init (toujours présent, même sans GTM) -->
  <script>window.dataLayer = window.dataLayer || [];</script>

  {{EXTRA_HEAD}}
</head>
<body data-page="{{PAGE_ID}}" class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
  <header class="border-b border-slate-800">
    <nav class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/" class="text-xl font-bold tracking-wide">✦ Stellaire</a>
      <ul class="flex gap-6 text-sm">
        <li><a href="/catalogue" class="hover:text-indigo-300">Boutique</a></li>
        <li><a href="/blog/" class="hover:text-indigo-300">Blog</a></li>
        <li><a href="/contact" class="hover:text-indigo-300">Contact</a></li>
        <li><a href="/panier" class="hover:text-indigo-300" id="nav-cart">Panier (<span data-cart-count>0</span>)</a></li>
      </ul>
    </nav>
  </header>

  <main class="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
    {{MAIN}}
  </main>

  <footer class="border-t border-slate-800 mt-16">
    <div class="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-400 grid md:grid-cols-3 gap-8">
      <div>
        <p class="font-semibold text-slate-200">Stellaire</p>
        <p class="mt-2">Le ciel à portée de main.</p>
      </div>
      <div>
        <p class="font-semibold text-slate-200">Boutique</p>
        <ul class="mt-2 space-y-1">
          <li><a href="/catalogue?cat=telescopes">Télescopes</a></li>
          <li><a href="/catalogue?cat=observation">Observation</a></li>
          <li><a href="/catalogue?cat=livres">Livres &amp; cartes</a></li>
          <li><a href="/catalogue?cat=deco">Posters &amp; déco</a></li>
        </ul>
      </div>
      <div>
        <p class="font-semibold text-slate-200">Mentions</p>
        <ul class="mt-2 space-y-1">
          <li><a href="/mentions-legales">Mentions légales</a></li>
          <li><a href="/politique-cookies">Politique cookies</a></li>
          <li><form id="newsletter" class="flex gap-2 mt-2">
            <input type="email" required placeholder="Newsletter" class="bg-slate-900 px-2 py-1 rounded text-slate-100 text-xs" />
            <button class="text-xs px-2 py-1 bg-indigo-600 rounded">OK</button>
          </form></li>
        </ul>
      </div>
    </div>
  </footer>

  <script src="/assets/js/data.js"></script>
  <script src="/assets/js/tracking.js"></script>
  <script src="/assets/js/cart.js"></script>
  <script src="/assets/js/app.js"></script>
</body>
</html>
```

- [ ] **Step 1: Create `site/assets/css/styles.css`**

```css
/* Stellaire — minimal overrides on top of Tailwind CDN */

:root {
  --cosmos-bg: #020617;
  --cosmos-accent: #6366f1;
}

body {
  background-image: radial-gradient(ellipse at top, rgba(99, 102, 241, 0.08), transparent 60%);
  background-attachment: fixed;
}

.product-card img {
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

/* Intentionally low-contrast button — planted ergo issue (see audit-issues.md).
   Real impl will override on .btn-primary only on certain pages to keep the issue local. */

.btn-primary-default {
  background-color: #3730a3;
  color: #fff;
}
```

- [ ] **Step 2: Verify file written**

```bash
test -f site/assets/css/styles.css && echo OK
# Expected: OK
```

- [ ] **Step 3: Commit**

```bash
git add site/assets/css/styles.css
git commit -m "Add base CSS and document shared HTML shell"
```

Note: the shared shell is not yet written to any HTML file — pages will be created task by task using this Shell A as reference.

---

## Task 3: Catalog data (`data.js`)

**Files:**
- Create: `site/assets/js/data.js`

- [ ] **Step 1: Write `data.js` with 12 products across 4 categories**

```javascript
// site/assets/js/data.js
window.STELLAIRE_PRODUCTS = [
  {
    id: "tel-001", slug: "telescope-debutant-70", category: "telescopes",
    name: "Télescope débutant 70/700",
    price: 149.00,
    image: "https://images-assets.nasa.gov/image/PIA17563/PIA17563~thumb.jpg",
    shortDesc: "Idéal pour découvrir le ciel.",
    longDesc: "Télescope réfracteur 70mm d'ouverture, focale 700mm. Monture azimutale légère, oculaires 10mm et 25mm fournis. Parfait pour observer la Lune, les planètes brillantes et les étoiles doubles.",
    brand: "Stellaire", sku: "STE-TEL-001"
  },
  {
    id: "tel-002", slug: "dobson-200mm", category: "telescopes",
    name: "Dobson 200mm",
    price: 549.00,
    image: "https://images-assets.nasa.gov/image/PIA22946/PIA22946~thumb.jpg",
    shortDesc: "Le rapport qualité/prix incontournable.",
    longDesc: "Télescope Newton 200mm sur monture Dobson. Très lumineux, permet l'observation détaillée des objets du ciel profond (galaxies, amas, nébuleuses). Livré avec deux oculaires Plossl.",
    brand: "Stellaire", sku: "STE-TEL-002"
  },
  {
    id: "tel-003", slug: "lunette-astro-90", category: "telescopes",
    name: "Lunette astronomique 90/900",
    price: 799.00,
    image: "https://images-assets.nasa.gov/image/PIA21472/PIA21472~thumb.jpg",
    shortDesc: "Optique apochromatique haut de gamme.",
    longDesc: "Lunette ED 90mm apochromatique. Image piquée sans aberration chromatique. Monture équatoriale motorisée incluse.",
    brand: "Stellaire", sku: "STE-TEL-003"
  },
  {
    id: "obs-001", slug: "jumelles-10x50", category: "observation",
    name: "Jumelles 10x50 astronomie",
    price: 89.00,
    image: "https://images-assets.nasa.gov/image/PIA12348/PIA12348~thumb.jpg",
    shortDesc: "Prises en main, idéales constellations.",
    longDesc: "Jumelles 10x50 traitées multicouches. Grand champ, parfaites pour les amas ouverts et la Voie lactée.",
    brand: "Stellaire", sku: "STE-OBS-001"
  },
  {
    id: "obs-002", slug: "oculaire-plossl-10", category: "observation",
    name: "Oculaire Plossl 10mm",
    price: 39.00,
    image: "https://images-assets.nasa.gov/image/PIA22228/PIA22228~thumb.jpg",
    shortDesc: "Oculaire de qualité pour fort grossissement.",
    longDesc: "Oculaire Plossl 10mm coulant 31.75mm. Traité multicouches.",
    brand: "Stellaire", sku: "STE-OBS-002"
  },
  {
    id: "obs-003", slug: "filtre-lunaire", category: "observation",
    name: "Filtre lunaire ND",
    price: 24.00,
    image: "https://images-assets.nasa.gov/image/PIA00302/PIA00302~thumb.jpg",
    shortDesc: "Réduit l'éblouissement lunaire.",
    longDesc: "Filtre densité neutre ND-13%. Indispensable pour l'observation lunaire en pleine phase.",
    brand: "Stellaire", sku: "STE-OBS-003"
  },
  {
    id: "obs-004", slug: "cherche-etoile", category: "observation",
    name: "Chercheur point rouge",
    price: 32.00,
    image: "https://images-assets.nasa.gov/image/PIA17046/PIA17046~thumb.jpg",
    shortDesc: "Pointer rapidement vos cibles.",
    longDesc: "Chercheur à point rouge avec réglage d'intensité. Fixation queue d'aronde standard.",
    brand: "Stellaire", sku: "STE-OBS-004"
  },
  {
    id: "liv-001", slug: "atlas-du-ciel", category: "livres",
    name: "Atlas du ciel nocturne",
    price: 34.90,
    image: "https://images-assets.nasa.gov/image/PIA00154/PIA00154~thumb.jpg",
    shortDesc: "L'ouvrage de référence en français.",
    longDesc: "Atlas complet en français, 88 constellations, cartes saisonnières, index Messier et NGC. 320 pages.",
    brand: "Stellaire", sku: "STE-LIV-001"
  },
  {
    id: "liv-002", slug: "guide-objets-messier", category: "livres",
    name: "Guide des objets Messier",
    price: 22.50,
    image: "https://images-assets.nasa.gov/image/PIA01970/PIA01970~thumb.jpg",
    shortDesc: "110 objets, fiches détaillées.",
    longDesc: "Pour chaque objet du catalogue Messier : description, conseils d'observation, croquis. Format poche.",
    brand: "Stellaire", sku: "STE-LIV-002"
  },
  {
    id: "liv-003", slug: "carte-tournante", category: "livres",
    name: "Carte tournante du ciel",
    price: 15.00,
    image: "https://images-assets.nasa.gov/image/PIA11800/PIA11800~thumb.jpg",
    shortDesc: "Repérez les constellations en un clin d'œil.",
    longDesc: "Carte tournante en plastique souple. Latitude 45° N (France métropolitaine).",
    brand: "Stellaire", sku: "STE-LIV-003"
  },
  {
    id: "dec-001", slug: "poster-voie-lactee", category: "deco",
    name: "Poster Voie Lactée NASA",
    price: 19.00,
    image: "https://images-assets.nasa.gov/image/PIA23645/PIA23645~thumb.jpg",
    shortDesc: "Tirage qualité galerie 50x70cm.",
    longDesc: "Tirage photographique haute définition issu des archives NASA. Papier mat 250g, format 50x70cm.",
    brand: "Stellaire", sku: "STE-DEC-001"
  },
  {
    id: "dec-002", slug: "mug-constellations", category: "deco",
    name: "Mug Constellations",
    price: 14.50,
    image: "https://images-assets.nasa.gov/image/PIA24033/PIA24033~thumb.jpg",
    shortDesc: "88 constellations en céramique.",
    longDesc: "Mug céramique 350ml imprimé des 88 constellations. Compatible lave-vaisselle.",
    brand: "Stellaire", sku: "STE-DEC-002"
  }
];

window.STELLAIRE_CATEGORIES = [
  { id: "telescopes", label: "Télescopes" },
  { id: "observation", label: "Observation" },
  { id: "livres",      label: "Livres & cartes" },
  { id: "deco",        label: "Posters & déco" },
];

window.stellaire = window.stellaire || {};
window.stellaire.findProduct = function (slug) {
  return window.STELLAIRE_PRODUCTS.find(p => p.slug === slug);
};
window.stellaire.findProductById = function (id) {
  return window.STELLAIRE_PRODUCTS.find(p => p.id === id);
};
```

- [ ] **Step 2: Sanity check in browser**

Open `site/assets/js/data.js` and visually verify 12 products, 4 categories, slugs are unique kebab-case.

```bash
grep -c '"id":' site/assets/js/data.js
# Expected: 12
```

- [ ] **Step 3: Commit**

```bash
git add site/assets/js/data.js
git commit -m "Add product catalog (12 products, 4 categories)"
```

---

## Task 4: Tracking library (`tracking.js`)

**Files:**
- Create: `site/assets/js/tracking.js`

- [ ] **Step 1: Write `tracking.js`**

```javascript
// site/assets/js/tracking.js
// Wraps dataLayer.push() with the GA4 e-commerce schema.
// Does NOT load GTM. The candidate's GTM container will consume these pushes.

(function () {
  window.dataLayer = window.dataLayer || [];
  window.stellaire = window.stellaire || {};

  function buildItem(product, qty) {
    return {
      item_id: product.id,
      item_name: product.name,
      item_brand: product.brand,
      item_category: product.category,
      price: product.price,
      quantity: qty || 1,
    };
  }

  function track(eventName, payload) {
    var data = Object.assign({ event: eventName }, payload || {});
    window.dataLayer.push(data);
  }

  window.stellaire.track = track;
  window.stellaire.buildItem = buildItem;

  // High-level helpers used by app.js
  window.stellaire.trackViewItem = function (product) {
    track("view_item", {
      ecommerce: {
        currency: "EUR",
        value: product.price,
        items: [buildItem(product, 1)],
      },
    });
  };

  window.stellaire.trackAddToCart = function (product, qty) {
    track("add_to_cart", {
      ecommerce: {
        currency: "EUR",
        value: product.price * (qty || 1),
        items: [buildItem(product, qty || 1)],
      },
    });
  };

  window.stellaire.trackRemoveFromCart = function (product, qty) {
    track("remove_from_cart", {
      ecommerce: {
        currency: "EUR",
        value: product.price * (qty || 1),
        items: [buildItem(product, qty || 1)],
      },
    });
  };

  window.stellaire.trackViewCart = function (items, total) {
    track("view_cart", {
      ecommerce: { currency: "EUR", value: total, items: items },
    });
  };

  window.stellaire.trackBeginCheckout = function (items, total) {
    track("begin_checkout", {
      ecommerce: { currency: "EUR", value: total, items: items },
    });
  };

  window.stellaire.trackPurchase = function (order) {
    track("purchase", {
      ecommerce: {
        currency: "EUR",
        transaction_id: order.id,
        value: order.value,
        tax: order.tax,
        shipping: order.shipping,
        items: order.items,
      },
    });
  };

  window.stellaire.trackGenerateLead = function (formId) {
    track("generate_lead", { form_id: formId });
  };

  window.stellaire.trackSignUp = function () {
    track("sign_up", { method: "newsletter" });
  };
})();
```

- [ ] **Step 2: Verify in a browser console (manual)**

Open a temporary HTML file or any existing page in `site/`, paste in the console after loading `data.js` and `tracking.js`:

```javascript
window.dataLayer = [];
stellaire.trackViewItem(STELLAIRE_PRODUCTS[0]);
console.log(window.dataLayer[0]);
// Expected: { event: "view_item", ecommerce: { currency: "EUR", value: 149, items: [{ item_id: "tel-001", ... }] } }
```

- [ ] **Step 3: Commit**

```bash
git add site/assets/js/tracking.js
git commit -m "Add tracking library (GA4 e-commerce dataLayer pushes)"
```

---

## Task 5: Cart module (`cart.js`)

**Files:**
- Create: `site/assets/js/cart.js`

- [ ] **Step 1: Write `cart.js`**

```javascript
// site/assets/js/cart.js
// LocalStorage-backed cart. Pure data, no DOM.

(function () {
  var KEY = "stellaire_cart_v1";
  window.stellaire = window.stellaire || {};

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) { return []; }
  }
  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function getItems() {
    return read().map(function (line) {
      var product = window.stellaire.findProductById(line.id);
      return product ? { product: product, qty: line.qty } : null;
    }).filter(Boolean);
  }

  function add(productId, qty) {
    var items = read();
    var existing = items.find(function (i) { return i.id === productId; });
    if (existing) existing.qty += (qty || 1);
    else items.push({ id: productId, qty: qty || 1 });
    write(items);
  }

  function remove(productId) {
    var items = read().filter(function (i) { return i.id !== productId; });
    write(items);
  }

  function setQty(productId, qty) {
    var items = read();
    var line = items.find(function (i) { return i.id === productId; });
    if (line) {
      if (qty <= 0) {
        remove(productId);
      } else {
        line.qty = qty;
        write(items);
      }
    }
  }

  function clear() { write([]); }

  function total() {
    return getItems().reduce(function (sum, line) {
      return sum + line.product.price * line.qty;
    }, 0);
  }

  function count() {
    return read().reduce(function (n, i) { return n + i.qty; }, 0);
  }

  window.stellaire.cart = {
    getItems: getItems,
    add: add,
    remove: remove,
    setQty: setQty,
    clear: clear,
    total: total,
    count: count,
  };
})();
```

- [ ] **Step 2: Manual verification**

In browser console after loading data.js + cart.js:

```javascript
stellaire.cart.clear();
stellaire.cart.add("tel-001", 1);
stellaire.cart.add("dec-001", 2);
console.log(stellaire.cart.count());           // Expected: 3
console.log(stellaire.cart.total());           // Expected: 187.00 (149 + 19*2)
console.log(stellaire.cart.getItems().length); // Expected: 2
```

- [ ] **Step 3: Commit**

```bash
git add site/assets/js/cart.js
git commit -m "Add LocalStorage-backed cart module"
```

---

## Task 6: Integrations placeholder (`integrations.js`)

**Files:**
- Create: `site/assets/js/integrations.js`

- [ ] **Step 1: Write `integrations.js` (copy verbatim from spec §4.4 bis)**

```javascript
// ============================================================
// integrations.js — branche GTM et Axeptio sur le site Stellaire
// Édite uniquement ce fichier pour activer le tracking et la CMP.
// ============================================================

// --- BLOC 0: Consent Mode v2 par défaut (denied) -------------
// À activer lors de l'exercice 6 (CMP). Pour l'instant, en commentaire.
//
// window.gtag = window.gtag || function(){ (window.dataLayer = window.dataLayer || []).push(arguments); };
// gtag('consent', 'default', {
//   ad_storage: 'denied',
//   analytics_storage: 'denied',
//   ad_user_data: 'denied',
//   ad_personalization: 'denied',
//   wait_for_update: 500,
// });

// --- BLOC 1: GTM ---------------------------------------------
// 1. Crée ton conteneur GTM (web). Récupère ton ID au format GTM-XXXXXXX.
// 2. Remplace GTM-XXXXXXX ci-dessous par ton ID. Commit. C'est tout.
(function (w, d, s, l, i) {
  if (i === 'GTM-XXXXXXX') return; // tant que pas configuré, on ne charge rien
  w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
  j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-XXXXXXX');

// --- BLOC 2: Axeptio (CMP) -----------------------------------
// 1. Crée un projet Axeptio (gratuit), récupère ton clientId.
// 2. Remplace YOUR-CLIENT-ID ci-dessous. Configure la version cookie dans Axeptio.
window.axeptioSettings = {
  clientId: "YOUR-CLIENT-ID",
  cookiesVersion: "stellaire-base",
};
(function (d, s) {
  if (window.axeptioSettings.clientId === "YOUR-CLIENT-ID") return;
  var t = d.getElementsByTagName(s)[0], e = d.createElement(s);
  e.async = true; e.src = "//static.axept.io/sdk.js";
  t.parentNode.insertBefore(e, t);
})(document, "script");
```

- [ ] **Step 2: Verify placeholders are inert**

Manually open the file and confirm:
- `GTM-XXXXXXX` placeholder is present
- `YOUR-CLIENT-ID` placeholder is present
- Both blocks have the auto-disable guard

- [ ] **Step 3: Commit**

```bash
git add site/assets/js/integrations.js
git commit -m "Add integrations.js placeholder (the file the candidate edits)"
```

---

## Task 7: App orchestrator (`app.js`)

**Files:**
- Create: `site/assets/js/app.js`

- [ ] **Step 1: Write `app.js`**

```javascript
// site/assets/js/app.js
// Page orchestrator. Detects body[data-page] and runs the matching init.

(function () {
  function euros(n) { return n.toFixed(2).replace(".", ",") + " €"; }
  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function refreshCartCount() {
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = stellaire.cart.count();
    });
  }

  function renderProductCard(p) {
    return '<a href="/produit/' + p.slug + '" class="product-card block bg-slate-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500" data-product-id="' + p.id + '">'
      + '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" />'
      + '<div class="p-3">'
      +   '<h3 class="text-sm font-semibold">' + p.name + '</h3>'
      +   '<p class="text-xs text-slate-400 mt-1">' + p.shortDesc + '</p>'
      +   '<p class="text-indigo-300 mt-2">' + euros(p.price) + '</p>'
      + '</div>'
      + '</a>';
  }

  var pages = {

    home: function () {
      var featured = STELLAIRE_PRODUCTS.slice(0, 4);
      var grid = document.querySelector("[data-featured-grid]");
      if (grid) grid.innerHTML = featured.map(renderProductCard).join("");
    },

    catalogue: function () {
      var cat = qs("cat");
      var items = STELLAIRE_PRODUCTS.filter(function (p) {
        return !cat || p.category === cat;
      });
      var grid = document.querySelector("[data-catalog-grid]");
      if (grid) grid.innerHTML = items.map(renderProductCard).join("");
      document.querySelectorAll("[data-filter]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var target = btn.getAttribute("data-filter");
          location.search = target ? "?cat=" + target : "";
        });
      });
    },

    produit: function () {
      // Slug from URL: /produit/<slug> (Vercel rewrites to /produit.html)
      var slug = location.pathname.replace(/^\/produit\//, "").replace(/\/$/, "");
      if (!slug) slug = qs("slug");
      var product = stellaire.findProduct(slug);
      var root = document.querySelector("[data-product-root]");
      if (!product || !root) {
        if (root) root.innerHTML = "<p>Produit introuvable.</p>";
        return;
      }
      root.innerHTML = ''
        + '<div class="grid md:grid-cols-2 gap-8">'
        +   '<img src="' + product.image + '" alt="' + product.name + '" class="rounded-lg w-full" />'
        +   '<div>'
        +     '<h1 class="text-3xl font-bold">' + product.name + '</h1>'
        +     '<p class="text-indigo-300 text-xl mt-2">' + euros(product.price) + '</p>'
        +     '<p class="mt-4 text-slate-300">' + product.longDesc + '</p>'
        +     '<button data-add-to-cart class="btn-primary-default mt-6 px-4 py-2 rounded">Ajouter au panier</button>'
        +     '<button data-testid="coup-de-coeur" class="mt-3 ml-2 px-4 py-2 rounded bg-slate-800 text-slate-200">Voir nos coups de cœur</button>'
        +   '</div>'
        + '</div>';

      // JSON-LD Product (NB: planted issue — one product will have broken JSON-LD; handled in Task 18)
      var ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": [product.image],
        "description": product.longDesc,
        "sku": product.sku,
        "brand": { "@type": "Brand", "name": product.brand },
        "offers": {
          "@type": "Offer",
          "url": location.href,
          "priceCurrency": "EUR",
          "price": product.price,
          "availability": "https://schema.org/InStock"
        }
      });
      document.head.appendChild(ld);

      stellaire.trackViewItem(product);

      root.querySelector("[data-add-to-cart]").addEventListener("click", function () {
        stellaire.cart.add(product.id, 1);
        stellaire.trackAddToCart(product, 1);
        refreshCartCount();
      });
    },

    panier: function () {
      var rows = stellaire.cart.getItems();
      var root = document.querySelector("[data-cart-root]");
      if (!root) return;
      if (!rows.length) {
        root.innerHTML = "<p>Votre panier est vide.</p>";
        return;
      }
      root.innerHTML = '<table class="w-full text-left">'
        + '<thead><tr class="text-slate-400 text-sm"><th>Produit</th><th>Qté</th><th>Prix</th><th></th></tr></thead>'
        + '<tbody>'
        + rows.map(function (line) {
            return '<tr class="border-t border-slate-800">'
              + '<td class="py-2">' + line.product.name + '</td>'
              + '<td><input type="number" min="0" value="' + line.qty + '" data-qty="' + line.product.id + '" class="bg-slate-900 w-16 px-2 py-1 rounded" /></td>'
              + '<td>' + euros(line.product.price * line.qty) + '</td>'
              + '<td><button data-remove="' + line.product.id + '" class="text-red-400">Retirer</button></td>'
              + '</tr>';
          }).join("")
        + '</tbody></table>'
        + '<div class="text-right mt-4"><p>Total: <strong>' + euros(stellaire.cart.total()) + '</strong></p>'
        + '<a href="/checkout" class="inline-block mt-3 btn-primary-default px-4 py-2 rounded">Passer commande</a></div>';

      // Build items array for view_cart
      var items = rows.map(function (l) { return stellaire.buildItem(l.product, l.qty); });
      stellaire.trackViewCart(items, stellaire.cart.total());

      root.querySelectorAll("[data-qty]").forEach(function (input) {
        input.addEventListener("change", function () {
          var id = input.getAttribute("data-qty");
          var product = stellaire.findProductById(id);
          var newQty = parseInt(input.value, 10);
          var oldQty = stellaire.cart.getItems().find(function (l) { return l.product.id === id; }).qty;
          stellaire.cart.setQty(id, newQty);
          if (newQty < oldQty) {
            stellaire.trackRemoveFromCart(product, oldQty - newQty);
          } else if (newQty > oldQty) {
            stellaire.trackAddToCart(product, newQty - oldQty);
          }
          location.reload();
        });
      });
      root.querySelectorAll("[data-remove]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-remove");
          var line = stellaire.cart.getItems().find(function (l) { return l.product.id === id; });
          stellaire.cart.remove(id);
          if (line) stellaire.trackRemoveFromCart(line.product, line.qty);
          location.reload();
        });
      });
    },

    checkout: function () {
      var rows = stellaire.cart.getItems();
      var items = rows.map(function (l) { return stellaire.buildItem(l.product, l.qty); });
      var total = stellaire.cart.total();
      if (!rows.length) {
        var root = document.querySelector("[data-checkout-root]");
        if (root) root.innerHTML = "<p>Panier vide. <a href='/catalogue'>Retour à la boutique</a>.</p>";
        return;
      }
      stellaire.trackBeginCheckout(items, total);

      document.querySelector("[data-checkout-total]").textContent = euros(total);
      document.getElementById("checkout-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var orderId = "STL-" + Date.now();
        var shipping = 4.90;
        var tax = +(total * 0.2).toFixed(2);
        sessionStorage.setItem("stellaire_last_order", JSON.stringify({
          id: orderId, value: total + shipping, tax: tax, shipping: shipping, items: items
        }));
        stellaire.cart.clear();
        location.href = "/confirmation?order=" + orderId;
      });
    },

    confirmation: function () {
      var data = sessionStorage.getItem("stellaire_last_order");
      var orderId = qs("order");
      if (data) {
        var order = JSON.parse(data);
        order.id = orderId || order.id;
        stellaire.trackPurchase(order);
        document.querySelector("[data-order-id]").textContent = order.id;
      }
    },

    contact: function () {
      document.getElementById("contact-form").addEventListener("submit", function (e) {
        e.preventDefault();
        stellaire.trackGenerateLead("contact");
        e.target.innerHTML = "<p>Merci, votre message est bien parti.</p>";
      });
    },

    // Default init for pages that just need newsletter + cart count
    _default: function () {}
  };

  document.addEventListener("DOMContentLoaded", function () {
    refreshCartCount();
    var page = document.body.getAttribute("data-page") || "_default";
    (pages[page] || pages._default)();

    // Newsletter (footer, every page)
    var nl = document.getElementById("newsletter");
    if (nl) {
      nl.addEventListener("submit", function (e) {
        e.preventDefault();
        stellaire.trackSignUp();
        nl.innerHTML = "<p class='text-xs text-slate-300'>Merci !</p>";
      });
    }
  });
})();
```

- [ ] **Step 2: Commit**

```bash
git add site/assets/js/app.js
git commit -m "Add page orchestrator (renders pages, wires dataLayer pushes)"
```

---

## Task 8: Home page (`index.html`)

**Files:**
- Create: `site/index.html`

- [ ] **Step 1: Write `site/index.html` using Shell A from Task 2**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Stellaire — Boutique d'astronomie et d'observation du ciel</title>
  <meta name="description" content="Télescopes, jumelles, livres et accessoires d'astronomie. Conseils d'experts pour observer le ciel." />
  <script src="/assets/js/integrations.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/assets/css/styles.css" />
  <script>window.dataLayer = window.dataLayer || [];</script>
</head>
<body data-page="home" class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
  <!-- HEADER (copié depuis Shell A — voir docs/.../plan section Task 2) -->
  <header class="border-b border-slate-800">
    <nav class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/" class="text-xl font-bold tracking-wide">✦ Stellaire</a>
      <ul class="flex gap-6 text-sm">
        <li><a href="/catalogue" class="hover:text-indigo-300">Boutique</a></li>
        <li><a href="/blog/" class="hover:text-indigo-300">Blog</a></li>
        <li><a href="/contact" class="hover:text-indigo-300">Contact</a></li>
        <li><a href="/panier" class="hover:text-indigo-300" id="nav-cart">Panier (<span data-cart-count>0</span>)</a></li>
      </ul>
    </nav>
  </header>

  <main class="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
    <section class="text-center py-16">
      <h1 class="text-4xl md:text-6xl font-bold">Le ciel à portée de main</h1>
      <p class="mt-4 text-slate-300 max-w-2xl mx-auto">Télescopes, jumelles, livres et accessoires pour explorer l'univers. Sélection d'experts, expédition rapide.</p>
      <a href="/catalogue" class="inline-block mt-6 btn-primary-default px-6 py-3 rounded">Explorer la boutique</a>
    </section>

    <section class="mt-12">
      <h2 class="text-2xl font-semibold mb-6">Nos catégories</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a href="/catalogue?cat=telescopes" class="bg-slate-900 p-6 rounded text-center hover:ring-2 hover:ring-indigo-500"><p>Télescopes</p></a>
        <a href="/catalogue?cat=observation" class="bg-slate-900 p-6 rounded text-center hover:ring-2 hover:ring-indigo-500"><p>Observation</p></a>
        <a href="/catalogue?cat=livres" class="bg-slate-900 p-6 rounded text-center hover:ring-2 hover:ring-indigo-500"><p>Livres &amp; cartes</p></a>
        <a href="/catalogue?cat=deco" class="bg-slate-900 p-6 rounded text-center hover:ring-2 hover:ring-indigo-500"><p>Posters &amp; déco</p></a>
      </div>
    </section>

    <section class="mt-12">
      <h2 class="text-2xl font-semibold mb-6">Coups de cœur</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4" data-featured-grid></div>
    </section>
  </main>

  <!-- FOOTER (copié depuis Shell A) -->
  <footer class="border-t border-slate-800 mt-16">
    <div class="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-400 grid md:grid-cols-3 gap-8">
      <div><p class="font-semibold text-slate-200">Stellaire</p><p class="mt-2">Le ciel à portée de main.</p></div>
      <div>
        <p class="font-semibold text-slate-200">Boutique</p>
        <ul class="mt-2 space-y-1">
          <li><a href="/catalogue?cat=telescopes">Télescopes</a></li>
          <li><a href="/catalogue?cat=observation">Observation</a></li>
          <li><a href="/catalogue?cat=livres">Livres &amp; cartes</a></li>
          <li><a href="/catalogue?cat=deco">Posters &amp; déco</a></li>
        </ul>
      </div>
      <div>
        <p class="font-semibold text-slate-200">Mentions</p>
        <ul class="mt-2 space-y-1">
          <li><a href="/mentions-legales">Mentions légales</a></li>
          <li><a href="/politique-cookies">Politique cookies</a></li>
          <li><form id="newsletter" class="flex gap-2 mt-2">
            <input type="email" required placeholder="Newsletter" class="bg-slate-900 px-2 py-1 rounded text-slate-100 text-xs" />
            <button class="text-xs px-2 py-1 bg-indigo-600 rounded">OK</button>
          </form></li>
        </ul>
      </div>
    </div>
  </footer>

  <script src="/assets/js/data.js"></script>
  <script src="/assets/js/tracking.js"></script>
  <script src="/assets/js/cart.js"></script>
  <script src="/assets/js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Manual smoke test**

Serve locally (any way), open `/index.html` in a browser:
- Page renders without console errors
- 4 product cards appear in "Coups de cœur"
- Header/footer navigation visible

```bash
# From repo root:
cd site && python3 -m http.server 8000
# Then open http://localhost:8000/ in browser
```

- [ ] **Step 3: Commit**

```bash
git add site/index.html
git commit -m "Add home page"
```

---

## Task 9: Catalog page (`catalogue.html`)

**Files:**
- Create: `site/catalogue.html`

- [ ] **Step 1: Write `site/catalogue.html`** (same shell as index, with `data-page="catalogue"` and the catalog-specific main)

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Boutique d'astronomie | Stellaire</title>
  <meta name="description" content="Notre catalogue: télescopes, jumelles, livres et déco. Sélection rigoureuse, prix maîtrisés." />
  <script src="/assets/js/integrations.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/assets/css/styles.css" />
  <script>window.dataLayer = window.dataLayer || [];</script>
</head>
<body data-page="catalogue" class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
  <!-- HEADER identique à index.html (Shell A) -->
  <!-- ... copier le header de index.html ... -->

  <main class="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
    <h1 class="text-3xl font-bold mb-6">Catalogue</h1>
    <div class="flex flex-wrap gap-2 mb-8">
      <button data-filter="" class="px-3 py-1 rounded bg-slate-800 text-sm">Tous</button>
      <button data-filter="telescopes" class="px-3 py-1 rounded bg-slate-800 text-sm">Télescopes</button>
      <button data-filter="observation" class="px-3 py-1 rounded bg-slate-800 text-sm">Observation</button>
      <button data-filter="livres" class="px-3 py-1 rounded bg-slate-800 text-sm">Livres &amp; cartes</button>
      <button data-filter="deco" class="px-3 py-1 rounded bg-slate-800 text-sm">Posters &amp; déco</button>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4" data-catalog-grid></div>
  </main>

  <!-- FOOTER identique à index.html (Shell A) -->
  <!-- ... copier le footer de index.html ... -->

  <script src="/assets/js/data.js"></script>
  <script src="/assets/js/tracking.js"></script>
  <script src="/assets/js/cart.js"></script>
  <script src="/assets/js/app.js"></script>
</body>
</html>
```

When writing this file, **fully expand the HEADER and FOOTER blocks** copying from `index.html` (no `<!-- ... -->` placeholders in the actual file).

- [ ] **Step 2: Smoke test**

Open `/catalogue.html` in browser:
- 12 products visible
- Clicking a filter narrows the grid (URL gets `?cat=…`)

- [ ] **Step 3: Commit**

```bash
git add site/catalogue.html
git commit -m "Add catalog page with category filters"
```

---

## Task 10: Product page (`produit.html`)

**Files:**
- Create: `site/produit.html`

- [ ] **Step 1: Write `site/produit.html`** (Shell A with `data-page="produit"` and a single empty `<div data-product-root>` in main; app.js fills it)

Body shell identical to index.html. Main:

```html
<main class="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
  <div data-product-root></div>
</main>
```

(Title and meta description below are intentionally generic; will be replaced by app.js in a future enhancement OR kept generic as a planted SEO issue. For this task, keep generic.)

```html
<title>Produit | Stellaire</title>
<meta name="description" content="Découvrez nos produits d'astronomie." />
```

- [ ] **Step 2: Smoke test**

```bash
# Open http://localhost:8000/produit.html?slug=telescope-debutant-70
```
- Page shows product details + image + add-to-cart button
- Console: `window.dataLayer` has a `view_item` entry
- Click "Ajouter au panier" → cart count increments, `add_to_cart` event in dataLayer

- [ ] **Step 3: Commit**

```bash
git add site/produit.html
git commit -m "Add product detail page"
```

---

## Task 11: Cart page (`panier.html`)

**Files:**
- Create: `site/panier.html`

- [ ] **Step 1: Write `site/panier.html`** (Shell A with `data-page="panier"`, main contains:)

```html
<main class="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
  <h1 class="text-3xl font-bold mb-6">Mon panier</h1>
  <div data-cart-root></div>
</main>
```

Title: `Mon panier | Stellaire`
Meta description: `Votre sélection de produits d'astronomie.`

- [ ] **Step 2: Smoke test**

Add a product from a product page, then open `/panier.html`:
- Line appears with name, qty input, price
- `view_cart` event in dataLayer
- Change qty → `add_to_cart` or `remove_from_cart` fires
- Remove → `remove_from_cart` fires

- [ ] **Step 3: Commit**

```bash
git add site/panier.html
git commit -m "Add cart page"
```

---

## Task 12: Checkout + confirmation pages

**Files:**
- Create: `site/checkout.html`
- Create: `site/confirmation.html`

- [ ] **Step 1: Write `site/checkout.html`** (Shell A, `data-page="checkout"`, main:)

```html
<main class="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
  <h1 class="text-3xl font-bold mb-6">Validation de commande</h1>
  <div data-checkout-root>
    <form id="checkout-form" class="grid md:grid-cols-2 gap-6 max-w-3xl">
      <label class="block"><span class="text-sm">Nom complet</span>
        <input required class="w-full mt-1 bg-slate-900 px-3 py-2 rounded" />
      </label>
      <label class="block"><span class="text-sm">Email</span>
        <input type="email" required class="w-full mt-1 bg-slate-900 px-3 py-2 rounded" />
      </label>
      <label class="block md:col-span-2"><span class="text-sm">Adresse</span>
        <input required class="w-full mt-1 bg-slate-900 px-3 py-2 rounded" />
      </label>
      <label class="block"><span class="text-sm">Numéro de carte (factice)</span>
        <input required placeholder="0000 0000 0000 0000" class="w-full mt-1 bg-slate-900 px-3 py-2 rounded" />
      </label>
      <label class="block"><span class="text-sm">Expiration</span>
        <input required placeholder="MM/AA" class="w-full mt-1 bg-slate-900 px-3 py-2 rounded" />
      </label>
      <div class="md:col-span-2 flex items-center justify-between mt-4">
        <p>Total: <strong data-checkout-total>—</strong></p>
        <button type="submit" class="btn-primary-default px-6 py-2 rounded">Confirmer la commande</button>
      </div>
    </form>
  </div>
</main>
```

Title: `Commande | Stellaire`. Meta description: `Finalisez votre commande.`

- [ ] **Step 2: Write `site/confirmation.html`** (Shell A, `data-page="confirmation"`, main:)

```html
<main class="flex-1 max-w-6xl mx-auto px-4 py-10 w-full text-center">
  <h1 class="text-3xl font-bold">Merci, votre commande est confirmée ! ✨</h1>
  <p class="mt-4 text-slate-300">Numéro de commande : <strong data-order-id>—</strong></p>
  <a href="/catalogue" class="inline-block mt-6 btn-primary-default px-4 py-2 rounded">Continuer mes achats</a>
</main>
```

Title: `Commande confirmée | Stellaire`. Meta description: `Votre commande a bien été enregistrée.`

- [ ] **Step 3: Smoke test (full funnel)**

1. From product page, add to cart
2. Open `/panier.html`, click "Passer commande"
3. Fill form, submit → redirect to confirmation
4. Confirm: dataLayer contains `begin_checkout` then `purchase`, cart is cleared

- [ ] **Step 4: Commit**

```bash
git add site/checkout.html site/confirmation.html
git commit -m "Add checkout and confirmation pages (full funnel)"
```

---

## Task 13: Blog (index + 2 articles)

**Files:**
- Create: `site/blog/index.html`
- Create: `site/blog/choisir-premier-telescope.html`
- Create: `site/blog/objets-celestes-du-mois.html`

- [ ] **Step 1: Write `site/blog/index.html`** (Shell A, `data-page="blog-index"`)

Main:

```html
<main class="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
  <h1 class="text-3xl font-bold mb-8">Le blog Stellaire</h1>
  <div class="grid md:grid-cols-2 gap-6">
    <a href="/blog/choisir-premier-telescope" class="bg-slate-900 rounded-lg p-6 hover:ring-2 hover:ring-indigo-500">
      <h2 class="text-xl font-semibold">Comment choisir son premier télescope</h2>
      <p class="mt-2 text-slate-300">Notre guide pour ne pas se tromper sur son premier achat.</p>
    </a>
    <a href="/blog/objets-celestes-du-mois" class="bg-slate-900 rounded-lg p-6 hover:ring-2 hover:ring-indigo-500">
      <h2 class="text-xl font-semibold">Les 5 objets célestes à observer ce mois-ci</h2>
      <p class="mt-2 text-slate-300">Notre sélection pour vos prochaines soirées d'observation.</p>
    </a>
  </div>
</main>
```

- [ ] **Step 2: Write `site/blog/choisir-premier-telescope.html`** (Shell A, `data-page="blog-article"`)

Main:

```html
<main class="flex-1 max-w-3xl mx-auto px-4 py-10 w-full prose prose-invert">
  <h1>Comment choisir son premier télescope</h1>
  <p>Choisir son premier télescope est une étape clé pour démarrer l'astronomie. Voici les critères à connaître pour faire un choix éclairé.</p>
  <h2>1. Le diamètre, c'est le critère n°1</h2>
  <p>Plus le diamètre est grand, plus on capte de lumière. Un 70mm permet déjà beaucoup, un 200mm ouvre la porte du ciel profond.</p>
  <h2>2. La monture compte autant que l'optique</h2>
  <p>Une bonne optique sur une mauvaise monture ne donnera rien. Privilégier une monture stable, type Dobson pour débuter.</p>
  <h2>3. Notre recommandation</h2>
  <p>Pour 90% des débutants, un Dobson 200mm est le meilleur rapport plaisir / prix.</p>
</main>
```

Title: `Choisir son premier télescope — Le guide | Stellaire`
Meta description: `Diamètre, monture, accessoires : notre guide complet pour bien choisir votre premier télescope.`

- [ ] **Step 3: Write `site/blog/objets-celestes-du-mois.html`** (Shell A, `data-page="blog-article"`)

Main:

```html
<main class="flex-1 max-w-3xl mx-auto px-4 py-10 w-full prose prose-invert">
  <h1>Les 5 objets célestes à observer ce mois-ci</h1>
  <p>Une sélection pour vos prochaines soirées sous les étoiles.</p>
  <h2>1. La Lune en quartier</h2>
  <p>Idéale pour démarrer une soirée : cratères et terminator bien marqués.</p>
  <h2>2. Jupiter et ses lunes</h2>
  <p>Les 4 lunes galiléennes visibles aux jumelles 10x50.</p>
  <h2>3. La nébuleuse d'Orion (M42)</h2>
  <p>Le grand classique d'hiver, repérable même en ville.</p>
  <h2>4. Les Pléiades (M45)</h2>
  <p>Un amas ouvert magnifique aux jumelles.</p>
  <h2>5. La galaxie d'Andromède (M31)</h2>
  <p>Notre voisine galactique, visible à l'œil nu sous bon ciel.</p>
</main>
```

Title: `5 objets célestes à observer ce mois-ci | Stellaire`
Meta description: `Notre sélection mensuelle d'objets faciles à observer aux jumelles ou au télescope.`

- [ ] **Step 4: Smoke test**

Open `/blog/`, click each article, verify they render.

- [ ] **Step 5: Commit**

```bash
git add site/blog/
git commit -m "Add blog (index + 2 articles)"
```

---

## Task 14: Contact page

**Files:**
- Create: `site/contact.html`

- [ ] **Step 1: Write `site/contact.html`** (Shell A, `data-page="contact"`)

Main:

```html
<main class="flex-1 max-w-2xl mx-auto px-4 py-10 w-full">
  <h1 class="text-3xl font-bold mb-6">Contact</h1>
  <form id="contact-form" class="space-y-4">
    <label class="block"><span class="text-sm">Nom</span>
      <input required class="w-full mt-1 bg-slate-900 px-3 py-2 rounded" />
    </label>
    <label class="block"><span class="text-sm">Email</span>
      <input type="email" required class="w-full mt-1 bg-slate-900 px-3 py-2 rounded" />
    </label>
    <label class="block"><span class="text-sm">Message</span>
      <textarea required rows="5" class="w-full mt-1 bg-slate-900 px-3 py-2 rounded"></textarea>
    </label>
    <button type="submit" class="btn-primary-default px-4 py-2 rounded">Envoyer</button>
  </form>
</main>
```

Title: `Nous contacter | Stellaire`. Meta description: `Une question, un conseil ? Contactez l'équipe Stellaire.`

- [ ] **Step 2: Smoke test**

Open `/contact.html`, submit form → `generate_lead` in dataLayer + success message replaces form.

- [ ] **Step 3: Commit**

```bash
git add site/contact.html
git commit -m "Add contact page (generate_lead push)"
```

---

## Task 15: Legal pages (mentions + politique-cookies)

**Files:**
- Create: `site/mentions-legales.html`
- Create: `site/politique-cookies.html`

- [ ] **Step 1: Write `site/mentions-legales.html`** (Shell A, `data-page="legal"`)

Main:

```html
<main class="flex-1 max-w-3xl mx-auto px-4 py-10 w-full prose prose-invert">
  <h1>Mentions légales</h1>
  <h2>Éditeur</h2>
  <p>Stellaire SAS — 12 rue des Étoiles, 68100 Mulhouse, France.</p>
  <h2>Hébergeur</h2>
  <p>Vercel Inc., 340 S Lemon Ave #4133, Walnut CA 91789, USA.</p>
  <h2>Contact</h2>
  <p>contact@stellaire-shop.example</p>
</main>
```

Title: `Mentions légales | Stellaire`. Meta description: `Mentions légales du site Stellaire.`

- [ ] **Step 2: Write `site/politique-cookies.html`** (Shell A, `data-page="legal"`)

Main:

```html
<main class="flex-1 max-w-3xl mx-auto px-4 py-10 w-full prose prose-invert">
  <h1>Politique cookies</h1>
  <p><em>Cette page sera complétée lors de l'exercice 6 (mise en place de la CMP Axeptio).</em></p>
</main>
```

Title: `Politique cookies | Stellaire`. Meta description: `Notre utilisation des cookies sur le site Stellaire.`

- [ ] **Step 3: Commit**

```bash
git add site/mentions-legales.html site/politique-cookies.html
git commit -m "Add legal pages (politique-cookies left empty for exercise 6)"
```

---

## Task 16: robots.txt + sitemap.xml (initial clean versions)

**Files:**
- Create: `site/robots.txt`
- Create: `site/sitemap.xml`

Note: planted issues (e.g., `/blog/` blocked in robots, sitemap incomplete) are applied in **Task 18**. Here we ship clean baselines so the site is auditable before the issues are added.

- [ ] **Step 1: Write `site/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://stellaire.vercel.app/sitemap.xml
```

- [ ] **Step 2: Write `site/sitemap.xml`** (all pages, all products)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://stellaire.vercel.app/</loc></url>
  <url><loc>https://stellaire.vercel.app/catalogue</loc></url>
  <url><loc>https://stellaire.vercel.app/blog/</loc></url>
  <url><loc>https://stellaire.vercel.app/blog/choisir-premier-telescope</loc></url>
  <url><loc>https://stellaire.vercel.app/blog/objets-celestes-du-mois</loc></url>
  <url><loc>https://stellaire.vercel.app/contact</loc></url>
  <url><loc>https://stellaire.vercel.app/mentions-legales</loc></url>
  <url><loc>https://stellaire.vercel.app/politique-cookies</loc></url>
  <url><loc>https://stellaire.vercel.app/produit/telescope-debutant-70</loc></url>
  <url><loc>https://stellaire.vercel.app/produit/dobson-200mm</loc></url>
  <url><loc>https://stellaire.vercel.app/produit/lunette-astro-90</loc></url>
  <url><loc>https://stellaire.vercel.app/produit/jumelles-10x50</loc></url>
  <url><loc>https://stellaire.vercel.app/produit/oculaire-plossl-10</loc></url>
  <url><loc>https://stellaire.vercel.app/produit/filtre-lunaire</loc></url>
  <url><loc>https://stellaire.vercel.app/produit/cherche-etoile</loc></url>
  <url><loc>https://stellaire.vercel.app/produit/atlas-du-ciel</loc></url>
  <url><loc>https://stellaire.vercel.app/produit/guide-objets-messier</loc></url>
  <url><loc>https://stellaire.vercel.app/produit/carte-tournante</loc></url>
  <url><loc>https://stellaire.vercel.app/produit/poster-voie-lactee</loc></url>
  <url><loc>https://stellaire.vercel.app/produit/mug-constellations</loc></url>
</urlset>
```

Note: domain `stellaire.vercel.app` is illustrative; replace at deploy time once Vercel assigns the real subdomain.

- [ ] **Step 3: Commit**

```bash
git add site/robots.txt site/sitemap.xml
git commit -m "Add robots.txt and sitemap.xml (clean baseline)"
```

---

## Task 17: Verify full clean baseline before planting issues

This is a "safety net" task. Before we sprinkle bugs across the site, confirm the clean version works end-to-end.

- [ ] **Step 1: Local smoke test of full funnel**

```bash
cd site && python3 -m http.server 8000
```

In browser:
1. Open `http://localhost:8000/` → home renders
2. Open Console, run `window.dataLayer = []`
3. Click a category card → catalog filtered
4. Click a product card → product page renders
5. Console: confirm `dataLayer[0]` = `view_item` for that product
6. Click "Ajouter au panier" → cart count = 1, `add_to_cart` in dataLayer
7. Go to `/panier.html` → line visible, `view_cart` pushed
8. Click "Passer commande" → `/checkout.html`, `begin_checkout` pushed
9. Fill form, submit → redirect to confirmation, `purchase` event with valid `transaction_id`
10. Go to `/contact.html`, submit → `generate_lead` pushed
11. Submit newsletter in footer → `sign_up` pushed

- [ ] **Step 2: Tag the baseline commit**

```bash
git tag baseline-clean
```

This tag is a safety bookmark if we ever need to confirm "what did the clean version look like".

- [ ] **Step 3: No code commit needed for this task**

(The tag is the artifact.)

---

## Task 18: Plant the ~20 SEO issues (technical + ergo + editorial)

This task introduces deliberate bugs across the site to give the candidate matter to audit. Each issue is applied with a clear localisation that will be recorded in `reference/audit-issues.md` (Task 28).

**Files modified (everything written in earlier tasks):**
- `site/index.html`
- `site/catalogue.html`
- `site/produit.html` (and through it, JSON-LD logic in `app.js`)
- `site/panier.html`
- `site/checkout.html`
- `site/blog/index.html`, `site/blog/*.html`
- `site/contact.html`
- `site/mentions-legales.html`
- `site/robots.txt`, `site/sitemap.xml`
- `site/assets/css/styles.css`
- `site/assets/js/app.js`
- `site/assets/js/data.js` (description on one product)

Each subsection below is a numbered issue with the exact change to make.

### TECHNIQUE

- [ ] **T1 — Title manquant sur la page contact**

In `site/contact.html`, remove the `<title>` tag entirely. Leave the rest of `<head>` intact.

- [ ] **T2 — Title trop long sur le produit "lunette-astro-90"**

Approach: edit the catalog data to make one product's name 95 chars (will be reflected in the rendered title). In `site/assets/js/data.js`, for `tel-003`, change `name` to:

```
"Lunette astronomique 90/900 apochromatique ED traitée multicouches — édition spéciale Stellaire 2026"
```

(99 characters)

- [ ] **T3 — Title dupliqué entre 2 fiches produit**

The product page sets `<title>Produit | Stellaire</title>` statically — already dupliqué across all products by default (Task 10). Keep this as-is: it counts as the duplicate-title issue (all product pages share the same static title).

Action: no change. Document this in `audit-issues.md` (Task 28).

- [ ] **T4 — Meta description manquante sur `/blog/index.html`**

In `site/blog/index.html`, remove the `<meta name="description" ...>` line.

- [ ] **T5 — Meta description dupliquée entre les 2 articles**

In `site/blog/choisir-premier-telescope.html` AND `site/blog/objets-celestes-du-mois.html`, set the meta description to the **same** string:

```html
<meta name="description" content="Découvrez nos conseils d'astronomie sur le blog Stellaire." />
```

- [ ] **T6 — Deux H1 sur la page d'accueil**

In `site/index.html`, in the "Coups de cœur" section, change `<h2>Coups de cœur</h2>` to `<h1>Coups de cœur</h1>`.

- [ ] **T7 — Saut de hiérarchie Hn sur un article de blog**

In `site/blog/choisir-premier-telescope.html`, change `<h2>3. Notre recommandation</h2>` to `<h4>3. Notre recommandation</h4>`.

- [ ] **T8 — Image lourde non optimisée**

In `site/index.html`, add at the very top of `<main>` a large hero image referenced by direct NASA URL known to be heavy (>2MB). Add:

```html
<img src="https://images-assets.nasa.gov/image/PIA23645/PIA23645~orig.jpg" alt="" class="w-full h-64 object-cover rounded mb-8" />
```

The `~orig.jpg` variant returns the full-resolution image (often >2MB) instead of `~thumb.jpg`.

- [ ] **T9 — `alt` manquant ou vide sur plusieurs images**

In `site/index.html`, the hero image added at T8 has an empty `alt=""` (this is partially OK for purely decorative images, but here the image is informative — counts as an issue).

Additionally, in `site/assets/js/app.js`, in `renderProductCard`, **for catalog and home grids, leave the alt as the product name** (already correct). Then introduce one specific alt issue: in `renderProductCard` for a specific product (e.g., `dec-001`), output empty alt:

```javascript
// Replace in renderProductCard:
// '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" />'
// with:
'<img src="' + p.image + '" alt="' + (p.id === "dec-001" ? "" : p.name) + '" loading="lazy" />'
```

- [ ] **T10 — `lang` attribute manquant**

In `site/mentions-legales.html`, change `<html lang="fr">` to `<html>` (remove the lang attribute).

- [ ] **T11 — Canonical manquant + page accessible via deux URLs**

In `vercel.json`, add an additional rewrite that exposes `/catalogue` also as `/catalogue/all`:

```json
{ "source": "/catalogue/all", "destination": "/catalogue.html" }
```

No canonical link is present on the catalogue page — the duplicate URL creates a duplicate-content issue.

- [ ] **T12 — `robots.txt` bloquant `/blog/`**

In `site/robots.txt`, change to:

```
User-agent: *
Allow: /
Disallow: /blog/
Sitemap: https://stellaire.vercel.app/sitemap.xml
```

- [ ] **T13 — Sitemap incomplet**

In `site/sitemap.xml`, remove the lines for `mug-constellations` and `carte-tournante`. The candidate must notice that some products are not in the sitemap.

- [ ] **T14 — JSON-LD cassé sur une fiche produit**

In `site/assets/js/app.js`, in the `produit` page handler, after building the JSON-LD, **delete the `"price"` field for the product whose slug is "dobson-200mm"**:

```javascript
// Just before document.head.appendChild(ld); add:
if (product.slug === "dobson-200mm") {
  var parsed = JSON.parse(ld.textContent);
  delete parsed.offers.price;
  ld.textContent = JSON.stringify(parsed);
}
```

`price` is a required field for `Offer` — schema validator will flag this.

- [ ] **T15 — Lien interne 404 dans le footer**

In every page's footer, the "Politique cookies" link points to `/politique-cookies`. Change in `site/index.html` only (one occurrence is enough to count as a planted broken link — and we will not redirect, so other pages keep the correct link to vary the issue):

Actually simpler: add a footer link that 404s. In `site/index.html` footer, in the "Mentions" section, add a new line:

```html
<li><a href="/livraison">Livraison &amp; retours</a></li>
```

The page `/livraison` doesn't exist → 404.

### ERGONOMIQUE

- [ ] **E1 — Contraste insuffisant sur CTA principal**

In `site/assets/css/styles.css`, replace `.btn-primary-default` rule with:

```css
.btn-primary-default {
  background-color: #3730a3;
  color: #818cf8;  /* light indigo on dark indigo — fails WCAG AA */
}
```

- [ ] **E2 — Formulaire contact sans messages d'erreur visibles + labels via placeholder uniquement**

In `site/contact.html`, replace the form with a version that uses placeholders instead of `<label>`:

```html
<form id="contact-form" class="space-y-4">
  <input required placeholder="Nom" class="w-full bg-slate-900 px-3 py-2 rounded" />
  <input type="email" required placeholder="Email" class="w-full bg-slate-900 px-3 py-2 rounded" />
  <textarea required rows="5" placeholder="Message" class="w-full bg-slate-900 px-3 py-2 rounded"></textarea>
  <button type="submit" class="btn-primary-default px-4 py-2 rounded">Envoyer</button>
</form>
```

- [ ] **E3 — Pas de feedback visuel après "Ajouter au panier"**

In `site/assets/js/app.js`, in the `produit` handler, the click handler currently calls `refreshCartCount()`. Keep this — but **don't add any "added to cart" toast/message**. The cart count in the header updates silently, which is below the fold on mobile.

No change needed — this is already a planted issue by omission.

- [ ] **E4 — Mobile: zone tap < 44px sur la nav du footer**

In `site/index.html` footer, wrap the newsletter button with explicit small size:

```html
<button class="text-xs px-1 py-0 bg-indigo-600 rounded" style="min-height: 18px">OK</button>
```

(Replaces the existing newsletter button.)

- [ ] **E5 — Page checkout sans indicateur d'étape**

No action — this is already the case (the checkout page is a single form with no breadcrumb / step indicator). Document in `audit-issues.md`.

### ÉDITORIAL

- [ ] **C1 — Cannibalisation de mots-clés entre les 2 articles de blog**

Both articles target "télescope débutant" implicitly. Strengthen this by editing `site/blog/objets-celestes-du-mois.html` H1:

```html
<h1>Les 5 objets célestes à observer ce mois-ci pour débuter en astronomie avec son premier télescope</h1>
```

Now both articles include "premier télescope" in their visible heading → keyword cannibalization.

- [ ] **C2 — Marque "Stellaire" en début de title (suboptimal SEO)**

Already the case in `site/index.html`: `<title>Stellaire — Boutique d'astronomie...</title>` starts with the brand. Keep as-is. Document.

- [ ] **C3 — Fiche produit sans description rédigée**

In `site/assets/js/data.js`, for `obs-002` (Oculaire Plossl 10mm), replace `longDesc` with:

```
"Oculaire Plossl 10mm 31.75mm."
```

(Less than 50 characters — thin content.)

- [ ] **C4 — Maillage interne défaillant**

No action — by default, the blog articles do not link to product pages, and product pages do not link to blog articles. Document this in `audit-issues.md` as a recommendation opportunity.

- [ ] **C5 — Anchor text génériques**

In `site/index.html`, change the hero CTA from `Explorer la boutique` to `Cliquez ici`:

```html
<a href="/catalogue" class="inline-block mt-6 btn-primary-default px-6 py-3 rounded">Cliquez ici</a>
```

- [ ] **C6 — Article daté sans date affichée**

The article "Objets célestes du mois" implies a monthly publication but has no `<time>` element or visible date. No action needed — issue exists by omission.

- [ ] **C7 — Mentions légales indexable (devrait être noindex)**

No `<meta name="robots" content="noindex">` on `site/mentions-legales.html`, and the page is in the sitemap. Keep as-is, document.

### Commit all planted issues

- [ ] **Step Final: Verify the site still loads and commit**

```bash
cd site && python3 -m http.server 8000
```

Verify: home loads (with hero image), product pages load, JSON-LD for dobson-200mm is broken (use https://validator.schema.org/ on the deployed URL — or paste the page HTML).

```bash
git add site/
git commit -m "Plant ~20 SEO issues across pages (technique + ergo + éditorial) — see reference/audit-issues.md"
git tag baseline-with-issues
```

---

## Task 19: `exercises/README.md`

**Files:**
- Create: `exercises/README.md`

- [ ] **Step 1: Write the booklet intro**

```markdown
# Cahier d'exercices — Stellaire SEO Training

Bienvenue ! Ce parcours t'amène, en 8 étapes, à auditer un site e-commerce fictif et à y mettre en place tout le tracking (GTM, GA4, CMP) jusqu'au dashboard final. C'est exactement le genre de mission que tu pourrais avoir en agence.

## Pré-requis

- Un compte Google personnel (pour GTM, GA4, Looker Studio)
- Un compte Axeptio (offre gratuite, créé à l'étape 6)
- Chrome installé, plus deux extensions :
  - **Tag Assistant Companion** (Google)
  - **GTM/GA Debugger** (optionnel, complémentaire à Tag Assistant)
- Compte GitHub : tu n'auras qu'à éditer **un seul fichier** via l'interface web (clic sur le fichier → crayon → modifier → "Commit")
- Aucun logiciel à installer en local

## Ordre des étapes

Le parcours respecte l'ordre d'une mission agence réelle : **auditer d'abord, instrumenter ensuite**.

1. [Audit SEO (technique + ergonomique + éditorial)](01-audit-seo.md)
2. [Installer GTM](02-installer-gtm.md)
3. [Configurer GA4](03-configurer-ga4.md)
4. [Brancher les événements e-commerce](04-events-ecommerce.md)
5. [Ajouter un événement custom](05-event-custom.md)
6. [CMP Axeptio + Consent Mode v2](06-cmp-axeptio.md)
7. [Vérification bout-en-bout](07-verification.md)
8. [Construire le dashboard Looker Studio](08-dashboard-looker-studio.md)

## Comment travailler

Pour chaque étape, lis l'objectif, fais le travail, puis remplis toi-même la check-list de validation. Quand tu butes, regarde les "pièges classiques" en bas de chaque exercice. Quand tu as fini, on se fait un débrief — c'est le meilleur moment pour consolider ce que tu as appris.

Bon courage 🚀
```

- [ ] **Step 2: Commit**

```bash
git add exercises/README.md
git commit -m "Add exercises booklet intro"
```

---

## Task 20: Exercise 01 — Audit SEO

**Files:**
- Create: `exercises/01-audit-seo.md`

- [ ] **Step 1: Write the audit exercise**

````markdown
# Étape 1 — Audit SEO du site Stellaire

## Objectif

Auditer le site Stellaire (lien fourni par Adrien) sur trois axes — **technique**, **ergonomique**, **éditorial** — et produire un rapport structuré avec recommandations priorisées.

## Pré-requis

- Le lien Vercel du site déployé (Adrien te le fournit)
- Chrome avec Lighthouse (intégré aux DevTools)
- Optionnel : Screaming Frog SEO Spider (version gratuite, jusqu'à 500 URLs)
- Optionnel : Google Search Console (peut nécessiter de vérifier la propriété, voir étape 2)

## Marche à suivre

### 1. Découverte du site (15-20 min)

Parcours le site comme un visiteur lambda : home, catalogue, fiche produit, panier, checkout, blog, contact. Note tes premières impressions. Ce que tu **ressens** mal, un visiteur le ressentira aussi.

### 2. Audit technique (45-60 min)

Outils recommandés :
- **Lighthouse** (Chrome DevTools → Lighthouse → Generate report) : lance un audit sur la home, le catalogue, une fiche produit. Note les scores et les principales recommandations.
- **DevTools → Elements** : inspecte les `<head>` de chaque page (title, meta description, balises Hn, attribut lang, images sans alt).
- **DevTools → Network** : repère les ressources lourdes (images > 500ko).
- **`/robots.txt`** et **`/sitemap.xml`** : ouvre-les directement dans le navigateur. Cherche les incohérences.
- **Validateur Schema.org** : https://validator.schema.org/ — colle l'URL d'une fiche produit, vérifie le JSON-LD.
- Optionnel : **Screaming Frog** pour cartographier les URL, les balises, les liens internes/externes, les 404.

Pour chaque problème, note : page concernée, élément précis, ce qui ne va pas, ce qui devrait être fait.

### 3. Audit ergonomique (30-45 min)

Outils :
- **Lighthouse → Accessibility** : score + détails.
- **Navigation mobile** : Chrome DevTools → bascule mobile (Ctrl+Shift+M). Teste le parcours sur 360px de large.
- **Contraste** : DevTools → Inspect Element sur les boutons/CTA → onglet "Accessibility" → Contrast Ratio.
- **Test "à la souris fermée"** : essaie de soumettre un formulaire vide, supprime un produit du panier, valide une commande. Tout est-il clair ? Y a-t-il un feedback ?

### 4. Audit éditorial (30-45 min)

À l'œil et au cerveau :
- Les titres SEO sont-ils optimisés (mot-clé en début, pas trop longs, uniques) ?
- Les meta descriptions donnent-elles envie de cliquer ? Sont-elles uniques ?
- Le maillage interne est-il bon ? (le blog renvoie-t-il vers le catalogue ? les fiches produits vers des contenus connexes ?)
- Y a-t-il de la cannibalisation de mots-clés entre les pages ?
- Les anchor texts sont-ils descriptifs ou génériques ?
- Le contenu des fiches produits est-il suffisant et différencié ?

## Livrable attendu

Un rapport Markdown structuré comme suit (à rendre dans un fichier `audit-stellaire.md` que tu m'envoies) :

```markdown
# Audit SEO du site Stellaire — [ton nom] — [date]

## Synthèse exécutive
3-5 lignes : état général, principaux constats, axes prioritaires.

## 1. Axe technique
Pour chaque issue :
### Issue T1 — [titre court]
- **Page(s)** : URL(s)
- **Élément** : sélecteur ou description précise
- **Constat** : ce qui ne va pas
- **Impact estimé** : élevé / moyen / faible (+ pourquoi)
- **Recommandation** : action concrète à entreprendre
- **Priorité** : P1 (à corriger immédiatement) / P2 / P3

## 2. Axe ergonomique
Même format.

## 3. Axe éditorial
Même format.

## Plan d'action priorisé
Tableau récapitulatif : top 10 actions à mener, dans l'ordre.
```

## Critères de validation

- [ ] Au moins 12 issues identifiées au total (l'objectif est d'en trouver 15+)
- [ ] Chaque issue a sa localisation précise (URL + élément)
- [ ] Chaque issue a une recommandation actionnable
- [ ] Le rapport propose une priorisation justifiée
- [ ] Le rapport mentionne les outils utilisés pour chaque type d'issue

## Pièges classiques

- **Confondre score Lighthouse et priorité métier** : un score de 60 en SEO n'est pas forcément urgent si les pages clés sont OK.
- **Oublier le "pourquoi"** : recommander "ajouter une meta description" ne suffit pas — il faut expliquer l'impact (taux de clic SERP, lisibilité).
- **Ne regarder que les pages templates** : pense à auditer des pages "individuelles" (un produit en particulier, un article spécifique).
- **Négliger la dimension ergonomique** : un site rapide et bien balisé qui frustre les utilisateurs ne convertira pas.

## Ressources

- [Documentation Google : SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Lighthouse — comprendre les métriques](https://developer.chrome.com/docs/lighthouse/)
- [Schema.org Validator](https://validator.schema.org/)
- [Google Search Central — robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
````

- [ ] **Step 2: Commit**

```bash
git add exercises/01-audit-seo.md
git commit -m "Add exercise 1 (SEO audit)"
```

---

## Task 21: Exercise 02 — Installer GTM (le plus accompagné)

**Files:**
- Create: `exercises/02-installer-gtm.md`

- [ ] **Step 1: Write the GTM install exercise (extra-guided)**

````markdown
# Étape 2 — Installer GTM sur le site Stellaire

## Objectif

Créer un conteneur Google Tag Manager (Web), récupérer son ID, et le brancher au site Stellaire en éditant **un seul fichier** via l'interface GitHub. Vérifier que GTM charge bien sur toutes les pages.

## Pré-requis

- Étape 1 (audit) terminée
- Un compte Google personnel
- Accès au repo GitHub Stellaire (Adrien t'a partagé le lien)

## Marche à suivre — pas à pas

### 1. Créer un compte et un conteneur GTM

1. Va sur https://tagmanager.google.com/ et connecte-toi.
2. Clique "**Créer un compte**".
3. Nom du compte : "Stellaire — Training" (ou ce que tu veux). Pays : France.
4. Nom du conteneur : "Stellaire Web". Plateforme cible : **Web**.
5. Accepte les conditions. Tu arrives sur l'écran d'accueil du conteneur — Google affiche **deux snippets** de code et un identifiant qui ressemble à `GTM-XXXXXXX`.
6. **Note ton GTM-ID** quelque part — on s'en sert juste après.
7. Tu peux fermer la fenêtre des snippets : on ne va PAS copier-coller leur contenu, on a déjà le code prêt sur le site.

### 2. Brancher l'ID sur le site

C'est ici qu'on remplace le snippet "à coller dans le `<head>`" par une seule modification d'un fichier.

1. Va sur le repo GitHub du site (Adrien t'a partagé l'URL).
2. Ouvre le fichier **`site/assets/js/integrations.js`**.
3. Clique sur l'icône **crayon** ("Edit this file") en haut à droite.
4. Cherche la ligne qui contient `'GTM-XXXXXXX'`. Elle apparaît **deux fois** : remplace les **deux** occurrences par ton vrai GTM-ID (ex : `'GTM-AB1C2D3'`).
5. Scrolle en bas de la page, clique **"Commit changes..."**, puis **"Commit changes"** dans la modale.
6. Attends ~30 secondes : Vercel redéploie automatiquement.

### 3. Vérifier que GTM charge

1. Retourne sur ton conteneur GTM.
2. Clique sur **"Aperçu"** (en haut à droite). Saisis l'URL du site Stellaire (ex : `https://stellaire-xxx.vercel.app`). Clique "Connect".
3. Une nouvelle fenêtre s'ouvre avec ton site, et **Tag Assistant** s'affiche dans une autre fenêtre. Tu dois voir "Connected!".
4. Dans Tag Assistant, tu dois voir l'événement **"Container Loaded"**. C'est gagné.
5. Bonus : installe l'extension Chrome **Tag Assistant Companion** pour mieux voir ce qui se passe sur le site.

## Livrable attendu

- Ton GTM-ID communiqué à Adrien
- Une capture d'écran de Tag Assistant montrant "Container Loaded" sur la home Stellaire

## Critères de validation

- [ ] GTM-ID au format `GTM-XXXXXXX` créé
- [ ] `integrations.js` modifié sur GitHub (ton ID y figure aux deux endroits)
- [ ] Vercel a redéployé (l'historique des déploiements le confirme)
- [ ] Tag Assistant affiche "Container Loaded" sur la home, le catalogue ET une fiche produit
- [ ] La balise `<script src="https://www.googletagmanager.com/gtm.js?id=...">` est présente dans le HTML chargé (DevTools → Network → filter "gtm")

## Pièges classiques

- **Oublier de remplacer les deux occurrences** dans `integrations.js` (il y en a une dans le code IIFE, une dans le guard). Vérifie qu'aucun `GTM-XXXXXXX` ne traîne après ton commit.
- **Tester sans attendre Vercel** : le déploiement met ~30s. Va voir l'onglet "Deployments" du repo (sur Vercel) pour confirmer que le nouveau déploiement est "Ready".
- **Bloqué par un bloqueur de pub** : les extensions type uBlock peuvent bloquer GTM. Désactive-les sur l'URL Stellaire pour tester.
- **Snippet noscript non posé** : avec notre approche JS-only, le `<noscript>` du snippet GTM n'est pas en place. C'est volontaire et acceptable pour ce projet — on en reparlera en débrief.

## Ressources

- [GTM — Quickstart Guide](https://developers.google.com/tag-platform/tag-manager/web)
- [Comprendre `dataLayer`](https://developers.google.com/tag-platform/tag-manager/datalayer)
- [Tag Assistant — Mode d'emploi](https://support.google.com/tagassistant/answer/10039345)
````

- [ ] **Step 2: Commit**

```bash
git add exercises/02-installer-gtm.md
git commit -m "Add exercise 2 (GTM install, extra-guided)"
```

---

## Task 22: Exercise 03 — Configurer GA4

**Files:**
- Create: `exercises/03-configurer-ga4.md`

- [ ] **Step 1: Write exercise 03**

````markdown
# Étape 3 — Configurer GA4 via GTM

## Objectif

Créer une propriété GA4, créer dans GTM le tag de configuration GA4 qui va l'alimenter, et vérifier en temps réel que les hits remontent.

## Pré-requis

- Étape 2 terminée (GTM branché sur le site)

## Marche à suivre

### 1. Créer une propriété GA4

1. Va sur https://analytics.google.com/.
2. Crée un compte si besoin, puis une **propriété** GA4 "Stellaire — Training". Devise : EUR. Fuseau : Europe/Paris.
3. À la création, GA4 te propose un **flux de données Web** : indique l'URL Vercel du site Stellaire.
4. Récupère ton **Measurement ID** (format `G-XXXXXXXXXX`). Note-le.

### 2. Créer le tag de configuration GA4 dans GTM

1. Va sur GTM, ouvre ton conteneur Stellaire.
2. Onglet **Balises** → **Nouvelle**.
3. Type : **Google Tag** (anciennement "GA4 Configuration" — la fusion des deux a eu lieu en 2024). Renseigne :
   - **Tag ID** : ton `G-XXXXXXXXXX`
4. Déclencheur : **All Pages**.
5. Nom de la balise : "GA4 — Configuration".
6. Enregistre.

### 3. Tester avant publication

1. Clique **"Aperçu"** en haut à droite, saisis l'URL Stellaire, lance la session de debug.
2. Sur le site, parcours quelques pages.
3. Dans Tag Assistant, vérifie que la balise "GA4 — Configuration" se déclenche bien sur chaque page.
4. Va sur GA4 → **Configurer** → **DebugView**. Tu dois voir des événements `page_view` arriver en temps réel.

### 4. Publier le conteneur

1. Dans GTM, clique **"Envoyer"** (en haut à droite).
2. Nom de version : "v1 — GA4 config". Description : "Configuration de base GA4".
3. Publie.

## Livrable attendu

- Measurement ID GA4 communiqué à Adrien
- Capture de GA4 DebugView montrant des `page_view` en temps réel sur le site Stellaire

## Critères de validation

- [ ] Propriété GA4 créée, flux Web associé à l'URL Stellaire
- [ ] Tag "GA4 — Configuration" créé dans GTM, déclencheur "All Pages"
- [ ] Aperçu GTM montre la balise déclenchée à chaque navigation
- [ ] DebugView GA4 montre `page_view` en temps réel
- [ ] Version GTM publiée (visible dans l'historique des versions)

## Pièges classiques

- **Oublier de cliquer "Envoyer"** : tant que tu n'as pas publié, le tag n'est actif qu'en preview pour toi. La candidate doit publier pour que les hits remontent depuis n'importe quel visiteur.
- **Confondre Measurement ID (G-XXX) et GTM-ID (GTM-XXX)** : le premier va dans le tag GA4 ; le second est déjà dans `integrations.js`.
- **DebugView vide** : il faut être en mode debug (aperçu GTM ou extension GA Debugger active). Sans ça, tes événements vont dans le rapport "Realtime" mais pas dans "DebugView".

## Ressources

- [Configurer une propriété GA4](https://support.google.com/analytics/answer/9304153)
- [Le tag GA4 dans GTM](https://support.google.com/tagmanager/answer/9442095)
- [GA4 DebugView](https://support.google.com/analytics/answer/7201382)
````

- [ ] **Step 2: Commit**

```bash
git add exercises/03-configurer-ga4.md
git commit -m "Add exercise 3 (GA4 configuration via GTM)"
```

---

## Task 23: Exercise 04 — Events e-commerce

**Files:**
- Create: `exercises/04-events-ecommerce.md`

- [ ] **Step 1: Write exercise 04**

````markdown
# Étape 4 — Brancher les événements e-commerce

## Objectif

Faire remonter dans GA4 les événements e-commerce que le site Stellaire pousse déjà dans `dataLayer` : `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `purchase`. Valider chaque événement en DebugView.

## Pré-requis

- Étape 3 terminée (GA4 reçoit déjà des `page_view`)

## Contexte

Le site Stellaire pousse déjà ces événements dans `window.dataLayer` quand l'utilisateur navigue. Tu peux le vérifier en ouvrant la console et en tapant `dataLayer` après avoir cliqué sur "Ajouter au panier". Ton travail : créer dans GTM les balises qui capturent ces événements et les envoient à GA4, en récupérant les paramètres (`items`, `value`, etc.) depuis le `dataLayer`.

## Marche à suivre

### 1. Créer les variables Data Layer dans GTM

Pour chaque paramètre dont tu auras besoin, tu crées une variable Data Layer.

1. Onglet **Variables** → **Variables définies par l'utilisateur** → **Nouvelle**.
2. Type : **Data Layer Variable**.
3. Crée au minimum :
   - `dlv - ecommerce` → "Nom de la variable Data Layer" : `ecommerce`
   - `dlv - ecommerce.value` → `ecommerce.value`
   - `dlv - ecommerce.items` → `ecommerce.items`
   - `dlv - ecommerce.currency` → `ecommerce.currency`
   - `dlv - ecommerce.transaction_id` → `ecommerce.transaction_id`

### 2. Créer un déclencheur "Custom Event" par événement

1. Onglet **Déclencheurs** → **Nouveau**.
2. Type : **Custom Event**.
3. Pour `view_item` : "Event name" = `view_item`. Coche "All Custom Events" → "Some Custom Events" si tu veux ajouter une condition.
4. Répète pour `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `purchase`.

### 3. Créer un tag GA4 Event par événement

1. Onglet **Balises** → **Nouvelle**.
2. Type : **GA4 Event**.
3. **Configuration tag** : pointe vers ta balise "GA4 — Configuration" (ou renseigne directement ton Measurement ID).
4. **Event Name** : `view_item` (correspond à ce qu'on envoie à GA4).
5. **Event Parameters** : ajoute les paramètres pertinents :
   - `currency` → `{{dlv - ecommerce.currency}}`
   - `value` → `{{dlv - ecommerce.value}}`
   - `items` → `{{dlv - ecommerce.items}}`
6. **Déclencheur** : `view_item`.
7. Nom de la balise : "GA4 — view_item".
8. Répète pour chaque événement, en ajustant les paramètres (pour `purchase`, ajouter `transaction_id`, `tax`, `shipping`).

### 4. Tester en DebugView

1. Mode Aperçu GTM activé, parcours le site : home → fiche produit → ajout panier → checkout → confirmation.
2. Vérifie en DebugView GA4 : chaque événement remonte avec ses paramètres. Clique sur un événement pour voir les `items` détaillés.

### 5. Publier

Quand tout fonctionne, publie le conteneur (version "v2 — e-commerce events").

## Livrable attendu

- Une capture de DebugView montrant un `purchase` complet (avec `transaction_id`, `value`, et la liste des `items`)

## Critères de validation

- [ ] 6 tags GA4 Event créés (un par événement e-commerce)
- [ ] Chaque tag a son déclencheur Custom Event correspondant
- [ ] Les variables Data Layer renvoient bien les bonnes valeurs (vérifié en Aperçu GTM)
- [ ] DebugView GA4 affiche les 6 événements avec leurs paramètres après un parcours complet
- [ ] Conteneur publié en version "v2 — e-commerce events"

## Pièges classiques

- **Confondre `event name` au sens GTM (déclencheur Custom Event) et `event name` envoyé à GA4** (champ "Event Name" du tag) : les deux sont indépendants. La best practice est de les garder identiques.
- **Oublier d'envoyer le tableau `items` complet** : sans `items`, GA4 ne peut pas calculer le revenu par produit ni le funnel.
- **Mode Aperçu non rafraîchi** : si tu modifies un tag, sors et rentre en aperçu (sinon tu testes l'ancienne version).
- **Variable Data Layer mal nommée** : `ecommerce.items` ≠ `ecommerce_items`. Respecte le path exact tel qu'il est poussé.

## Ressources

- [GA4 — Schéma e-commerce recommandé](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [GTM — Variables Data Layer](https://support.google.com/tagmanager/answer/9080510)
- [GTM — Custom Event Trigger](https://support.google.com/tagmanager/answer/7679219)
````

- [ ] **Step 2: Commit**

```bash
git add exercises/04-events-ecommerce.md
git commit -m "Add exercise 4 (e-commerce events)"
```

---

## Task 24: Exercise 05 — Event custom

**Files:**
- Create: `exercises/05-event-custom.md`

- [ ] **Step 1: Write exercise 05**

````markdown
# Étape 5 — Ajouter un événement custom (sans toucher au code)

## Objectif

Configurer dans GTM, **sans modifier le code du site**, un événement custom qui mesure soit un clic spécifique soit un scroll profond. L'envoyer à GA4. Valider en DebugView.

## Pré-requis

- Étape 4 terminée

## Choisir une cible (une suffit)

**Option A — Clic sur le CTA "Voir nos coups de cœur" en fiche produit**
- Sélecteur : `[data-testid="coup-de-coeur"]`
- Le bouton est présent sur toutes les fiches produit

**Option B — Scroll 75% sur une fiche produit**
- Tu utilises le déclencheur natif "Scroll Depth"

## Marche à suivre — Option A (clic CTA)

### 1. Activer les variables intégrées de clic

1. Variables → "Configurer" (à droite des variables intégrées) → coche au minimum :
   - `Click Element`
   - `Click Classes`
   - `Click Target`
   - `Click URL`

### 2. Créer un déclencheur "Click — All Elements"

1. Déclencheurs → Nouveau → type **Click — All Elements**.
2. Cette déclenche se produit sur : **Some Clicks**.
3. Condition : `Click Element` → **matches CSS selector** → `[data-testid="coup-de-coeur"]`.
4. Nom : "Click — Coup de cœur".

### 3. Créer le tag GA4 Event

1. Tag GA4 Event :
   - Event Name : `coup_de_coeur_click`
   - Paramètre suggéré : `link_text` → `{{Click Text}}` (variable intégrée à activer)
2. Déclencheur : "Click — Coup de cœur".
3. Nom : "GA4 — coup_de_coeur_click".

## Marche à suivre — Option B (scroll 75%)

### 1. Créer un déclencheur "Scroll Depth"

1. Déclencheurs → Nouveau → type **Scroll Depth**.
2. Vertical Scroll Depths : Percentages → 75.
3. Cette déclenche se produit sur : Pages ayant `Page Path` contenant `/produit/` (variable intégrée `Page Path`).
4. Nom : "Scroll — Fiche produit 75%".

### 2. Créer le tag GA4 Event

1. Tag GA4 Event :
   - Event Name : `deep_scroll`
   - Paramètres : `percent_scrolled` → `{{Scroll Depth Threshold}}`
2. Déclencheur : "Scroll — Fiche produit 75%".

## Tester et publier

1. Mode Aperçu : exécute l'action (clic ou scroll) sur une fiche produit.
2. Vérifie en DebugView GA4 l'événement (`coup_de_coeur_click` ou `deep_scroll`) avec ses paramètres.
3. Publie le conteneur (version "v3 — event custom").

## Livrable attendu

- Capture DebugView GA4 montrant l'événement custom avec ses paramètres

## Critères de validation

- [ ] Déclencheur custom créé (clic CSS selector ou scroll depth)
- [ ] Tag GA4 Event créé, événement nommé en snake_case
- [ ] Événement visible en DebugView avec au moins un paramètre utile
- [ ] Aucune modification du code source du site n'a été nécessaire

## Pièges classiques

- **CSS selector incorrect** : tester d'abord dans la console du site avec `document.querySelector('[data-testid="coup-de-coeur"]')` — si ça renvoie `null`, le selector est faux.
- **Déclencheur "All Clicks" sans condition** : tu enverrais des `click` GA4 sur chaque clic du site. Toujours scoper.
- **Nom d'événement avec espaces ou majuscules** : GA4 normalise tout en snake_case. Reste cohérent.

## Ressources

- [GTM — Click triggers](https://support.google.com/tagmanager/answer/7679320)
- [GTM — Scroll Depth trigger](https://support.google.com/tagmanager/answer/7679626)
- [GA4 — Naming conventions for events](https://support.google.com/analytics/answer/13316687)
````

- [ ] **Step 2: Commit**

```bash
git add exercises/05-event-custom.md
git commit -m "Add exercise 5 (custom event via GTM only)"
```

---

## Task 25: Exercise 06 — CMP Axeptio + Consent Mode v2

**Files:**
- Create: `exercises/06-cmp-axeptio.md`

- [ ] **Step 1: Write exercise 06**

````markdown
# Étape 6 — CMP Axeptio + Consent Mode v2

## Objectif

Mettre en place un bandeau de consentement cookies fonctionnel via Axeptio, configurer le Consent Mode v2 de Google (default denied → update au consentement), et vérifier que les tags GTM respectent l'état du consent.

## Pré-requis

- Étape 5 terminée
- Un projet Axeptio créé (offre gratuite suffisante)

## Marche à suivre

### 1. Créer ton projet Axeptio

1. Va sur https://www.axeptio.eu/ et crée un compte (gratuit).
2. Crée un nouveau projet "Stellaire".
3. Crée une **Version de cookies** : nom interne `stellaire-base`. Configure les catégories :
   - **Mesure d'audience** (lié à `analytics_storage`)
   - **Publicité** (lié à `ad_storage`, `ad_user_data`, `ad_personalization`) — même si on n'en a pas, prévois-la
4. Récupère ton **clientId** dans les paramètres du projet (format UUID).

### 2. Brancher Axeptio sur le site

1. Sur GitHub, ouvre `site/assets/js/integrations.js`, clique sur le crayon.
2. Trouve la ligne `clientId: "YOUR-CLIENT-ID"`. Remplace par ton vrai clientId.
3. Confirme que `cookiesVersion: "stellaire-base"` correspond bien au nom de version cookies que tu as créé dans Axeptio.
4. Commit.

### 3. Activer le Consent Mode v2 par défaut (denied)

Dans le même fichier `integrations.js`, **avant le bloc GTM**, il y a un bloc commenté (BLOC 0) qui ressemble à :

```javascript
// window.gtag = window.gtag || function(){ ... };
// gtag('consent', 'default', { ... });
```

**Décommente l'intégralité du BLOC 0**. Cela définit le consent par défaut à `denied`. Tant que le visiteur n'a pas cliqué sur "Accepter" dans Axeptio, Google sait qu'il n'a pas le droit de stocker de cookies analytics ou pub.

Commit.

### 4. Configurer Axeptio pour appeler `gtag consent update`

Dans le back-office Axeptio :
1. Va dans **Intégrations** → **Google Consent Mode v2**.
2. Active l'intégration.
3. Axeptio se charge d'appeler `gtag('consent', 'update', { ... })` quand l'utilisateur consent. Vérifie dans la doc Axeptio s'il faut renseigner un script complémentaire ; sinon, le SDK Axeptio le fait tout seul.

### 5. Vérifier

1. Ouvre une fenêtre **navigation privée** (sinon Axeptio se souvient de ton consent précédent).
2. Charge le site Stellaire. Le bandeau Axeptio doit apparaître.
3. Avec Tag Assistant ouvert : avant que tu cliques "Accepter", le tag GA4 ne doit **pas** se déclencher (ou se déclencher en mode `consent denied` — visible dans Tag Assistant).
4. Clique "Accepter" dans Axeptio. Le tag GA4 doit alors se déclencher normalement.
5. Refais le test en cliquant "Refuser" : aucun cookie analytics ne doit être déposé (vérifie dans DevTools → Application → Cookies).

### 6. Compléter la page politique cookies

La page `site/politique-cookies.html` est vide. Édite-la sur GitHub pour y mettre un contenu rédigé qui explique : quelles catégories de cookies sont utilisées, à quoi elles servent, comment l'utilisateur peut modifier son choix (lien vers le widget Axeptio).

### 7. Publier

Publie le conteneur GTM (version "v4 — consent mode").

## Livrable attendu

- Captures montrant :
  - Bandeau Axeptio affiché en première visite
  - Tag GA4 bloqué (consent denied) avant clic "Accepter"
  - Tag GA4 actif après clic "Accepter"
  - Page politique cookies remplie

## Critères de validation

- [ ] Projet Axeptio créé, clientId branché dans `integrations.js`
- [ ] Bloc Consent Mode v2 par défaut (denied) activé dans `integrations.js`
- [ ] Bandeau Axeptio visible en navigation privée
- [ ] Vérification que les tags respectent le consent (avant/après "Accepter")
- [ ] Page politique cookies remplie avec un contenu rédigé

## Pièges classiques

- **Tester avec un consent déjà donné** : utilise toujours la navigation privée pour réinitialiser.
- **Oublier la `cookiesVersion`** : si elle ne correspond pas à celle du back-office Axeptio, le bandeau ne s'affiche pas.
- **Configurer le consent mode APRÈS le tag GTM** : l'ordre est critique. Le `gtag('consent', 'default', ...)` doit être exécuté AVANT le snippet GTM. Notre `integrations.js` respecte cet ordre — ne change pas la position des blocs.
- **Confondre `analytics_storage` et `ad_storage`** : `analytics_storage` contrôle GA4. `ad_storage` contrôle Google Ads.

## Ressources

- [Axeptio — documentation](https://developers.axeptio.eu/v/francais)
- [Google Consent Mode v2 — overview](https://developers.google.com/tag-platform/security/guides/consent)
- [GTM — Consent settings](https://support.google.com/tagmanager/answer/10718549)
````

- [ ] **Step 2: Commit**

```bash
git add exercises/06-cmp-axeptio.md
git commit -m "Add exercise 6 (Axeptio CMP + Consent Mode v2)"
```

---

## Task 26: Exercise 07 — Vérification

**Files:**
- Create: `exercises/07-verification.md`

- [ ] **Step 1: Write exercise 07**

````markdown
# Étape 7 — Vérification bout-en-bout

## Objectif

Faire le tour de toute l'implémentation, croiser les sources de vérification (Tag Assistant, GA4 DebugView, GA4 Realtime, DevTools, Axeptio), et documenter ce qui passe et ce qui ne passe pas.

## Pré-requis

- Étapes 1 à 6 terminées

## Marche à suivre

### 1. Préparer un parcours utilisateur "golden path"

Tu vas exécuter ce parcours en navigation privée :

1. Charger la home
2. Refuser le consentement Axeptio → vérifier que GA4 ne reçoit RIEN
3. Effacer les cookies (fermer/rouvrir nav privée)
4. Recharger la home, **accepter** Axeptio
5. Naviguer : home → catalogue (filtrer "Télescopes") → fiche produit Dobson 200mm → ajout au panier → panier → checkout → soumission → confirmation
6. Retourner sur le site, soumettre le formulaire contact
7. Soumettre le formulaire newsletter en footer

### 2. Liste de contrôle des événements attendus dans GA4 DebugView

À chaque étape du parcours, vérifie que l'événement attendu remonte :

| Étape user | Événement GA4 attendu | Paramètres clés |
|---|---|---|
| Charge home | `page_view` | `page_location` = home URL |
| Charge fiche produit | `page_view` + `view_item` | `items[0].item_name` = "Dobson 200mm" |
| Click "Voir nos coups de cœur" | `coup_de_coeur_click` ou `deep_scroll` (selon ton choix étape 5) | — |
| Click "Ajouter au panier" | `add_to_cart` | `value`, `items[0]` |
| Charge panier | `view_cart` | `value` = total panier |
| Click "Passer commande" | `begin_checkout` | `value`, `items` |
| Soumet checkout | `page_view` (confirmation) + `purchase` | `transaction_id`, `value`, `items` |
| Soumet contact | `generate_lead` | `form_id` = "contact" |
| Soumet newsletter | `sign_up` | `method` = "newsletter" |

### 3. Croisement multi-sources

Pour chaque événement, vérifie sur 2 sources :
- **Tag Assistant** : la balise GTM s'est déclenchée, avec les bons paramètres
- **GA4 DebugView** : l'événement est arrivé sur Google, avec les bons paramètres
- Bonus : **GA4 Realtime** (sans mode debug) montre aussi les événements en quasi temps-réel

### 4. Documenter

Produis un fichier `verification-stellaire.md` avec :

```markdown
# Vérification du tracking — Stellaire

## Configuration testée
- GTM-ID : ...
- GA4 Measurement ID : ...
- Axeptio clientId : ...
- Version conteneur GTM : v4
- Date du test : ...

## Résultats par événement

| Événement | Tag Assistant | DebugView | Realtime | Paramètres OK | Notes |
|---|---|---|---|---|---|
| page_view (home) | ✅ | ✅ | ✅ | ✅ | — |
| view_item | ✅ | ✅ | ✅ | ✅ | — |
| ... | ... | ... | ... | ... | ... |

## Issues identifiées
- [Si tu trouves un événement qui ne remonte pas correctement, décris ici]

## Comportement consent
- [ ] Tags bloqués avant consent (consent denied)
- [ ] Tags actifs après consent
- [ ] Aucun cookie analytics avant consent
```

## Livrable attendu

Le fichier `verification-stellaire.md` complété et envoyé à Adrien.

## Critères de validation

- [ ] Tous les événements attendus (tableau ci-dessus) ont été testés
- [ ] Pour chaque événement, deux sources de vérification au minimum
- [ ] Le comportement consent (denied → update) est vérifié
- [ ] Toute issue est documentée avec sa cause probable

## Pièges classiques

- **Cookies persistants** : la même session de test peut donner un résultat différent quelques minutes plus tard si le consent change. Toujours utiliser la navigation privée pour des tests propres.
- **DebugView ne montre rien** : il faut être en mode debug actif (preview GTM ou extension GA Debugger). Sinon, les hits vont dans Realtime mais pas DebugView.
- **Confondre Realtime et Reports standards** : les rapports standards GA4 ont 24-48h de latence. Ne les utilise pas pour vérifier que ton implémentation marche le jour J.

## Ressources

- [GA4 DebugView documentation](https://support.google.com/analytics/answer/7201382)
- [Tag Assistant — déboguer GTM](https://support.google.com/tagassistant)
````

- [ ] **Step 2: Commit**

```bash
git add exercises/07-verification.md
git commit -m "Add exercise 7 (end-to-end verification)"
```

---

## Task 27: Exercise 08 — Dashboard Looker Studio

**Files:**
- Create: `exercises/08-dashboard-looker-studio.md`

- [ ] **Step 1: Write exercise 08**

````markdown
# Étape 8 — Construire le dashboard Looker Studio

## Objectif

Construire dans Looker Studio (ex-Data Studio) un dashboard **une page** qui restitue l'essentiel de l'activité du site Stellaire : acquisition, conversion, produits, funnel.

## Pré-requis

- Étapes 1 à 7 terminées
- Idéalement : 24h-48h après le tracking pour avoir un peu de données. Sinon, force des données en faisant toi-même un parcours complet plusieurs fois.

## Marche à suivre

### 1. Créer le rapport

1. Va sur https://lookerstudio.google.com/.
2. Nouveau rapport vierge.
3. Ajoute une source de données → **Google Analytics** → sélectionne la propriété Stellaire que tu as créée.

### 2. Structurer la page

Découpe la page en 4 zones :

```
+--------------------------------------------------+
| EN-TÊTE : Logo + titre + période                 |
+--------------------------------------------------+
| KPI cards : Sessions | Utilisateurs |             |
|             Taux de conv. | Revenue total        |
+--------------------------------------------------+
| Acquisition (gauche)    | Funnel achat (droite)  |
| - Sessions/source       | view_item → add_to_cart|
| - Bar chart             | → begin_checkout       |
|                         | → purchase             |
+-------------------------+-------------------------+
| Top produits (bas)                                |
| Tableau : item_name | quantité | revenue        |
+--------------------------------------------------+
```

### 3. KPI cards (4)

Pour chacune : composant "Scorecard".

- **Sessions** : métrique `Sessions`
- **Utilisateurs actifs** : métrique `Active users`
- **Taux de conversion (achats)** : métrique `Purchaser conversion rate` (ou calculée : `purchase / sessions`)
- **Revenue total** : métrique `Total revenue`

### 4. Acquisition

Composant "Bar chart" :
- Dimension : `Session source / medium`
- Métrique : `Sessions`
- Tri : `Sessions` descendant, top 10

### 5. Funnel d'achat

Looker Studio n'a pas de "funnel" natif simple. Deux approches :
- **Tableau** avec dimension `Event name` filtrée sur `view_item, add_to_cart, begin_checkout, purchase`, métrique `Event count`. Tri manuel des lignes dans l'ordre du funnel.
- **Bar chart horizontale** triée dans le même ordre.

Choisis ce qui rend le mieux.

### 6. Top produits

Composant "Tableau" :
- Dimension : `Item name`
- Métriques : `Items purchased`, `Item revenue`
- Tri : `Item revenue` descendant, top 5

### 7. Période et filtres

- Ajoute un **contrôle de plage de dates** en haut → permet à l'utilisateur de changer la période.
- Période par défaut : **7 derniers jours**.

### 8. Mise en forme

- Charte cosmique : fond sombre (#0F172A), titres clairs, accents indigo
- Logo Stellaire en en-tête
- Titres clairs sur chaque bloc

### 9. Partager

Bouton "Partager" → "Obtenir un lien de visualisation" → réglage "Toute personne disposant du lien peut consulter".

## Livrable attendu

- L'URL publique du dashboard Looker Studio, envoyée à Adrien
- Un commentaire (un paragraphe) qui explique : pour qui ce dashboard est conçu, quelles décisions il permet de prendre

## Critères de validation

- [ ] Dashboard tient sur une seule page
- [ ] 4 KPI cards en haut
- [ ] Vue acquisition (bar chart sources)
- [ ] Vue funnel (4 étapes : view_item → add_to_cart → begin_checkout → purchase)
- [ ] Top 5 produits par revenue
- [ ] Sélecteur de période
- [ ] Cohérence visuelle (cosmic palette)

## Pièges classiques

- **Mauvaise dimension "Source"** : `Session source/medium` vs `First user source/medium` — ne dit pas la même chose.
- **Périodes incohérentes** : si tu compares la semaine vs la veille, normalise les périodes.
- **Trop de tout** : sur 1 page, on ne peut pas tout dire. Si une métrique n'aide pas à prendre une décision, on l'enlève.
- **Filtres globaux qui cassent une vue** : un filtre "purchase only" appliqué globalement empêche le funnel de montrer les autres étapes.

## Ressources

- [Looker Studio — connecteur GA4](https://support.google.com/looker-studio/answer/6283323)
- [GA4 — Dimensions et métriques disponibles](https://support.google.com/analytics/answer/9143382)
````

- [ ] **Step 2: Commit**

```bash
git add exercises/08-dashboard-looker-studio.md
git commit -m "Add exercise 8 (Looker Studio dashboard)"
```

---

## Task 28: Reference — Audit issues answer key

**Files:**
- Create: `reference/audit-issues.md`

This is the answer key for Task 18. Even though `reference/` is gitignored, the file is created locally for Adrien's use during debriefing.

- [ ] **Step 1: Write `reference/audit-issues.md`**

```markdown
# Audit Issues — Answer Key (Stellaire)

> Liste exhaustive des 20+ issues plantées intentionnellement, pour servir de grille de correction du livrable d'audit (exercice 1).

## TECHNIQUE

| Code | Page / URL | Élément | Constat | Reco | Priorité |
|------|------------|---------|---------|------|----------|
| T1 | `/contact` | `<head>` | `<title>` manquant | Ajouter `<title>Nous contacter | Stellaire</title>` | P1 |
| T2 | `/produit/lunette-astro-90` | `<title>` | Title > 70 caractères (99 chars) | Reformuler en < 65 chars en gardant la requête cible | P2 |
| T3 | Toutes les fiches produit | `<title>` | Title `Produit | Stellaire` dupliqué sur 12 pages | Générer dynamiquement à partir du nom du produit | P1 |
| T4 | `/blog/` | `<head>` | Meta description manquante | Ajouter une meta description unique | P2 |
| T5 | Articles blog | `<head>` | Meta descriptions identiques sur les deux articles | Rédiger une description unique par article | P2 |
| T6 | `/` (home) | `<main>` | Deux H1 (un dans le hero, un dans "Coups de cœur") | Garder un seul H1 par page, basculer en H2 | P2 |
| T7 | `/blog/choisir-premier-telescope` | `<h4>3. Notre recommandation</h4>` | Saut de hiérarchie H2 → H4 | Repasser en H2 (ou H3 si volonté de hiérarchiser) | P3 |
| T8 | `/` (home) | `<img src="PIA23645/...~orig.jpg">` | Image > 2 Mo, non optimisée | Servir une version compressée (WebP, < 200ko) | P1 |
| T9 | Cards "Posters & déco" sur catalogue | `<img alt="">` | alt vide pour `dec-001` (informatif, devrait avoir un alt) | Renseigner un alt descriptif | P2 |
| T10 | `/mentions-legales` | `<html>` | Attribut `lang` manquant | Ajouter `lang="fr"` | P3 |
| T11 | `/catalogue` accessible aussi via `/catalogue/all` | Pas de canonical | Duplicate content (deux URLs, même contenu) | Ajouter `<link rel="canonical" href="/catalogue">` ou supprimer la duplication | P1 |
| T12 | `/robots.txt` | `Disallow: /blog/` | Blog entier interdit aux crawlers | Retirer la directive | P1 |
| T13 | `/sitemap.xml` | Lignes manquantes | Mug Constellations et Carte tournante absents du sitemap | Ajouter les URLs manquantes | P2 |
| T14 | `/produit/dobson-200mm` | JSON-LD | Champ `price` manquant dans `offers` | Vérifier que JSON-LD est complet ; régénérer | P2 |
| T15 | Footer de la home | `<a href="/livraison">` | Lien 404 | Soit créer la page, soit retirer le lien | P3 |

## ERGONOMIQUE

| Code | Page / URL | Élément | Constat | Reco | Priorité |
|------|------------|---------|---------|------|----------|
| E1 | Toutes pages | `.btn-primary-default` | Contraste #818cf8 sur #3730a3 : ratio 2.8 (< AA 4.5) | Augmenter le contraste du texte (blanc pur ou jaune clair) | P1 |
| E2 | `/contact` | Formulaire | Labels remplacés par `placeholder`. Accessibilité dégradée, pas de message d'erreur lisible | Restaurer les `<label>`, ajouter une zone d'erreur visible | P2 |
| E3 | `/produit/*` | Click "Ajouter au panier" | Pas de feedback visuel (juste un compteur dans la nav qui change) | Ajouter un toast ou animer le bouton | P2 |
| E4 | Footer | Newsletter button | Hauteur < 24px (zone tap insuffisante mobile) | Min-height 44px | P3 |
| E5 | `/checkout` | Formulaire | Pas d'indicateur d'étape, bouton Confirmer après une section qui ressemble à un footer | Ajouter un breadcrumb d'étapes, repositionner le CTA | P2 |

## ÉDITORIAL

| Code | Page / URL | Élément | Constat | Reco | Priorité |
|------|------------|---------|---------|------|----------|
| C1 | Articles blog | H1 | Les deux articles ciblent "premier télescope" dans leur H1 visible | Désambiguïser : article 2 doit cibler "ciel du mois" | P1 |
| C2 | Toutes pages | `<title>` | Marque "Stellaire" en début de title | Placer la requête cible en début, marque en fin | P2 |
| C3 | `/produit/oculaire-plossl-10` | `longDesc` | Description < 50 caractères, thin content | Rédiger une description riche (avantages, usage, public cible) | P2 |
| C4 | Blog ↔ Catalogue | Liens internes | Aucun lien entre articles et produits | Ajouter des liens contextuels (article guide → produits recommandés ; fiche produit → articles connexes) | P1 |
| C5 | `/` (home) | CTA hero | Anchor "Cliquez ici" | "Explorer la boutique" ou "Découvrir nos télescopes" | P2 |
| C6 | `/blog/objets-celestes-du-mois` | Pas de `<time>` | Article daté implicitement ("ce mois-ci") sans date affichée | Ajouter `<time datetime="...">` et une date visible | P3 |
| C7 | `/mentions-legales` | `<head>` + sitemap | Pas de `noindex`, présent dans sitemap | Ajouter `<meta name="robots" content="noindex">`, retirer du sitemap | P3 |

## Total : 20 issues planifiées (15 technique + 5 ergo + 7 éditorial = 27 sur le papier, certaines très proches comptent comme un seul item)

## Conseil de débrief

- Si la candidate identifie 14+ issues, c'est excellent
- 10-13 : bon niveau, à challenger sur la priorisation
- < 10 : retravailler la méthode d'audit avec elle
- Toujours questionner le "pourquoi" de la priorité plus que le simple comptage
```

- [ ] **Step 2: Verify it stays gitignored**

```bash
git status reference/audit-issues.md
# Expected: empty (file ignored)
```

- [ ] **Step 3: No commit needed (file is gitignored)**

---

## Task 29: Reference — GTM container blueprint

**Files:**
- Create: `reference/gtm-container-blueprint.md`

- [ ] **Step 1: Write the blueprint**

```markdown
# GTM Container Blueprint (référence)

> Ce que devrait contenir le conteneur GTM de la candidate à la fin du parcours, pour servir de référence en débrief.

## Variables Data Layer

- `dlv - ecommerce` → `ecommerce`
- `dlv - ecommerce.value` → `ecommerce.value`
- `dlv - ecommerce.items` → `ecommerce.items`
- `dlv - ecommerce.currency` → `ecommerce.currency`
- `dlv - ecommerce.transaction_id` → `ecommerce.transaction_id`
- `dlv - ecommerce.tax` → `ecommerce.tax`
- `dlv - ecommerce.shipping` → `ecommerce.shipping`
- `dlv - form_id` → `form_id`

## Variables intégrées activées

- Click Element, Click Classes, Click Text, Click Target, Click URL
- Page Path
- Scroll Depth Threshold

## Déclencheurs

- `All Pages` (intégré)
- `Custom Event - view_item`
- `Custom Event - add_to_cart`
- `Custom Event - remove_from_cart`
- `Custom Event - view_cart`
- `Custom Event - begin_checkout`
- `Custom Event - purchase`
- `Custom Event - generate_lead`
- `Custom Event - sign_up`
- `Click - Coup de cœur` (CSS selector `[data-testid="coup-de-coeur"]`) — option A
  OU `Scroll - Fiche produit 75%` — option B

## Balises

- `GA4 - Configuration` (Google Tag) — sur All Pages
- `GA4 - view_item` (GA4 Event) — sur Custom Event view_item
- `GA4 - add_to_cart`
- `GA4 - remove_from_cart`
- `GA4 - view_cart`
- `GA4 - begin_checkout`
- `GA4 - purchase` (avec params `transaction_id`, `tax`, `shipping`)
- `GA4 - generate_lead` (avec param `form_id`)
- `GA4 - sign_up` (avec param `method`)
- `GA4 - coup_de_coeur_click` OU `GA4 - deep_scroll`

## Consent Settings

Chaque tag GA4 a son consent setting :
- Built-in : "Require additional consent for tag to fire"
- Consent type : `analytics_storage`

## Versions publiées

- v1 — GA4 config
- v2 — e-commerce events
- v3 — event custom
- v4 — consent mode

## Points à challenger en débrief

- Nommage cohérent des balises et déclencheurs ? (préfixe GA4 -, suffixe événement)
- Organisation en dossiers GTM ? (Folders : "GA4 Config", "Ecommerce", "Custom", "Forms")
- Variables réutilisables vs hardcoded dans les tags ?
- Gestion d'erreur si `ecommerce.items` est absent ?
```

- [ ] **Step 2: No commit needed (gitignored)**

---

## Task 30: Reference — Looker Studio template notes

**Files:**
- Create: `reference/looker-studio-template.md`

- [ ] **Step 1: Write the template notes**

```markdown
# Looker Studio — Template de référence

## Lien template public

À créer après le premier débrief : faire un dashboard de référence avec des données fictives, le partager en lecture, et coller le lien ici.

## Structure attendue

Voir `exercises/08-dashboard-looker-studio.md` (cahier candidat).

## Critères de qualité (à challenger en débrief)

- Tient sur une page sans scroll ?
- 4 KPIs lisibles d'un coup d'œil ?
- Funnel clair : on voit le drop-off entre chaque étape ?
- Date range visible et fonctionnel ?
- Cohérence chromatique (palette cosmique sombre) ?
- Source visible : "Source : GA4 — Stellaire" en pied de rapport ?

## Erreurs fréquentes

- Confusion `Sessions` vs `Total users` vs `Active users`
- Mélange `Item revenue` et `Purchase revenue`
- Filtres globaux qui cassent une vue (ex: filtre "purchase only" + funnel = funnel cassé)
```

- [ ] **Step 2: No commit needed**

---

## Task 31: Reference — Debrief notes + README

**Files:**
- Create: `reference/notes-debrief.md`
- Create: `reference/README.md`

- [ ] **Step 1: Write `reference/README.md`**

```markdown
# Reference (privé)

Ce dossier contient la solution de référence et les notes de débrief. Il est **gitignoré** : ne pas commiter.

- `audit-issues.md` — grille de correction de l'exercice 1
- `gtm-container-blueprint.md` — ce que devrait contenir le conteneur GTM
- `looker-studio-template.md` — guide du dashboard attendu
- `notes-debrief.md` — questions et points de débrief par étape
```

- [ ] **Step 2: Write `reference/notes-debrief.md`**

```markdown
# Notes de débrief

Structure recommandée : 1h-2h en visio, écran partagé sur le travail rendu. Suivre l'ordre des exercices.

## Étape 1 — Audit

Questions à poser :
- Comment as-tu structuré ton audit (par axe, par page, par priorité) ?
- Quels outils as-tu utilisés et pourquoi ?
- Quelle issue, selon toi, est la plus impactante pour Stellaire et pourquoi ?
- Si tu devais ne traiter que 3 issues, lesquelles ?

Croiser avec `audit-issues.md` pour les issues manquées.

## Étape 2 — GTM install

- Comment ça s'est passé techniquement ? Confortable avec l'édition GitHub ?
- Différence entre snippet inline et notre approche `integrations.js` ?
- Limites de notre approche (noscript, timing) ?

## Étape 3 — GA4

- Pourquoi un seul "Google Tag" plutôt qu'un par événement (best practice 2024) ?
- Différence Measurement ID vs Property ID ?

## Étape 4 — E-commerce

- Pourquoi structurer en `ecommerce.items[]` plutôt qu'en variables plates ?
- Comment retrouverait-on un événement `purchase` mal poussé ?

## Étape 5 — Custom event

- Pourquoi via GTM seul et pas en modifiant le code ?
- Limites de cette approche (CSS fragile, scroll inégal selon contenu) ?

## Étape 6 — CMP

- Ordre critique des blocs dans `integrations.js` — pourquoi ?
- Différence `default` vs `update` du consent ?
- Que se passe-t-il si Axeptio est bloqué (uBlock, DNS) ?

## Étape 7 — Vérification

- Quelle source est la plus fiable : Tag Assistant, DebugView, Realtime ? Pourquoi 3 ?
- Comment tu vérifierais une seconde fois 6 mois plus tard ?

## Étape 8 — Dashboard

- À qui s'adresse ce dashboard (CEO, marketing, ops) ? Adapté ?
- Que mesure-t-on qui ne sert à rien ? Que manque-t-il ?

## Points méta

- Quel exercice t'a appris le plus ?
- Quel exercice t'a frustré le plus ?
- Comment présenterais-tu ce projet en entretien (2 min, story-telling) ?
- Si tu devais refaire un audit demain, qu'est-ce que tu changerais dans ta méthode ?
```

- [ ] **Step 3: No commit needed (gitignored)**

---

## Task 32: Root README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# Stellaire Sandbox

Terrain d'entraînement SEO + GTM/GA4 + CMP + Looker Studio, sous la forme d'une fausse boutique d'astronomie.

🌌 **Démo en ligne :** _(à compléter après déploiement Vercel)_

## Pour la candidate

Suis le parcours dans [`exercises/`](exercises/README.md). 8 étapes, de l'audit SEO à la construction du dashboard.

## Pour qui ?

Projet pédagogique conçu pour préparer un entretien Chef·fe de projet SEO. Pour s'entraîner sur un cas réel et pouvoir le présenter en entretien comme un case study.

## Stack

HTML/CSS/JS vanilla. Tailwind via CDN. Aucun build, aucun npm. Déploiement Vercel.

## Structure

- `site/` — le site fictif (Stellaire, boutique d'astronomie)
- `exercises/` — les 8 exercices à faire
- `docs/superpowers/` — design spec et plan d'implémentation
- `reference/` — solution de référence (gitignored, privée)

## Licence

Code source libre. Images NASA en domaine public.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Add root README"
```

---

## Task 33: Deployment & handoff checklist

**No files created — manual ops checklist for Adrien.**

- [ ] **Step 1: Create GitHub repo (public)**

```bash
# Adrien — manual step in browser or via gh CLI
gh repo create stellaire-sandbox --public --source=. --remote=origin --push
```

- [ ] **Step 2: Connect Vercel to the repo**

1. Va sur https://vercel.com/new
2. Sélectionne le repo `stellaire-sandbox`
3. Framework Preset: **Other**
4. Root Directory: `site`
5. Build Command: (vide)
6. Output Directory: `.`
7. Deploy

- [ ] **Step 3: Update sitemap.xml with real Vercel URL**

Une fois le subdomain Vercel attribué (ex: `stellaire-sandbox-abc.vercel.app`), update les URL dans `site/sitemap.xml` et `site/robots.txt`.

```bash
# Replace stellaire.vercel.app with actual subdomain
git commit -am "Update sitemap/robots with Vercel URL"
git push
```

- [ ] **Step 4: Final manual QA**

Ouvre la home en navigation privée :
- Pas d'erreurs console
- 4 produits "Coups de cœur" visibles
- Parcours complet possible (browse → cart → checkout → confirmation)
- `dataLayer` se remplit comme attendu

- [ ] **Step 5: Hand off to the candidate**

Envoyer à l'amie :
- L'URL du site Vercel
- L'URL du repo GitHub
- Le lien direct vers `exercises/README.md`
- Un message d'accompagnement (ce que tu attends, quand vous débriefez)

---

## Self-Review

**Spec coverage:** Each spec section is covered:
- §1 Objective → tasks 8–15 (site), 18 (audit issues), 19–27 (exercises)
- §1.bis Profil candidate → §4.4 bis mechanism + task 6 (integrations.js), task 21 (extra-guided GTM install)
- §2 Périmètre → covered by tasks 8–27 (inclus) + reference tasks 28–31 (exclus de git)
- §3 Architecture → task 1 (folders), tasks 8–15 (HTML), tasks 3–7 (JS)
- §4 Site fonctionnel → tasks 3 (data), 7 (app), 8–15 (HTML pages), 4 (tracking)
- §4.4 bis Plugin-like integrations → task 6
- §4.5 Custom event → task 24 (exercice), button is rendered in task 7's `produit` handler
- §4.6 Issues plantées → task 18 (planting) + task 28 (answer key)
- §5 Cahier exercices → tasks 19–27 (one task per exercise)
- §6 Solution référence → tasks 28–31
- §7 Stack → task 1 (vercel.json) + task 2 (CSS)
- §8 Livrables → task 33 (handoff)
- §9 Critères succès → measured by the exercises (validation checklists in each)

**Placeholder scan:** No "TBD", no "TODO". Two intentional placeholders (`GTM-XXXXXXX`, `YOUR-CLIENT-ID`) are in code shipped to the candidate — these are the placeholders SHE replaces, not the implementer.

**Type consistency:**
- `window.stellaire.track*` functions used consistently across tracking.js and app.js
- Product IDs (e.g., `tel-001`, `dec-001`) consistent between data.js and audit-issues.md references
- `data-page` attribute values: `home`, `catalogue`, `produit`, `panier`, `checkout`, `confirmation`, `contact`, `legal`, `blog-index`, `blog-article` — used consistently in HTML and matched in `app.js` pages object (note: `blog-index` and `blog-article` aren't handled — they fall back to `_default`, which is fine since they don't need a page-specific init)
- `[data-testid="coup-de-coeur"]` used in app.js renderer AND in exercise 5 instructions
- Cookie version `stellaire-base` consistent between integrations.js placeholder and exercise 6 instructions

**Scope check:** Single coherent project, all tasks build toward one deliverable.

---

## Execution Handoff

Plan complete and saved to [docs/superpowers/plans/2026-05-22-stellaire-sandbox.md](docs/superpowers/plans/2026-05-22-stellaire-sandbox.md). Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
