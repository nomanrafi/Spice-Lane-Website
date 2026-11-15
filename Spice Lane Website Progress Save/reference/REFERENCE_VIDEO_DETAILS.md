# Reference video — trained details (read this instead of the video)

> Purpose: future agents do NOT need the reference video. Everything needed to replicate it is here.
> Source of truth used: the reference site's own code (`Optional you can use/reference site's prompt-code.txt`,
> component `sushi-conveyor-menu.tsx` from 21st.dev — this is exactly the site shown in the video) + the
> "from the reference video" sections of the build prompt. Frame-sampled colors from the earlier session were
> lost (never pushed); colors below come from the code/theme and are marked where they should be eyeballed.

## 1. Page in the video (demo layout)
- Full-viewport section, dark theme (`bg-background`, near-black), content centered.
- **Top-right cart**: white "Added" chip (bg-foreground, text-background, 11px, rounded-full, px-2.5 py-1)
  slides in from the right (translate-x-1 → 0, opacity 0 → 1, 300ms) left of the cart, visible **2.4s**.
  Cart pill: h-9, rounded-full, border, bg-card, ShoppingBag icon (lucide, 16px) + tabular count.
- **Wide layout (≥1024px)**: text column on the LEFT, belt on the RIGHT. **Narrow**: everything centered and stacked
  (header → belt → controls → caption → button).
- Left column (top → bottom):
  1. Eyebrow `KAITEN · LUNCH BELT` — 11px, uppercase, tracking 0.28em, muted gray.
  2. H2 "A sushi belt that keeps turning, right on the page." — font-medium, tracking-tight,
     text-4xl / xl:2.75rem, leading 1.1, text-balance.
  3. Price legend: hollow ring (10px, 2px border in tier color) + price, 11px tabular muted, gap-x 14px:
     `$3.20 (t1) · $4.20 (t2) · $5.40 (t3) · $6.80 (t4) · $8.50 (t5)`.
  4. Caption (aria-live): default muted "Hover to stop the belt, flick to spin it, pick a plate to order."
     When a plate is active: **Name** (white, medium) `· $price` (muted) + 13px description line below.
  5. "See full menu" pill — white bg, black text, px-5 py-2.5, text-sm, hover lifts 1px + shadow.
- Under belt: 3 round controls (32px, border, bg-card, muted icons): ‹  ⏸/▶  ›.

## 2. Menu data shown in the video (8 plates)
| # | Name | Price | Tier | Description | Chips |
|---|---|---|---|---|---|
| 1 | Salmon nigiri | $4.20 | 2 | Two slices of fresh salmon over seasoned rice, with pickled ginger. | 2 pieces, Fish, Chef's pick |
| 2 | Tuna nigiri | $6.80 | 4 | Lean red tuna over warm rice on a black lacquer plate. | 2 pieces, Fish |
| 3 | Ebi nigiri | $4.20 | 2 | Butterflied poached shrimp over rice, tail left on. | 2 pieces, Shellfish |
| 4 | California roll | $5.40 | 3 | Crab, avocado and cucumber, rolled inside out in orange tobiko. | 4 pieces, Shellfish, Fish roe |
| 5 | Dragon roll | $8.50 | 5 | Shrimp tempura roll draped in avocado, finished with eel sauce. | 4 pieces, Shellfish, Wheat, Chef's pick |
| 6 | Tamago nigiri | $3.20 | 1 | Sweet rolled omelette tied to rice with a band of nori. | 2 pieces, Egg |
| 7 | Salted edamame | $3.20 | 1 | A small bowl of steamed soybean pods with flaky sea salt. | 1 bowl, Soy, Vegan |
| 8 | Mochi ice cream | $5.40 | 3 | Matcha and strawberry mochi ice cream, one of each. | 2 pieces, Milk, Dessert |

**For Spice Lane** we replace these with our 8 GLBs in `assets/` (same structure, 8 items, 5 price tiers):
A5-Wagyu-Ribeye, Dark-Chocolate-Fondant, Grilled-Ribeye-Steak, Herb-Crusted-Rack-of-Lamb, Lobster-Thermidor,
Salmon-Sushi-Roll, Sesame-Crusted-Tuna-Tataki, Spaghetti-with-Tomato-Sauce.

## 3. Tier colors (plate ring + dot)
Uses shadcn `--chart-1..5` (dark theme defaults; verify visually):
- t1 `oklch(0.488 0.243 264.376)` blue  ≈ #1447e6
- t2 `oklch(0.696 0.17 162.48)` green/teal ≈ #00bc7d
- t3 `oklch(0.769 0.188 70.08)` amber ≈ #fe9a00
- t4 `oklch(0.627 0.265 303.9)` purple ≈ #ad46ff
- t5 `oklch(0.645 0.246 16.439)` red/pink ≈ #ff2056
Ring: 2px border, inset -2% around plate (rounded 50%). Dialog ring: 3px, inset -1.5%.

## 4. The belt (geometry — it is 2.5D in the video; we rebuild it in real 3D)
- Stadium loop: two straight lanes + two semicircles. Constants: `SPACING 1.35` (plate pitch = 1.35 × plate
  diameter d), `CURVE 0.95` (radius = 0.95·d max), `BAND 1.22` (belt width = 1.22·d), `TILT 0.8` (depth
  foreshortening), `SLAT 0.34` (slat seam every 0.34·d), back lane scale `kb` (back plates smaller).
- Loop length l = n·1.35·d; r = min(0.95d, l/2π); straight s = (l − 2πr)/2.
- Front lane runs **right → left**, back lane left → right (belt moves clockwise when seen from above).
- Look: belt surface dark (fg 16% mix), belt side darker (7%) offset down by `side = max(3, 0.07d)`; crescent
  slat seams (black 42% opacity) + a faint white glint (14%) that travel with the plates and bend round curves;
  outer & inner rails (muted gray) with thin white top highlights (55% / 40%); a soft blurred black drop shadow
  under the whole loop (opacity 60% dark); raised **inner island** (gradient top, darker wall, white 40% rim).
- A subtle "counter" gradient band behind the back of the table (fg 9% → transparent).
- Back plates get a dark shade (BACK_SHADE 0.15) and every plate has a soft shadow.
- Hovered/active plate: lifts up (LIFT_Y −6% of height) and scales +8% (LIFT_SCALE 0.08); a chip appears just above
  it: `● Name $price` (11px, bg-card, border, rounded-full, dot in tier color, price muted) fading/sliding up 300ms.

## 5. Motion / physics (exact values from the reference)
- Cruise speed **26 px/s** on the front lane (calm). Belt starts already moving.
- Sim with sub-steps (≤17ms each), dt clamped to 0.25s.
- **Stopped states** (paused, a plate active/hovered, dialog open): velocity decays `v *= exp(-7.2·h)` → smooth stop.
- **Return to cruise**: if |v − cruise| is large, error decays `exp(-2.4h)` minus 90·h linear; when close `exp(-3.4h)`.
- **Seek (prev/next/keyboard/autoplay)**: critically-damped spring, ω = 5.6 → lands exactly on plate slot
  (snap when |Δ|<0.3 and |v|<4).
- **Plate lift spring**: stiffness 330, damping 23 (slight overshoot pop).
- **Drag/flick**: horizontal drag > 6px (and more horizontal than vertical) starts DRAG; belt follows the finger
  (front lane 1:1, back lane scaled 1/kb, direction inverted on back lane); velocity smoothed `0.6 old + 0.4 new`;
  on release velocity carries with decay `exp(-holdTime/70ms)` and is clamped to ±1400 px/s, then eases back to cruise.
- Hover-while-moving: hit test runs each frame, so plates passing under a still cursor get picked up.
- After a drag release, hover is "locked" until mouse moves 4px.
- **Autoplay** (on in the demo): after 1.6s, brings the next plate to the front (seek), lifts it, holds **1400ms**,
  drops it, next one every **3000ms**. Any user interaction stops autoplay permanently.
- Animation pauses when off-screen / tab hidden (IntersectionObserver + visibilitychange).
- prefers-reduced-motion: belt static, no springs, instant.

## 6. Input behaviour
- Mouse hover plate → belt eases to stop, plate lifts, caption updates. Mouse leave → plate drops, belt resumes.
- Click plate → dialog. Touch: first tap lifts/selects, second tap opens. Tap empty belt → deselect.
- Prev/next buttons: move exactly one slot from active (or center) plate with seek spring.
- Pause toggles (icon pause ⇄ play triangle), aria-pressed.
- Keyboard: roving tabindex on plates; ←/→ next/prev, Home/End first/last; Enter opens; focus kept on plate.

## 7. Product dialog (popup) in the video
- Backdrop: bg-background/80 + backdrop-blur-md, fade 300ms; click backdrop closes.
- Card: rounded-[2rem], border, bg-card, shadow-2xl, scale 0.97→1 + fade 300ms.
- "Close ✕" text button top-right (xs, muted → white on hover). Esc closes. Focus trap; body scroll locked.
- **Shared-element flight**: the plate image flies from its belt position into the dialog figure in **680ms**
  `cubic-bezier(.22,.85,.3,1)` with an arc: midpoint at 42% of the path, raised by `min(120, |dy|·0.3+40)` px,
  scale ×1.05 and rotate ±6° (opposite to travel direction). The plate on the belt hides while flying.
- Close flight back: **540ms** `cubic-bezier(.45,0,.55,1)`, midpoint 58% raised 36px.
- Layout: figure (plate with 3px tier ring) on the left / top on mobile; text side: mono counter
  `● 03 / 08` (11px, tracking 0.2em, muted, dot tier color) → title (2xl/3xl medium) → description → chips →
  price (2xl semibold tabular) + white pill "Add to order". Text block fades/slides in with 150ms delay, 500ms.
- Add click → button shows added state, cart +1, "Added" chip near cart, dialog auto-closes after **450ms**.

## 8. How Spice Lane upgrades it (from the build prompt)
- Real 3D (R3F) table + GLB food on plates (on belt and inside the modal, orbitable).
- Ambient blurred glow in the front item's accent color under the table, color lerp ~600ms, 6s breathing.
- Drag a plate onto the cart to add it (ghost, magnet, particle burst).
- Keep ALL motion values above so it feels identical to the video.
