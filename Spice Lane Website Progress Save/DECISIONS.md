# DECISIONS

### 1. Where everything lives
Decision: ALL agent work (Next.js app, logs, scripts, outputs) lives inside `Spice Lane Website Progress Save/`.
Why: user's explicit instruction in chat ("Save agents all progress in just 'Spice Lane Website Progress Save' folder").
The original GLBs stay in repo-root `assets/` (read-only input); optimized copies go to `Spice Lane Website Progress Save/public/models/`.

### 2. Menu = our 8 GLBs, not sushi
Decision: Seed menu.ts with the 8 Spice Lane dishes in `/assets` (wagyu, fondant, ribeye, lamb, lobster, salmon roll, tuna tataki, spaghetti), mapped to the 5 price tiers / ring colors of the reference.
Why: build prompt says "adjust to my GLB files"; never invent filenames.

### 3. Push cadence
Decision: push after every small micro-task.
Why: user said in chat (Bengali) "Aktu fast push korba choto choto task korei" = push quickly after each small task.

### 4. Prices for Spice Lane dishes
Decision: keep the 5 reference ring colours but use restaurant-realistic prices: blue $14 · green $18 · orange $24 · purple $32 · red $48 (2 dishes per tier for the first 6, then lobster=purple, wagyu=red). Defined in `src/data/menu.ts` → TIERS.
Why: dishes are steak/lobster, not $3 sushi; ring-colour = price-tier concept is preserved.

### 5. Model optimization
Decision: `scripts/optimize-models.mjs` uses gltf-transform `optimize` (meshopt, simplify ratio 0.04, webp 1024). Source GLBs are single-mesh Tripo exports (~1M verts, 3 × 4K textures).
Why: 16–20 MB per file is too heavy for a web belt of 8 plates. Output → `public/models/<lowercase>.glb`.

### 6. (session #5) Website code at repo root, progress folder = notes only
Decision: app (Next.js) lives at repo root; `Spice Lane Website Progress Save/` keeps only agent notes/logs/scripts/reference/archive/screenshots.
Why: user chat (session #5) said earlier agents wrongly saved the website inside the progress folder; overrides session #3 rule "everything in this folder".
