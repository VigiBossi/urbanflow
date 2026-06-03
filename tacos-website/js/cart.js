/**
 * TACOS Restaurant — Cart Module
 * Pure cart logic with no DOM dependencies.
 * All state lives in this closure; UI reads via the public API.
 */

const Cart = (() => {

  let _items = [];

  // ── Getters ────────────────────────────────────────────────────────────────

  function getItems() {
    return _items.map(i => ({ ...i, customizations: [...i.customizations] }));
  }

  function getItemCount() {
    return _items.reduce((sum, i) => sum + i.quantity, 0);
  }

  function getSubtotal() {
    return _items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  /**
   * Add an item (or increment if an identical customization already exists).
   * @param {Object} menuItem  - item from MENU_DATA.items
   * @param {Array}  selected  - array of customization objects from menuItem.customizations
   * @param {number} quantity
   */
  function addItem(menuItem, selected, quantity = 1) {
    const extrasPrice = selected.reduce((s, c) => s + (c.price || 0), 0);
    const unitPrice   = menuItem.price + extrasPrice;

    // Serialize selected IDs to detect duplicate configurations
    const configKey = selected.map(c => c.id).sort().join(',');

    const existing = _items.findIndex(i =>
      i.menuItemId === menuItem.id &&
      i.configKey  === configKey
    );

    if (existing >= 0) {
      _items[existing].quantity += quantity;
    } else {
      _items.push({
        cartId:        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        menuItemId:    menuItem.id,
        name:          menuItem.name,
        image:         menuItem.image,
        basePrice:     menuItem.price,
        customizations: [...selected],
        configKey,
        unitPrice,
        quantity,
      });
    }

    _emit();
  }

  function updateQuantity(cartId, delta) {
    const idx = _items.findIndex(i => i.cartId === cartId);
    if (idx < 0) return;

    _items[idx].quantity += delta;
    if (_items[idx].quantity <= 0) _items.splice(idx, 1);

    _emit();
  }

  function removeItem(cartId) {
    _items = _items.filter(i => i.cartId !== cartId);
    _emit();
  }

  function clear() {
    _items = [];
    _emit();
  }

  // ── Serialization (for order submission) ──────────────────────────────────

  function toOrderPayload() {
    return _items.map(i => ({
      menuItemId:     i.menuItemId,
      name:           i.name,
      quantity:       i.quantity,
      basePrice:      i.basePrice,
      customizations: i.customizations.map(c => ({
        label: c.label,
        price: c.price,
        type:  c.type,
      })),
      unitPrice: i.unitPrice,
      lineTotal: i.unitPrice * i.quantity,
    }));
  }

  // ── Simple event bus (avoids tight coupling to app.js) ────────────────────

  const _listeners = [];

  function onChange(fn) {
    _listeners.push(fn);
  }

  function _emit() {
    const snapshot = { items: getItems(), count: getItemCount(), subtotal: getSubtotal() };
    _listeners.forEach(fn => fn(snapshot));
  }

  return { getItems, getItemCount, getSubtotal, addItem, updateQuantity, removeItem, clear, toOrderPayload, onChange };

})();
