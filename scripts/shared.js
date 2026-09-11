export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function imageHTML(project, lazy = false) {
  const image = project.image;
  return `<img src="${escapeHTML(image.src)}" width="${image.width}" height="${image.height}" alt="${escapeHTML(image.alt)}" decoding="async" ${lazy ? 'loading="lazy"' : ''}>`;
}
export function linkHTML(project) {
  return `<a class="button project-link" href="${escapeHTML(project.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(project.actionLabel)} <span aria-hidden="true">↗</span><span class="sr-only">（新标签页打开）</span></a><span class="new-tab">新标签页打开</span>`;
}
export function statusHTML(project) {
  return project.status ? `<p class="status">${escapeHTML(project.status.message)}</p>` : '';
}
export function initHeader() {
  const header = document.querySelector('.site-header');
  const update = () => header.classList.toggle('scrolled', scrollY > 24);
  addEventListener('scroll', update, { passive: true });
  update();
}
// One timer owns each page's automatic selection. Focus, visibility and reduced
// motion all suspend the same clock, so they cannot accidentally restart it.
export function createRotation({ region, hoverRegion = region, keyboardFocusOnly = false, manualDelay = 12000, pauseButton, advance, progress = () => {}, delay = 8000 }) {
  let elapsed = 0, last = performance.now(), manualUntil = 0, paused = false;
  let hovering = false, focused = false, visible = true;
  const blocked = () => paused || hovering || focused || !visible || document.hidden || reducedMotion.matches || performance.now() < manualUntil;
  function tick() {
    const now = performance.now();
    if (!blocked()) {
      elapsed += Math.min(now - last, 300);
      if (elapsed >= delay) { elapsed = 0; advance(); }
    }
    last = now;
    progress(reducedMotion.matches ? 0 : elapsed / delay, {paused: blocked(), remaining: Math.ceil((delay-elapsed)/1000), reduced: reducedMotion.matches});
  }
  const timer = setInterval(tick, 100);
  hoverRegion.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') hovering = true; });
  hoverRegion.addEventListener('pointerleave', () => { hovering = false; });
  const updateFocus = () => { focused = region.contains(document.activeElement) && (!keyboardFocusOnly || document.activeElement.matches(':focus-visible')); };
  region.addEventListener('focusin', updateFocus);
  region.addEventListener('focusout', () => queueMicrotask(updateFocus));
  region.addEventListener('pointerdown', () => { if(keyboardFocusOnly)focused=false; });
  region.addEventListener('keydown', () => { if(keyboardFocusOnly)focused=true; });
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  observer.observe(region);
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.textContent = paused ? '继续轮换' : '暂停轮换';
  });
  const updateMotion = () => { pauseButton.disabled = reducedMotion.matches; pauseButton.textContent = reducedMotion.matches ? '已减少动态' : paused ? '继续轮换' : '暂停轮换'; };
  reducedMotion.addEventListener('change', updateMotion);
  updateMotion();
  return {
    manual() { elapsed = 0; manualUntil = performance.now() + manualDelay; },
    reset() { elapsed = 0; },
    dispose() { clearInterval(timer); observer.disconnect(); }
  };
}
