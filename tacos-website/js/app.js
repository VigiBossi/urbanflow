/**
 * TACOS Restaurant — Main Application
 * Handles rendering, modals, favorites, cart UI, checkout, and Firebase.
 */

// ══════════════════════════════════════════════════════════════════════════════
// FIREBASE CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════
// Replace these values with your own Firebase project settings.
// Find them at: Firebase Console → Project Settings → Your apps → Web app
// ──────────────────────────────────────────────────────────────────────────────

const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "YOUR_PROJECT",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

// Delivery fee in MKD
const DELIVERY_FEE = 100;

// ══════════════════════════════════════════════════════════════════════════════
// BOOTSTRAP
// ══════════════════════════════════════════════════════════════════════════════

let firebaseDB = null;

function initFirebase() {
  try {
    if (!firebase || FIREBASE_CONFIG.apiKey === 'YOUR_API_KEY') return;
    firebase.initializeApp(FIREBASE_CONFIG);
    firebaseDB = firebase.database();
  } catch (e) {
    console.warn('Firebase not configured — orders will save locally only.', e);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// APP STATE
// ══════════════════════════════════════════════════════════════════════════════

let activeCategory  = MENU_DATA.categories[0].id;
let selectedOrderType = 'takeout';
let modalItem       = null;   // current item open in the detail modal
let modalQty        = 1;
let selectedCustomizations = [];

// ══════════════════════════════════════════════════════════════════════════════
// FAVORITES (localStorage)
// ══════════════════════════════════════════════════════════════════════════════

const Favorites = (() => {
  const KEY = 'tacos_favorites';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function toggle(itemId) {
    const favs = getAll();
    const idx  = favs.indexOf(itemId);
    if (idx >= 0) favs.splice(idx, 1); else favs.push(itemId);
    localStorage.setItem(KEY, JSON.stringify(favs));
    return idx < 0; // returns true if just added
  }

  function has(itemId) { return getAll().includes(itemId); }

  return { getAll, toggle, has };
})();

// ══════════════════════════════════════════════════════════════════════════════
// RENDERING — SPECIALS
// ══════════════════════════════════════════════════════════════════════════════

function renderSpecials() {
  const grid = document.getElementById('specials-grid');
  if (!grid) return;

  grid.innerHTML = MENU_DATA.specials.map(s => `
    <article class="special-card special-badge-${s.badgeColor}">
      <div class="special-image-wrap">
        <img src="${s.image}" alt="${s.name}" loading="lazy" class="special-image">
        <span class="special-badge">${s.badge}</span>
      </div>
      <div class="special-body">
        <h3 class="special-name">${s.name}</h3>
        <p class="special-desc">${s.description}</p>
        <div class="special-pricing">
          <span class="special-old-price">${s.originalPrice} MKD</span>
          <span class="special-new-price">${s.specialPrice} MKD</span>
          <span class="special-save">Save ${s.originalPrice - s.specialPrice} MKD</span>
        </div>
        <button class="btn btn-primary" onclick="scrollToMenu()">Order Now</button>
      </div>
    </article>
  `).join('');
}

function scrollToMenu() {
  document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDERING — CATEGORY TABS
// ══════════════════════════════════════════════════════════════════════════════

function renderCategoryTabs() {
  const container = document.getElementById('category-tabs');
  if (!container) return;

  container.innerHTML = MENU_DATA.categories.map(cat => `
    <button
      class="category-tab ${cat.id === activeCategory ? 'active' : ''}"
      data-category="${cat.id}"
      role="tab"
      aria-selected="${cat.id === activeCategory}"
    >
      <span class="cat-emoji">${cat.emoji}</span>
      <span class="cat-name">${cat.name}</span>
    </button>
  `).join('');

  container.querySelectorAll('.category-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      renderCategoryTabs();
      renderMenuGrid();
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDERING — MENU GRID
// ══════════════════════════════════════════════════════════════════════════════

function renderMenuGrid() {
  const grid  = document.getElementById('menu-grid');
  if (!grid) return;

  const items = MENU_DATA.items.filter(i => i.category === activeCategory);
  const favs  = Favorites.getAll();

  grid.innerHTML = items.map(item => `
    <article class="menu-card" data-item-id="${item.id}">
      <div class="menu-card-image-wrap">
        <img src="${item.image}" alt="${item.name}" loading="lazy" class="menu-card-image">
        ${item.popular ? '<span class="popular-badge">⭐ Popular</span>' : ''}
        <button
          class="fav-btn ${favs.includes(item.id) ? 'active' : ''}"
          data-item-id="${item.id}"
          aria-label="Toggle favourite"
          title="Save as favourite"
        >${favs.includes(item.id) ? '♥' : '♡'}</button>
      </div>
      <div class="menu-card-body">
        <h3 class="menu-card-name">${item.name}</h3>
        <p class="menu-card-desc">${item.description}</p>
        <div class="menu-card-footer">
          <span class="menu-card-price">${item.price} MKD</span>
          <button class="btn btn-primary btn-sm add-to-cart-btn" data-item-id="${item.id}">
            + Add
          </button>
        </div>
      </div>
    </article>
  `).join('');

  // Wire up card clicks → open modal
  grid.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.fav-btn') || e.target.closest('.add-to-cart-btn')) return;
      openItemModal(card.dataset.itemId);
    });
  });

  // Add-to-cart quick button
  grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openItemModal(btn.dataset.itemId);
    });
  });

  // Favourite toggle
  grid.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const added = Favorites.toggle(btn.dataset.itemId);
      btn.textContent = added ? '♥' : '♡';
      btn.classList.toggle('active', added);
      showToast(added ? 'Saved to favourites ♥' : 'Removed from favourites');
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// ITEM MODAL
// ══════════════════════════════════════════════════════════════════════════════

function openItemModal(itemId) {
  const item = MENU_DATA.items.find(i => i.id === itemId);
  if (!item) return;

  modalItem              = item;
  modalQty               = 1;
  selectedCustomizations = [];

  // Populate static fields
  document.getElementById('modal-item-image').src       = item.image;
  document.getElementById('modal-item-image').alt       = item.name;
  document.getElementById('modal-item-name').textContent = item.name;
  document.getElementById('modal-item-desc').textContent = item.description;
  document.getElementById('modal-qty').textContent       = modalQty;

  // Favourite button state
  const favBtn = document.getElementById('modal-fav-btn');
  const isFav  = Favorites.has(item.id);
  favBtn.textContent = isFav ? '♥' : '♡';
  favBtn.classList.toggle('active', isFav);

  // Ingredients
  document.getElementById('modal-ingredient-tags').innerHTML =
    item.ingredients.map(ing => `<span class="ingredient-tag">${ing}</span>`).join('');

  // Customization options
  const addOpts    = item.customizations.filter(c => c.type === 'add');
  const removeOpts = item.customizations.filter(c => c.type === 'remove');

  renderCustomizationGroup('customization-add-options',    addOpts,    'add-group',    item.id);
  renderCustomizationGroup('customization-remove-options', removeOpts, 'remove-group', item.id);

  document.getElementById('customization-add-group').style.display    = addOpts.length    ? '' : 'none';
  document.getElementById('customization-remove-group').style.display = removeOpts.length ? '' : 'none';
  document.getElementById('modal-customizations').style.display       =
    (addOpts.length || removeOpts.length) ? '' : 'none';

  updateModalPrice();

  // Show modal
  document.getElementById('item-modal-overlay').classList.add('open');
  document.body.classList.add('modal-open');
}

function renderCustomizationGroup(containerId, options, groupClass, itemId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = options.map(opt => `
    <label class="customization-option ${groupClass}" for="cust-${itemId}-${opt.id}">
      <input
        type="checkbox"
        id="cust-${itemId}-${opt.id}"
        data-option-id="${opt.id}"
        class="cust-checkbox"
      >
      <span class="cust-label">${opt.label}</span>
      ${opt.price > 0 ? `<span class="cust-price">+${opt.price} MKD</span>` : '<span class="cust-price free">Free</span>'}
    </label>
  `).join('');

  container.querySelectorAll('.cust-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const opt = modalItem.customizations.find(c => c.id === cb.dataset.optionId);
      if (cb.checked) {
        selectedCustomizations.push(opt);
      } else {
        selectedCustomizations = selectedCustomizations.filter(c => c.id !== opt.id);
      }
      updateModalPrice();
    });
  });
}

function updateModalPrice() {
  const extrasTotal = selectedCustomizations.reduce((s, c) => s + (c.price || 0), 0);
  const unitPrice   = (modalItem?.price || 0) + extrasTotal;
  const lineTotal   = unitPrice * modalQty;

  document.getElementById('modal-item-price').textContent = `${unitPrice} MKD`;
  document.getElementById('modal-add-price').textContent  = `${lineTotal} MKD`;
}

function closeItemModal() {
  document.getElementById('item-modal-overlay').classList.remove('open');
  document.body.classList.remove('modal-open');
  modalItem = null;
  selectedCustomizations = [];
}

// ══════════════════════════════════════════════════════════════════════════════
// CART UI
// ══════════════════════════════════════════════════════════════════════════════

function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.classList.add('modal-open');
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.classList.remove('modal-open');
}

function renderCart(snapshot) {
  const { items, count, subtotal } = snapshot;
  const isDelivery = selectedOrderType === 'delivery';
  const total      = subtotal + (isDelivery ? DELIVERY_FEE : 0);

  // Badge
  const badge = document.getElementById('cart-count');
  badge.textContent = count;
  badge.classList.toggle('has-items', count > 0);

  // Order type label
  const labelMap = { takeout: '🥡 Takeout', delivery: '🛵 Delivery', 'dine-in': '🪑 Dine-in' };
  document.getElementById('cart-order-type-label').innerHTML =
    `<span class="order-type-badge">${labelMap[selectedOrderType]}</span>`;

  // Empty / filled states
  const emptyEl  = document.getElementById('cart-empty');
  const itemsEl  = document.getElementById('cart-items');
  const footerEl = document.getElementById('cart-footer');

  if (items.length === 0) {
    emptyEl.style.display  = '';
    itemsEl.style.display  = 'none';
    footerEl.style.display = 'none';
    return;
  }

  emptyEl.style.display  = 'none';
  itemsEl.style.display  = '';
  footerEl.style.display = '';

  itemsEl.innerHTML = items.map(item => `
    <div class="cart-item" data-cart-id="${item.cartId}">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <p class="cart-item-name">${item.name}</p>
        ${item.customizations.length
          ? `<p class="cart-item-mods">${item.customizations.map(c => c.label).join(', ')}</p>`
          : ''}
        <p class="cart-item-price">${item.unitPrice} MKD</p>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn qty-minus" data-cart-id="${item.cartId}" aria-label="Decrease">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-btn qty-plus"  data-cart-id="${item.cartId}" aria-label="Increase">+</button>
        <button class="cart-remove-btn" data-cart-id="${item.cartId}" aria-label="Remove">🗑</button>
      </div>
    </div>
  `).join('');

  // Quantity + remove events
  itemsEl.querySelectorAll('.qty-minus').forEach(btn =>
    btn.addEventListener('click', () => Cart.updateQuantity(btn.dataset.cartId, -1)));
  itemsEl.querySelectorAll('.qty-plus').forEach(btn =>
    btn.addEventListener('click', () => Cart.updateQuantity(btn.dataset.cartId, +1)));
  itemsEl.querySelectorAll('.cart-remove-btn').forEach(btn =>
    btn.addEventListener('click', () => Cart.removeItem(btn.dataset.cartId)));

  // Totals
  document.getElementById('cart-subtotal').textContent = `${subtotal} MKD`;
  document.getElementById('cart-total').textContent    = `${total} MKD`;

  const deliveryRow = document.getElementById('delivery-fee-row');
  deliveryRow.style.display = isDelivery ? '' : 'none';
  if (isDelivery) document.getElementById('delivery-fee').textContent = `${DELIVERY_FEE} MKD`;
}

// ══════════════════════════════════════════════════════════════════════════════
// CHECKOUT MODAL
// ══════════════════════════════════════════════════════════════════════════════

function openCheckoutModal() {
  if (Cart.getItemCount() === 0) return;
  renderCheckoutSummary();

  const addrSection   = document.getElementById('delivery-address-section');
  const dineInSection = document.getElementById('dine-in-section');
  addrSection.style.display   = selectedOrderType === 'delivery' ? '' : 'none';
  dineInSection.style.display = selectedOrderType === 'dine-in'  ? '' : 'none';

  // Mark address field required only for delivery
  const addrInput = document.getElementById('checkout-address');
  if (addrInput) addrInput.required = (selectedOrderType === 'delivery');

  document.getElementById('order-success').style.display      = 'none';
  document.getElementById('checkout-form').style.display      = '';
  document.getElementById('checkout-modal-overlay').classList.add('open');
  document.body.classList.add('modal-open');
  closeCart();
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal-overlay').classList.remove('open');
  document.body.classList.remove('modal-open');
}

function renderCheckoutSummary() {
  const items       = Cart.getItems();
  const subtotal    = Cart.getSubtotal();
  const isDelivery  = selectedOrderType === 'delivery';
  const total       = subtotal + (isDelivery ? DELIVERY_FEE : 0);

  document.getElementById('checkout-items-list').innerHTML = items.map(i => `
    <div class="checkout-item-row">
      <span class="checkout-item-qty">${i.quantity}×</span>
      <span class="checkout-item-name">${i.name}</span>
      <span class="checkout-item-total">${i.unitPrice * i.quantity} MKD</span>
    </div>
    ${i.customizations.length
      ? `<p class="checkout-item-mods">${i.customizations.map(c => c.label).join(', ')}</p>`
      : ''}
  `).join('');

  document.getElementById('checkout-totals').innerHTML = `
    <div class="checkout-total-row">
      <span>Subtotal</span><span>${subtotal} MKD</span>
    </div>
    ${isDelivery ? `<div class="checkout-total-row"><span>Delivery fee</span><span>${DELIVERY_FEE} MKD</span></div>` : ''}
    <div class="checkout-total-row checkout-grand-total">
      <span>Total</span><span>${total} MKD</span>
    </div>
  `;
}

// ══════════════════════════════════════════════════════════════════════════════
// ORDER SUBMISSION
// ══════════════════════════════════════════════════════════════════════════════

async function submitOrder(formData) {
  const isDelivery = selectedOrderType === 'delivery';
  const subtotal   = Cart.getSubtotal();
  const total      = subtotal + (isDelivery ? DELIVERY_FEE : 0);
  const orderNum   = 'TAC-' + Date.now().toString().slice(-6);

  const order = {
    orderNumber:   orderNum,
    timestamp:     Date.now(),
    status:        'pending',
    type:          selectedOrderType,
    customer: {
      name:  formData.get('name'),
      phone: formData.get('phone'),
      ...(isDelivery && {
        address: formData.get('address'),
        city:    formData.get('city') || 'Gostivar',
        floor:   formData.get('floor') || '',
      }),
      ...(selectedOrderType === 'dine-in' && { table: formData.get('table') }),
    },
    time: {
      type:  formData.get('timeType') || 'asap',
      value: formData.get('time')    || 'ASAP',
    },
    notes:       formData.get('notes') || '',
    items:       Cart.toOrderPayload(),
    subtotal,
    deliveryFee: isDelivery ? DELIVERY_FEE : 0,
    total,
  };

  // Save to Firebase
  if (firebaseDB) {
    try {
      await firebaseDB.ref('orders').push(order);
    } catch (err) {
      console.error('Firebase write failed:', err);
      saveOrderLocally(order);
    }
  } else {
    saveOrderLocally(order);
  }

  return orderNum;
}

function saveOrderLocally(order) {
  try {
    const all = JSON.parse(localStorage.getItem('tacos_orders') || '[]');
    all.unshift(order);
    localStorage.setItem('tacos_orders', JSON.stringify(all.slice(0, 50)));
  } catch {}
}

// ══════════════════════════════════════════════════════════════════════════════
// TOAST NOTIFICATION
// ══════════════════════════════════════════════════════════════════════════════

let toastTimer;

function showToast(message, duration = 2800) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ══════════════════════════════════════════════════════════════════════════════
// HEADER SCROLL SHADOW
// ══════════════════════════════════════════════════════════════════════════════

function initScrollHeader() {
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ══════════════════════════════════════════════════════════════════════════════
// WIRE UP ALL EVENT LISTENERS
// ══════════════════════════════════════════════════════════════════════════════

function wireEvents() {

  // Cart toggle
  document.getElementById('cart-toggle-btn').addEventListener('click', openCart);
  document.getElementById('cart-close-btn').addEventListener('click', closeCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);
  document.getElementById('checkout-btn').addEventListener('click', openCheckoutModal);

  // Item modal close
  document.getElementById('item-modal-close').addEventListener('click', closeItemModal);
  document.getElementById('item-modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeItemModal();
  });

  // Modal favourite button
  document.getElementById('modal-fav-btn').addEventListener('click', () => {
    if (!modalItem) return;
    const added = Favorites.toggle(modalItem.id);
    const btn   = document.getElementById('modal-fav-btn');
    btn.textContent = added ? '♥' : '♡';
    btn.classList.toggle('active', added);
    // Sync card in grid
    const cardFavBtn = document.querySelector(`.fav-btn[data-item-id="${modalItem.id}"]`);
    if (cardFavBtn) {
      cardFavBtn.textContent = added ? '♥' : '♡';
      cardFavBtn.classList.toggle('active', added);
    }
    showToast(added ? 'Saved to favourites ♥' : 'Removed from favourites');
  });

  // Quantity controls in modal
  document.getElementById('modal-qty-minus').addEventListener('click', () => {
    if (modalQty <= 1) return;
    modalQty--;
    document.getElementById('modal-qty').textContent = modalQty;
    updateModalPrice();
  });
  document.getElementById('modal-qty-plus').addEventListener('click', () => {
    modalQty++;
    document.getElementById('modal-qty').textContent = modalQty;
    updateModalPrice();
  });

  // Add to cart from modal
  document.getElementById('modal-add-btn').addEventListener('click', () => {
    if (!modalItem) return;
    Cart.addItem(modalItem, selectedCustomizations, modalQty);
    showToast(`${modalItem.name} added to cart 🌮`);
    closeItemModal();
    openCart();
  });

  // Order type tabs
  document.querySelectorAll('.order-type-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      selectedOrderType = tab.dataset.type;
      document.querySelectorAll('.order-type-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      // Re-render cart totals if cart is open
      renderCart({ items: Cart.getItems(), count: Cart.getItemCount(), subtotal: Cart.getSubtotal() });
    });
  });

  // Checkout modal close
  document.getElementById('checkout-modal-close').addEventListener('click', closeCheckoutModal);
  document.getElementById('checkout-modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeCheckoutModal();
  });

  // Time picker visibility
  document.getElementById('checkout-time-type').addEventListener('change', e => {
    const group = document.getElementById('time-picker-group');
    group.style.display = e.target.value === 'scheduled' ? '' : 'none';
  });

  // Checkout form submit
  document.getElementById('checkout-form').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const btn = document.getElementById('place-order-btn');
    btn.disabled    = true;
    btn.textContent = 'Placing order…';

    try {
      const formData = new FormData(form);
      const orderNum = await submitOrder(formData);

      Cart.clear();
      form.style.display = 'none';
      document.getElementById('order-success').style.display     = '';
      document.getElementById('order-number-display').textContent = `Order #${orderNum}`;
      document.getElementById('success-phone').textContent        = formData.get('phone');
    } catch (err) {
      console.error(err);
      showToast('Something went wrong. Please try again.');
    } finally {
      btn.disabled    = false;
      btn.textContent = '🌮 Place Order';
    }
  });

  // Success close
  document.getElementById('order-success-close').addEventListener('click', () => {
    closeCheckoutModal();
    document.getElementById('checkout-form').reset();
  });

  // ESC key closes any open modal
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closeItemModal();
    closeCheckoutModal();
    closeCart();
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// INITIALISE
// ══════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  initScrollHeader();

  renderSpecials();
  renderCategoryTabs();
  renderMenuGrid();

  // Subscribe to cart changes to keep all UI in sync
  Cart.onChange(snapshot => renderCart(snapshot));
  // Trigger initial render with empty cart
  renderCart({ items: [], count: 0, subtotal: 0 });

  wireEvents();
});
