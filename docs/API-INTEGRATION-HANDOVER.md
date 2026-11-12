# WordPress + WooCommerce API integration handover

The frontend currently uses local fallback content and does not connect to WordPress or WooCommerce. Public base URLs are read from `.env`; no consumer key, consumer secret, payment credential, or privileged nonce belongs in the browser bundle.

## Current data audit

| Area | Current source | Integration boundary |
| --- | --- | --- |
| Products and categories | `src/data/fallback/catalog.ts` | `productService.ts`, `categoryService.ts` |
| Hero slides | `src/config/heroFallback.ts` | `heroService.ts` |
| Promotional banners | `src/config/promoBannerFallback.ts` | `promoBannerService.ts` |
| Cart and coupon | Browser storage | `cartCheckoutService.ts`, `StoreContext.tsx` |
| Customer, addresses, downloads and orders | Server-injected authenticated session | `accountService.ts` |
| Wishlist | Browser storage until customer sync exists | `wishlistReviewService.ts` |
| Reviews | Empty/local UI state | `wishlistReviewService.ts` contract |
| Recently viewed | Browser storage | `recentlyViewed.ts` |

Static policy, About and Contact copy remains page content rather than commerce data. KOKO/Payzy calculations are display estimates only. The frontend does not create orders, authenticate customers, or process payments.

## Required backend capabilities and fields

Exact routes must be agreed with the WordPress team; this document intentionally does not prescribe endpoint URLs.

### Products

Published product list and single-product lookup need: stable ID, name, slug, permalink/path, descriptions, consistently documented price units, sale price, stock state/quantity, images and alt text, category IDs, brand, average rating, review count, purchasability, variations/options, visibility, and pagination metadata.

### Categories

Need: stable ID, parent ID, name, slug, description, image URL/alt text, real product count, display order, visibility, and empty-category policy. Relationships must use IDs rather than names.

### Hero and promotional banners

Need: stable ID, copy, desktop/mobile images with dimensions and alt text, destination/button data, display order, active/published status, optional publish/expiry dates, and presentation style. A read-only WordPress custom endpoint can be used after its contract is approved.

### Cart and checkout

Use the public WooCommerce Store API or a same-origin server adapter. Required operations are cart read/create, add/update/remove line, coupon apply/remove, shipping and total calculation, available payment methods, and checkout/order creation. Responses need cart token/session handling, line keys, product/variation IDs, quantity limits, totals, coupons, shipping rates, validation errors, and checkout result/redirect. Payment credentials and card data must never pass through React.

### Customer accounts and orders

All operations require a WordPress-authenticated same-origin session with CSRF/nonce protection. Need current profile, address CRUD/default address, password change, logout, paginated order history/detail, and downloads. Order data needs stable ID/number, creation date, status, currency/formatted total, line items (product ID, name, image, quantity, line total), and a safe view URL.

### Wishlist and reviews

Wishlist needs authenticated list/add/remove/sync operations keyed by stable product IDs. Reviews need published list, pagination, rating summary, and authenticated submission with product ID, rating, content, display author, verification state, and created date. Moderation remains in WordPress.

## Configuration and rollout

Copy `.env.example` to a local `.env` only after contracts exist. `VITE_WORDPRESS_API_BASE_URL` and `VITE_WOOCOMMERCE_STORE_API_BASE_URL` are public origins. Feature paths remain blank until implemented. Never use `VITE_*` for secrets because Vite exposes them to visitors.

1. Agree schemas, authentication, CORS and error formats with the backend team.
2. Add repository adapters behind the existing service interfaces and map payloads into `src/types/commerce.ts`.
3. Retain fallback repositories for local development and safe read-only fallback where appropriate.
4. Wire loading, empty and error resource states to the existing page treatments; never turn authenticated mutation failures into mock success.
5. Test pagination, category changes, cart persistence, checkout validation, expired sessions, unavailable products and image fallbacks before enabling production URLs.
