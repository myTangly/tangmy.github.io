import { projects } from './projects.js';
import { imageHTML, linkHTML, statusHTML, escapeHTML, initHeader, createRotation, reducedMotion } from './shared.js';
initHeader();
const gallery = document.querySelector('#gallery');
const dots = document.querySelector('#gallery-dots');
let index = 0, rotation, automatic = false, settleTimer;
projects.forEach((project, i) => {
  const slide = document.createElement('article');
  slide.className = `gallery-slide ${project.presentation}`;
  slide.setAttribute('aria-roledescription', '幻灯片');
  slide.setAttribute('aria-label', `${i + 1} / ${projects.length}：${project.title}`);
  slide.innerHTML = `<div class="gallery-visual"><div class="media-frame"><div class="media-top"><span>项目预览</span><span>${String(i + 1).padStart(2, '0')}</span></div><div class="stay-progress" aria-hidden="true"><span></span></div>${imageHTML(project, i > 0)}<div class="media-bottom"><span>${escapeHTML(project.category)}</span><span aria-hidden="true">↗</span></div></div></div><div class="gallery-copy"><p class="eyebrow">EXPERIMENT ${String(i + 1).padStart(2, '0')}</p><h2>${escapeHTML(project.title)}</h2><p class="description">${escapeHTML(project.description)}</p><div class="link-row">${linkHTML(project)}</div>${statusHTML(project)}<p class="preview-caption">真实页面 · 项目预览</p></div>`;
  gallery.append(slide);
  const countdown=document.createElement('span');
  countdown.className='preview-countdown';
  countdown.textContent='剩余 5 秒';
  slide.querySelector('.media-top').append(countdown);
  const dot = document.createElement('button');
  dot.type = 'button'; dot.setAttribute('aria-label', `预览${project.title}`);
  dot.addEventListener('click', () => go(i, true)); dots.append(dot);
});
document.querySelector('#project-directory').innerHTML = projects.map((project, i) => `<article class="directory-row"><span class="row-number">${String(i + 1).padStart(2, '0')}</span><div><p class="eyebrow">${escapeHTML(project.category)}</p><h3>${escapeHTML(project.title)}</h3><p class="description">${escapeHTML(project.description)}</p>${statusHTML(project)}</div><div class="directory-action">${linkHTML(project)}</div></article>`).join('');
document.querySelector('#directory-count').textContent = `${String(projects.length).padStart(2, '0')} 个项目`;
document.querySelector('#gallery-controls').hidden = false;
function update() {
  [...dots.children].forEach((el, i) => { el.setAttribute('aria-pressed', String(i === index)); });
}
function go(next, manual = false) {
  index = (next + projects.length) % projects.length;
  automatic = true;
  gallery.scrollTo({left: gallery.children[index].offsetLeft, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  update();
  manual ? rotation?.manual() : rotation?.reset();
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => { automatic = false; }, 1000);
}
rotation = createRotation({
  delay: 5000,
  hoverRegion: gallery,
  keyboardFocusOnly: true,
  manualDelay: 0,
  region: document.querySelector('.gallery-section'), pauseButton: document.querySelector('#gallery-pause'),
  advance: () => go(index + 1),
  progress: (value,state) => [...gallery.children].forEach((el, i) => {
    el.style.setProperty('--progress', i === index ? value : 0);
    const text=state.reduced?'手动切换':i!==index?'剩余 5 秒':state.paused?`已暂停 · ${state.remaining} 秒`:`剩余 ${state.remaining} 秒`;
    const countdown=el.querySelector('.preview-countdown');
    if(countdown.textContent!==text)countdown.textContent=text;
  })
});
document.querySelector('#prev').addEventListener('click', () => go(index - 1, true));
document.querySelector('#next').addEventListener('click', () => go(index + 1, true));
gallery.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault(); go(index + (event.key === 'ArrowRight' ? 1 : -1), true);
  }
});
gallery.addEventListener('pointerdown', () => { automatic = false; rotation.manual(); });
gallery.addEventListener('wheel', () => { automatic = false; rotation.manual(); }, {passive:true});
gallery.addEventListener('scroll', () => {
  if (automatic) return;
  const next = [...gallery.children].reduce((best, el, i) => Math.abs(el.offsetLeft - gallery.scrollLeft) < Math.abs(gallery.children[best].offsetLeft - gallery.scrollLeft) ? i : best, 0);
  if (next !== index) { index = next; update(); if (!automatic) rotation.manual(); }
}, {passive: true});
let resizeTimer;
new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { gallery.scrollTo({left: gallery.children[index].offsetLeft, behavior:'instant'}); }, 100); }).observe(gallery);
update();
