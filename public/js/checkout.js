const orderReview = document.getElementById('order-review');
const checkoutTotal = document.getElementById('checkout-total');
const form = document.getElementById('checkout-form');
const statusEl = document.getElementById('form-status');
const placeOrderBtn = document.getElementById('place-order-btn');

async function loadReview() {
  const items = Cart.read();

  if (items.length === 0) {
    orderReview.innerHTML = `<p class="empty-state">Your cart is empty.</p>`;
    checkoutTotal.textContent = formatPrice(0);
    placeOrderBtn.disabled = true;
    return;
  }

  try {
    const results = await Promise.all(items.map((i) => Api.getProduct(i.id)));
    let total = 0;

    orderReview.innerHTML = results
      .map(({ product }, idx) => {
        const item = items[idx];
        const subtotal = product.price * item.qty;
        total += subtotal;
        return `
          <div class="cart-line">
            <img src="${product.image}" alt="${product.name}" />
            <div>
              <h4>${product.name}</h4>
              <span class="unit-price">${item.qty} × ${formatPrice(product.price)}</span>
            </div>
            <div class="price">${formatPrice(subtotal)}</div>
          </div>
        `;
      })
      .join('');

    checkoutTotal.textContent = formatPrice(total);
  } catch (err) {
    orderReview.innerHTML = `<p class="empty-state">${err.message}</p>`;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = '';
  statusEl.className = 'form-status';

  const items = Cart.read();
  if (items.length === 0) {
    statusEl.textContent = 'Your cart is empty.';
    statusEl.classList.add('error');
    return;
  }

  const customer = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    address: form.address.value.trim(),
  };

  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = 'Placing order…';

  try {
    const { order } = await Api.createOrder({ items, customer });
    Cart.clear();
    window.location.href = `/confirmation.html?orderId=${order.id}`;
  } catch (err) {
    statusEl.textContent = err.message;
    statusEl.classList.add('error');
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = 'Place order';
  }
});

loadReview();
