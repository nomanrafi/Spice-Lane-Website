# Spice Lane — Interactive 3D Kaiten Restaurant Website

A restaurant ordering site whose hero is a rotating 3D conveyor-belt ("kaiten") table. Every dish is a real GLB model —
on the belt, in the product popup, in the spotlight section — with PNG poster fallbacks when WebGL is unavailable.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · three.js / @react-three/fiber / drei · GSAP + ScrollTrigger ·
Lenis · Framer Motion · Zustand (cart persisted to localStorage) · @use-gesture/react.

## Features
- **Hero belt** — auto-rotates, stops on hover, flick to spin (inertia), prev / pause / next buttons, arrow keys.
  Ambient glow follows the front dish's accent colour. Plate ring colour = price tier.
- **Product modal** — 360° orbit viewer, counter, tags, quantity, *Add to order → ✓ Added*.
- **Drag a plate onto the cart** to add it (ghost, magnet, burst); the plate stays on the belt.
- **Cart drawer → `/checkout` → `/order/[id]`** confirmation.
- **Sections:** Spotlight (pinned, reacts to selected dish), Menu grid (filters/search), How it works, Specials,
  Platter builder, Reviews, Reservations (`/api/reserve`), Locations, FAQ, Newsletter + Footer.
- SEO (metadata, JSON-LD, robots, sitemap), reduced-motion support, error boundary + poster fallback for 3D.

## Structure
```
src/app/                 routes: page.tsx, checkout/, order/[id]/, api/reserve/, robots.ts, sitemap.ts, icon.svg
src/components/hero/     Hero, HeroCanvas, KaitenTable, Plate, FoodModel, AmbientGlow, DragGhost
src/components/modal/    ProductModal
src/components/cart/     CartDrawer, CheckoutForm, OrderConfirmation
src/components/sections/ all scroll sections
src/components/three/    ModelViewer, CanvasBoundary (WebGL fallback)
src/data/menu.ts         single source of truth for every dish
src/store/useStore.ts    Zustand store (selection, belt state, cart)
src/lib/                 belt math, drop-zone, reservation validation, site config
public/models/           optimized GLB models (committed)
public/posters/          PNG poster per dish (committed)
assets/                  original source GLB models (16–20 MB each)
scripts/                 optimize-models.mjs, generate-posters.mjs
Spice Lane Website Progress Save/   AI-agent progress notes, logs, screenshots (not app code)
Optional you can use/               reference site prompt/code (optional)
```

## Run
```bash
npm install
npm run dev               # http://localhost:3000
npm run build && npm start
npm run optimize-models   # re-create public/models from assets/*.glb (meshopt + webp textures)
npm run generate-posters  # re-render public/posters/*.png from the models
```

## Add a food
1. Put `My-Dish.glb` in `assets/` and run `npm run optimize-models`.
2. Add an entry to `src/data/menu.ts` (`model: '/models/my-dish.glb'`, `poster: '/posters/my-dish.png'`,
   price `tier`, `accentColor`, nutrition, allergens…).
3. Run `npm run generate-posters` to create its poster. A missing model shows a placeholder plate (dev warning), never a crash.

## Deploy
Deploy-ready (checked: `npm run lint`, `npx tsc --noEmit`, `npm run build` all pass; production smoke test OK).

**Vercel (recommended)**
1. Import the GitHub repo in Vercel → framework "Next.js" is auto-detected (root directory = repo root).
2. Add env var `NEXT_PUBLIC_SITE_URL` = your live URL (e.g. `https://spicelane.com`). See `.env.example`.
3. Deploy. No database or secrets are needed.

**Any Node host**: Node ≥ 18.17 → `npm ci && npm run build && npm start` (port 3000, or set `PORT`).

Notes
- `public/models/` (optimized GLBs, ~5.6 MB) and `public/posters/` are committed, so no model step runs at deploy time.
- `assets/*.glb` are the large source models; they are only used by `npm run optimize-models` and are not served.
- `/api/order` uses a **mock payment** and does not store orders; `/api/reserve` validates and confirms only.
  For real orders, plug in a payment provider (e.g. Stripe) + a database in `src/app/api/order/route.ts`.
- `Spice Lane Website Progress Save/` holds AI-agent progress notes only; it is not part of the website.
