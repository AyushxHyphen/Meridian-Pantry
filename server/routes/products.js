const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '..', 'data', 'products.json');

function readProducts() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

// GET /api/products?category=Coffee&search=roast
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let products = readProducts();

  if (category && category !== 'All') {
    products = products.filter(
      (p) => p.category.toLowerCase() === String(category).toLowerCase()
    );
  }

  if (search) {
    const term = String(search).toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.notes.toLowerCase().includes(term)
    );
  }

  res.json({ count: products.length, products });
});

// GET /api/products/categories  (must be declared before /:id)
router.get('/categories', (req, res) => {
  const products = readProducts();
  const categories = [...new Set(products.map((p) => p.category))];
  res.json({ categories });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const products = readProducts();
  const product = products.find((p) => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  res.json({ product });
});

module.exports = router;
