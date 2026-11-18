/**
 * Runs a learner's JavaScript without a server and without trusting it.
 *
 * The code runs in /runner.html, loaded in a hidden iframe with
 * sandbox="allow-scripts". That gives it a throwaway origin with no access to
 * this app's storage, session or DOM, and the runner page's own
 * Content-Security-Policy blocks network requests. Inside the iframe the code
 * runs in a worker that is stopped after a few seconds, so an endless loop
 * only ends that run.
 */

export interface LogLine {
  level: 'log' | 'warn' | 'error';
  text: string;
}

export type CallResult = { ok: true; json: string; text: string } | { ok: false; error: string };

export interface RunResult {
  /** Lines written with console.log and friends. */
  logs: LogLine[];
  /** One entry per requested call, in order. Empty when the code itself failed. */
  results: CallResult[];
  /** A syntax error, or an error thrown while the code was loading. */
  error: string | null;
  timedOut: boolean;
}

/** The sandbox could not be loaded or did not answer. */
export class RunnerUnavailableError extends Error {}

const READY_TIMEOUT_MS = 8000;
/** The runner stops the code after 3 seconds; this is the backstop for a runner that never answers. */
const REPLY_TIMEOUT_MS = 6000;

let frame: HTMLIFrameElement | null = null;
let ready: Promise<HTMLIFrameElement> | null = null;
let nextId = 1;

function loadRunner(): Promise<HTMLIFrameElement> {
  if (ready) return ready;
  ready = new Promise<HTMLIFrameElement>((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    iframe.title = 'Gahz code runner';
    iframe.className = 'code-runner-frame';

    const fail = (): void => {
      cleanup();
      iframe.remove();
      frame = null;
      ready = null;
      reject(new RunnerUnavailableError('The code runner did not start'));
    };
    const timer = setTimeout(fail, READY_TIMEOUT_MS);
    const onMessage = (event: MessageEvent): void => {
      if (event.source !== iframe.contentWindow || event.data?.type !== 'gahz-runner-ready') return;
      cleanup();
      frame = iframe;
      resolve(iframe);
    };
    const cleanup = (): void => {
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
    };

    window.addEventListener('message', onMessage);
    iframe.addEventListener('error', fail);
    iframe.src = `${import.meta.env.BASE_URL}runner.html`;
    document.body.append(iframe);
  });
  return ready;
}

function isRunResult(value: unknown): value is RunResult {
  const data = value as Partial<RunResult> | null;
  return Boolean(data) && Array.isArray(data?.logs) && Array.isArray(data?.results);
}

/**
 * Runs `code`, then evaluates each expression in `calls` in the same scope
 * (so they can use the functions the code declares).
 */
export async function runCode(code: string, calls: readonly string[] = []): Promise<RunResult> {
  const iframe = await loadRunner();
  const id = nextId++;
  return new Promise<RunResult>((resolve, reject) => {
    const timer = setTimeout(() => {
      window.removeEventListener('message', onMessage);
      // Start from a fresh sandbox next time.
      iframe.remove();
      if (frame === iframe) {
        frame = null;
        ready = null;
      }
      reject(new RunnerUnavailableError('The code runner did not answer'));
    }, REPLY_TIMEOUT_MS);
    const onMessage = (event: MessageEvent): void => {
      if (event.source !== iframe.contentWindow) return;
      const data: unknown = event.data;
      if ((data as { type?: unknown; id?: unknown })?.type !== 'gahz-result' || (data as { id?: unknown }).id !== id) return;
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      if (!isRunResult(data)) {
        reject(new RunnerUnavailableError('The code runner sent an unexpected answer'));
        return;
      }
      resolve({ logs: data.logs, results: data.results, error: data.error ?? null, timedOut: Boolean(data.timedOut) });
    };
    window.addEventListener('message', onMessage);
    // The sandboxed frame has an opaque origin, so no target origin can be named.
    iframe.contentWindow?.postMessage({ type: 'gahz-run', id, code, calls }, '*');
  });
}
