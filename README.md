# Spice Lane — Interactive 3D Kaiten Restaurant Website

Next.js 14 (App Router) + TypeScript + Tailwind + three.js / react-three-fiber.

## Structure
```
src/            app code (app/, components/, data/menu.ts, store/, lib/)
public/models/  optimized GLB food models (committed)
assets/         original source GLB models (16–20 MB each)
scripts/        project scripts (optimize-models.mjs)
Spice Lane Website Progress Save/   AI-agent progress notes, logs, reference (not app code)
Optional you can use/               reference site prompt/code (optional)
```

## Run
```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run optimize-models   # re-create public/models from assets/*.glb
```

## Add a food
1. Put `My-Dish.glb` in `assets/`, run `npm run optimize-models`.
2. Add an entry to `src/data/menu.ts` with `model: '/models/my-dish.glb'`.
