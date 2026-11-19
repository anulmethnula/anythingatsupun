# Anything at Supun — Backend Integration Report

**Audience:** WordPress/WooCommerce backend developer and React frontend developer  
**Repository audited:** current `anythingatsupun` frontend repository  
**Report status:** implementation handover; proposed APIs are not claims of existing functionality  
**Last repository review:** 2026-11-19

## 1. Executive summary

This repository is a responsive React storefront prototype. It has complete browsing, cart, wishlist, checkout, account, content, and policy interfaces, but only a small number of optional read/mutation seams currently call HTTP APIs. Products, categories, cart state, coupons, wishlist state, recommendations, and most totals are local. Login, registration, checkout/order creation, newsletter signup, and real payment processing are deliberately not connected.

The recommended production architecture is:

- WordPress/WooCommerce remains the source of truth for products, variations, stock, prices, coupons, customers, tax, shipping, orders, reviews, media, and transactional status.
- Public catalogue reads use WooCommerce Store API where its response contains all required fields, with an `aas/v1` WordPress REST adapter for project-specific fields/content.
- Cart and checkout use the WooCommerce Store API or a same-origin WordPress adapter that preserves WooCommerce cart/session semantics.
- Account mutations use a secure same-origin WordPress session and `X-WP-Nonce`; privileged WooCommerce REST credentials never enter the browser.
- MPGS, KOKO, and Payzy integrations are server-side WooCommerce payment gateways. The frontend must receive server-calculated fees, availability, and redirect/session information; it must not calculate authoritative payment totals or handle gateway secrets/card data.

The existing service boundaries should be reused, but the frontend must also be refactored where pages import local `products`/`categories` directly. Until that is done, replacing only `productService.ts` and `categoryService.ts` will not make the complete site dynamic.

## 2. Audit scope

The audit covered:

- Application/bootstrap/config: `package.json`, `.env.example`, `vite.config.ts`, `tsconfig*.json`, `src/main.tsx`, `src/App.tsx`, `src/config/*`.
- Models and data: `src/types/*`, `src/data/*`.
- State and service boundaries: `src/context/StoreContext.tsx`, every file in `src/services/*`.
- Pages: every file in `src/pages/*`.
- Components: every file in `src/components/*`, including account, catalogue, and home components.
- Existing integration guidance: `README.md` and `docs/API-INTEGRATION-HANDOVER.md`.
- Static assets and current environment-variable declarations.

Generated assets/screenshots and the compiled `dist` directory are not application contracts.

## 3. Current frontend architecture and tech stack

### 3.1 Stack

| Area | Current implementation |
| --- | --- |
| UI | React + TypeScript |
| Build | Vite; `npm run build` runs `tsc -b && vite build` |
| Routing | `react-router-dom` with `BrowserRouter` |
| State | React context/hooks; no Redux/query library |
| Styling | One global `src/styles.css`; Tailwind/PostCSS packages are configured but UI is primarily custom CSS |
| Icons | `lucide-react` |
| Persistence | Browser `localStorage` for cart, coupon, wishlist, recently viewed, and cookie consent |
| HTTP | Native `fetch`; no shared HTTP client, retry layer, or query cache |
| Data source | Local fallback catalogue plus optional WordPress content endpoints |
| Testing | No automated test framework or test script is currently declared |

There are no backend SDKs or unnecessary commerce dependencies in `package.json`.

### 3.2 Runtime composition

- `src/main.tsx` mounts the application in React strict mode.
- `src/App.tsx` defines all routes and wraps them with `StoreProvider` and `Layout`.
- `src/context/StoreContext.tsx` owns cart, wishlist, badge counts, subtotal, add-to-cart behavior, and toast feedback.
- `src/components/Layout.tsx` contains header search/navigation, category links, cart drawer, footer, newsletter form, mobile navigation, cart toast, and cookie banner.
- Checkout intentionally hides the site footer and mobile bottom navigation in `src/components/Layout.tsx`.

### 3.3 Existing service/repository boundaries

| Boundary | Current state |
| --- | --- |
| `src/services/productService.ts` | Repository interface exists, but implementation returns local fallback products. Most product consumers bypass it. |
| `src/services/categoryService.ts` | Repository interface exists; local implementation calculates counts. `Catalog.tsx` consumes it, while home/header consume static categories directly. |
| `src/services/cartCheckoutService.ts` | Local cart/coupon storage; checkout repository is a throwing stub. |
| `src/services/wishlistReviewService.ts` | Wishlist is local; review repository returns no reviews and rejects submissions. Product review form currently calls an env URL directly instead. |
| `src/services/accountService.ts` | Reads a server-injected session and implements same-origin address/details/password/logout mutations. |
| `src/services/heroService.ts` | Optional working HTTP read contract with validation and fallback. |
| `src/services/promoBannerService.ts` | Optional working HTTP read contract with validation and fallback. |
| `src/services/contact.ts` | Generates a `mailto:` link only. |
| `src/services/recentlyViewed.ts` | Local-only product ID history. |
| `src/services/cookieConsent.ts` | Local consent preferences and browser events; no trackers are installed. |

## 4. Implemented, partial, and pending features

| Feature | UI implemented | Backend status | Notes |
| --- | --- | --- | --- |
| Home hero carousel | Yes | **Optional API supported** | Falls back to `src/config/heroFallback.ts`. |
| Promotional banner carousel | Yes | **Optional API supported** | Falls back to `src/config/promoBannerFallback.ts`. |
| Product/category browsing | Yes | **Local only** | Twelve fallback products and category tree. |
| Search/filter/sort/pagination | Yes | **Local only** | All filtering and pagination occur in `Catalog.tsx`. |
| Product variants | Placeholder only | **Missing** | `options` is a boolean; no variation ID, attributes, price, or stock contract. |
| Product gallery | Yes | **Single local image only** | Model contains only one `image` string. |
| Live viewer count | Yes | **Optional API supported** | Polls every 30 seconds if configured. |
| Reviews | Form/UI yes | **Submission optional; reads missing** | Direct POST env URL; visible review list is always empty. |
| Cart | Yes | **Local only** | Stored as product IDs/quantities in localStorage. |
| Coupon | Yes | **Hard-coded local demo** | Only `SUPUN10`, 10% off. Must be removed as authority. |
| Wishlist | Yes | **Local only** | Product IDs in localStorage. |
| Recently viewed | Yes | **Local only** | Maximum 12 IDs in localStorage. |
| Checkout form/steps | Yes | **Not submitted** | Browser validation only; no shipping/tax/order API. |
| Shipping | UI placeholder | **Missing** | Always “Pending”; no zones/rates. |
| Tax | UI placeholder | **Missing** | No tax calculation. |
| MPGS | Selection/UI only | **Missing** | Must use secure hosted gateway/redirect. |
| KOKO | Estimate/UI only | **Missing** | Frontend currently estimates 13% fee and three installments. |
| Payzy | Estimate/UI only | **Missing** | Frontend currently estimates 8% fee and four installments. |
| Cash on delivery | Selection/UI only | **Missing checkout** | Availability is not validated. |
| Login/registration | Forms yes | **Intentionally inert** | Credentials are not sent. |
| Account dashboard | Yes | **Partial contract implemented** | Requires injected authenticated session; mutations need endpoint URLs/nonces. |
| Addresses/profile/password/logout | UI and service methods | **Backend endpoints required** | Same-origin POST contract already assumed. |
| Orders/downloads | Dashboard rendering | **Injected data only** | No independent list/detail/download API calls. |
| Contact form | Yes | **Mail client only** | No server submission/storage. |
| Newsletter | UI only | **Missing** | Submit currently only prevents default. |
| Cookie consent | Yes | **Local only** | Optional scripts must consult consent before loading. |
| Policies/about/contact copy | Yes | **Static frontend copy** | Not WordPress-admin controlled today. |

## 5. Contract conventions for all proposed APIs

All endpoints in this report marked **Proposed** are recommendations to be agreed and implemented; they do not currently exist in the repository.

### 5.1 Base paths

- Prefer WooCommerce Store API for standard public commerce operations: `/wp-json/wc/store/v1/...` (confirm the installed WooCommerce Store API namespace/version).
- Prefer a custom plugin namespace for project-specific adapters/content: `/wp-json/aas/v1/...`.
- Account and checkout mutations should be same-origin where practical.
- Never expose `/wc/v3` consumer key/secret credentials to Vite/browser code.

### 5.2 JSON, money, dates, IDs

- Send `Content-Type: application/json; charset=utf-8` and `Accept: application/json`.
- Use stable numeric WooCommerce IDs for product/category/variation/order/customer relations.
- Use ISO 8601 UTC timestamps, for example `2026-11-19T06:30:00Z`.
- Do not send authoritative money as floating-point display values. Recommended shape:

```ts
interface Money {
  currencyCode: "LKR" | string;
  minorUnit: number;      // LKR is normally 2; backend remains authoritative
  amount: string;         // integer minor units, e.g. "1490000"
  formatted: string;      // e.g. "Rs. 14,900.00"
}
```

The current `Product.price: number` and `money()` formatter assume decimal rupees. The frontend adapter must convert server money once and consistently, or migrate UI models to `Money`.

### 5.3 Standard success metadata

List responses should include pagination rather than requiring the browser to load the entire catalogue:

```ts
interface PaginationMeta {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

interface ApiList<T> {
  items: T[];
  pagination: PaginationMeta;
}
```

### 5.4 Standard error contract

**Proposed:** normalize custom endpoints and adapters to:

```ts
interface ApiErrorResponse {
  code: string; // stable machine code: invalid_coupon, out_of_stock, validation_error
  message: string; // safe customer-facing summary
  status: number;
  fieldErrors?: Record<string, string[]>;
  details?: Record<string, unknown>;
  requestId?: string;
}
```

Recommended status handling:

| Status | Frontend behavior |
| --- | --- |
| 400/422 | Show inline validation errors; keep entered data. |
| 401 | Refresh/authenticate session, preserve intended route/cart. |
| 403 | Show permission/nonce-expired message; obtain a fresh nonce. |
| 404 | Product/content unavailable; route to a useful not-found state. |
| 409 | Refresh cart/product because price, stock, coupon, or cart version changed. |
| 429 | Disable repeated submission and respect `Retry-After`. |
| 500/502/503 | Show retryable service error; do not show fake success. |

The frontend must not rely only on `response.ok`; parse and map error bodies. Mutations require idempotency protection where duplicate order/payment creation is possible.

## 6. Product, category, search, and catalogue APIs

### 6.1 Product list/search — **Proposed**

`GET /wp-json/aas/v1/products` (adapter) or mapped WooCommerce Store API products endpoint.

Suggested query parameters:

```text
page, per_page, search, category, subcategory, brand[], min_price,
max_price, on_sale, in_stock, collection, sort
```

`sort`: `default | price_asc | price_desc | rating | newest`.

Response example:

```json
{
  "items": [
    {
      "id": 9,
      "slug": "premium-porcelain-serving-set",
      "name": "Premium Porcelain Serving Set",
      "sku": "AAS-0009",
      "type": "simple",
      "brand": { "id": 12, "name": "Dankotuwa", "slug": "dankotuwa" },
      "categories": [{ "id": 5, "name": "HOUSEHOLD", "slug": "household", "parentId": null }],
      "shortDescription": "Genuine quality product...",
      "descriptionHtml": "<p>...</p>",
      "price": { "currencyCode": "LKR", "minorUnit": 2, "amount": "1490000", "formatted": "Rs. 14,900.00" },
      "regularPrice": { "currencyCode": "LKR", "minorUnit": 2, "amount": "1650000", "formatted": "Rs. 16,500.00" },
      "onSale": true,
      "stock": { "status": "instock", "quantity": 8, "backordersAllowed": false, "maxPurchaseQuantity": 8 },
      "images": [{ "id": 501, "url": "https://example.lk/uploads/product.jpg", "thumbnailUrl": "https://example.lk/uploads/product-300x300.jpg", "alt": "Premium porcelain serving set", "width": 1200, "height": 1200 }],
      "averageRating": 5,
      "reviewCount": 4,
      "purchasable": true,
      "hasOptions": false,
      "permalinkPath": "/product/9"
    }
  ],
  "facets": {
    "brands": [{ "slug": "dankotuwa", "name": "Dankotuwa", "count": 4 }],
    "price": { "min": "160000", "max": "31990000", "minorUnit": 2 },
    "stock": { "inStock": 11 },
    "saleCount": 8
  },
  "pagination": { "page": 1, "perPage": 9, "totalItems": 12, "totalPages": 2 }
}
```

Required consumers:

- `src/pages/Catalog.tsx` — currently local search, filter, sorting, and pagination.
- `src/pages/Home.tsx` — monthly specials, hot deals, fragrance drops, top-rated items.
- `src/pages/Commerce.tsx` — wishlist/cart recommendations.
- `src/components/home/RecentlyViewed.tsx` — resolve stored IDs.
- `src/context/StoreContext.tsx` — currently imports a fixed product array to hydrate the cart.
- `src/App.tsx` — recently-viewed tracker currently validates IDs against the local array.

### 6.2 Single product and variations — **Proposed**

`GET /wp-json/aas/v1/products/{id-or-slug}`

```ts
interface ProductImage {
  id: number;
  url: string;
  thumbnailUrl?: string;
  alt: string;
  width: number;
  height: number;
}

interface ProductAttributeOption {
  value: string;
  label: string;
}

interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  required: boolean;
  options: ProductAttributeOption[];
}

interface ProductVariation {
  id: number;
  sku: string;
  attributes: Record<string, string>;
  price: Money;
  regularPrice?: Money;
  stock: ProductStock;
  image?: ProductImage;
  purchasable: boolean;
}

interface ProductStock {
  status: "instock" | "outofstock" | "onbackorder";
  quantity: number | null;
  backordersAllowed: boolean;
  minPurchaseQuantity?: number;
  maxPurchaseQuantity?: number;
}

interface ProductSummary {
  id: number;
  slug: string;
  name: string;
  sku: string;
  type: "simple" | "variable";
  brand?: { id: number; name: string; slug: string };
  categories: Array<{ id: number; name: string; slug: string; parentId: number | null }>;
  shortDescription: string;
  price: Money;
  regularPrice?: Money;
  onSale: boolean;
  stock: ProductStock;
  images: ProductImage[];
  averageRating: number;
  reviewCount: number;
  purchasable: boolean;
  hasOptions: boolean;
  permalinkPath: string;
}

interface ProductDetail extends ProductSummary {
  descriptionHtml: string;
  images: ProductImage[];
  attributes: ProductAttribute[];
  variations: ProductVariation[];
  relatedProductIds: number[];
  shippingClass?: string;
  weight?: string;
  dimensions?: { length: string; width: string; height: string };
}
```

Consumer: `src/pages/Product.tsx`. It currently falls back to the first product for an unknown ID, manufactures SKU as `AAS-{id}`, has one image, and renders an empty variation `<select>`. Production must render a 404/unavailable state and require a valid `variationId` before add-to-cart.

### 6.3 Categories — existing frontend interface, backend implementation **missing**

Current frontend types in `src/types/commerce.ts`:

```ts
interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  image: string;
  productCount?: number;
  order: number;
  visible: boolean;
  showWhenEmpty?: boolean;
  description: string;
}
type CategoryNode = Category & { children: CategoryNode[] };
```

**Proposed:** `GET /wp-json/aas/v1/categories?tree=true&hide_empty=true`

```json
{
  "items": [
    {
      "id": 2,
      "name": "WRIST WATCHES",
      "slug": "watches",
      "parentId": null,
      "image": { "url": "https://example.lk/uploads/watches.png", "alt": "Wrist watches" },
      "productCount": 20,
      "order": 2,
      "visible": true,
      "showWhenEmpty": false,
      "description": "Timeless styles for every occasion.",
      "children": []
    }
  ]
}
```

Consumers:

- `src/services/categoryService.ts` and `src/pages/Catalog.tsx` already form one replaceable boundary.
- `src/pages/Home.tsx`, `src/components/Layout.tsx`, and `src/data/catalog.ts` still use static categories and must be connected to shared category state/service.
- `src/components/catalog/CategoryNavigation.tsx` expects product counts and hierarchy.

### 6.4 Brands and collections — **contract decision required**

The UI treats brand as a string and “Hot Deals”/“Top Rated Items” as code-defined collections. Backend must decide whether:

- brand is a WooCommerce global attribute, taxonomy, or approved brand plugin taxonomy; and
- homepage/shop collections are product tags, categories, custom taxonomies, merchandising rules, or explicit curated product IDs.

Expose stable brand/collection IDs and slugs. Do not make frontend filtering depend on display names.

## 7. Cart and coupon APIs

### 7.1 Current state

- `src/context/StoreContext.tsx` stores lines as `{ productId, quantity }` in `aas-cart`.
- `src/services/cartCheckoutService.ts` rehydrates those IDs from the local product array.
- Quantity updates and removal are synchronous local mutations.
- Add-to-cart uses an artificial 120 ms delay and only checks local `product.stock`.
- `src/pages/Commerce.tsx` recognizes only hard-coded `SUPUN10` and calculates 10% locally.

All prices, limits, stock, coupon validity, discounts, shipping, fees, and taxes must be revalidated by WooCommerce.

### 7.2 Required cart operations

Prefer WooCommerce Store API cart operations if compatible with the chosen hosting/session setup. If an adapter is used, the following **proposed** semantics are required:

| Method | Proposed endpoint | Purpose |
| --- | --- | --- |
| GET | `/wp-json/aas/v1/cart` | Restore server cart and authoritative totals. |
| POST | `/wp-json/aas/v1/cart/items` | Add product/variation. |
| PATCH | `/wp-json/aas/v1/cart/items/{lineKey}` | Change quantity. |
| DELETE | `/wp-json/aas/v1/cart/items/{lineKey}` | Remove line. |
| POST | `/wp-json/aas/v1/cart/coupons` | Apply coupon. |
| DELETE | `/wp-json/aas/v1/cart/coupons/{code}` | Remove coupon. |

Add request:

```json
{
  "productId": 6,
  "variationId": 612,
  "quantity": 1,
  "attributes": { "pa_size": "55-inch" }
}
```

Cart response:

```ts
interface CartApi {
  id: string;
  version: string;
  lines: Array<{
    key: string;
    productId: number;
    variationId?: number;
    name: string;
    image: ProductImage;
    quantity: number;
    quantityLimits: { minimum: number; maximum: number; multipleOf: number; editable: boolean };
    unitPrice: Money;
    lineSubtotal: Money;
    lineDiscount: Money;
    lineTotal: Money;
    stockStatus: ProductStock["status"];
  }>;
  coupons: Array<{ code: string; discountType: string; discountTotal: Money }>;
  totals: {
    itemsSubtotal: Money;
    discountTotal: Money;
    feeTotal: Money;
    shippingTotal: Money | null;
    taxTotal: Money | null;
    grandTotal: Money | null;
  };
  requiresShipping: boolean;
  notices: Array<{ type: "success" | "error" | "notice"; code: string; message: string }>;
}
```

Session transport must follow the selected Store API mode (WooCommerce session cookie/nonces or supported cart token). Do not create a second unsynchronized cart model without an explicit merge strategy.

Consumers:

- `src/context/StoreContext.tsx`
- `src/components/ProductCard.tsx`
- `src/pages/Product.tsx`
- `src/components/Layout.tsx` cart drawer and badges
- `src/pages/Commerce.tsx`
- `src/pages/CheckoutPage.tsx`
- `src/services/cartCheckoutService.ts`

### 7.3 Guest/authenticated cart merge

Contract decision required for login:

1. Preserve guest cart session before authentication.
2. On successful login, merge guest and customer carts once.
3. Enforce stock/quantity limits during merge.
4. Return the final canonical cart and notices.
5. Avoid duplicate lines/orders when requests are retried.

## 8. Wishlist, recently viewed, and reviews

### 8.1 Wishlist — **Proposed**

For guests, local IDs may remain. For authenticated customers, provide:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/wp-json/aas/v1/me/wishlist` | List stable product IDs or summaries. |
| POST | `/wp-json/aas/v1/me/wishlist/items` | Add `{ "productId": 9 }`. |
| DELETE | `/wp-json/aas/v1/me/wishlist/items/{productId}` | Remove item. |
| POST | `/wp-json/aas/v1/me/wishlist/merge` | Merge guest IDs after login. |

```ts
interface WishlistResponse {
  productIds: number[];
  updatedAt: string;
}
```

Consumers: `src/services/wishlistReviewService.ts`, `src/context/StoreContext.tsx`, `src/pages/Commerce.tsx`, `src/components/ProductCard.tsx`, `src/pages/Product.tsx`, and wishlist badge in `src/components/Layout.tsx`.

### 8.2 Recently viewed — optional **Proposed**

Local storage may remain for guests. If cross-device account history is required:

- `GET /wp-json/aas/v1/me/recently-viewed`
- `POST /wp-json/aas/v1/me/recently-viewed` with `{ "productId": 9 }`

Consumers: `src/services/recentlyViewed.ts`, `src/components/home/RecentlyViewed.tsx`, and tracker in `src/App.tsx`.

### 8.3 Reviews — partial direct contract exists

Existing env-based submission in `src/pages/Product.tsx` sends:

```json
{
  "productId": 9,
  "rating": 5,
  "name": "Customer Name",
  "email": "customer@example.com",
  "message": "Review text"
}
```

It sends no credentials/nonce and treats any 2xx as success. This must be replaced or hardened.

**Proposed:**

- `GET /wp-json/aas/v1/products/{productId}/reviews?page=1&per_page=10`
- `POST /wp-json/aas/v1/products/{productId}/reviews`

```ts
interface ProductReview {
  id: number;
  productId: number;
  author: string;
  rating: number;
  content: string;
  createdAt: string;
  verified?: boolean;
}

interface ReviewListResponse {
  items: ProductReview[];
  summary: { average: number; count: number; distribution: Record<"1"|"2"|"3"|"4"|"5", number> };
  pagination: PaginationMeta;
}
```

Backend requirements: WooCommerce review storage, moderation/spam protection, verified-owner calculation, rating range validation, sanitized content, rate limiting, and privacy-safe display names. Decide whether guests may review and whether pending submissions return `201` or `202`.

Consumers: `src/pages/Product.tsx` and the currently unused repository contract in `src/services/wishlistReviewService.ts`.

## 9. Customer authentication and account APIs

### 9.1 Current injected session contract

`src/services/accountService.ts` reads JSON from:

```html
<script id="aas-account-session" type="application/json">...</script>
```

Current `AccountSession` contains customer, orders, addresses, downloads, logout URL, and optional endpoint URLs/nonces. This approach is viable only if WordPress serves/injects the shell or another same-origin layer safely injects authenticated data. A purely static Vite deployment on another origin cannot rely on WordPress injecting this script.

### 9.2 Authentication endpoints — **Proposed**

| Method | Endpoint | Body/purpose |
| --- | --- | --- |
| POST | `/wp-json/aas/v1/auth/login` | `{ email, password, remember }` |
| POST | `/wp-json/aas/v1/auth/register` | `{ name, email, password }` |
| POST | `/wp-json/aas/v1/auth/logout` | End current session. |
| GET | `/wp-json/aas/v1/auth/session` | Return current safe account session. |
| POST | `/wp-json/aas/v1/auth/lost-password` | `{ email }`; always privacy-safe response. |
| POST | `/wp-json/aas/v1/auth/reset-password` | Reset token/key plus new password. |

```ts
interface AuthSessionResponse {
  authenticated: boolean;
  customer?: { id: number; name: string; email: string };
  csrfNonce?: string;
}
```

Do not place passwords in logs. Rotate session identifiers on login. Add brute-force protection and generic lost-password/login failure messages where account enumeration is a risk.

Consumers: inert forms in `src/pages/Static.tsx`, session reader in `src/services/accountService.ts`, header link in `src/components/Layout.tsx`.

### 9.3 Existing account mutation contract

The existing frontend expects same-origin POST URLs supplied inside `session.api`:

- `addressUrl`, accepting one of:
  - `{ "action": "save", "address": AccountAddress }` → saved `AccountAddress`
  - `{ "action": "delete", "id": "..." }` → `{ "success": true }`
  - `{ "action": "set-default", "id": "..." }` → `{ "success": true }`
- `detailsUrl`, accepting `{ "name": "...", "email": "..." }` → same shape.
- `passwordUrl`, accepting `{ "currentPassword": "...", "newPassword": "..." }` → `{ "success": true }`.
- `logoutUrl`, same-origin POST.

All requests use `credentials: "same-origin"` and `X-WP-Nonce`.

Exact existing types are in `src/services/accountService.ts`. Note that `AccountAddress` currently uses `district`, while `CheckoutAddress` in `src/types/commerce.ts` uses `province`; unify these names before integration.

### 9.4 Account reads/orders/downloads — **Proposed**

If not returned in one injected/session payload:

- `GET /wp-json/aas/v1/me`
- `GET /wp-json/aas/v1/me/addresses`
- `POST/PATCH/DELETE /wp-json/aas/v1/me/addresses/{id}`
- `POST /wp-json/aas/v1/me/addresses/{id}/default`
- `GET /wp-json/aas/v1/me/orders?page=1&per_page=10`
- `GET /wp-json/aas/v1/me/orders/{id}`
- `GET /wp-json/aas/v1/me/downloads`

Orders must enforce ownership server-side. Download URLs must be signed/authorized and must not expose filesystem paths.

Consumers: `src/components/account/AccountDashboard.tsx`, `src/pages/Static.tsx`, and checkout prefill in `src/pages/CheckoutPage.tsx`.

## 10. Checkout, shipping, tax, orders, and payments

### 10.1 Current checkout facts

- `src/pages/CheckoutPage.tsx` contains Contact, Delivery, and Payment UI and browser-side validation.
- Form values are not assembled into `CheckoutDraft` and `checkoutRepository.createCheckout()` is never called.
- Shipping is always pending.
- Coupon and subtotal originate from local state.
- MPGS/KOKO/Payzy are marked “Integration coming soon.”
- KOKO currently adds a local 13% estimate; Payzy adds a local 8% estimate.
- No order/payment is submitted. This safety behavior must remain until real APIs are connected.

### 10.2 Address and shipping calculation — **Proposed**

Use WooCommerce cart customer/shipping endpoints or an adapter:

`PUT /wp-json/aas/v1/cart/customer`

```json
{
  "billing": {
    "firstName": "Asha",
    "lastName": "Perera",
    "email": "asha@example.com",
    "phone": "+94771234567",
    "address1": "16 R. A. De Mel Mawatha",
    "address2": "",
    "city": "Colombo",
    "state": "Western Province",
    "postcode": "00400",
    "country": "LK"
  },
  "shipping": null
}
```

Response must return recalculated `CartApi`, shipping packages/rates, taxes, and available payment methods.

```ts
interface ShippingPackage {
  packageId: string;
  destination: CheckoutAddress;
  rates: Array<{
    rateId: string;
    methodId: string;
    label: string;
    cost: Money;
    tax: Money;
    selected: boolean;
    deliveryEstimate?: string;
  }>;
}
```

Required operations:

- list/recalculate available rates after address changes;
- select a rate by stable `rateId`;
- return “not serviceable” explicitly;
- calculate tax according to WooCommerce settings, product tax class, customer address, shipping method, and fee taxability.

The current hard-coded province list in `src/data/locations.ts` can remain as UX input only if backend accepts the exact values; otherwise backend must publish allowed countries/states and canonical codes.

### 10.3 Checkout/order creation — **Proposed**

`POST /wp-json/aas/v1/checkout`

```ts
interface CheckoutRequest {
  cartId: string;
  cartVersion: string;
  billing: CheckoutAddress;
  shipping?: CheckoutAddress;
  notes?: string;
  shippingRateIds: string[];
  paymentMethod: "mpgs" | "koko" | "payzy" | "cod";
  termsAccepted: true;
  idempotencyKey: string;
}

interface CheckoutResponse {
  orderId: number;
  orderNumber: string;
  status: "pending" | "processing" | "on-hold" | "failed";
  totals: CartApi["totals"];
  payment: {
    method: string;
    status: "not_required" | "pending" | "requires_action" | "failed";
    redirectUrl?: string;
    clientReference?: string;
  };
  orderReceivedPath?: string;
}
```

Backend must re-read the cart and recalculate stock, prices, coupons, fees, shipping, and tax in the same transactional flow before creating the order. Never trust browser totals or fee percentages. Use `Idempotency-Key` header and/or `idempotencyKey` storage to prevent duplicate orders.

Consumer: `src/pages/CheckoutPage.tsx`; reuse and implement `CheckoutRepository` in `src/services/cartCheckoutService.ts` and the existing `CheckoutDraft` model after expanding it for variation/cart/shipping/session fields.

### 10.4 Payment availability and fees — **Proposed**

`GET /wp-json/aas/v1/checkout/payment-methods` after cart/address/rate selection:

```json
{
  "items": [
    {
      "id": "payzy",
      "title": "Payzy",
      "available": true,
      "unavailableReason": null,
      "fee": { "type": "percentage", "rate": "8.00", "amount": { "currencyCode": "LKR", "minorUnit": 2, "amount": "119200", "formatted": "Rs. 1,192.00" } },
      "installments": { "count": 4, "amount": { "currencyCode": "LKR", "minorUnit": 2, "amount": "402300", "formatted": "Rs. 4,023.00" } }
    }
  ]
}
```

The displayed 13% KOKO and 8% Payzy rules must be confirmed by the business and represented by WooCommerce fee logic or gateway configuration. Frontend estimates are not binding and must be removed as the calculation authority.

### 10.5 MPGS requirements

- Implement as a maintained/custom WooCommerce payment gateway or server-side integration.
- Create gateway sessions/order references server-side.
- Prefer hosted checkout/hosted session fields to keep card data out of React and reduce PCI scope.
- Validate the exact amount/currency/order on callback; do not trust return query parameters alone.
- Use signed callbacks/webhooks and idempotently update WooCommerce orders.
- Expose only a short-lived redirect/session result to the browser.

### 10.6 KOKO and Payzy requirements

- Confirm merchant onboarding, supported currency, minimum/maximum order values, installments, fee/tax rules, callback signatures, refunds, and sandbox/production URLs with each provider.
- Calculate eligibility and fees server-side.
- Create provider transactions only after a WooCommerce order/reservation exists.
- Store provider transaction/reference IDs as order metadata.
- Handle browser return and server callback independently; server callback is authoritative.
- Implement refund/status synchronization where provider APIs support it.

### 10.7 Payment/order webhooks — **Proposed**

- `/wp-json/aas/v1/webhooks/mpgs`
- `/wp-json/aas/v1/webhooks/koko`
- `/wp-json/aas/v1/webhooks/payzy`

Requirements: signature verification, raw-body handling where required, timestamp/replay checks, idempotency by provider event/transaction ID, audit logs without sensitive data, correct HTTP acknowledgements, and retry-safe status transitions.

## 11. WordPress-admin controlled content

### 11.1 Hero slides — optional API contract already implemented

Configured by:

- `VITE_WORDPRESS_API_BASE_URL`
- `VITE_WORDPRESS_HERO_ENDPOINT`

`src/services/heroService.ts` expects:

```ts
type HeroApiPayload = { slides: unknown[] };

type HeroSlide = {
  id: string;
  eyebrow?: string;
  heading: string;
  highlightedHeading?: string;
  description: string;
  desktopImage: { url: string; alt: string; width: number; height: number };
  mobileImage?: { url: string; alt: string; width: number; height: number };
  primaryButton: { text: string; link: string };
  secondaryButton?: { text: string; link: string };
  showPrimaryButton: boolean;
  showSecondaryButton: boolean;
  imagePresentation?: "product" | "banner" | "full-banner";
  order: number;
  isActive: boolean;
  status: "draft" | "scheduled" | "published";
  publishAt?: string;
  expiresAt?: string;
};
```

Suggested endpoint: **Proposed** `GET /wp-json/aas/v1/content/hero`. Return `{ "slides": [...] }`. Frontend additionally filters active/published/schedule dates and sorts by order.

Backend admin requirements: media selection, separate mobile image, alt text, safe internal/external link validation, button toggles, presentation style, order, status, start/end scheduling, capability checks, preview, and sanitization.

Consumers: `src/services/heroService.ts`, `src/components/home/HeroSection.tsx`; fallback is `src/config/heroFallback.ts`.

### 11.2 Promotional banners — optional API contract already implemented

Configured by `VITE_WORDPRESS_PROMO_BANNER_ENDPOINT`. Expected root is `{ "banners": [...] }`; exact model is in `src/types/promoBanner.ts`.

Suggested endpoint: **Proposed** `GET /wp-json/aas/v1/content/promotional-banners`.

Required fields: ID, desktop/mobile URLs and dimensions, name, alt text, destination URL, order, active, optional start/end dates. Consumers: `src/services/promoBannerService.ts` and `src/components/home/PromotionalBannerSection.tsx`; fallback is `src/config/promoBannerFallback.ts`.

### 11.3 Other content currently hard-coded

The following can remain version-controlled or become WordPress-admin controlled by explicit business decision:

- Homepage benefit bar and section headings: `src/pages/Home.tsx`.
- Homepage product merchandising definitions: `src/pages/Home.tsx`.
- Header/footer contact data, social URLs, payment logos, footer copy: `src/components/Layout.tsx`.
- About and contact content: `src/pages/AboutContact.tsx`.
- Privacy, returns, warranty, and terms content: `src/pages/Policies.tsx`.
- Legacy/simple static page content: `src/pages/Static.tsx`.

If dynamic, **Proposed** `GET /wp-json/aas/v1/content/site` and `GET /wp-json/wp/v2/pages?slug=...`, with a documented sanitization/rendering policy. The React app currently renders JSX, not arbitrary WordPress HTML; connecting page HTML will require a safe renderer or structured blocks.

### 11.4 Contact and newsletter — **Proposed**

- `POST /wp-json/aas/v1/contact`
  - body matches `ContactMessage` in `src/services/contact.ts`.
  - validate server-side, reject honeypot `website`, rate limit, send/store according to policy, and return `{ "success": true, "reference": "..." }`.
- `POST /wp-json/aas/v1/newsletter/subscriptions`
  - body `{ "email": "customer@example.com", "consent": true, "source": "footer" }`.
  - use double opt-in where required; do not reveal existing subscription state unnecessarily.

Consumers: `src/pages/AboutContact.tsx`, `src/services/contact.ts`, and footer form in `src/components/Layout.tsx`.

## 12. WooCommerce/plugin compatibility requirements

Before implementation, record and test the exact versions of WordPress, WooCommerce, PHP, theme/runtime, Store API package/namespace, and every payment/wishlist/brand plugin. Do not assume plugin response shapes.

Required compatibility characteristics:

- Products, variations, stock management, sale scheduling, tax classes, coupons, shipping zones/rates, orders, refunds, reviews, and customer records remain native WooCommerce data wherever possible.
- HPOS (High-Performance Order Storage): custom order queries/meta/payment plugins must use WooCommerce CRUD APIs and declare/test compatibility rather than querying legacy post tables directly.
- Cart/Checkout Blocks/Store API: confirm gateway integrations expose availability and processing correctly for Store API/headless checkout, not only classic shortcode checkout.
- Brands: choose one taxonomy source and expose a stable adapter so changing a brand plugin does not change the frontend contract.
- Wishlist: if a plugin is selected, confirm authenticated REST operations, guest merge, privacy behavior, and product deletion handling. Otherwise implement a small custom customer-meta/table service.
- Multilingual/multicurrency: not present in the frontend. If planned, add locale/currency to every cache key and API contract before implementation.
- Image optimization/CDN: return HTTPS URLs, useful sizes/srcsets, alt text, width/height, and stable fallback behavior.
- Caching: public content/catalogue endpoints may be cached, but cart, account, checkout, nonce, and payment responses must never be publicly cached.
- Custom code should live in a version-controlled plugin (preferably an `aas-integration` plugin), not theme templates or edited vendor plugins.

## 13. Authentication, security, validation, CORS, and sessions

### 13.1 Browser/backend topology decision

Decide first whether React is:

1. served on the same origin as WordPress;
2. served on a subdomain; or
3. deployed on a different origin (for example a static host).

This decision determines cookie `Domain`, `SameSite`, CSRF/nonces, CORS, account session injection, and Store API cart behavior. The current account service explicitly rejects cross-origin mutation URLs.

### 13.2 Security requirements

- HTTPS in all production environments.
- Keep WooCommerce REST secrets, database credentials, SMTP/API keys, and payment credentials server-side.
- Use WordPress capability and ownership checks on every private endpoint.
- Use WordPress REST nonces/CSRF protection for cookie-authenticated mutations; refresh expired nonces safely.
- Sanitize input, validate types/ranges/IDs, escape output, and allowlist redirect URLs.
- Never trust client product prices, discounts, stock, shipping, taxes, fees, order status, customer ID, or payment success.
- Apply rate limits to login, registration, password reset, reviews, contact, newsletter, viewer count, checkout, and payment session creation.
- Add bot/spam controls without silently reporting success for failed commerce mutations.
- Use secure, HttpOnly, SameSite cookies and rotate sessions on authentication.
- Do not log passwords, full card data, gateway secrets, nonces, or unnecessary PII.
- Define data retention/deletion/export handling for customer/contact/review/newsletter records.
- Add Content Security Policy compatible with gateway redirects/hosted fields and image/CDN origins.

### 13.3 CORS

If cross-origin is unavoidable:

- allow only explicit production/preview origins, never `*` with credentials;
- allow required methods/headers (`Content-Type`, `X-WP-Nonce`, Store API nonce/cart token, `Idempotency-Key`);
- expose only necessary response headers;
- answer preflight consistently;
- set `Vary: Origin`;
- test credentialed requests and cookies on iOS Safari as well as desktop browsers.

Public hero/banner reads currently use `credentials: "omit"`; account requests use `same-origin`.

### 13.4 Viewer count

`VITE_PRODUCT_VIEWERS_ENDPOINT` is polled with `?productId={id}` and expects a non-negative integer in `viewerCount` or `count`. Clarify whether this is concurrent presence, recent views, or synthetic social proof. Do not fabricate counts. If implemented, use an expiring presence store, rate limiting, privacy-safe identifiers, and caching appropriate to 30-second polling.

## 14. Environment variables

Existing public Vite variables in `.env.example`:

```dotenv
VITE_WORDPRESS_API_BASE_URL=
VITE_WOOCOMMERCE_STORE_API_BASE_URL=
VITE_WORDPRESS_HERO_ENDPOINT=
VITE_WORDPRESS_PROMO_BANNER_ENDPOINT=
VITE_PRODUCT_VIEWERS_ENDPOINT=
VITE_WOOCOMMERCE_REVIEWS_ENDPOINT=
```

Recommended additional **public** frontend variables after contracts are agreed:

```dotenv
VITE_AAS_API_BASE_URL=
VITE_APP_ORIGIN=
```

Prefer a single base URL and stable paths over one variable per endpoint. Do not add secrets to any `VITE_*` value.

Backend-only settings (names illustrative; never committed/client-exposed):

```text
WP/WooCommerce database and auth salts
MPGS merchant ID, API password/key, gateway URLs, webhook secret
KOKO merchant credentials, sandbox/live URLs, webhook secret
Payzy merchant credentials, sandbox/live URLs, webhook secret
SMTP/transactional email credentials
Allowed frontend origins
Webhook replay/idempotency storage configuration
Logging/monitoring keys
```

Maintain separate sandbox/staging/production credentials and callback URLs.

## 15. Exact frontend API-consumer map

| Capability | Current/proposed boundary | Exact consumers |
| --- | --- | --- |
| Products | `src/services/productService.ts` (prepared) | Must connect `src/pages/Home.tsx`, `src/pages/Catalog.tsx`, `src/pages/Product.tsx`, `src/pages/Commerce.tsx`, `src/components/home/RecentlyViewed.tsx`, `src/context/StoreContext.tsx`, `src/App.tsx` |
| Categories | `src/services/categoryService.ts` | `src/pages/Catalog.tsx`; additionally connect `src/pages/Home.tsx`, `src/components/Layout.tsx` |
| Hero | `src/services/heroService.ts` | `src/components/home/HeroSection.tsx` |
| Promo banners | `src/services/promoBannerService.ts` | `src/components/home/PromotionalBannerSection.tsx` |
| Cart/coupons/checkout | `src/services/cartCheckoutService.ts`, `src/context/StoreContext.tsx` | `src/components/ProductCard.tsx`, `src/pages/Product.tsx`, `src/components/Layout.tsx`, `src/pages/Commerce.tsx`, `src/pages/CheckoutPage.tsx` |
| Wishlist | `src/services/wishlistReviewService.ts`, `src/context/StoreContext.tsx` | `src/components/ProductCard.tsx`, `src/pages/Product.tsx`, `src/pages/Commerce.tsx`, `src/components/Layout.tsx` |
| Reviews | direct env fetch plus unused repository | `src/pages/Product.tsx`, `src/services/wishlistReviewService.ts` |
| Viewer count | direct env fetch | `src/pages/Product.tsx` |
| Account session/mutations | `src/services/accountService.ts` | `src/pages/Static.tsx`, `src/components/account/AccountDashboard.tsx`, checkout prefill in `src/pages/CheckoutPage.tsx` |
| Login/register | no service yet | `src/pages/Static.tsx` |
| Contact | `src/services/contact.ts` | `src/pages/AboutContact.tsx` |
| Newsletter | no service yet | `src/components/Layout.tsx` |
| Recently viewed | `src/services/recentlyViewed.ts` | `src/App.tsx`, `src/components/home/RecentlyViewed.tsx` |
| Cookie consent | `src/services/cookieConsent.ts` | `src/components/CookieConsent.tsx`, footer settings in `src/components/Layout.tsx`; future trackers must consult it |

## 16. Local/demo data that must be replaced or reviewed

| Local/demo source | Current use | Production action |
| --- | --- | --- |
| `src/data/fallback/catalog.ts` | 12 products, 12 categories | Replace runtime authority with WooCommerce adapters; retain only optional dev fixtures. |
| `src/data/catalog.ts` | Exports static products/categories and currency formatter | Stop direct runtime imports; centralize API models/money. |
| `src/config/heroFallback.ts` | Three hero slides | Retain as resilience fallback only if approved. |
| `src/config/promoBannerFallback.ts` | KOKO promo | Retain as fallback only if dates/offer remain valid. |
| `src/data/locations.ts` | Sri Lankan province display names | Align to backend country/state codes and shipping zones. |
| `aas-cart` localStorage | Guest cart | Replace/synchronize with Woo session cart. |
| `aas-coupon` localStorage and `SUPUN10` | Demo coupon | Remove hard-coded validation/discount; use WooCommerce response. |
| `aas-wish` localStorage | Guest wishlist | Sync/merge for authenticated users if required. |
| recently viewed localStorage | Local history | Keep or sync by product IDs. |
| `dashboardPreviewSession` in `src/pages/Static.tsx` | Dev-only account demo | Keep guarded by `import.meta.env.DEV`; never expose as production data. |
| Product SKU `AAS-{id}` | Manufactured display | Use WooCommerce SKU. |
| Product `options` boolean | Placeholder variant indication | Replace with attributes/variations. |
| Local rating and empty review list | Demo display | Use WooCommerce aggregate/reviews. |
| Home collections in `src/pages/Home.tsx` | Client filters/sorts local array | Backend-managed queries/curated collections. |
| Shop collections in `src/pages/Catalog.tsx` | Code-defined “Hot Deals”/“Top Rated” | Define taxonomy/rule contract. |
| Footer newsletter submit | No-op | Connect to newsletter endpoint/provider. |
| Static policy/about/contact/footer copy | JSX | Decide whether to migrate to WordPress content/settings. |
| Checkout KOKO 13% / Payzy 8% | Client estimates | Confirm rules and make backend authoritative. |

## 17. Database/data requirements and relationships

Use native WordPress/WooCommerce tables/APIs for native entities. Custom tables are justified only for high-write or non-native data such as payment webhook idempotency/presence, and must use WordPress schema/version migrations.

Core relationships:

```text
Product ──< Variation
Product >──< Product Category (hierarchical)
Product >──< Brand / Collection taxonomy
Product ──< Product Image/Media
Product ──< Review >── Customer (optional for guests)

Customer ──< Address
Customer ──< Order ──< Order Line >── Product/Variation
Customer ──< Wishlist Item >── Product

Cart/Session ──< Cart Line >── Product/Variation
Cart ──< Applied Coupon >── Coupon
Cart ──< Shipping Package ──< Shipping Rate

Order ──< Fee/Tax/Shipping Line
Order ──< Payment Attempt ── Payment Provider
Payment Attempt ──< Webhook Event (unique provider event ID)
```

Required integrity/audit data:

- Preserve order-line product name, SKU, variation attributes, unit/line totals, taxes, and quantity as purchase-time snapshots.
- Store all money with currency and WooCommerce precision; do not derive historical totals from current product prices.
- Track stock reservations/reductions using WooCommerce mechanisms and restore correctly on cancellation/failure.
- Coupon usage limits must be enforced atomically by WooCommerce.
- Save selected shipping rate/method and calculated tax lines on the order.
- Save payment provider, transaction/reference IDs, amount/currency, status, and safe callback audit metadata.
- Enforce uniqueness on webhook/provider event IDs and checkout idempotency keys.
- Store consent evidence required for newsletter/marketing separately from essential commerce records.

## 18. Missing contracts and integration risks

1. **Deployment topology is unspecified.** The injected account session and same-origin mutations conflict with a standalone cross-origin static SPA unless an adapter/BFF is added.
2. **Prepared repositories are bypassed.** Most product/category consumers import local data directly, so backend integration is not a one-file swap.
3. **Product model is too small.** No slug, SKU, variation ID, multiple images, stock quantity, price precision, review count, or purchasability.
4. **Money uses floating-point rupees.** Fee/discount rounding can differ from WooCommerce.
5. **Two address models disagree.** `district` vs `province`, and checkout name fields differ from API conventions.
6. **Checkout form is uncontrolled and not serialized.** A deliberate frontend implementation task remains.
7. **Client-calculated coupon/payment fees are unsafe.** Server totals must replace them.
8. **Shipping/tax are unknown.** No zones, postal validation, rate IDs, tax classes, or serviceability contract exists.
9. **Payment integrations and business rules are unconfirmed.** KOKO 13% and Payzy 8% need written business/provider confirmation.
10. **Review submission bypasses the review repository.** Auth/nonce/moderation behavior is undecided.
11. **Unknown products show the first product.** Must become a 404/unavailable state.
12. **No automated tests.** Integration regression risk is high across cart/session/payment flows.
13. **No shared HTTP/error layer.** Current services implement different credential/error behavior.
14. **Static legal/content text may become stale.** Content ownership and publishing workflow must be decided.
15. **Cookie consent does not install tracking.** Any future analytics/marketing scripts must load only after the appropriate consent event/state.
16. **Browser storage migration is undefined.** Guest cart/wishlist IDs must merge without duplicates or stale products.

## 19. Backend implementation order and priorities

### Phase 0 — decisions and foundation (blocking)

1. Confirm deployment origins, session/auth strategy, WooCommerce/WordPress/PHP versions, HPOS, and Store API compatibility.
2. Agree canonical money, error, pagination, product, address, cart, and checkout contracts.
3. Create version-controlled `aas-integration` plugin and environment separation.
4. Configure CORS/security headers, logging/request IDs, nonces, and API test collections.

### Phase 1 — catalogue/content (high)

1. Product list/detail/variation mapping with prices, stock, images, categories, brands, facets, pagination, and search.
2. Category hierarchy/counts.
3. Hero and promo admin models/endpoints.
4. Reviews read API; optional viewer count only after semantics are approved.

This phase lets frontend replace local browse data without risking orders.

### Phase 2 — cart/coupons (high)

1. WooCommerce cart session strategy.
2. Add/update/remove/restore cart and quantity validation.
3. Coupon apply/remove and authoritative totals.
4. Guest/account cart merge.

### Phase 3 — accounts (high)

1. Login/register/logout/session/password reset.
2. Profile/address CRUD/default address.
3. Orders/detail/downloads with ownership checks.
4. Wishlist storage/merge if in scope.

### Phase 4 — shipping/tax/checkout (critical)

1. Address validation and shipping zones/rates.
2. Tax and fee calculation.
3. Checkout validation, stock reservation, idempotent WooCommerce order creation.
4. COD availability and order flow.

### Phase 5 — online payments (critical, provider-dependent)

1. Sandbox plugins/integrations for MPGS, KOKO, Payzy.
2. Server-authoritative fees/eligibility and hosted/redirect flows.
3. Signed webhook handlers, idempotency, reconciliation, refunds, and failure recovery.
4. Provider certification/UAT and production cutover.

### Phase 6 — secondary forms/content and hardening

Contact/newsletter, admin-managed pages/site settings, performance/caching, accessibility regression, observability, security review, backups, load testing, and launch runbook.

## 20. Step-by-step frontend integration checklist

1. Add one shared API client that handles base URL, JSON, nonces/cart token, normalized errors, abort signals, and request IDs.
2. Expand `src/types/commerce.ts` with canonical API DTOs and explicit adapter functions; do not leak raw plugin payloads into components.
3. Implement remote `ProductRepository` and `CategoryRepository` with local fallback allowed only for development/read resilience.
4. Replace direct `products`/`categories` imports in all files listed in Section 15 with provider/hooks/resource state.
5. Add loading, empty, error, retry, and product-not-found UI; stop defaulting to the first product.
6. Implement variation selection and send `variationId`/attributes when adding to cart.
7. Replace local cart operations with server cart responses; update badges/toasts only after confirmed success.
8. Replace hard-coded coupon logic with apply/remove API responses.
9. Implement guest cart restoration and login merge; migrate or clear obsolete local keys safely.
10. Connect login, registration, logout, lost-password, and session refresh.
11. Connect account addresses/profile/password/orders/downloads and map server field errors.
12. Connect wishlist and merge local guest IDs if backend persistence is selected.
13. Move review reads/submission behind `wishlistReviewService.ts`; support pending moderation.
14. Convert checkout controls to a serializable state/model while preserving entered values and inline validation.
15. Update address changes on the cart, show returned shipping rates, and select a stable rate ID.
16. Render only server-returned tax, shipping, coupon, payment fee, and final totals.
17. Render gateway availability/unavailable reason from API; remove “integration coming soon” only for genuinely connected methods.
18. Submit checkout once with an idempotency key, disable repeat clicks, and follow validated payment redirects/actions.
19. Add an order-received route that verifies/retrieves the order rather than trusting URL parameters.
20. Connect contact/newsletter and load analytics/marketing only after saved consent.

## 21. Integration and testing checklist

### Contract/API tests

- [ ] OpenAPI/schema or Postman collection agreed for every custom endpoint.
- [ ] Success, empty, validation, auth, conflict, rate-limit, and outage responses tested.
- [ ] Monetary precision/rounding matches WooCommerce for discounts, fees, shipping, and tax.
- [ ] Pagination/facets/counts are correct under filters and search.
- [ ] Product deletion/unpublishing and stale IDs are handled.
- [ ] Variation-specific images/prices/stock/limits are enforced.

### Cart/checkout tests

- [ ] Guest cart survives refresh and expected session duration.
- [ ] Guest/login merge does not duplicate lines.
- [ ] Concurrent stock/price changes return a refreshable conflict.
- [ ] Coupon validity, expiry, minimum spend, usage limits, exclusions, and removal work.
- [ ] Shipping address changes recalculate rates/taxes/totals.
- [ ] Unsupported addresses cannot proceed.
- [ ] KOKO 13% and Payzy 8% rules match approved backend configuration and rounding.
- [ ] Double-click/retry cannot create duplicate orders or payments.
- [ ] Cart clears only after confirmed order policy, not on failed/abandoned payment.

### Payment tests

- [ ] MPGS/KOKO/Payzy sandbox success, decline, cancel, timeout, abandoned browser, duplicate callback, delayed callback, and refund tested.
- [ ] Callback signatures/replay protection verified.
- [ ] Browser return without webhook does not falsely mark paid.
- [ ] Webhook without browser return still updates the order correctly.
- [ ] Amount/currency/order reference are checked server-side.
- [ ] No card data or provider secret appears in frontend, logs, analytics, or error messages.

### Account/security tests

- [ ] Login/session rotation/logout/expiry/remember-me tested.
- [ ] CSRF and expired nonce behavior tested.
- [ ] Customer cannot read/change another customer’s addresses/orders/downloads/wishlist.
- [ ] Registration/login/password reset are rate-limited and enumeration-safe.
- [ ] CORS accepts only approved origins and credential behavior works in Safari/mobile.
- [ ] XSS/HTML sanitization, redirect allowlists, SQL/input validation, and file/media validation reviewed.

### Frontend regression tests

- [ ] Home, shop, category, search, product, cart, wishlist, checkout, account, and policies tested on desktop.
- [ ] Mobile tested at 320, 375, and 430 px, including iPhone Safari safe areas.
- [ ] Loading/empty/error/offline states and slow network tested.
- [ ] Add-to-cart badge/toast reflects real confirmed cart response.
- [ ] Checkout bottom navigation/footer remain hidden and actions do not overlap.
- [ ] Consent settings persist and optional scripts remain blocked until consent.
- [ ] `npm run build` passes with production environment configuration.

### Launch checks

- [ ] Staging data/config is separate from production.
- [ ] Backups, monitoring, error alerting, webhook logs, and reconciliation procedure exist.
- [ ] Legal/privacy/cookie/returns/warranty/terms copy is approved.
- [ ] Provider production credentials and callback URLs are verified.
- [ ] Cache/CDN excludes private/cart/account/checkout/payment responses.
- [ ] Rollback plan and responsible contacts are documented.

## 22. Responsibilities

### Backend developer

- Configure and maintain WordPress/WooCommerce and compatible plugins.
- Implement/version the custom `aas/v1` plugin endpoints and admin fields.
- Publish exact request/response/error/auth documentation and a test collection.
- Make WooCommerce authoritative for catalogue, stock, cart, coupons, shipping, tax, fees, orders, and refunds.
- Implement authentication/session/nonces, capability/ownership checks, validation, sanitization, rate limiting, CORS, and logging.
- Implement MPGS/KOKO/Payzy securely, including fee rules, callbacks, webhooks, idempotency, reconciliation, and sandbox/UAT support.
- Supply staging URLs, non-secret frontend config, test accounts/products/coupons, and known constraints.
- Notify frontend developer of schema changes through versioned contracts.

### Frontend developer

- Create API client/adapters behind the existing services and update types.
- Remove direct runtime dependency on local catalogue data from every consumer.
- Build loading/empty/error/conflict/session-expiry states without fake success.
- Serialize checkout fields, integrate shipping/payment availability, and render server totals.
- Preserve responsive UI, accessibility, pending states, anti-double-submit behavior, and existing navigation rules.
- Integrate account, wishlist, review, contact, newsletter, and content endpoints as approved.
- Keep secrets out of Vite config and honor cookie consent before optional tracking.
- Add frontend integration/e2e tests and run the production build.

### Shared responsibility

- Agree the canonical contracts, deployment topology, money rounding, address codes, cart merge, payment fees, order status mapping, failure UX, content ownership, and launch acceptance criteria before implementation.
- Test complete browser → WordPress/WooCommerce → gateway → webhook → order/account flows together.

## 23. Definition of backend-ready handover

The backend is ready for frontend integration when:

1. staging endpoints and an API collection/schema are available;
2. authentication, nonce/cart-session, CORS, and deployment topology are proven in a browser;
3. product/category/cart/coupon/shipping/tax/checkout responses include all fields defined above or an agreed equivalent;
4. test products cover simple, variable, sale, out-of-stock, low-stock, and image edge cases;
5. test coupons and shipping zones cover success and failure rules;
6. COD and payment sandbox flows cannot create duplicate orders and webhooks are verifiable;
7. account ownership/security tests pass; and
8. no frontend secret or client-calculated amount is required for authoritative commerce behavior.

Until those conditions are met, the frontend’s fallback/demo behavior must remain explicitly labeled and must not simulate successful authentication, orders, or payments.
