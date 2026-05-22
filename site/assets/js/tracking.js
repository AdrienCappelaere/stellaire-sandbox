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
