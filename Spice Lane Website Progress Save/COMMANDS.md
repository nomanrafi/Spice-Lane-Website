# COMMANDS (numbered; working dir = repo root unless noted; app dir = "Spice Lane Website Progress Save/")

### 1. Configure git (session #3)
$ git config --global user.name/email/pull.rebase/credential.helper store ; write ~/.git-credentials
Result: SUCCESS — Configured git credentials (token hidden)

### 2. Clone
$ git clone https://github.com/nomanrafi/Spice-Lane-Website.git project
Result: SUCCESS — 7 commits, assets/ has 8 GLBs (16–20 MB each)

### 3. Create scripts/checkpoint.sh + scripts/autopush.sh (copied from AI_AGENT_INSTRUCTIONS.md §8)
Result: SUCCESS — paths adapted: autopush cd's into the progress folder; checkpoint's "recent files" find prunes */node_modules, */.next, */scripts/logs

### 4. (session #4) npm install  (app dir)
Result: SUCCESS — 585 packages, log scripts/logs/npm-install.log

### 5. npm run build  (app dir)
Result: SUCCESS — placeholder page, log scripts/logs/build-1.log

### 6. npm run optimize-models  (app dir; FORCE=1 to overwrite)
Result: SUCCESS — 8 GLBs 16–20 MB → 0.63–0.89 MB each in public/models/ (log scripts/logs/optimize.log)

### 7. (session #5) Configured git credentials (token hidden); git clone
### 8. git mv app files (src, public, package*.json, configs, .eslintrc, .gitignore, scripts/optimize-models.mjs) → repo root
Result: SUCCESS — optimize script SRC now path.resolve('assets')

### 9. (session #5) npm install + npm run build at repo root
Result: SUCCESS (logs scripts/logs/npm-install-s5.log, build-s5.log)

### 10. (session #5) wrote src/lib/belt.ts (4.1)

### 11. (session #5) wrote src/components/hero/FoodModel.tsx + Plate.tsx (4.2 part 1)

### 12. (session #5) wrote src/components/hero/KaitenTable.tsx + HeroCanvas.tsx (4.2 done)
- S8: npm install (OK, 585 pkgs); npm run build (PASS, / = 162 kB first load)
- S9: Configured git credentials (token hidden); git clone; npm install
- S9: npm install OK; npm run build PASS (/ 172 kB, /checkout, /order/[id])
- S12: npm install OK; npm run build PASS after 8.3+8.4 (logs/build-s12.log)
- S13: npm install OK; npm run build PASS for 8.5 (logs/build-s13.log)
- S13: npm run build PASS for 8.6+8.7 (logs/build-s13b.log)
- S14: Configured git credentials (token hidden); git clone; npm install (bg)
- S14: npm run build PASS for 8.8–8.10, Step 8 complete (logs/build-s14.log)
- S14: npm run build PASS for 9.1+9.2 (logs/build-s14b.log)
- S14: npm run build PASS for 9.3 (logs/build-s14c.log)
- S15: Configured git credentials (token hidden); git clone; npm install (bg); autopush started
- S15: npm run generate-posters → 8 PNGs in public/posters (OK)
- S16: Configured git credentials (token hidden); git clone; npm install (bg); autopush started
- S16: npm install OK; npm run build PASS for 9.4b posters (logs/build-s16.log)
- S16: npx next start -p 3000 (bg); node scripts/shot.mjs → hero-s16.png, menu-s16.png (1 console 404)
- S16: added src/app/icon.svg; npm run build PASS (logs/build-s16b.log)
- S17: Configured git credentials (token hidden); git clone; npm install (bg); autopush started
- S18: Configured git credentials (token hidden); git clone; npm install (bg); autopush started
- S18: npm install OK (585 pkgs); npm run build → logs/build-s18.log
