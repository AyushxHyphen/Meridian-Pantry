const detailContainer = document.getElementById('product-detail');
const crumbName = document.getElementById('crumb-name');

function getIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id');
}

function renderProduct(product) {
  crumbName.textContent = product.name;
  document.title = `Meridian Pantry — ${product.name}`;

  detailContainer.innerHTML = `
    <div class="product-photo">
      <img src="${product.image}" alt="${product.name}" />
    </div>
    <div class="product-info">
      <p class="category">${product.category}</p>
      <h1>${product.name}</h1>
      <p class="origin">${product.origin} · ${product.unit}</p>
      <span class="price">${formatPrice(product.price)}</span>
      <p class="description">${product.description}</p>
      <div class="notes-row">
        ${product.notes
          .split(',')
          .map((n) => `<span class="note-pill">${n.trim()}</span>`)
          .join('')}
      </div>
      <div class="qty-row">
        <div class="qty-control">
          <button type="button" id="qty-minus" aria-label="Decrease quantity">–</button>
          <input type="number" id="qty-input" value="1" min="1" max="${product.stock}" />
          <button type="button" id="qty-plus" aria-label="Increase quantity">+</button>
        </div>
        <span class="stock-note">${
          product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'
        }</span>
      </div>
      <button class="btn btn-block" id="add-to-cart-btn" ${
        product.stock === 0 ? 'disabled' : ''
      }>
        ${product.stock === 0 ? 'Out of stock' : 'Add to cart'}
      </button>
    </div>
  `;

  const qtyInput = document.getElementById('qty-input');
  document.getElementById('qty-minus').addEventListener('click', () => {
    qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
  });
  document.getElementById('qty-plus').addEventListener('click', () => {
    qtyInput.value = Math.min(product.stock, Number(qtyInput.value) + 1);
  });

  document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
    const qty = Math.max(1, Number(qtyInput.value) || 1);
    Cart.add(product.id, qty);
    showToast(`Added ${qty} × ${product.name}`);
  });
}

async function init() {
  const id = getIdFromQuery();
  if (!id) {
    detailContainer.innerHTML = `<p class="empty-state">No product specified.</p>`;
    return;
  }

  try {
    const { product } = await Api.getProduct(id);
    renderProduct(product);
  } catch (err) {
    detailContainer.innerHTML = `<p class="empty-state">${err.message}</p>`;
  }
}

init();
