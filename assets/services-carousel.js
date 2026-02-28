// Carrusel horizontal de servicios (Index)
// - Flechas desplazan por tarjeta (snap-friendly) para que SIEMPRE se mueva
// - Puntos indican la página actual

function clamp(n, min, max){
  return Math.max(min, Math.min(max, n));
}

function initServicesCarousel(){
  const track = document.getElementById('servicesTrack');
  const dotsWrap = document.getElementById('servicesDots');
  if (!track || !dotsWrap) return;

  const wrap = track.closest('.patitas-services-wrap');
  const prevBtn = wrap?.querySelector('.patitas-services-nav[data-dir="prev"]');
  const nextBtn = wrap?.querySelector('.patitas-services-nav[data-dir="next"]');

  function cards(){
    return [...track.querySelectorAll('.patitas-service-card')];
  }

  function cardOffsets(){
    return cards().map(c => c.offsetLeft);
  }

  function closestCardIndex(){
    const offs = cardOffsets();
    if (!offs.length) return 0;
    const x = track.scrollLeft;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < offs.length; i++){
      const d = Math.abs(offs[i] - x);
      if (d < bestDist){ bestDist = d; bestIdx = i; }
    }
    return bestIdx;
  }

  function scrollToCard(idx){
    const offs = cardOffsets();
    if (!offs.length) return;
    const safe = clamp(idx, 0, offs.length - 1);
    track.scrollTo({ left: offs[safe], behavior: 'smooth' });
  }

  // Paginación por “pantallas”: cuántas tarjetas caben por vista.
  function cardsPerView(){
    const list = cards();
    if (!list.length) return 1;
    const cardW = list[0].getBoundingClientRect().width;
    const gapStr = getComputedStyle(track).gap || '0px';
    const gap = parseFloat(gapStr) || 0;
    const unit = Math.max(1, cardW + gap);
    return Math.max(1, Math.floor(track.clientWidth / unit));
  }

  function totalPages(){
    const list = cards();
    const per = cardsPerView();
    return Math.max(1, Math.ceil(list.length / per));
  }

  function currentPage(){
    const idx = closestCardIndex();
    const per = cardsPerView();
    return clamp(Math.floor(idx / per), 0, totalPages() - 1);
  }

  function scrollToPage(p){
    const per = cardsPerView();
    const pages = totalPages();
    const safe = clamp(p, 0, pages - 1);
    scrollToCard(safe * per);
  }

  function rebuildDots(){
    dotsWrap.innerHTML = '';
    const pages = totalPages();
    for (let i = 0; i < pages; i++){
      const b = document.createElement('button');
      b.className = 'patitas-services-dot';
      b.type = 'button';
      b.setAttribute('aria-label', `Ir a la página ${i + 1}`);
      b.addEventListener('click', () => scrollToPage(i));
      dotsWrap.appendChild(b);
    }
    updateUI();
  }

  function updateUI(){
    const pages = totalPages();
    const p = currentPage();

    // Dots
    [...dotsWrap.children].forEach((el, idx) => {
      el.setAttribute('aria-current', idx === p ? 'true' : 'false');
    });

    // Flechas (deshabilitar visualmente si no hay más)
    if (prevBtn) prevBtn.style.opacity = (p <= 0 ? '0.45' : '1');
    if (nextBtn) nextBtn.style.opacity = (p >= pages - 1 ? '0.45' : '1');
  }

  // Flechas (por tarjeta) — garantiza que se note el movimiento incluso con poco overflow
  prevBtn?.addEventListener('click', () => scrollToCard(closestCardIndex() - 1));
  nextBtn?.addEventListener('click', () => scrollToCard(closestCardIndex() + 1));

  // Teclado (track enfocable)
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); scrollToCard(closestCardIndex() - 1); }
    if (e.key === 'ArrowRight'){ e.preventDefault(); scrollToCard(closestCardIndex() + 1); }
  });

  // Actualización en scroll (debounce)
  let t = null;
  track.addEventListener('scroll', () => {
    if (t) cancelAnimationFrame(t);
    t = requestAnimationFrame(updateUI);
  }, { passive: true });

  // Recalcular al cambiar tamaño
  const ro = new ResizeObserver(() => rebuildDots());
  ro.observe(track);

  rebuildDots();
}

document.addEventListener('DOMContentLoaded', initServicesCarousel);
