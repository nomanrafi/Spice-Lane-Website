# Reference video — observations from the ACTUAL video (Screenshot-5204.mp4)

> Video: 35.1 s, 1772×964, 30 fps, dark screen recording of the kaiten sushi-belt demo.
> Analysed frame-by-frame on 2026-11-15. This CONFIRMS `REFERENCE_VIDEO_DETAILS.md` (built from code) and adds
> what only the video shows. Future agents: you do NOT need the video. Key frames are in `reference/frames/`.

## 1. Verified against the video (code-based doc is correct)
- Layout: text column left (~35% width), belt right; cart pill top-right; 3 round controls (‹ ⏸ ›) centred under belt.
- Eyebrow `KAITEN · LUNCH BELT`, H2 "A sushi belt that keeps turning, right on the page." (3 lines, white, medium weight).
- Legend `$3.20 $4.20 $5.40 $6.80 $8.50` with hollow coloured rings; caption "Hover to stop the belt, flick to spin it,
  pick a plate to order."; white pill "See full menu".
- All 8 names, prices and descriptions in the table match exactly (seen in captions/tooltips and dialog).
- Hover tooltip chip above the lifted plate: `● Ebi nigiri $4.20` (dot in tier colour, price muted).
- Caption swaps to **Name** · $price + description when a plate is active.
- Belt front lane moves RIGHT → LEFT (Mochi went from front-right to front-left between t=1s and t=4s).
- Popup: Ebi nigiri, counter `● 03 / 08`, chips "2 pieces" "Shellfish", "$4.20", white pill "+ Add to order",
  "Close ✕" top-right. After click button shows "✓ Add to order", popup closes, "Added" white chip appears left of
  cart and count goes 0 → 1.

## 2. Tier colours — SAMPLED from video pixels (use these; they replace the "verify" note)
| Tier | Price | Hex (sampled) | Name |
|---|---|---|---|
| t1 | $3.20 | `#1045e7` | blue |
| t2 | $4.20 | `#01b87b` | emerald green |
| t3 | $5.40 | `#fc9808` | amber/orange |
| t4 | $6.80 | `#a036fa` | violet |
| t5 | $8.50 | `#ff1555` | pink-red |
Page background: `#0a0a0a`. Card/dialog: very dark gray (~`#161616`) with 1px subtle border, ~2rem radius.
(Sampled values ≈ the code's chart-1..5 defaults, so those defaults are correct.)

## 3. Per-plate look (plate colour + ring) seen in the video
| # | Dish | Plate | Ring tier |
|---|---|---|---|
| 1 | Salmon nigiri | white/cream plate (+ pickled ginger) | t2 green |
| 2 | Tuna nigiri | black lacquer plate | t4 violet |
| 3 | Ebi nigiri | pale celadon/mint plate | t2 green |
| 4 | California roll | white plate, 4 pieces | t3 amber |
| 5 | Dragon roll | dark/black plate, 4 pieces | t5 red |
| 6 | Tamago nigiri | red lacquer plate | t1 blue |
| 7 | Salted edamame | amber/gold bowl | t1 blue |
| 8 | Mochi ice cream | white plate (green + pink mochi) | t3 amber |
Belt order around the loop = table order 1→8. Ring sits just outside the plate rim (thin, ~2px, glowing slightly).
Spice Lane: give each GLB a plate colour that contrasts with the food, like above.

## 4. Belt look (visual)
- Stadium/pill shaped table, dark charcoal (~#2b2b2b) top, slightly lighter grey metallic outer rim with a thin
  white highlight; radial slat seams (crescent grooves) between plates; soft shadow under the whole table.
- Raised inner island: dark rounded rectangle in the middle, with thin light rim.
- 3/4 top-down perspective (back lane smaller, front lane larger). 4 plates back, 4 front at any moment.

## 5. Timeline of the video (what the user did)
- 0–3 s: belt cruising slowly; cursor hovering. 4–6 s: hover Ebi → belt stops, plate lifts, chip + caption.
- 6–9 s: hover Dragon roll ($8.50), then cursor leaves → belt resumes. 9–12 s: next ›  clicks → seek one slot each,
  tooltip shows Tamago $3.20, Salted edamame $3.20, Mochi $5.40, Salmon $4.20 / Tuna $6.80 (caption).
- 13–16 s: hover California roll, Ebi. 17–21 s: click Ebi → plate flies into centred dialog (backdrop blurs & dims
  the page), click "+ Add to order" → "✓" → dialog closes (plate flies back), "Added" chip + cart = 1.
- 22–35 s: more hover (California roll), click "See full menu" (no visible navigation in demo), belt keeps cruising.

## 6. Key frames saved
`frames/t1s.jpg` idle belt · `t5s.jpg` hover/tooltip · `t8s.jpg` Dragon roll caption · `t18s.jpg` dialog ·
`t21s.jpg` "Added" chip + cart 1.
