// runtime/reactive/signals.js
import { assert } from "../core/assert.js";
import { log } from "../logger.js";

export function signal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  // dev log
  log.trace(
    "Signal",
    `Created signal with initial value: ${JSON.stringify(initialValue)}`
  );

  function subscribe(fn) {
    subscribers.add(fn);
    log.trace("Signal", `Subscribed function:`, fn.name || "(anonymous)");

    fn(value);
    return () => {
      subscribers.delete(fn);
      log.trace("Signal", `Unsubscribed function:`, fn.name || "(anonymous)");
    };
  }

  async function set(newValue) {
    assert(
      arguments.length === 1,
      "signal.set() requires exactly one argument"
    );

    // assert(
    //   newValue !== undefined,
    //   "signal.set(undefined) is not allowed (use null instead)"
    // );

    if (Object.is(value, newValue)) return;
    const oldValue = value;
    value = newValue;

    log.trace(
      "Signal",
      `Value changed: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`
    );

    // batch updates asynchronously (microtask)
    await Promise.resolve();

    for (const fn of subscribers) {
      try {
        log.trace("Signal", `Triggering subscriber:`, fn.name || "(anonymous)");
        fn(value);
      } catch (err) {
        log.error("Signal subscriber error:", err);
      }
    }
  }

  function get() {
    return value;
  }

  return { get, set, subscribe };
}
