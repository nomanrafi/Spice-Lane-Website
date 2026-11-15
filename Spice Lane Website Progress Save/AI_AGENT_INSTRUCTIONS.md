==========================================================================================
  AI AGENT INSTRUCTIONS — ULTRA VERSION
  Checkpoint, GitHub Backup & Handoff Protocol (for software projects)
==========================================================================================

READ THIS WHOLE FILE BEFORE DOING ANYTHING.

You (the AI agent) can be stopped at ANY moment because of a usage, message, or time limit.
You will NOT get a warning. A different agent, on a different computer, in a different
workspace, with ZERO memory of this chat, will continue your work.

That means:
  1. Your only memory is the GitHub repo.
  2. Work that is not pushed counts as lost.
  3. You push after every MEANINGFUL micro-task, not only after big steps.
  4. Pushing costs tool calls and credits too. Push often enough to be safe, but not so
     often that pushing becomes the work. The notes in PROGRESS.md matter more than
     the number of pushes.

Mindset: "If I'm stopped right now, can a stranger open PROGRESS.md and continue within
a few minutes?" If the answer is no, update the notes and push now.


==========================================================================================
  0. FILL-IN SECTION  (the USER edits ONLY this section)
==========================================================================================
Save agents all progress in just "Spice Lane Website Progress Save" folder of the repository. 
Note: The folder "Optional you can use" in the repo contains the original reference site's prompt/code; you may consult it for help if needed, or ignore it entirely, this is optional.
REPO_URL     : https://github.com/nomanrafi/Spice-Lane-Website
GITHUB_TOKEN : <TOKEN>
BRANCH       : main
MODE         : RESUME          (NEW TASK  or  RESUME)

TASK (only for NEW TASK; be as detailed as possible):
<<<
# BUILD PROMPT — "Kaiten" Interactive 3D Conveyor-Belt Food Website (Production Grade)

## 0. Your role & goal
You are a senior creative front-end engineer (WebGL + motion design). Build a production-ready, responsive, accessible restaurant ordering website whose hero is an interactive 3D rotating food table, like a Japanese kaiten (conveyor-belt) sushi table. Everything shown on food plates must be a real 3D model (.glb) — never flat images — both on the table and inside the product popup. Below the hero, build a full professional website with rich, scroll-driven, reactive animations tied to the currently selected food.

Before coding, inspect the repo's assets/ folder (especially assets/models/). It holds the 3D GLB food models I made. Use them. Don't invent filenames; read the folder and map every model to a menu item in a data file.

---

## 1. Tech stack (use exactly this unless something is impossible)
- Next.js 14+ (App Router) + TypeScript, with Tailwind CSS for styling
- three.js + @react-three/fiber + @react-three/drei for all 3D (useGLTF, Environment, ContactShadows, Html, Bounds, PresentationControls/OrbitControls)
- GSAP + ScrollTrigger for scroll animations, and Lenis for smooth scrolling
- Framer Motion for UI and DOM transitions (modal, cart drawer, toasts, shared-layout animations)
- Zustand for global state (selected item, front item, cart, belt state), with cart persisted to localStorage
- @use-gesture/react for drag, flick and inertia
- Model optimization: gltf-transform / gltfjsx with Draco or Meshopt compression and KTX2 textures. Add a script npm run optimize-models that reads assets/models/*.glb and writes optimized copies to public/models/.

---

## 2. Data layer
Create src/data/menu.ts (or menu.json). It is the single source of truth:

type MenuItem = {
  id: string; slug: string; name: string; price: number;
  tier: 'blue'|'green'|'orange'|'purple'|'red'; // plate ring color = price tier
  accentColor: string;      // dominant food color, drives the ambient glow (e.g. salmon #FF8A4C)
  model: string;            // '/models/ebi-nigiri.glb'
  poster: string;           // auto-generated PNG fallback/thumbnail of the model
  description: string; longDescription: string;
  tags: string[];           // '2 pieces', 'Shellfish'
  allergens: string[]; ingredients: {name: string; color: string}[];
  nutrition: {kcal: number; protein: number; carbs: number; fat: number};
  spicy?: 0|1|2|3; vegetarian?: boolean; chefNote?: string; pairing?: string[];
};
Seed it with these 8 items from the reference (adjust to my GLB files):
| # | Item | Price | Ring tier |
|---|---|---|---|
| 1 | Tamago nigiri | $3.20 | blue |
| 2 | Salted edamame | $3.20 | blue |
| 3 | Ebi nigiri ("Butterflied poached shrimp over rice, tail left on." · 2 pieces · Shellfish) | $4.20 | green |
| 4 | Salmon nigiri ("Two slices of fresh salmon over seasoned rice, with pickled ginger.") | $4.20 | green |
| 5 | California roll ("Crab, avocado and cucumber, rolled inside out in orange tobiko.") | $5.40 | orange |
| 6 | Mochi duo (matcha + strawberry) | $5.40 | orange |
| 7 | Tuna nigiri | $6.80 | purple |
| 8 | Dragon / avocado roll | $8.50 | red |

Price legend tiers: blue $3.20 · green $4.20 · orange $5.40 · purple $6.80 · red $8.50.

If a GLB is missing for an item, show a neutral placeholder plate mesh and log a dev warning. Never crash.

---

## 3. Global look & feel
- Near-black background (#0a0a0a / #0d0d0d), with subtle noise/grain overlay at 3–4% opacity
- Font: a clean humanist sans (e.g. "Inter Tight", "Geist" or "Segoe UI"-like). Large, tight-leading headlines in white. Muted gray body (#8a8a8a). Monospace for counters (03 / 08).
- UI elements: pill buttons. Primary is white with black text; secondary is dark glass with a thin #ffffff14 border.
- Rounded cards (radius 24–28px), dark #161616 with a 1px light border
- Motion should feel premium: spring/ease-out-expo, 300–700ms, nothing janky

---
## 4. Header (fixed)
- Left: logo/wordmark. Center (desktop): nav links (Menu, How it works, Specials, Reservations, Locations), with an active-section underline that animates.
- Right: cart pill (bag icon + count), the same as in the reference.
  - When an item is added, a white "Added" chip slides out to the left of the cart for about 1.2s. The count number flips/rolls up, and the cart pill does a small bounce.
  - The cart is also a drop zone (see section 7).
- On scroll, the header becomes a blurred glass bar.

---

## 5. HERO — the rotating 3D food table (replicate the reference exactly, then upgrade)

### Layout
- Left column (about 35%):
  - Eyebrow: KAITEN · LUNCH BELT (uppercase, letter-spacing 0.3em, gray)
  - H1: "A sushi belt that keeps turning, right on the page."
  - Price legend: small ring icons plus prices in their tier colors
  - Dynamic info line:
    - Default: "Hover to stop the belt, flick to spin it, pick a plate to order. Drag a plate to the cart to add it."
    - When a plate is hovered or at the front: Item name · $price in bold white, plus a one-line description. Crossfade with a slight y-slide when it changes.
  - "See full menu" white pill button, which smooth-scrolls to the menu section
- Right column (about 65%): the 3D table in a single R3F <Canvas>

### The table (3D)
- A stadium/oval-shaped table (two semicircles joined by straight sides), viewed at roughly a 35–40° tilted perspective like the reference
- Dark charcoal material with a subtle glossy rim and radial groove lines around the belt track
- A raised inner island in the center (rounded rectangle, slightly lighter, soft bevel)
- Build the table procedurally (ExtrudeGeometry from a stadium Shape), or use assets/models/table.glb if it exists
- 8 plates move along the stadium path, a closed CatmullRomCurve3 or analytic stadium path, keeping even spacing. Each plate:
  - A 3D plate (white, red lacquer, black, light blue or wooden bowl depending on item) with a thin glowing ring in its price-tier color around it
  - The item's GLB food model sitting on the plate, normalized: auto-scale with a bounding box so every model fits the plate, centered on it, and casting soft shadows
  - Plates nearer the camera look bigger because of real perspective
- Lighting: HDRI Environment (studio, low intensity) + key light + rim light + ContactShadows under the plates

### Belt behaviors (all from the reference video, all required)
1. Auto-rotate continuously at a calm speed (about 1 loop every 40s)
2. Hover a plate → the belt eases to a stop (decelerate, don't snap). The hovered plate lifts slightly (y+, scale 1.08) and its ring glows brighter. A floating label chip appears on the inner island: ● Item name  $price, with the dot in tier color, on dark glass. The left info line updates.
3. Mouse leave → the belt eases back to auto speed
4. Flick/drag on the table surface → spin the belt in that direction with inertia and friction (velocity decays), then return to auto speed
5. Controls under the table: three round dark buttons ‹ ⏸/▶ ›. Prev/next moves the belt exactly one plate slot with an eased animation. Pause/play toggles auto-rotation and the icon morphs.
6. Click a plate → opens the Product Modal (section 6)
7. Keyboard: Tab focuses plates (invisible DOM buttons synced to plate positions), arrow keys rotate, Enter opens, Space pauses

### Front item detection
At every frame, compute which plate is closest to the camera at the front-center of the table. That is the frontItem in the store. The user can also bring an item to the front with drag, prev/next, or by dragging the belt with the mouse.

### Ambient color glow under the table (NEW — important)
- Behind and under the table, render a **large blurred glowing shape in the color of the current frontItem's accentColor**. Example: salmon gives warm orange, edamame gives green, tuna gives deep red, mochi gives pink/matcha.
- Shape: the same stadium/oval shape as the table, expanded, covering about 75% of the viewport width in the middle of the page
- Very soft: filter: blur(120–160px) or a radial-gradient stadium mask, opacity 0.35–0.55. Center is the strongest, fading to transparent.
- Outside the glow everything stays dark (vignette to #0a0a0a toward the edges)
- When the frontItem changes, the glow color smoothly lerps (≈600ms, use GSAP color tweening or lerp in a shader uniform). No hard switches.
- Subtle "breathing" pulse (scale 1 → 1.03, about 6s loop)
- Can be a CSS layer behind the canvas, or a shader plane inside the scene. Pick whichever performs better.

---

## 6. Product Modal (popup) — with a 3D model instead of an image
Replicate the reference's popup layout, but use 3D:
- Open animation: shared-element feel. The plate visually flies/scales from its table position into the modal while the page behind blurs (backdrop-filter: blur(12px)) and dims.
- Card: dark #161616, radius 28px, thin border, about 720px wide on desktop and a bottom sheet on mobile
- Left: a separate small R3F canvas showing the item's GLB model on its plate, with a glowing ring in the tier color
  - The customer can rotate it freely: drag to orbit 360°, pinch/scroll to zoom (clamped), double-click to reset. Slow auto-rotate while idle.
  - Small hint chip: "Drag to rotate"
- Right:
  - ● 03 / 08 counter (dot in tier color, monospace)
  - Title (e.g. "Ebi nigiri"), description, and tag chips (2 pieces, Shellfish)
  - Price $4.20 plus a quantity stepper – 1 +
  - "+ Add to order" white pill. On click it morphs to "✓ Added", the cart count increments, and the "Added" chip appears near the cart.
- "Close ✕" at top right, plus Esc key and click outside to close
- Prev/next arrows inside the modal to browse items, with the 3D model crossfading/spinning in
- Focus trap and aria-modal; body scroll locked while open

---

## 7. NEW FEATURE — Drag a plate from the table into the cart
- Press and hold a plate (about 150ms or more of movement, so it's distinguishable from a click) to pick it up
- On pickup, spawn a ghost clone: a floating 3D or rendered snapshot of that food that follows the cursor/finger, scales to about 0.8, tilts with velocity, and casts a shadow
- The original plate stays on the table. The belt never loses items, because a customer can order the same food many times. Optionally show a faint "copy" shimmer on the original.
- While dragging:
  - The belt pauses
  - The cart pill grows, glows in the item's accentColor, and shows "Drop to add"
  - When the ghost comes near the cart, it is magnetically pulled toward it
- Drop on cart → the ghost shrinks and swooshes into the cart icon, the count +1, the "Added" toast appears, and there is a small particle burst in the accent color
- Drop elsewhere → the ghost springs back to its plate and fades out, with nothing added
- Works with mouse and touch (long-press on touch). Respect prefers-reduced-motion, which should give a simple fade.
- Accessible alternative: every plate is also addable via the modal and the menu grid

---

## 8. Sections below the hero (scroll-driven, reactive to the selected item)
All sections react to selectedItem, which is the hovered/clicked/front item, defaulting to frontItem. Use GSAP ScrollTrigger + Lenis. Every section has entrance animations (staggered text reveals with masked lines, fade-up, scale-in).

### 8.1 Spotlight — "Meet your plate" (pinned, scroll-scrubbed)
- Pin the section for about 300vh. A large R3F canvas shows the selected item's GLB model.
- As the user scrolls:
  1. The model rises and rotates 180° while the title and price slide in
  2. Exploded ingredient view: if the model has separate meshes (rice, fish, nori…), they separate along the Y axis with labels connected by thin lines. If it is one mesh, show orbiting ingredient chips instead.
  3. A nutrition panel: animated counters (kcal, protein, carbs, fat) and ring/bar charts filling in accentColor
  4. Allergens and dietary badges pop in, plus the chef's note in a quote style
  5. A final "Add to order" CTA, plus "You might also like" (pairings)
- The section background uses the same blurred glow in the selected item's accentColor
- A mini item switcher (8 small round thumbnails) at the side lets the user change the spotlight item without scrolling back up. The model morphs/crossfades.

### 8.2 Full Menu
- Category filter tabs (All, Nigiri, Rolls, Sides, Desserts, Drinks), with a sliding pill indicator. Plus a search box, a price-tier filter (the colored rings) and dietary toggles (Veg, Spicy, Gluten-free).
- Responsive grid of cards. Each card shows a lightweight 3D preview: one shared canvas with View from drei (scissor viewports) for performance, or the poster image that swaps to live 3D on hover.
- Card hover: the model rotates, the card tilts with the cursor (3D tilt), and the border glows in the item's accent color
- Each card has a quick "+ Add" button. Cards are also draggable to the cart.
- Layout animations (Framer Motion layout) when filtering

### 8.3 How it works (Kaiten explained)
- A horizontal scroll-pinned storyline in 4 steps: "Pick a color → Grab a plate → Stack it up → Pay by plates". Animated SVG/3D icons for each step.
- Shows the plate color = price legend as large interactive rings. Hovering a ring highlights all menu items of that tier.

### 8.4 Chef's Specials / Combos
- Combo sets (e.g. "Lunch Set: 3 nigiri + edamame + miso") shown as a 3D stacked plate tower, with an animated price strike-through for the discount
- A countdown timer for a limited-time special

### 8.5 Build your own platter
- An interactive builder: drag items onto a big wooden platter (3D). It shows a live total, and the platter is added to the cart as a bundle.

### 8.6 Social proof
- Ratings summary (animated stars and count-up), plus an infinite marquee of review cards that pauses on hover
- An Instagram-style gallery grid with a parallax hover effect

### 8.7 Reservations
- Form: date picker, time slots, party size, name, phone and email, with validation (zod + react-hook-form), success state, confetti in accent color, and a clean API stub at /api/reserve

### 8.8 Locations & hours
- Map embed (lazy-loaded), address cards, open/closed status computed live, and a "Get directions" link

### 8.9 FAQ
- Accordion with smooth height animation and schema.org FAQ markup

### 8.10 Newsletter + Footer
- Email capture with an animated success state, plus social links, legal links, and a big wordmark in the footer that reveals on scroll

---

## 9. Cart & checkout
- Cart drawer slides from the right: line items with a small 3D/poster thumb, quantity steppers, remove (with an undo toast), notes, subtotal/tax/total with animated numbers, a promo code field, and an empty state ("Your belt is waiting")
- Plate stacking visualization: plates stack up in tier colors as items are added, like a real kaiten bill
- Checkout page: delivery/pickup toggle, address, time, a payment UI (Stripe-ready stub), order summary, and an order confirmation page with an order number
- Cart persisted in localStorage and synced across tabs

---

## 10. Performance (must hit Lighthouse ≥ 90 on desktop and ≥ 80 on mobile)
- Draco/Meshopt + KTX2 compressed models, using useGLTF.preload for hero models only. Lazy-load the rest when sections enter the viewport.
- Instanced or shared geometry for plates, dpr={[1, 2]}, frameloop="demand" where possible, and pause rendering when the canvas is offscreen
- Show a skeleton/poster first and fade in the 3D model when loaded. Add a <Suspense> loader with a progress ring.
- On low-end or mobile devices, reduce shadows, cap DPR at 1.5, and fall back to posters if WebGL is unavailable
- Respect prefers-reduced-motion by disabling auto-rotate, parallax and the exploded view, keeping simple fades

## 11. Responsive
- Desktop: the layout as described
- Tablet: the text stacks above the table
- Mobile: the table fills the width, with swipe to spin and tap to open; the modal becomes a bottom sheet; drag-to-cart uses long-press; the cart becomes a floating button at bottom-right; the glow stays at 75% width

## 12. Accessibility & SEO
- Semantic landmarks, alt text and aria-labels for every 3D item (from data), visible focus rings, keyboard support for the belt and modal, and color contrast AA
- Metadata, Open Graph image, schema.org Restaurant + Menu JSON-LD, sitemap, and robots

## 13. Code quality
- Folder structure: components/hero/KaitenTable, Plate, FoodModel, AmbientGlow, components/modal, components/cart, components/sections/*, store/, data/, lib/three/
- A reusable <FoodModel src normalize autoRotate interactive /> component used everywhere: table, modal, spotlight and menu
- Strict TypeScript, ESLint + Prettier, no console errors, and an error boundary around every Canvas
- README covering how to add a new food: drop the GLB in assets/models/, run npm run optimize-models, then add an entry in menu.ts

## 14. Acceptance checklist
- [ ] The oval table auto-rotates, stops smoothly on hover, spins with a flick (with inertia), and has working prev/pause/next
- [ ] Every food on the table, in the modal, in the spotlight and in the menu is a real GLB 3D model
- [ ] Hovering shows the label chip on the island and updates the left info text
- [ ] Clicking opens the modal with a 360° rotatable 3D model, counter, tags, price, Add to order → ✓ Added, and the cart count updates with the "Added" chip
- [ ] Dragging a plate onto the cart adds it, and the plate stays on the table. The same item can be added multiple times.
- [ ] The blurred stadium-shaped glow in the front item's color covers about 75% of the center width, transitions smoothly, and the edges stay dark
- [ ] Scroll sections react to the selected item with smooth GSAP animations
- [ ] The site is responsive, accessible and performant, and works without WebGL (poster fallback)
>>>

TECH / CONSTRAINTS (optional):
  <languages, frameworks, things to avoid, design or brand rules, deadline>

DEFINITION OF DONE (optional, but recommended):
  <How do we know it's finished? e.g. "npm run build passes, all pages work,
   README explains how to run it">

Rules:
- MODE = RESUME → the task is already in PROGRESS.md in the repo. Read it and continue.
- Extra instructions in the user's chat message also apply. If they conflict with this
  file, the user's newest message wins. Record the conflict in DECISIONS.md.


==========================================================================================
  1. GOLDEN RULES  (never break these)
==========================================================================================

 1. CLONE / PULL THE REPO FIRST, before any other work.
 2. THE REPO IS THE SINGLE SOURCE OF TRUTH. Don't rely on memory. Trust the real files
    over the logs.
 3. MICRO-TASKS: split every step into micro-tasks of 1–2 tool calls each.
 4. PUSH AFTER EVERY MEANINGFUL MICRO-TASK with the checkpoint script (section 8).
    Manual push rule: after each finished micro-task, OR at the latest every 3–4 tool
    calls, AND always BEFORE a long command (big install, long build, long test).
    Don't try to measure minutes; you can't time yourself reliably. Count tool calls.
    The AUTO-PUSH safety net (section 8.5, every 3–5 minutes) backs up the files in
    between. Manual pushes exist mainly to keep PROGRESS.md notes up to date.
 5. NEVER DELETE WORK. Move failed or replaced code to archive/ with a short note.
 6. LOG EVERYTHING: commands → COMMANDS.md, progress → PROGRESS.md,
    decisions → DECISIONS.md.
 7. NO SECRETS IN THE REPO. Never write a token, password, API key, or .env value into
    any file, commit message, or log. Write <TOKEN> or <SECRET> instead.
 8. NO DESTRUCTIVE GIT. Never use: git push --force, git reset --hard on pushed commits,
    git clean -fdx, or deleting branches. If history looks wrong, ask the user.
 9. WRITE FOR A STRANGER. Every log line should make sense to an agent with zero context.
    Use exact file paths, line numbers, and commands.
10. HALF-DONE CODE IS STILL PUSHED. Mark it with:  TODO(agent): <what is missing>
11. DON'T LOOP. If the same approach fails 3 times, stop. Write the problem in
    PROGRESS.md → Problems, try a different approach, or ask the user.
12. VERIFY, DON'T ASSUME. After writing code, run it, build it, or test it before marking
    the micro-task as done.


==========================================================================================
  2. STARTUP PROCEDURE  (do this exactly, in order)
==========================================================================================

2.1  Network
-----------
If cloning fails because the network is blocked, ask the user to enable internet access
and retry. Don't continue the task without the repo.

2.2  Git identity + safe token storage
--------------------------------------
The token is stored ONLY in ~/.git-credentials, which is OUTSIDE the repo. It never goes
in the remote URL, .git/config, or any project file. Never echo or print the token.

    cd /data
    git config --global user.name  "AI Agent"
    git config --global user.email "ai-agent@users.noreply.github.com"
    git config --global init.defaultBranch main
    git config --global pull.rebase true
    git config --global credential.helper store

    # Replace <TOKEN> with the real token in YOUR tool call only. Never log this command.
    printf 'https://x-access-token:%s@github.com\n' '<TOKEN>' > ~/.git-credentials
    chmod 600 ~/.git-credentials

    git clone https://github.com/<owner>/<repo>.git project
    cd project
    git checkout <BRANCH> 2>/dev/null || git checkout -b <BRANCH>

In COMMANDS.md, log this step only as: "Configured git credentials (token hidden)".

2.3  Decide: NEW TASK or RESUME
-------------------------------
A) Repo is empty, or has no PROGRESS.md → NEW TASK
   1. Create the folder structure (section 3) and .gitignore (section 7).
   2. Save this file into the repo as AI_AGENT_INSTRUCTIONS.md (WITHOUT the token).
   3. Create scripts/checkpoint.sh (section 8) and make it executable.
   3b. Create scripts/autopush.sh (section 8.5) and start it in the background.
       Check that `flock` exists (`command -v flock`). It's needed for the lock.
   4. Create PROGRESS.md: paste the user's exact task, then write a plan.
      Split it into Steps, and split each Step into micro-tasks (3.1, 3.2, ...).
   5. Create COMMANDS.md and DECISIONS.md.
   6. Checkpoint:  ./scripts/checkpoint.sh "step 0/N: project setup and plan"

B) PROGRESS.md exists → RESUME
   1. Read PROGRESS.md (the QUICK STATE block first), DECISIONS.md, and the last ~40
      lines of COMMANDS.md.
   2. Run:  git log --oneline -25
   3. Find the micro-task marked  ← IN PROGRESS  (or the first unchecked one).
   4. READ THE REAL CODE, not only the logs:
        git show --stat HEAD~5..HEAD               # recently changed files
        grep -rn "TODO(agent)" --exclude-dir=node_modules .
      Open every file related to the IN PROGRESS micro-task and the files it depends on.
   4b. Start the AUTO-PUSH loop (section 8.5) right away.
   5. Reinstall the environment (section 2.4) and run the project, build, or tests to
      see what works right now.
   6. If the logs don't match the real files, trust the files and fix PROGRESS.md.
   7. Add to Session History: "Session #X started, resuming from step Y.Z".
   8. Checkpoint:  ./scripts/checkpoint.sh "resume: session #X started at step Y.Z"
   9. Continue the work.

2.4  Reinstall the environment
------------------------------
A new agent always gets a fresh computer. Run every command listed in
PROGRESS.md → Environment setup (e.g. npm install, pip install -r requirements.txt).
When you install something new, IMMEDIATELY add it to that section and to the dependency
file (package.json, requirements.txt, ...).


==========================================================================================
  3. REQUIRED REPO STRUCTURE
==========================================================================================

project/
├── AI_AGENT_INSTRUCTIONS.md   ← copy of this file (no secrets)
├── PROGRESS.md                ← task, plan, quick state, next action   (MOST IMPORTANT)
├── COMMANDS.md                ← every terminal command + short result, numbered
├── DECISIONS.md               ← important choices and WHY
├── README.md                  ← how to install, run, and use the project (for humans)
├── .gitignore
├── .env.example               ← variable NAMES only, no real values (if env vars are used)
├── src/                       ← main project code
├── tests/                     ← tests (if the project has them)
├── scripts/
│   ├── checkpoint.sh          ← safe commit + push script (section 8)
│   ├── autopush.sh            ← background safety-net loop (section 8.5)
│   ├── logs/                  ← long command outputs (trimmed, no secrets)
│   └── (helper, test, one-off and data scripts)
├── assets/                    ← small input files, images, fonts, data
├── output/                    ← builds, exports, generated results (< 50 MB)
│   └── preview/               ← screenshots of the app or UI
└── archive/                   ← failed or replaced code, each with a short note why

If the project already has its own structure (e.g. a Next.js or Django layout), keep that
structure for the code and only add the log files and folders above.
Empty folders get a .gitkeep file.


==========================================================================================
  4. WHAT MUST BE PUSHED
==========================================================================================

| What                                                    | Where                          |
|---------------------------------------------------------|--------------------------------|
| All project code, created or edited                     | src/ (or the project layout)   |
| Half-finished or broken code, marked TODO(agent)        | its normal place               |
| Helper, test, temporary, one-off scripts                | scripts/                       |
| Failed or replaced code + a 1-line reason               | archive/                       |
| Every terminal command + short result                   | COMMANDS.md                    |
| Long logs (trimmed, secrets removed)                    | scripts/logs/                  |
| Plan, status, next action                               | PROGRESS.md                    |
| Decisions + reasons                                     | DECISIONS.md                   |
| Errors and how they were fixed                          | PROGRESS.md → Problems         |
| Dependency files (package.json, lock files, reqs)       | project root                   |
| Builds, exports, screenshots (< 50 MB)                  | output/, output/preview/       |
| Work outside the computer (Notion edits, web research,  | PROGRESS.md → External actions |
|   links, info from the user in chat)                    |                                |
| Required env variable names (no values)                 | .env.example                   |

RULE OF THUMB: if a file was created on the computer for this task, it goes in the repo,
except secrets, node_modules/venv/caches, and files over 50 MB.

Important user info shared in chat (requirements, preferences, answers to questions)
must be written to PROGRESS.md or DECISIONS.md. The next agent can't see this chat.


==========================================================================================
  5. PROGRESS.md FORMAT  (update its QUICK STATE block at every checkpoint)
==========================================================================================

# PROGRESS

## ⚡ QUICK STATE  (read this first; update at EVERY checkpoint)
- Overall: IN PROGRESS        (IN PROGRESS | BLOCKED | DONE)
- Current: Step 3/6 → micro-task 3.2 — Add login form validation
- Last action: Created src/components/LoginForm.jsx (form UI done, no validation yet)
- NEXT ACTION: In src/components/LoginForm.jsx, add email/password validation in
  handleSubmit() (line ~40, marked TODO(agent)). Then run COMMANDS.md #14 to test.
- Project runs?: YES — `npm run dev` works (last checked in session #2)
- Last updated: 2026-11-13 21:30 (Asia/Dhaka) by Session #2

## Task (copied exactly from the user)
<full original task text>

## Definition of Done
- [ ] <e.g. npm run build passes with no errors>
- [ ] <e.g. all pages work on mobile and desktop>
- [ ] <e.g. README explains setup and usage>

## Plan
- [x] Step 1: Project setup (Vite + React)
  - [x] 1.1 Init project   - [x] 1.2 Install deps   - [x] 1.3 First run OK
- [x] Step 2: Layout + routing
- [ ] Step 3: Authentication
  - [x] 3.1 Login form UI
  - [ ] 3.2 Form validation   ← IN PROGRESS
  - [ ] 3.3 Auth logic + session storage
- [ ] Step 4: Task CRUD
- [ ] Step 5: Testing + bug fixes
- [ ] Step 6: Final build, README, summary

## Done so far (details)
- Step 1: Vite + React 18 in src/. Commands #1–#5.
- Step 2: React Router v6, pages Home/Login/Dashboard. Screenshot: output/preview/home.png

## Problems / Notes
- #1 Port 5173 busy → used --port 5174 (COMMANDS.md #9).

## Environment setup (run these on a fresh computer)
cd project && npm install
npm run dev        # dev server
npm run build      # production build

## External actions (not in code)
- User said in chat: primary color #2563EB, no dark mode needed.
- Read Notion page "Brand guide" for colors (#FF5500, #111111).

## Session History
- Session #1: steps 0–2 done.
- Session #2: resumed at 3.1; 3.1 done, 3.2 in progress.


==========================================================================================
  6. COMMANDS.md AND DECISIONS.md FORMAT
==========================================================================================

COMMANDS.md
-----------
### 13. Install validation library (micro-task 3.2)
$ npm install zod
Result: SUCCESS — zod 3.23 added to package.json

### 14. Run dev server to test the form
$ npm run dev
Result: ERROR — "Cannot find module './schema'"
Fix: created src/lib/schema.js → re-ran as #15

Rules:
- Number every command. Write a short result: SUCCESS or ERROR plus a 1-line summary.
- Long output → save a trimmed copy to scripts/logs/<name>.log and reference it.
- Replace any secret with <TOKEN> or <SECRET>.
- Log in batches: you can add several commands at once, but always before the next push.

DECISIONS.md
------------
### 3. Validation library
Decision: zod.
Why: small, works with plain JS and TS, clear error messages.
Alternatives considered: yup (bigger), manual checks (more code).
Revisit if: the project moves to a form library that has validation built in.


==========================================================================================
  7. WHAT MUST NEVER BE PUSHED + .gitignore
==========================================================================================

Never push: tokens, passwords, API keys, .env files, cookies, SSH keys, credentials,
node_modules/, virtual envs, caches, or files over 50 MB (GitHub rejects > 100 MB).

Default .gitignore:

    node_modules/
    .venv/
    venv/
    env/
    __pycache__/
    *.pyc
    .cache/
    .next/
    dist/.cache/
    .env
    .env.*
    !.env.example
    *.key
    *.pem
    .git-credentials
    .DS_Store
    Thumbs.db
    scripts/logs/autopush.log
    scripts/logs/autopush.heartbeat

Note: build folders (dist/, build/) are normally ignored. If the user wants the built
result in the repo, copy it to output/ instead.

Large files: push a compressed or smaller version, and write in PROGRESS.md the exact
command to regenerate the full version.

If a secret was EVER committed by mistake: don't try to rewrite history yourself.
Tell the user right away to REVOKE that token or key on GitHub/the provider, and note it
in PROGRESS.md → Problems (without the secret).


==========================================================================================
  8. CHECKPOINT  (commit + push after every meaningful micro-task)
==========================================================================================

8.1  Create this script once (NEW TASK setup): scripts/checkpoint.sh
--------------------------------------------------------------------
What it protects against:
  - Secrets and files over 50 MB getting committed.
  - Two pushes running at the same time (manual + auto) → uses a LOCK (flock), so no
    "index.lock" errors.
  - Committing while a rebase/merge is half-done → it refuses to run.
  - Rebase conflicts → it runs `git rebase --abort`, keeps your commit locally, and
    exits with code 3 so you can tell the user. It never hides the error.
  - (Auto mode only) Half-written files → it skips the round if any file changed in
    the last 30 seconds.

#!/usr/bin/env bash
# Usage (manual):  ./scripts/checkpoint.sh "wip(3.2): form validation half done"
# Usage (auto):    AUTO=1 ./scripts/checkpoint.sh "auto: checkpoint"
# Exit codes: 0 ok/nothing to do, 1 blocked (secret/big file/bad state),
#             2 push failed, 3 rebase conflict (aborted), 4 lock busy
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1
MSG="${1:-wip: checkpoint}"
AUTO="${AUTO:-0}"
BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || echo main)"
GITDIR="$(git rev-parse --git-dir)"

# 0) LOCK: only one checkpoint at a time.
#    Auto mode: skip this round if busy. Manual mode: wait up to 120s.
exec 9>/tmp/checkpoint.lock
if [ "$AUTO" = "1" ]; then
  flock -n 9 || { echo "ℹ️ Another checkpoint is running. Skipped."; exit 0; }
else
  flock -w 120 9 || { echo "❌ Lock busy for 120s. Try again."; exit 4; }
fi

# 0b) Refuse to run in the middle of a rebase / merge / other git operation
if [ -d "$GITDIR/rebase-merge" ] || [ -d "$GITDIR/rebase-apply" ] || \
   [ -f "$GITDIR/MERGE_HEAD" ] || [ -f "$GITDIR/index.lock" ]; then
  echo "❌ Git is in the middle of a rebase/merge (or index.lock exists). Not committing."
  echo "   Fix it first (see section 8.4). Auto-push stays paused until then."
  [ "$AUTO" = "1" ] && exit 0 || exit 1
fi

# 0c) Auto mode only: skip if files are still being written (changed in last 30s)
if [ "$AUTO" = "1" ]; then
  RECENT="$(find . -path ./.git -prune -o -path ./node_modules -prune \
            -o -path ./scripts/logs -prune -o -type f -mmin -0.5 -print -quit)"
  if [ -n "$RECENT" ]; then
    echo "ℹ️ Files changed in the last 30s (e.g. $RECENT). Skipped this round."
    exit 0
  fi
fi

git add -A

# 1) Block known secret patterns in staged changes
PATTERNS='ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|gh[ousr]_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----'
if git diff --cached -U0 | grep -E "^\+" | grep -Eq "$PATTERNS"; then
  echo "❌ SECRET PATTERN FOUND in staged changes. Commit blocked."
  git diff --cached --name-only
  git reset -q
  exit 1
fi

# 2) Block the actual stored token value, if one exists
if [ -f ~/.git-credentials ]; then
  TOK="$(sed -n 's#https://[^:]*:\([^@]*\)@.*#\1#p' ~/.git-credentials | head -1)"
  if [ -n "$TOK" ] && git diff --cached | grep -qF "$TOK"; then
    echo "❌ GITHUB TOKEN FOUND in staged changes. Commit blocked."
    git reset -q
    exit 1
  fi
fi

# 3) Block files over 50 MB
BIG="$(git diff --cached --name-only --diff-filter=AM | while read -r f; do
  [ -f "$f" ] && [ "$(stat -c%s "$f")" -gt 52428800 ] && echo "$f"; done)"
if [ -n "$BIG" ]; then
  echo "❌ Files over 50 MB (add them to .gitignore or compress them):"; echo "$BIG"
  git reset -q
  exit 1
fi

# 4) Commit (skip if nothing changed)
if git diff --cached --quiet; then
  [ "$AUTO" = "1" ] && [ -z "$(git log "origin/$BRANCH..HEAD" --oneline 2>/dev/null)" ] \
    && { echo "ℹ️ Nothing to commit or push."; exit 0; }
  echo "ℹ️ Nothing new to commit. Pushing any unpushed commits."
else
  git commit -q -m "$MSG"
fi

# 5) Sync + push. Conflicts are NEVER hidden: abort the rebase and report.
for i in 1 2 3; do
  if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
    if ! git pull -q --rebase origin "$BRANCH"; then
      if [ -d "$GITDIR/rebase-merge" ] || [ -d "$GITDIR/rebase-apply" ]; then
        git rebase --abort
        echo "❌ REBASE CONFLICT with origin/$BRANCH. Rebase aborted."
        echo "   Your commit is safe locally: $(git log -1 --oneline)"
        echo "   Tell the user. Do NOT force-push. See section 8.4."
        exit 3
      fi
      echo "Pull failed (try $i/3, probably network). Retrying in 5s..."; sleep 5
      continue
    fi
  fi
  if git push -q -u origin "$BRANCH"; then
    echo "✅ Pushed: $(git log -1 --oneline)"
    exit 0
  fi
  echo "Push failed (try $i/3), retrying in 5s..."; sleep 5
done
echo "❌ PUSH FAILED after 3 tries. Work is committed locally. Tell the user."
exit 2

Then run:  chmod +x scripts/checkpoint.sh

Note: if `flock` is missing (rare), install util-linux, or tell the user. Don't remove
the lock from the script.

8.2  The micro-task loop  (repeat this for every micro-task)
-------------------------------------------------------------
  1. DO     → write or edit code for ONE micro-task.
  2. CHECK  → run, build, or test it quickly. If it's broken, still continue to step 3
              with a TODO(agent) note.
  3. LOG    → update PROGRESS.md QUICK STATE (Last action + NEXT ACTION), tick the
              checkbox, and add the commands to COMMANDS.md.
  4. PUSH   → ./scripts/checkpoint.sh "wip(3.2): <what was done>"
  5. CONFIRM→ the output says "✅ Pushed". If it doesn't, follow section 8.4.

Push when the micro-task is done, or at the latest after 3–4 tool calls, even if the
micro-task isn't finished yet (mark it with TODO(agent)).

Steps 3 + 4 should take ONE tool call: a single bash call that updates PROGRESS.md
and then runs the script.

SAVE TOOL CALLS: put the push in the SAME bash call as the work, so pushing doesn't
cost an extra tool call:

    cat > src/utils/date.js <<'CODE'
    ...code...
    CODE
    ./scripts/checkpoint.sh "wip(3.2): add date utils"

    npm run build 2>&1 | tail -20; ./scripts/checkpoint.sh "wip(3.3): build tested"

If you edit files with a separate edit tool, run the checkpoint in your next bash call
(together with the next command).

BEFORE A LONG COMMAND (install, long build, render, long test): push first, in the
same bash call:

    ./scripts/checkpoint.sh "wip(4.1): before npm install" && npm install 2>&1 | tail -20

8.3  Commit message format
--------------------------
  step 0/6: project setup and plan        ← setup
  wip(3.2): login validation half done    ← micro-task in progress
  step 3/6: authentication done           ← a full Step finished
  fix: crash when task list is empty      ← bug fix
  test: add tests for auth                ← tests
  docs: update README                     ← docs only
  resume: session #3 started at 4.1       ← new session
  done: final build + README              ← task complete
  auto: checkpoint 14:32                  ← made by autopush.sh only

Make messages specific: "wip(3.2): validation for email done, password pending" is
better than "update files".

To read the history WITHOUT the auto commits:
    git log --oneline --invert-grep --grep='^auto:'

8.4  If the checkpoint fails
----------------------------
  1. Exit code 3 = rebase conflict. The script already ran `git rebase --abort`, so the
     repo is clean and your commit is safe locally. Then:
       - Write it in PROGRESS.md → Problems (which files conflict, if known).
       - TELL THE USER. Don't resolve big conflicts by guessing.
       - Keep working locally; commits still work, only the push waits.
       - Auto-push keeps trying, but it will keep failing until this is fixed.
     If the user asks you to fix it: `git pull --rebase origin <BRANCH>`, open each
     conflicted file, keep BOTH changes when unsure, then
       git add -A && git rebase --continue && ./scripts/checkpoint.sh "fix: merge conflict"
     If anything goes wrong in the middle:  git rebase --abort
  2. "Git is in the middle of a rebase/merge" → run `git status`. If a rebase is stuck,
     run `git rebase --abort` (or `git merge --abort`), then checkpoint again.
     If `.git/index.lock` exists and NO git command is running, delete it:
       rm -f .git/index.lock
  3. Authentication error (401/403) → the token may be wrong, expired, or missing write
     access. Tell the user. Don't print the token.
  4. Network error → retry once. If it still fails, ask the user to enable internet access.
     Keep working locally and push as soon as possible.
  5. Exit code 4 = lock busy for 2 minutes → check that no stuck git command is running
     (`ps aux | grep git`), then try again.
  6. Never use --force.


8.5  AUTO-PUSH SAFETY NET  (background push every 4 minutes)
-------------------------------------------------------------
A background loop pushes the files every 4 minutes (anything in 3–5 minutes is fine),
so file changes are backed up even between manual pushes. Not 60 seconds: that wastes
resources and fills the history with hundreds of commits.

It is SAFE because it uses the same checkpoint.sh in AUTO mode:
  - it shares the lock with manual pushes, so they never run at the same time;
  - it skips a round while a rebase/merge is in progress;
  - it skips a round while files are still being written (changed in last 30s);
  - it does nothing if nothing changed.

Create scripts/autopush.sh:

#!/usr/bin/env bash
# Background auto-push every 4 minutes. Stop it with:  kill "$(cat /tmp/autopush.pid)"
cd "$(git rev-parse --show-toplevel)" || exit 1
mkdir -p scripts/logs
echo $$ > /tmp/autopush.pid
INTERVAL="${AUTOPUSH_INTERVAL:-240}"   # seconds (180–300 recommended)
while true; do
  sleep "$INTERVAL"
  date '+%s' > scripts/logs/autopush.heartbeat
  AUTO=1 ./scripts/checkpoint.sh "auto: checkpoint $(date '+%H:%M')" \
    >> scripts/logs/autopush.log 2>&1
  # keep the log small
  tail -n 200 scripts/logs/autopush.log > scripts/logs/autopush.tmp && \
    mv scripts/logs/autopush.tmp scripts/logs/autopush.log
done

Then run:
    chmod +x scripts/autopush.sh
    mkdir -p scripts/logs
    # Start only if it isn't already running (uses a PID file; don't use pgrep/pkill -f,
    # because they also match the shell running this command)
    if ! { [ -f /tmp/autopush.pid ] && kill -0 "$(cat /tmp/autopush.pid)" 2>/dev/null; }; then
      nohup ./scripts/autopush.sh >/dev/null 2>&1 &
    fi

Check that it is still alive (the sandbox can kill background processes WITHOUT any
warning). Put this in the same bash call as a manual checkpoint, about every 5 manual
pushes:

    if [ -f /tmp/autopush.pid ] && kill -0 "$(cat /tmp/autopush.pid)" 2>/dev/null; then
      echo "auto-push: running"; tail -n 3 scripts/logs/autopush.log 2>/dev/null
    else
      echo "auto-push: STOPPED → restarting"; nohup ./scripts/autopush.sh >/dev/null 2>&1 &
    fi

Rules:
- The loop is ONLY a safety net. It saves files, NOT notes. Still update PROGRESS.md
  QUICK STATE and push manually after every meaningful micro-task. Auto commits don't
  say what was done; your notes do.
- Never trust that it is running. If it stopped, restart it (above).
- If autopush.log shows "REBASE CONFLICT" or "PUSH FAILED", handle it (section 8.4)
  and tell the user.
- autopush.log and autopush.heartbeat are in .gitignore, so they don't create commits.
- If the computer is restarted or the session resumes, start the loop again.

==========================================================================================
  9. WHEN TO CHECKPOINT  (push immediately when ANY of these happens)
==========================================================================================

- A micro-task is finished (even a tiny one).
- A file was created, or meaningfully changed.
- A build, test, or run finished (success OR failure).
- A bug was found, or fixed.
- A decision was made, or the user gave new info in chat.
- 3–4 tool calls have passed since the last push (even if the micro-task isn't done).
- BEFORE a long command (big install, long build, render, long test run): push first,
  in the same bash call, then run it.
- You've been working a long time, or the chat is getting long → push now.

Don't push after EVERY single tool call. Each push costs a tool call and credits; too
many pushes means less real work before the limit. Combine the push with work in the
same bash call whenever you can (section 8.2).


==========================================================================================
 10. WORKING QUALITY RULES  (so the project ends up good, not just backed up)
==========================================================================================

- PLAN FIRST: before coding, write the plan in PROGRESS.md and push it.
- SMALL, WORKING INCREMENTS: after each Step, the project should still run.
- TEST AS YOU GO: run the app, build, or tests after each meaningful change. Save
  screenshots of UI work to output/preview/.
- READ BEFORE EDITING: open a file before you change it. Don't overwrite work you
  haven't read.
- KEEP IT SIMPLE: use well-known libraries, and avoid adding dependencies you don't need.
  Explain each new dependency in DECISIONS.md.
- CLEAR CODE: meaningful names, short functions, and comments where the logic isn't
  obvious.
- ASK WHEN TRULY BLOCKED: if a requirement is unclear and guessing wrong would waste a
  lot of work, ask the user. Write the question and answer in DECISIONS.md. For small
  things, pick a sensible default and log it.
- STAY IN SCOPE: do what the task asks. Write extra ideas in PROGRESS.md →
  Problems / Notes as "Ideas for later" instead of building them.
- UPDATE README.md when setup or usage changes.


==========================================================================================
 11. FINISHING THE TASK
==========================================================================================

 1. Check every item in "Definition of Done". Run the final build and tests.
 2. Put the final output in output/, or explain how to generate it in README.md.
 3. README.md: what the project is, how to install it, how to run it, how to build it.
 4. PROGRESS.md: Overall = DONE, all boxes checked, plus a "How to use the result" section.
 5. Final checkpoint:  ./scripts/checkpoint.sh "done: <short summary>"
 6. Optional milestone tag:  git tag v1.0 && git push origin v1.0
 7. Tell the user in chat:
      - what was built
      - where things are in the repo (main files, output, README)
      - how to run it
      - anything left open or worth improving
      - remind them to REVOKE the GitHub token now (it was shared in chat, so it stays
        in the chat history)
 8. Stop the auto-push loop:  kill "$(cat /tmp/autopush.pid)" 2>/dev/null


==========================================================================================
 12. QUICK CHECKLIST  (scan this every few minutes)
==========================================================================================

[ ] Did I push after the last finished micro-task / within the last 3–4 tool calls?
[ ] Will my next command take long? → push first.
[ ] Is the AUTO-PUSH loop (section 8.5) still running? Any errors in autopush.log?
[ ] Is the QUICK STATE in PROGRESS.md up to date, with an exact NEXT ACTION?
[ ] Are new commands logged in COMMANDS.md?
[ ] Is every new dependency in package.json/requirements.txt AND in Environment setup?
[ ] Is half-done code marked TODO(agent)?
[ ] Did I write user info from chat into the repo?
[ ] Are there zero secrets in the files I'm about to commit?
[ ] If I'm stopped right now, can a stranger continue from PROGRESS.md quickly?


==========================================================================================
 13. MESSAGE TO THE NEXT AGENT
==========================================================================================

"Assume you can be stopped at any moment. Micro-task → test → log → push. Repeat.
Push smart, not constantly: after each meaningful micro-task, every 3–4 tool calls, and
before long commands. Leave the repo so a stranger can open PROGRESS.md, read QUICK
STATE, and continue right away."

==========================================================================================
  END OF FILE
==========================================================================================