/**
 * A small reactive store built on a Proxy.
 *
 * - Read and write through `store.state` like a plain object.
 * - `subscribe(listener, keys)` runs the listener when any of those top-level
 *   keys change (all keys when omitted).
 * - Writes made in the same tick are coalesced: listeners run once, in a
 *   microtask, with the set of keys that changed.
 *
 * Tracking is shallow on purpose. Replace nested objects instead of mutating
 * them: `state.answers = { ...state.answers, [id]: 2 }`.
 */

export type Listener<T> = (state: Readonly<T>, changed: ReadonlySet<keyof T>) => void;

export interface Store<T extends object> {
  /** Reactive state. Assigning to a property notifies subscribers. */
  readonly state: T;
  /** Returns an unsubscribe function. */
  subscribe(listener: Listener<T>, keys?: readonly (keyof T)[]): () => void;
  /** Assign several keys at once. */
  set(patch: Partial<T>): void;
  /** Run pending notifications now instead of waiting for the microtask. */
  flush(): void;
}

interface Subscription<T> {
  listener: Listener<T>;
  keys: ReadonlySet<keyof T> | null;
}

export interface StoreOptions {
  /** Called when a listener throws, so one broken view cannot stop the others. */
  onError?: (error: unknown) => void;
}

export function createStore<T extends object>(initial: T, options: StoreOptions = {}): Store<T> {
  const subscriptions = new Set<Subscription<T>>();
  let pending = new Set<keyof T>();
  let scheduled = false;

  function flush(): void {
    scheduled = false;
    if (pending.size === 0) return;
    const changed = pending;
    pending = new Set<keyof T>();
    for (const sub of [...subscriptions]) {
      if (sub.keys && ![...changed].some((key) => sub.keys!.has(key))) continue;
      try {
        sub.listener(state, changed);
      } catch (error) {
        if (options.onError) options.onError(error);
        else console.error('[store] listener failed', error);
      }
    }
  }

  const state = new Proxy(initial, {
    set(target, property, value, receiver) {
      const key = property as keyof T;
      if (Object.is(target[key], value)) return true;
      const ok = Reflect.set(target, property, value, receiver);
      pending.add(key);
      if (!scheduled) {
        scheduled = true;
        queueMicrotask(flush);
      }
      return ok;
    },
    deleteProperty() {
      throw new Error('[store] deleting state keys is not supported');
    },
  });

  return {
    state,
    subscribe(listener, keys) {
      const sub: Subscription<T> = { listener, keys: keys ? new Set(keys) : null };
      subscriptions.add(sub);
      return () => subscriptions.delete(sub);
    },
    set(patch) {
      Object.assign(state, patch);
    },
    flush,
  };
}
