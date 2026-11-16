// Global page-scroll lock shared by popups (product modal, cart drawer).
// Lenis smooth-scroll listens to wheel events on window, so `body{overflow:hidden}` alone does NOT stop it:
// we must also call lenis.stop(). Ref-counted so two overlays can lock at once.
type LenisLike = { stop: () => void; start: () => void };
let lenis: LenisLike | null = null;
let locks = 0;

export function registerLenis(l: LenisLike | null) { lenis = l; if (l && locks > 0) l.stop(); }

export function lockScroll() {
  locks += 1;
  if (locks === 1) {
    lenis?.stop();
    const sb = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (sb > 0) document.body.style.paddingRight = `${sb}px`;
  }
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    lenis?.start();
  }
}
