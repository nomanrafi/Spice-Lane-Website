# PROGRESS — Spice Lane Website

## ⚡ QUICK STATE  (read this first; update at EVERY checkpoint)
- Overall: IN PROGRESS
- Current: Step 1 → 1.2 npm install + first build
- Last action: 1.1 scaffold files written (package.json, tsconfig, tailwind, src/app)
- NEXT ACTION: 1.2 run `npm install` in this folder, then `npm run build`; fix errors
- Project runs?: NO app code yet
- Last updated: 2026-11-15 21:40 (Asia/Dhaka) by Session #4 (resumed)

## Task
The full build prompt is in `AI_AGENT_INSTRUCTIONS.md` → section 0 → TASK ("Kaiten" interactive 3D conveyor-belt food
website). Reference details (motion values, colors, layout): `reference/REFERENCE_VIDEO_DETAILS.md` +
`reference/VIDEO_OBSERVATIONS.md` (video colours win). User chat rules: everything in THIS folder; push after every
small task; `Optional you can use/` (repo root) holds the reference site's code (optional help).

## Definition of Done
- [ ] `npm run build` passes, no console errors
- [ ] Acceptance checklist (prompt §14) satisfied
- [ ] README explains run/build + how to add a food

## Plan  (app root = this folder; paths below are relative to it)
- [x] Step 0: setup (scripts, logs, plan)
- [ ] Step 1: Scaffold
  - [x] 1.1 package.json, tsconfig, next/tailwind/postcss config, src/app layout+page
  - [ ] 1.2 npm install + first build OK
- [ ] Step 2: Models
  - [ ] 2.1 inspect GLBs (size, meshes, textures)
  - [ ] 2.2 scripts/optimize-models.mjs (`npm run optimize-models`: ../assets/*.glb → public/models/, meshopt + webp/resize)
  - [ ] 2.3 src/data/menu.ts (8 items, tiers, accent colors, nutrition…)
- [ ] Step 3: Store + layout shell (zustand store w/ persisted cart, Header w/ cart pill + Added chip, grain bg)
- [ ] Step 4: Hero 3D belt (KaitenTable, Plate, FoodModel, AmbientGlow, controls, hover/flick/seek, front item, chip)
- [ ] Step 5: Product modal (3D orbit viewer, counter, qty, add → ✓ Added)
- [ ] Step 6: Drag plate → cart (ghost, magnet, burst)
- [ ] Step 7: Cart drawer + checkout + confirmation pages
- [ ] Step 8: Sections: Spotlight (pinned), Menu grid, How it works, Specials, Platter builder, Reviews, Reservations(+/api/reserve), Locations, FAQ, Newsletter+Footer
- [ ] Step 9: Perf/a11y/SEO (posters, reduced motion, JSON-LD, sitemap, robots)
- [ ] Step 10: Final build, screenshots in output/preview, README

## Problems / Notes
- GLBs in ../assets are 16–20 MB each → must be optimized before web use (Step 2).

## Environment setup (run on a fresh computer)
cd "Spice Lane Website Progress Save" && npm install
npm run optimize-models   # (once Step 2 exists) writes public/models/*.glb
npm run dev / npm run build
Restart auto-push: nohup ./scripts/autopush.sh >/dev/null 2>&1 &

## External actions (not in code)
- User chat (session #3): save everything only in this folder; push fast after small tasks; repo token given in chat (never stored in repo).

## Session History
- Session #1 (2026-11-15): Created PROGRESS.md + reference details doc.
- Session #2 (2026-11-15): Video analysed; VIDEO_OBSERVATIONS.md + key frames.
- Session #3 (2026-11-15): resumed at "scaffold app"; added scripts, logs, plan.
- Session #4 (2026-11-15): resumed at 1.2 (npm install + first build).
