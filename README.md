# Anything at Supun — Phase 1 frontend

A frontend-only React prototype that preserves the familiar Anything at Supun shopping flow while improving spacing, responsiveness and interaction consistency.

## Run locally

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

## Structure

- `src/components` — shared layout and reusable product card
- `src/context` — cart/wishlist state with browser persistence
- `src/data` — typed mock catalog data
- `src/pages` — home, catalog, product, commerce and content pages
- `public/assets` — public reference assets used by the prototype

## WooCommerce handoff

Mock product data is isolated in `src/data/catalog.ts`. Replace this module with a WooCommerce-backed service later while retaining the `Product` interface and reusable UI components. Authentication, orders, payment and inventory are intentionally not connected in Phase 1. Checkout is clearly marked as a demo and does not collect or process payments.
