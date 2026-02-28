// hero-parallax.js — movimiento sutil del hero para que no se sienta estático

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

document.addEventListener('DOMContentLoaded', () => {
  if (prefersReducedMotion()) return;

  const hero = document.querySelector('.patitas-hero');
  const media = document.querySelector('.patitas-hero-media');
  if (!hero || !media) return;

  // Para que se note sin marear (solo unos px)
  const MAX_X = 8;
  const MAX_Y = 10;
  const MAX_WHEEL_Y = 18; // un poco más para que se sienta al hacer scroll con la rueda

  let raf = 0;
  let targetX = 0;
  let targetY = 0;

  function apply() {
    raf = 0;
    // movemos SOLO la imagen de fondo (media), no todo el contenedor
    media.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(1.03)`;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;  // 0..1
    const py = (e.clientY - r.top) / r.height;  // 0..1

    targetX = (px - 0.5) * MAX_X * 2;
    targetY = (py - 0.5) * MAX_Y * 2;

    if (!raf) raf = requestAnimationFrame(apply);
  });

  hero.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
    if (!raf) raf = requestAnimationFrame(apply);
  });

  // Si la página es corta y no hay scroll real, la rueda se siente “estática”.
  // Este listener da un micro-movimiento vertical a la imagen para que se note vida.
  let wheelResetTimer = 0;
  hero.addEventListener('wheel', (e) => {
    // No bloqueamos el scroll del navegador; solo aprovechamos el gesto.
    const delta = e.deltaY || 0;
    const push = clamp(delta * 0.04, -6, 6); // micro desplazamiento
    targetY = clamp(targetY + push, -MAX_WHEEL_Y, MAX_WHEEL_Y);

    if (!raf) raf = requestAnimationFrame(apply);

    // Regresa suavemente al centro tras un momento
    window.clearTimeout(wheelResetTimer);
    wheelResetTimer = window.setTimeout(() => {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    }, 180);
  }, { passive: true });
});
