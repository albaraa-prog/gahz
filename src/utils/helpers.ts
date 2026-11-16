/** Small pure helpers. No DOM access here, so they are easy to unit test. */

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escapes text, then turns the two bits of markup used in the question banks
 * into HTML: **bold** and `inline code`.
 */
export function formatRichText(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`\n]+?)`/g, '<code>$1</code>');
}

/** Fisher-Yates shuffle on a copy, then take the first `size` items. */
export function randomSample<T>(items: readonly T[], size: number, random: () => number = Math.random): T[] {
  const shuffled = items.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = shuffled[i] as T;
    shuffled[i] = shuffled[j] as T;
    shuffled[j] = tmp;
  }
  return shuffled.slice(0, Math.max(0, size));
}

/** 125 -> "02:05" */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const ARABIC = /[؀-ۿ]/;

export function containsArabic(text: string): boolean {
  return ARABIC.test(text);
}

/**
 * Rich text for one line (an answer option) shown inside right-to-left
 * content. A line with no Arabic in it, such as `O(n log n)` or `[1, 2]`,
 * keeps its left-to-right order instead of being mirrored.
 */
export function formatLine(text: string, insideRtl: boolean): string {
  const html = formatRichText(text);
  return insideRtl ? `<span dir="${containsArabic(text) ? 'rtl' : 'ltr'}">${html}</span>` : html;
}

export function formatAttemptDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

/** Local calendar day as YYYY-MM-DD, used for streaks. */
export function dayKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * First letter or digit of a name, for an avatar. Works on whole characters,
 * so names that start with an emoji, a space or an invisible direction mark
 * still produce a visible initial.
 */
export function initialOf(...candidates: Array<string | null | undefined>): string {
  for (const candidate of candidates) {
    const match = /[\p{L}\p{N}]/u.exec(candidate ?? '');
    if (match) return match[0].toLocaleUpperCase();
  }
  return '?';
}

/**
 * A short, readable name for tight spaces: the first name, or the part of the
 * email before the @. Avoids cutting a full name off with an ellipsis, which
 * reads badly in Arabic and mixed-direction text.
 */
export function shortName(displayName: string | null | undefined, email: string | null | undefined): string {
  const words = (displayName ?? '').trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  if (first) {
    // "A. Rahman" or "م. أحمد": a lone initial is not a name, so keep the next word too.
    const isInitial = first.replace(/[^\p{L}\p{N}]/gu, '').length < 2;
    return isInitial && words[1] ? `${first} ${words[1]}` : first;
  }
  return (email ?? '').split('@')[0] ?? '';
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, waitMs: number): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
}
