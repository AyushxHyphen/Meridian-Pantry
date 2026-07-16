const content = document.getElementById('confirmation-content');

async function init() {
  const orderId = new URLSearchParams(window.location.search).get('orderId');

  if (!orderId) {
    content.innerHTML = `<p class="empty-state">No order specified.</p>`;
    return;
  }

  try {
    const { order } = await Api.getOrder(orderId);

    content.innerHTML = `
      <div class="stamp">✓</div>
      <h1>Order confirmed</h1>
      <p class="order-id">Order #${order.id.slice(0, 8)} · placed ${new Date(
      order.createdAt
    ).toLocaleString()}</p>

      <div class="receipt">
        ${order.items
          .map(
            (item) => `
          <div class="summary-row">
            <span>${item.qty} × ${item.name}</span>
            <span>${formatPrice(item.subtotal)}</span>
          </div>
        `
          )
          .join('')}
        <div class="summary-row total">
          <span>Total</span>
          <span>${formatPrice(order.total)}</span>
        </div>
      </div>

      <p style="opacity:0.7; margin-bottom:30px;">
        A confirmation has been noted for ${order.customer.name} at ${order.customer.email}.
        Shipping to: ${order.customer.address}.
      </p>

      <a href="/index.html" class="btn">Back to the shelf</a>
    `;
  } catch (err) {
    content.innerHTML = `<p class="empty-state">${err.message}</p>`;
  }
}

init();
