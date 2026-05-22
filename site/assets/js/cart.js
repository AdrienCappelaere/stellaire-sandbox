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
