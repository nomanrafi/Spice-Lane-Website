# PROGRESS — Spice Lane Website

## ⚡ QUICK STATE  (read this first; update at EVERY checkpoint)
- Overall: IN PROGRESS
- Current: Step 8 → sections below hero
- Last action: S13 started; verifying 8.5 build
- NEXT ACTION: Verify 8.5 build (logs/build-s13.log); then 8.6 Reviews (src/components/sections/Reviews.tsx).
- Project runs?: YES — npm run build passes from repo root (session 5)
- Last updated: 2026-11-15 22:40 (Asia/Dhaka) by Session #13

## Task
The full build prompt is in `AI_AGENT_INSTRUCTIONS.md` → section 0 → TASK ("Kaiten" interactive 3D conveyor-belt food
website). Reference details (motion values, colors, layout): `reference/REFERENCE_VIDEO_DETAILS.md` +
`reference/VIDEO_OBSERVATIONS.md` (video colours win). User chat rules: everything in THIS folder; push after every
small task; `Optional you can use/` (repo root) holds the reference site's code (optional help).

## Definition of Done
- [ ] `npm run build` passes, no console errors
- [ ] Acceptance checklist (prompt §14) satisfied
- [ ] README explains run/build + how to add a food

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
- [ ] Step 3 (3.1 store ✓, 3.2 Header ✓ per commit 5019cc9; 3.3 shell pending): Store + layout shell (zustand store w/ persisted cart, Header w/ cart pill + Added chip, grain bg)
- [ ] Step 4 (4.1 belt.ts ✓ · 4.2 table/plate/model ✓ (untested) · 4.3 Hero section+controls · 4.4 hover/flick/keyboard): Hero 3D belt (KaitenTable, Plate, FoodModel, AmbientGlow, controls, hover/flick/seek, front item, chip)
- [x] Step 5: Product modal (3D orbit viewer, counter, qty, add → ✓ Added) — wired in src/app/page.tsx, build passes (session #8)
- [x] Step 6: Drag plate → cart (ghost, magnet, burst) — 6.1 ghost/store, 6.2 wired in HeroCanvas, build OK (s9)
- [x] Step 7: Cart drawer + checkout + confirmation pages
- [ ] Step 8 (8.1 Spotlight ✓ · 8.2 Menu grid ✓ · 8.3 How it works ✓ · 8.4 Specials ✓ · 8.5 Platter · 8.6 Reviews · 8.7 Reservations · 8.8 Locations · 8.9 FAQ · 8.10 Newsletter+Footer): Sections: Spotlight (pinned), Menu grid, How it works, Specials, Platter builder, Reviews, Reservations(+/api/reserve), Locations, FAQ, Newsletter+Footer
- [ ] Step 9: Perf/a11y/SEO (posters, reduced motion, JSON-LD, sitemap, robots)
- [ ] Step 10: Final build, screenshots in output/preview, README

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
