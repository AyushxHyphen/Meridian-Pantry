// Cart is a simple array of { id, qty } stored in localStorage.
const CART_KEY = 'meridian_cart';

const Cart = {
  read() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  write(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    Cart.updateBadge();
  },

  add(id, qty = 1) {
    const items = Cart.read();
    const existing = items.find((i) => i.id === id);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ id, qty });
    }
    Cart.write(items);
  },

  setQty(id, qty) {
    let items = Cart.read();
    if (qty <= 0) {
      items = items.filter((i) => i.id !== id);
    } else {
      const existing = items.find((i) => i.id === id);
      if (existing) existing.qty = qty;
    }
    Cart.write(items);
  },

  remove(id) {
    const items = Cart.read().filter((i) => i.id !== id);
    Cart.write(items);
  },

  clear() {
    Cart.write([]);
  },

  count() {
    return Cart.read().reduce((sum, i) => sum + i.qty, 0);
  },

  updateBadge() {
    const badge = document.querySelector('[data-cart-count]');
    if (badge) badge.textContent = Cart.count();
  },
};

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', Cart.updateBadge);
