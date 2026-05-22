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
      + '<img src="' + p.image + '" alt="' + (p.id === "dec-001" ? "" : p.name) + '" loading="lazy" />'
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
      var slug = location.pathname.replace(/^\/produit\//, "").replace(/\/$/, "");
      if (!slug || slug === "produit.html") slug = qs("slug");
      var product = stellaire.findProduct(slug);
      var root = document.querySelector("[data-product-root]");
      if (!product || !root) {
        if (root) root.innerHTML = "<p>Produit introuvable.</p>";
        return;
      }
      var similar = STELLAIRE_PRODUCTS
        .filter(function (p) { return p.category === product.category && p.id !== product.id; })
        .slice(0, 3);

      var featuresHtml = '';
      if (product.features && product.features.length) {
        featuresHtml = '<section class="mt-12">'
          + '<h2 class="text-xl font-semibold mb-4">Caractéristiques techniques</h2>'
          + '<ul class="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-300">'
          + product.features.map(function (f) {
              return '<li class="flex"><span class="text-indigo-400 mr-2">▸</span><span>' + f + '</span></li>';
            }).join("")
          + '</ul>'
          + '</section>';
      }

      var similarHtml = '';
      if (similar.length) {
        similarHtml = '<section class="mt-12">'
          + '<h2 class="text-xl font-semibold mb-4">Dans la même catégorie</h2>'
          + '<div class="grid grid-cols-2 md:grid-cols-3 gap-4">'
          + similar.map(renderProductCard).join("")
          + '</div>'
          + '</section>';
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
        +     '<div class="mt-6 text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">'
        +       '<span>🚚 Expédition sous 24h</span>'
        +       '<span>🔄 Retour gratuit 30j</span>'
        +       '<span>🛡️ Garantie 2 ans</span>'
        +     '</div>'
        +   '</div>'
        + '</div>'
        + featuresHtml
        + similarHtml;

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
      if (product.slug === "dobson-200mm") {
        var parsed = JSON.parse(ld.textContent);
        delete parsed.offers.price;
        ld.textContent = JSON.stringify(parsed);
      }
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
      var root = document.querySelector("[data-checkout-root]");
      if (!rows.length) {
        if (root) root.innerHTML = "<p>Panier vide. <a href='/catalogue'>Retour à la boutique</a>.</p>";
        return;
      }
      stellaire.trackBeginCheckout(items, total);

      var totalEl = document.querySelector("[data-checkout-total]");
      if (totalEl) totalEl.textContent = euros(total);

      var form = document.getElementById("checkout-form");
      if (form) form.addEventListener("submit", function (e) {
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
        var orderEl = document.querySelector("[data-order-id]");
        if (orderEl) orderEl.textContent = order.id;
      }
    },

    contact: function () {
      var form = document.getElementById("contact-form");
      if (form) form.addEventListener("submit", function (e) {
        e.preventDefault();
        stellaire.trackGenerateLead("contact");
        e.target.innerHTML = "<p>Merci, votre message est bien parti.</p>";
      });
    },

    _default: function () {}
  };

  document.addEventListener("DOMContentLoaded", function () {
    refreshCartCount();
    var page = document.body.getAttribute("data-page") || "_default";
    (pages[page] || pages._default)();

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
