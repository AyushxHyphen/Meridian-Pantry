const grid = document.getElementById('product-grid');
const filtersRow = document.querySelector('.filters');
const searchInput = document.getElementById('search-input');

let activeCategory = 'All';
let searchTerm = '';
let searchDebounce;

function productCardHTML(product) {
  return `
    <article class="tag-card">
      <a class="card-link" href="/product.html?id=${product.id}" aria-label="View ${product.name}"></a>
      <div class="thumb">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </div>
      <p class="category">${product.category}</p>
      <h3>${product.name}</h3>
      <p class="origin">${product.origin} · ${product.unit}</p>
      <div class="price-row">
        <span class="price">${formatPrice(product.price)}</span>
        <button class="mini-btn" data-quick-add="${product.id}">Add to cart</button>
      </div>
    </article>
  `;
}

async function renderCategories() {
  try {
    const { categories } = await Api.getCategories();
    categories.forEach((cat) => {
      const chip = document.createElement('button');
      chip.className = 'filter-chip';
      chip.dataset.category = cat;
      chip.textContent = cat;
      filtersRow.insertBefore(chip, document.querySelector('.search-box'));
    });
  } catch (err) {
    console.error('Could not load categories', err);
  }
}

async function renderProducts() {
  grid.innerHTML = `<p class="empty-state">Loading the shelf…</p>`;
  try {
    const params = {};
    if (activeCategory !== 'All') params.category = activeCategory;
    if (searchTerm) params.search = searchTerm;

    const { products } = await Api.getProducts(params);

    if (products.length === 0) {
      grid.innerHTML = `<p class="empty-state">Nothing matches that search. Try another term.</p>`;
      return;
    }

    grid.innerHTML = products.map(productCardHTML).join('');
  } catch (err) {
    grid.innerHTML = `<p class="empty-state">Couldn't load products: ${err.message}</p>`;
  }
}

filtersRow.addEventListener('click', (e) => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  document.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
  chip.classList.add('active');
  activeCategory = chip.dataset.category;
  renderProducts();
});

searchInput.addEventListener('input', (e) => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    searchTerm = e.target.value.trim();
    renderProducts();
  }, 250);
});

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-quick-add]');
  if (!btn) return;
  e.preventDefault();
  Cart.add(btn.dataset.quickAdd, 1);
  showToast('Added to cart');
});

renderCategories();
renderProducts();
