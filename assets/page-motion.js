// page-motion.js — micro movimiento global al usar la rueda del mouse
// Objetivo: que el sitio no se sienta “estático” incluso cuando la página es corta y no hay scroll real.

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

document.addEventListener('DOMContentLoaded', () => {
  if (prefersReducedMotion()) return;

  // Elegimos un objetivo “seguro” según la página.
  // - Auth: movemos la tarjeta.
  // - Otras páginas: movemos el main.
  const target =
    document.querySelector('.patitas-auth-card') ||
    document.querySelector('.patitas-main') ||
    document.querySelector('main') ||
    document.body;

  // Nota: no movemos la imagen del hero aquí para no “pelear” con hero-parallax.js.
  // Este efecto es MUY sutil y se resetea rápido.

  let y = 0;
  let raf = 0;
  let resetTimer = 0;

  function apply() {
    raf = 0;
    target.style.transform = `translate3d(0, ${y}px, 0)`;
  }

  function scheduleReset() {
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      y = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    }, 160);
  }

  window.addEventListener('wheel', (e) => {
    const delta = e.deltaY || 0;
    const push = clamp(delta * 0.03, -4, 4);
    y = clamp(y + push, -10, 10);
    if (!raf) raf = requestAnimationFrame(apply);
    scheduleReset();
  }, { passive: true });
});
