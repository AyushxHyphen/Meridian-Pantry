# Meridian Pantry

A full-stack e-commerce demo: a small pantry/coffee shop built on a **Node.js + Express** REST API with a **vanilla HTML/CSS/JS** frontend served from the same server.

## Features

- **Product catalog** — browse, filter by category, and search
- **Product detail pages** — notes, origin, quantity picker, stock awareness
- **Cart** — persisted in `localStorage`, editable quantities, remove items
- **Checkout** — customer form → creates a real order via the API
- **Order validation** — server checks stock, rejects invalid/over-quantity orders, decrements stock atomically per order
- **Order confirmation** — receipt page fetched from the server by order ID

## Architecture

```
meridian-pantry/
├── server/
│   ├── server.js           # Express app entry point, serves API + static frontend
│   ├── routes/
│   │   ├── products.js     # GET /api/products, /api/products/:id, /api/products/categories
│   │   └── orders.js       # POST /api/orders, GET /api/orders/:id
│   └── data/
│       ├── products.json   # Product catalog (acts as the "database")
│       └── orders.json     # Orders are appended here as they're placed
├── public/                 # Frontend — served as static files by Express
│   ├── index.html           # Home / product grid
│   ├── product.html         # Product detail
│   ├── cart.html            # Cart
│   ├── checkout.html        # Checkout form
│   ├── confirmation.html    # Order confirmation / receipt
│   ├── css/style.css
│   └── js/
│       ├── api.js          # fetch() wrapper around the API
│       ├── cart.js         # Cart state (localStorage) + toast/badge helpers
│       ├── main.js         # Home page logic
│       ├── product.js      # Product detail page logic
│       ├── checkout.js     # Checkout page logic
│       └── confirmation.js # Confirmation page logic
└── package.json
```

This uses JSON files instead of a real database on purpose, so the whole thing runs
with zero external services. Swapping `server/data/*.json` + the `fs` calls in
`routes/products.js` and `routes/orders.js` for a real database (Postgres, MongoDB, etc.)
is the natural next step and shouldn't require any frontend changes, since the API
contract stays the same.

## Running it

```bash
npm install
npm start
```

Then open **http://localhost:3000**.

For auto-restart on file changes during development:

```bash
npm run dev
```

## API reference

| Method | Route                        | Description                                  |
|--------|-------------------------------|-----------------------------------------------|
| GET    | `/api/products`               | List products. Query params: `category`, `search` |
| GET    | `/api/products/categories`    | List distinct categories                      |
| GET    | `/api/products/:id`           | Get one product                               |
| POST   | `/api/orders`                 | Create an order. Body: `{ items: [{id, qty}], customer: {name, email, address} }` |
| GET    | `/api/orders/:id`              | Fetch an order by ID                          |
| GET    | `/api/health`                  | Health check                                  |

## Notes on where this is a demo, not production

- No authentication — anyone can place an order with any email
- No payment processing integration (Stripe, etc. would slot into checkout.js + a new `/api/orders` step)
- JSON-file storage isn't safe for concurrent writes at scale — fine for a demo, not for real traffic
- Product images are placeholder photos from picsum.photos

These are the natural next additions if you want to take this further.
