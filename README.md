# Threadly: Responsive E-Commerce Website

A responsive online clothing store built with plain HTML, CSS and JavaScript. It was made as a Full Stack Development internship task (Task 3: Responsive E-Commerce Website).

## Features

- **Product catalogue** of 12 items loaded from a data file (`products.js`)
- **Search, category filters and sorting** (price low/high, name)
- **Product details pop-up** with description, rating and size picker
- **Shopping cart** with add, remove, quantity buttons, running totals and free-delivery progress (free over Rs. 5,000, otherwise Rs. 250)
- **Checkout form** with validation (name, phone, email, address, city, payment method)
- **Order confirmation** with an order ID; every order is saved
- **Responsive layout** that adapts from desktop to tablet to phone (2-column grid and a full-width cart on mobile)
- **Accessible**: keyboard navigation, focus outlines, ARIA labels, Escape key closes pop-ups

## How to run

No installation needed.

1. Keep all four files in one folder: `index.html`, `style.css`, `products.js`, `app.js`.
2. Double-click `index.html` to open it in your browser.

## Project structure

| File | Purpose |
|------|---------|
| `index.html` | Page structure: header, hero, product grid, cart drawer, modals |
| `style.css` | Styling and responsive rules |
| `products.js` | The product "database" (edit this to add or change products) |
| `app.js` | Filtering, cart logic, checkout, saving data |

## Data storage

The product list lives in `products.js`. The cart and the placed orders are stored in the browser's `localStorage` (keys `threadly.cart.v1` and `threadly.orders.v1`), so the cart survives a page refresh. To view saved orders, open the browser developer tools, go to Application, then Local Storage.

## Adding a product

Add a new object to the array in `products.js`:

```js
{ id: 13, name: 'Wool Beanie', category: 'Accessories', price: 999, emoji: '🧢',
  colors: ['#e0e0ff', '#c0c0f5'], rating: 4.5, desc: 'Warm knitted beanie.' }
```

## Notes

- This is a demo store: products are sample items and no real payment is taken.
- A real production version would store products and orders on a server with a database such as SQLite or MongoDB.
