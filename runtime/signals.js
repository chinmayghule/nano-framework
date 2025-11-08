// ============================================================================
// NANO RUNTIME — signals.js
// ----------------------------------------------------------------------------
// Provides a simple reactive primitive: "signal".
// ============================================================================

/**
 * Create a reactive signal.
 * @param {any} initialValue - Initial value of the signal.
 * @returns {{ get: Function, set: Function, subscribe: Function }}
 */
export function signal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  /**
   * Subscribe to changes.
   * The callback runs immediately once, and whenever the value updates.
   */
  function subscribe(fn) {
    subscribers.add(fn);
    fn(value);
    return () => subscribers.delete(fn);
  }

  /**
   * Set a new value and re-run all subscribers asynchronously.
   */
  function set(newValue) {
    if (newValue === value) return;
    value = newValue;
    Promise.resolve().then(() => {
      subscribers.forEach((fn) => fn(value));
    });
  }

  /** Get the current value (non-reactive). */
  function get() {
    return value;
  }

  return { get, set, subscribe };
}
