<p align="center">
  <img src="readme-banner.svg" width="100%" alt="Anything at Supun — modern React e-commerce frontend" />
</p>

<p align="center">
  <b>Product discovery • categories • product details • cart • checkout experience</b>
</p>

<p align="center">
  <a href="https://anythingatsupun.lk/">Existing WordPress Store</a> · <a href="docs/API-INTEGRATION-HANDOVER.md">WordPress / WooCommerce API Handover</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-Build-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/WooCommerce-Integration_Planned-96588A?style=flat-square&logo=woocommerce&logoColor=white" alt="WooCommerce integration planned" />
</p>

## ✦ Project Overview

**Anything at Supun** is a modern frontend redesign for the Supun Group of Companies' Sri Lankan online store. This repository contains the **React + TypeScript UI prototype**, built to preserve the familiar shopping flow with a cleaner red, white and dark interface.

**Project status:** Phase 1 frontend, prepared for future WordPress + WooCommerce integration. The linked live store is the **existing WordPress website**, not a deployment of this React frontend.

## ✦ Frontend Experience

| Area | Implemented frontend experience |
| --- | --- |
| Home | Hero carousel, promotional banner carousel, featured categories, product rails and recently viewed |
| Catalogue | Shop and category pages, subcategory cards, search, price/brand filters, sorting and pagination |
| Products | Image gallery, product information, price and installment estimates, wishlist and related products |
| Cart | Quantity controls, item removal, local cart persistence, coupon UI and cart drawer |
| Checkout | Billing/shipping forms, order summary and payment-method selection **UI only** |
| Accounts | Login, registration, customer dashboard, orders, addresses and review **UI / integration placeholders** |
| Content | About, Contact, privacy, returns, warranty and terms pages |
| Responsive layout | Desktop and mobile layouts are implemented; device testing and performance verification remain required |

> Product images, prices, ratings and catalogue entries currently come from **local fallback/demo data**. Checkout does not create real orders or process payments.

## ✦ API-Ready Architecture

```text
React + TypeScript + Vite frontend
                 |
                 v
   Reusable services & typed models
                 |
         [integration pending]
                 |
                 v
        WordPress + WooCommerce
  products • categories • banners
   customers • cart • checkout
```

- `src/services/` contains service boundaries for products, categories, banners, cart/checkout, accounts and reviews.
- `src/types/commerce.ts` provides shared commerce types.
- `src/data/fallback/catalog.ts` holds local catalogue data until the real APIs are connected.
- `src/config/api.ts` reads **public** API base URLs from environment configuration.
- `src/config/heroFallback.ts` and `src/config/promoBannerFallback.ts` provide banner data for the prototype.
- `docs/API-INTEGRATION-HANDOVER.md` describes required backend data, operations and security expectations.

### Admin updates — planned, not yet connected

The WordPress/WooCommerce team will provide tools to manage products, prices, stock, categories, images, offers, customer orders and published banners. React must then load the updated data from agreed API endpoints. **Uploading a product or banner in WordPress does not yet update this prototype automatically.**

## ✦ Speed, Mobile and Security Goals

The redevelopment brief requires fast mobile shopping, reliable checkout and accurate tracking. The following are **acceptance targets, not measured results**:

| Metric | Target |
| --- | --- |
| Largest Contentful Paint (LCP) | ≤ 2.5 seconds |
| Interaction to Next Paint (INP) | ≤ 200 ms |
| Cumulative Layout Shift (CLS) | ≤ 0.1 |
| Server response (TTFB) | ≤ 0.8 seconds |
| Mobile PageSpeed score | 80+ on key pages |

Production work will also require optimized responsive images, caching/CDN rules, accurate GA4/Meta tracking, tested payment gateways and strong WordPress security. These depend on both frontend and backend integration.

## ✦ Run Locally

```bash
npm ci
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

The project runs with local fallback data when no API URLs are configured. Refer to `.env.example` for **public URLs only**. Never commit `.env` credentials or WooCommerce keys to this repository.

## ✦ Backend Developer Handover

Read **[API-INTEGRATION-HANDOVER.md](docs/API-INTEGRATION-HANDOVER.md)** before making the backend connection.

The frontend and backend developers need to agree on:
- API routes, response fields and error handling
- WooCommerce cart sessions, shipping calculations and checkout flow
- Authentication and account data security
- Banner/category content management in WordPress admin
- Payment gateway compatibility (MPGS, KOKO and Payzy)
- Migration of existing products, customers, orders and URLs
- Mobile testing, tracking validation, and performance testing before launch

**Not yet production-ready:** Real authentication, server-validated discounts, order creation, payment processing and end-to-end integration tests are still pending.

---

<p align="center"><b>Discover → browse → choose → checkout — a cleaner storefront, ready for the next integration phase.</b></p>
