const express = require('express');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const router = express.Router();
const PRODUCTS_PATH = path.join(__dirname, '..', 'data', 'products.json');
const ORDERS_PATH = path.join(__dirname, '..', 'data', 'orders.json');

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// POST /api/orders
// body: { items: [{ id, qty }], customer: { name, email, address } }
router.post('/', (req, res) => {
  const { items, customer } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }
  if (!customer || !customer.name || !customer.email || !customer.address) {
    return res
      .status(400)
      .json({ error: 'Name, email, and address are required to place an order.' });
  }

  const products = readJSON(PRODUCTS_PATH);
  const lineItems = [];
  let total = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.id);
    if (!product) {
      return res.status(404).json({ error: `Product ${item.id} does not exist.` });
    }
    const qty = Number(item.qty) || 0;
    if (qty <= 0) {
      return res.status(400).json({ error: `Invalid quantity for ${product.name}.` });
    }
    if (qty > product.stock) {
      return res
        .status(409)
        .json({ error: `Only ${product.stock} left of ${product.name}.` });
    }

    lineItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty,
      subtotal: Number((product.price * qty).toFixed(2)),
    });
    total += product.price * qty;
  }

  // Decrement stock now that the order is validated
  const updatedProducts = products.map((p) => {
    const purchased = items.find((i) => i.id === p.id);
    if (purchased) {
      return { ...p, stock: p.stock - Number(purchased.qty) };
    }
    return p;
  });
  writeJSON(PRODUCTS_PATH, updatedProducts);

  const order = {
    id: randomUUID(),
    items: lineItems,
    customer,
    total: Number(total.toFixed(2)),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  const orders = readJSON(ORDERS_PATH);
  orders.push(order);
  writeJSON(ORDERS_PATH, orders);

  res.status(201).json({ order });
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const orders = readJSON(ORDERS_PATH);
  const order = orders.find((o) => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  res.json({ order });
});

module.exports = router;
