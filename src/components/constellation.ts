/**
 * Hero visual: a drifting field of small outlined triangles that gathers into
 * a "</>" code glyph. Purely decorative (the canvas is aria-hidden).
 *
 * It only animates while the home screen is visible, stops for hidden tabs,
 * and draws a single still frame when the user prefers reduced motion.
 */

import { byId } from '../utils/dom';
import { state, store } from '../utils/state';

const COLORS = ['#8052ff', '#ffb829', '#15846e', '#e052c8', '#4f8dff', '#b79bff', '#3fd0b2'] as const;
const GLYPH = '</>';
const SHAPE_PARTICLES = 1300;
const AMBIENT_PARTICLES = 150;

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  rotation: number;
  spin: number;
  phase: number;
  drift: number;
  /** Index into the draw groups: one per colour for the shape, then one per colour for ambient. */
  group: number;
}

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let width = 0;
let height = 0;
let frame = 0;
let running = false;
let onScreen = true;
let reducedMotion = false;

/** Pixels of the glyph, sampled from an offscreen canvas. */
function sampleGlyph(w: number, h: number): Array<[number, number]> {
  const offscreen = document.createElement('canvas');
  offscreen.width = Math.max(1, Math.floor(w));
  offscreen.height = Math.max(1, Math.floor(h));
  const ctx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  let fontSize = h * 0.62;
  ctx.font = `700 ${fontSize}px ui-monospace, Consolas, 'Courier New', monospace`;
  const measured = ctx.measureText(GLYPH).width;
  if (measured > w * 0.92) fontSize *= (w * 0.92) / measured;
  ctx.font = `700 ${fontSize}px ui-monospace, Consolas, 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(GLYPH, w / 2, h / 2);

  const { data } = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
  const points: Array<[number, number]> = [];
  const step = 3;
  for (let y = 0; y < offscreen.height; y += step) {
    for (let x = 0; x < offscreen.width; x += step) {
      if ((data[(y * offscreen.width + x) * 4 + 3] ?? 0) > 128) points.push([x, y]);
    }
  }
  return points;
}

function build(): void {
  const rect = canvas.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  if (width < 10 || height < 10) return;

  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context = canvas.getContext('2d');
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const glyph = sampleGlyph(width, height);
  const next: Particle[] = [];
  const count = glyph.length === 0 ? 0 : Math.min(SHAPE_PARTICLES, Math.round(width * 2.6));

  for (let i = 0; i < count; i++) {
    const point = glyph[Math.floor(Math.random() * glyph.length)] ?? [width / 2, height / 2];
    const targetX = point[0] + (Math.random() - 0.5) * 7;
    const targetY = point[1] + (Math.random() - 0.5) * 7;
    next.push({
      // Start scattered, then gather into the glyph.
      x: reducedMotion ? targetX : Math.random() * width,
      y: reducedMotion ? targetY : Math.random() * height,
      targetX,
      targetY,
      size: 2 + Math.random() * 3,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      phase: Math.random() * Math.PI * 2,
      drift: 1.5 + Math.random() * 4,
      group: Math.floor(Math.random() * COLORS.length),
    });
  }

  for (let i = 0; i < AMBIENT_PARTICLES; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    next.push({
      x,
      y,
      targetX: x,
      targetY: y,
      size: 2 + Math.random() * 4,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.01,
      phase: Math.random() * Math.PI * 2,
      drift: 6 + Math.random() * 14,
      group: COLORS.length + Math.floor(Math.random() * COLORS.length),
    });
  }

  particles = next;
  draw(0);
}

function draw(time: number): void {
  if (!context) return;
  context.clearRect(0, 0, width, height);
  context.lineWidth = 1;
  context.lineJoin = 'miter';

  const t = time / 1000;
  // One path per colour group keeps this to 14 stroke calls per frame.
  for (let group = 0; group < COLORS.length * 2; group++) {
    context.beginPath();
    for (const p of particles) {
      if (p.group !== group) continue;

      const goalX = p.targetX + Math.cos(t * 0.5 + p.phase) * p.drift;
      const goalY = p.targetY + Math.sin(t * 0.4 + p.phase * 1.3) * p.drift;
      if (reducedMotion) {
        p.x = p.targetX;
        p.y = p.targetY;
      } else {
        p.x += (goalX - p.x) * 0.045;
        p.y += (goalY - p.y) * 0.045;
        p.rotation += p.spin;
      }

      for (let corner = 0; corner < 3; corner++) {
        const angle = p.rotation + (corner * Math.PI * 2) / 3;
        const x = p.x + Math.cos(angle) * p.size;
        const y = p.y + Math.sin(angle) * p.size;
        if (corner === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
    }
    context.strokeStyle = COLORS[group % COLORS.length] ?? COLORS[0];
    context.globalAlpha = group < COLORS.length ? 0.95 : 0.4;
    context.stroke();
  }
  context.globalAlpha = 1;
}

function loop(time: number): void {
  if (!running) return;
  draw(time);
  frame = requestAnimationFrame(loop);
}

function updateRunning(): void {
  const shouldRun = !reducedMotion && onScreen && !document.hidden && state.screen === 'home';
  if (shouldRun === running) return;
  running = shouldRun;
  if (running) frame = requestAnimationFrame(loop);
  else cancelAnimationFrame(frame);
}

export function initConstellation(): void {
  canvas = byId<HTMLCanvasElement>('constellation');

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion = motion.matches;
  motion.addEventListener('change', () => {
    reducedMotion = motion.matches;
    build();
    updateRunning();
  });

  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 150);
  }).observe(canvas);

  new IntersectionObserver((entries) => {
    onScreen = entries.some((entry) => entry.isIntersecting);
    updateRunning();
  }).observe(canvas);

  document.addEventListener('visibilitychange', updateRunning);
  store.subscribe(() => {
    // The canvas has no size while the home screen is hidden, so rebuild on return.
    if (state.screen === 'home' && width < 10) build();
    updateRunning();
  }, ['screen']);

  build();
  updateRunning();
}
