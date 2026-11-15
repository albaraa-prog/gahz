/** Typed DOM lookups. The shell in index.html is static, so a missing id is a bug. */

export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element #${id} in index.html`);
  return element as T;
}

export function svgById<T extends SVGElement = SVGElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element #${id} in index.html`);
  return element as unknown as T;
}

/** Closest ancestor (or self) of an event target that matches the selector. */
export function closestFrom<T extends HTMLElement = HTMLElement>(event: Event, selector: string): T | null {
  const target = event.target;
  return target instanceof Element ? (target.closest(selector) as T | null) : null;
}
