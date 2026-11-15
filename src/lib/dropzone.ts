/** Cart drop-zone helpers for drag-to-cart (Step 6). The header cart pill has id="cart-pill". */
export const MAGNET_RADIUS = 150;
export function cartCenter(): { x: number; y: number } | null {
  const el = document.getElementById('cart-pill');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
/** Distance from a point to the cart pill centre (Infinity if no pill). */
export function cartDistance(x: number, y: number) {
  const c = cartCenter();
  return c ? Math.hypot(c.x - x, c.y - y) : Infinity;
}
