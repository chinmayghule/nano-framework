// runtime/reactive/signals.js
export function signal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  function subscribe(fn) {
    subscribers.add(fn);
    fn(value);
    return () => subscribers.delete(fn);
  }

  function set(newValue) {
    if (newValue === value) return;
    value = newValue;
    Promise.resolve().then(() => {
      subscribers.forEach((fn) => fn(value));
    });
  }

  function get() {
    return value;
  }

  return { get, set, subscribe };
}
