# PROGRESS — Spice Lane Website

## ⚡ QUICK STATE  (read this first; update at EVERY checkpoint)
- Overall: IN PROGRESS — Step 13: fixes from repo-root `Update Review.pdf` (user review, Bengali comments)
- Current: Step 13 → 13.12 build + screenshots verify (S29)
- Last action: 13.9 SpotlightCanvas: removed extra plate mesh, ring fits GLB rim (D=1.5), centred framing; Spotlight.tsx shows only frontId (removed hover/pick switcher, pairings open modal). tsconfig exclude progress+optional folders (archive broke tsc)
- NEXT ACTION: 13.12 npm run build + screenshots (hero, spotlight)
- Project runs?: YES — build PASS S23
- Last updated: 2026-11-16 13:40 (Asia/Dhaka) by Session #29

## Task
The full build prompt is in `AI_AGENT_INSTRUCTIONS.md` → section 0 → TASK ("Kaiten" interactive 3D conveyor-belt food
website). Reference details (motion values, colors, layout): `reference/REFERENCE_VIDEO_DETAILS.md` +
`reference/VIDEO_OBSERVATIONS.md` (video colours win). User chat rules: everything in THIS folder; push after every
small task; `Optional you can use/` (repo root) holds the reference site's code (optional help).

## Definition of Done
- [x] `npm run build` passes, no console errors (S16: favicon 404 fixed)
- [x] Acceptance checklist (prompt §14) satisfied (S17 grep audit; last gap = island hover chip, added 10.3a, build PASS S18)
- [x] README explains run/build + how to add a food (S17)

## Repo layout (since session #5)
- APP ROOT = repo root: `src/`, `public/models/`, `package.json`, `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `scripts/optimize-models.mjs`, `assets/*.glb` (source models).
- PROGRESS FOLDER = `Spice Lane Website Progress Save/`: PROGRESS.md, COMMANDS.md, DECISIONS.md, AI_AGENT_INSTRUCTIONS.md, `reference/`, `scripts/checkpoint.sh`, `scripts/autopush.sh`, `scripts/logs/`, `archive/`, `output/preview/` (screenshots).
- `Optional you can use/` = reference site code (optional).

## Plan  (paths below are relative to the REPO ROOT)
- [x] Step 0: setup (scripts, logs, plan)
- [x] Step 1: Scaffold
  - [x] 1.1 package.json, tsconfig, next/tailwind/postcss config, src/app layout+page
  - [x] 1.2 npm install + first build OK
- [x] Step 2: Models
  - [x] 2.1 inspect GLBs (size, meshes, textures)
  - [x] 2.2 scripts/optimize-models.mjs (`npm run optimize-models`: ../assets/*.glb → public/models/, meshopt + webp/resize)
  - [x] 2.3 src/data/menu.ts (8 items, tiers, accent colors, nutrition…)
- [x] Step 3: Store + layout shell — audited S16: useStore.ts, Header.tsx, .grain in globals.css + layout.tsx all present
- [x] Step 4: Hero 3D belt — audited S16: Hero.tsx (arrow keys, front item), HeroCanvas.tsx (useDrag flick+inertia), KaitenTable.tsx (hover stop), Plate/FoodModel/AmbientGlow present
- [x] Step 5: Product modal (3D orbit viewer, counter, qty, add → ✓ Added) — wired in src/app/page.tsx, build passes (session #8)
- [x] Step 6: Drag plate → cart (ghost, magnet, burst) — 6.1 ghost/store, 6.2 wired in HeroCanvas, build OK (s9)
- [x] Step 7: Cart drawer + checkout + confirmation pages
- [x] Step 8 (all 8.1–8.10 ✓, build PASS s14): Sections: Spotlight (pinned), Menu grid, How it works, Specials, Platter builder, Reviews, Reservations(+/api/reserve), Locations, FAQ, Newsletter+Footer
- [x] Step 9: Perf/a11y/SEO — 9.1 robots+sitemap · 9.2 JSON-LD+metadata · 9.3 reduced-motion · 9.4 posters (public/posters, MenuGrid cards + ModelViewer fallback) — build PASS S16 (logs/build-s16.log)
- [x] Step 10: Final build, screenshots in output/preview, README — 10.1 screenshots ✓ · 10.2 README ✓ · 10.3 acceptance audit ✓ · 10.3a IslandChip (KaitenTable.tsx) build PASS S18 (logs/build-s18.log)

- [ ] Step 13 (S24): Update Review.pdf fixes (repo root PDF, 4 pages, comment under each screenshot)
  - [x] 13.1 Table top = zebra stripes (like reference kaiten table) that rotate with the food plates
  - [x] 13.2 Table shape/size = wide flat ellipse like user's blue marking (bigger, wider); front items look bigger, back smaller (perspective)
  - [x] 13.3 Remove extra plate mesh under each food (GLB already has round plate); tier colour ring must fit the GLB plate's circle
  - [x] 13.4 Hover on an item shows WRONG item's name → fix hover label mapping
  - [x] 13.5 Dragging on the BACK side of table rotates the wrong way → invert drag direction when pointer is on far half
  - [x] 13.6 Table food items a bit bigger
  - [x] 13.7 Product popup bigger; while popup open, wheel zooms model, page behind must NOT scroll (scroll lock)
  - [x] 13.8 Cart drawer: list must scroll inside; page behind must NOT scroll while open
  - [x] 13.9 Spotlight/next section: products look cropped/falling below → fix framing; show ONLY the front-selected product there
  - [x] 13.10 Blank-looking sections (PDF p3 second image) → add meaningful content/visuals
  - [x] 13.11 Footer (blue mark, PDF p4): add "MADE BY NOMAN-RAFI"
  - [ ] 13.12 build + screenshots + push
- [x] Step 12 (S21–S23): deploy-readiness audit — 12.1 install+build ✓ · 12.2 lint+typecheck ✓ · 12.3 runtime smoke test ✓ (found: canvas edge clip, pause glyph) · 12.4 fix issues ✓ (S22, verified S23) · 12.5 deploy notes in README ✓ (S23)
- [x] Step 11 (S19–S20, optional follow-ups): 11.1 bundle cart line ✓ build PASS · 11.2 /api/order mock payment ✓ build PASS S20

## How to use the result
- From repo root: `npm install` → `npm run dev` (http://localhost:3000) or `npm run build && npm start`.
- Add a dish: drop GLB in `assets/`, run `npm run optimize-models`, add an entry to `src/data/menu.ts` (see README).
- Checkout posts to POST /api/order (server re-prices from src/data/menu.ts, mock payment). Bundles (Specials/PlatterBuilder) add a single bundle line to the cart.
- Open idea (not required): real payment provider + DB persistence — TODO(agent) in src/app/api/order/route.ts.

## Session History
- S29 (2026-11-16): resumed at 13.12 (S28 stopped by usage policy during production build after pushing 13.9)
- S28 (2026-11-16): resumed at 13.5 (S27 stopped by usage policy while fixing back-side drag; 13.1–13.4/13.6 were pushed)
- S27 (2026-11-16): resumed at 13.11 build-verify + 13.1–13.6 hero (S26 stopped by usage policy while rewriting Plate/belt; that work was NOT pushed)
- S26 (2026-11-16): resumed at 13.7 verify (S25 stopped by usage policy while reading useStore/Footer code)
- S25 (2026-11-16): resumed at 13.7 verify; prior session S24 was stopped by usage limit before pushing footer credit

## Problems / Notes
- GLBs in ../assets are 16–20 MB each → optimized (Step 2 done). public/models/ IS committed (~5.7 MB total) so no re-run needed.

## Environment setup (run on a fresh computer)
cd <repo root> && npm install          # app lives at repo root
npm run optimize-models   # only if assets/*.glb changed (public/models is committed)
npm run dev / npm run build
Checkpoint: "./Spice Lane Website Progress Save/scripts/checkpoint.sh" "msg"
Restart auto-push: nohup "./Spice Lane Website Progress Save/scripts/autopush.sh" >/dev/null 2>&1 &

## External actions (not in code)
- User chat (session #5): website code must live OUTSIDE this folder in a professional structure; this folder = agent progress backup only. Push fast after small tasks.
- User chat (session #3): save everything only in this folder; push fast after small tasks; repo token given in chat (never stored in repo).

## Session History
- Session #24 (2026-11-16): new request — apply fixes from `Update Review.pdf` (repo root). User: push fast, small tasks; website code outside progress folder.
- Session #1 (2026-11-15): Created PROGRESS.md + reference details doc.
- Session #2 (2026-11-15): Video analysed; VIDEO_OBSERVATIONS.md + key frames.
- Session #3 (2026-11-15): resumed at "scaffold app"; added scripts, logs, plan.
- Session #4 (2026-11-15): resumed at 1.2 (npm install + first build).
- Session #5 (2026-11-15): resumed at 3.3/4.1; moved app code to repo root (user request).
- Session #6 (2026-11-15): resumed at 4.3 verify (screenshot). User repeated: progress only in progress folder, website outside it, push fast.
- Session #7 (2026-11-15): resumed at 5.1 verify (session #6 stopped by usage policy after viewing hero-s6.png).
- Session #8 (2026-11-15): resumed at 5.1 verify (session #7 stopped by usage policy while retrying screenshots). User: push fast, small tasks; website outside progress folder.
- Session #9 (2026-11-15): resumed at 7.3 (session #8 stopped by usage policy; 7.3 confirmation page was not pushed).
- Session #10 (2026-11-15): resumed at Step 8 (session #9 stopped by usage policy after Step 6 build passed but before logging it).
- Session #11 (2026-11-15): resumed at 8.3 (session #10 stopped by usage policy after 8.2 build passed, before logging).
- Session #12 (2026-11-15): resumed at 8.3 build-verify / 8.4 Specials (session #11 stopped by usage policy while building 8.3 and writing Specials.tsx).
- Session #13 (2026-11-15): resumed at 8.5 build-verify (session #12 stopped by usage policy after writing PlatterBuilder, before verifying build).
- Session #14 (2026-11-15): resumed at 8.8–8.10 build-verify (session #13 stopped by usage policy while marking Step 8 done).
- Session #15 (2026-11-15): started, resuming from 9.4 posters
- Session #19 (2026-11-15): resumed after DONE to do TODO(agent) follow-ups (bundle cart line, order API). User: push fast, small tasks.
- Session #16 (2026-11-15): resumed at 9.4b build-verify (session #15 stopped by usage policy while marking Step 9 done + auditing Steps 3/4 hero). User: push fast, small tasks.
- Session #17 (2026-11-15): resumed at 10.1 screenshot check (session #16 stopped by usage policy while viewing h.jpg/m.jpg screenshots, favicon fix was pushed). User: push fast, small tasks.
- Session #18 (2026-11-15): resumed at 10.3a build-verify (session #17 stopped by usage policy while marking done + final push). User: push fast, small tasks.
- Session #21 (2026-11-15): resumed after DONE; user asked: anything left to build? check everything, deploy-ready? Push fast, small tasks.
- Session #20 (2026-11-15): resumed at 11.2 build-verify (S19 stopped by usage policy during final log/push; its API runtime test had passed per user screenshot).
- Session #22 (2026-11-15): resumed at 12.4 build-verify (S21 stopped after pushing fix, before build).
- Session #23 (2026-11-15): resumed at 12.4 verify (S22 stopped by usage policy after viewing hero-s22c.png; build-s22b passed). User: check all, deploy-ready? push fast.
