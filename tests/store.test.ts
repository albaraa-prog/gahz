import { describe, expect, it, vi } from 'vitest';
import { createStore } from '../src/utils/store';

describe('createStore', () => {
  it('notifies subscribers once per tick with the changed keys', async () => {
    const store = createStore({ a: 1, b: 'x' });
    const listener = vi.fn();
    store.subscribe(listener);

    store.state.a = 2;
    store.state.b = 'y';
    expect(listener).not.toHaveBeenCalled();

    await Promise.resolve();
    expect(listener).toHaveBeenCalledTimes(1);
    expect([...listener.mock.calls[0]![1]]).toEqual(['a', 'b']);
  });

  it('only wakes listeners subscribed to a changed key', () => {
    const store = createStore({ a: 1, b: 1 });
    const onA = vi.fn();
    const onB = vi.fn();
    store.subscribe(onA, ['a']);
    store.subscribe(onB, ['b']);

    store.state.a = 5;
    store.flush();
    expect(onA).toHaveBeenCalledTimes(1);
    expect(onB).not.toHaveBeenCalled();
  });

  it('ignores writes that do not change the value', () => {
    const store = createStore({ a: 1 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.state.a = 1;
    store.flush();
    expect(listener).not.toHaveBeenCalled();
  });

  it('stops notifying after unsubscribe and survives a throwing listener', () => {
    const onError = vi.fn();
    const store = createStore({ a: 1 }, { onError });
    const good = vi.fn();
    store.subscribe(() => {
      throw new Error('boom');
    });
    const unsubscribe = store.subscribe(good);

    store.state.a = 2;
    store.flush();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(good).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.state.a = 3;
    store.flush();
    expect(good).toHaveBeenCalledTimes(1);
  });
});
