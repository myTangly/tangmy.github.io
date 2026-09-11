import { projects } from './projects.js';
import { imageHTML, linkHTML, statusHTML, escapeHTML, initHeader, createRotation, reducedMotion } from './shared.js';
initHeader();
const zone = document.querySelector('#orbit-zone');
const panel = document.querySelector('#selected-card');
const tabs = document.querySelector('#project-tabs');
const labels = document.querySelector('#node-labels');
const canvas = document.querySelector('#universe');
let index = 0, scene = null, rotation, panelInitialized = false;
const shortNames = projects.map(p => p.id === 'film' ? 'AI 微电影' : p.id === 'linux' ? 'Linux 教程' : p.title);
projects.forEach((project, i) => {
  const tab = document.createElement('button');
  tab.type = 'button'; tab.className = 'project-tab';
  tab.textContent = `${String(i + 1).padStart(2, '0')}  ${shortNames[i]}`;
  tab.addEventListener('click', () => select(i, true));
  tabs.append(tab);
  const label = document.createElement('button');
  label.type = 'button'; label.className = 'node-label'; label.textContent = shortNames[i];
  label.setAttribute('aria-label', `选择${project.title}`);
  label.addEventListener('click', () => select(i, true));
  labels.append(label);
});
function select(next, manual = false, preserveView = false) {
  const previous = index;
  const initialized = panelInitialized;
  panelInitialized = true;
  index = (next + projects.length) % projects.length;
  if (initialized && previous === index) { if (manual) rotation?.manual(); return; }
  panel.classList.toggle('panel-transition', initialized);
  panel.style.setProperty('--panel-offset', next < previous ? '-12px' : '12px');
  const project = projects[index];
  panel.innerHTML = `<div class="selected-image">${imageHTML(project)}</div><div class="selected-copy"><p class="eyebrow">${String(index + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')} <span>·</span> ${escapeHTML(project.category)}</p><h3>${escapeHTML(project.title)}</h3><p class="description">${escapeHTML(project.description)}</p><div class="link-row">${linkHTML(project)}</div>${statusHTML(project)}</div><span class="card-corner" aria-hidden="true">↗</span>`;
  [...tabs.children].forEach((el, i) => el.setAttribute('aria-pressed', String(i === index)));
  [...labels.children].forEach((el, i) => el.setAttribute('aria-pressed', String(i === index)));
  scene?.select(index, preserveView);
  if (manual) rotation?.manual();
}
select(0);
document.querySelector('#home-controls').hidden = false;
rotation = createRotation({region: document.querySelector('main'), pauseButton: document.querySelector('#home-pause'), advance: () => select(index + 1)});
for (const region of [zone, tabs]) region.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); select(index + (event.key === 'ArrowRight' ? 1 : -1), true);
  }
});
let pointerStart = null;
zone.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  pointerStart = {x: event.clientX, y: event.clientY, moved: false};
  suppressClick=false; rotation.manual();
});
zone.addEventListener('pointermove', event => {
  if(!pointerStart)return;
  const dx=event.clientX-pointerStart.x,dy=event.clientY-pointerStart.y;
  if(!pointerStart.moved&&Math.hypot(dx,dy)<4)return;
  pointerStart.moved=true;
  if(!zone.hasPointerCapture(event.pointerId))zone.setPointerCapture(event.pointerId);
  scene?.drag(dx,dy);rotation.manual();
  pointerStart.x=event.clientX;pointerStart.y=event.clientY;
});
let suppressClick=false;
zone.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation();suppressClick=false;}},true);
zone.addEventListener('pointerup', event => {
  if (!pointerStart) return;
  suppressClick=pointerStart.moved;
  if(pointerStart.moved&&scene)select(scene.frontProject(),true,true);
  pointerStart = null;
  if(zone.hasPointerCapture(event.pointerId))zone.releasePointerCapture(event.pointerId);
});
zone.addEventListener('pointercancel', () => { pointerStart = null; });
function fallback() {
  scene?.dispose(); scene = null;
  canvas.hidden = true; document.body.classList.remove('has-webgl');
  [...labels.children].forEach(el => { el.style.cssText = ''; });
  zone.querySelector('.orbit-hint').textContent = '选择一个项目，开始探索';
}
let generation = 0;
async function initializeScene() {
  const attempt = ++generation;
  fallback();
  if (reducedMotion.matches || navigator.connection?.saveData) return;
  const testCanvas = document.createElement('canvas');
  const context = testCanvas.getContext('webgl2');
  if (!context) return;
  context.getExtension('WEBGL_lose_context')?.loseContext();
  try {
    const { createStarMap } = await import('./star-map.js');
    if (attempt !== generation) return;
    canvas.hidden = false;
    scene = createStarMap({canvas, zone, labels: [...labels.children], count: projects.length, onFailure: fallback});
    scene.select(index);
    document.body.classList.add('has-webgl');
    zone.querySelector('.orbit-hint').textContent = '拖动自由旋转 · 区域外滑动页面';
  } catch { fallback(); }
}
reducedMotion.addEventListener('change', initializeScene);
navigator.connection?.addEventListener('change', initializeScene);
initializeScene();
