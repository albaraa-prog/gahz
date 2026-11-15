/**
 * Error boundary. Anything unexpected ends up in `reportError`, which logs the
 * details and shows the user one short, non-technical message.
 */

type Notifier = (message: string, kind: 'error' | 'warning') => void;

let notify: Notifier = (message) => console.warn(message);
let lastMessage = '';
let lastShownAt = 0;

/** The toast component registers itself here once the DOM is ready. */
export function setErrorNotifier(fn: Notifier): void {
  notify = fn;
}

export function reportError(error: unknown, userMessage = 'Something went wrong. Your progress is still saved.'): void {
  console.error('[DevQuiz]', error);
  // Do not stack identical toasts (for example a failing write every second).
  const now = Date.now();
  if (userMessage === lastMessage && now - lastShownAt < 10_000) return;
  lastMessage = userMessage;
  lastShownAt = now;
  notify(userMessage, 'error');
}

/** Wraps an event handler so a thrown error is reported instead of lost. */
export function guarded<A extends unknown[]>(fn: (...args: A) => void | Promise<void>, userMessage?: string) {
  return (...args: A): void => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) result.catch((error) => reportError(error, userMessage));
    } catch (error) {
      reportError(error, userMessage);
    }
  };
}

export function installGlobalErrorHandlers(): void {
  window.addEventListener('error', (event) => {
    // Resource load failures (fonts, images) bubble here without an error object.
    if (!event.error) return;
    reportError(event.error);
  });
  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason);
  });
}
