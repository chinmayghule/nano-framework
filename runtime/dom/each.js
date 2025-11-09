// runtime/dom/each.js
import { currentComponent, setCurrentComponent } from "../core/context.js";
import { onDestroy } from "../core/lifecycle.js";
import { mountChild } from "../core/component.js";
import { log } from "../logger.js";

/* --------------------------------------------------------------------------
 *  Helper utilities
 * -------------------------------------------------------------------------- */

/** Safely destroy a single list instance. */
function destroyInstance(inst) {
  try {
    inst.cleanup?.();
  } catch (e) {
    log.error("List item cleanup error:", e);
  }
  try {
    inst.el?.remove();
  } catch {
    /* ignore DOM removal errors */
  }
}

/** Create a new child instance under given component context. */
function createInstance(parentInstance, renderFn, item, index, container) {
  const prev = currentComponent;
  setCurrentComponent(parentInstance);
  let result;
  try {
    result = renderFn(item, index);
    if (result == null) {
      throw new Error(
        `Render function for list item at index ${index} returned null or undefined`
      );
    }
  } catch (err) {
    log.error(`[Render Error] in <ListContainer>:`, err);
    // Render fallback visual
    const errorEl = document.createElement("div");
    errorEl.textContent = err.message;
    result = [errorEl, null];
  } finally {
    setCurrentComponent(prev);
  }

  const [el, cleanup] = Array.isArray(result) ? result : [result, null];
  container.appendChild(el);
  return { el, cleanup };
}

/** Perform keyed diff and update DOM. */
function updateList({
  list,
  getKey,
  renderFn,
  container,
  instances,
  setInstances,
  parentInstance,
  cleaned,
}) {
  if (cleaned.current) return;

  log.groupStart("List update");
  log.trace("List", "New list:", list);

  const newInstances = new Map();
  const usedKeys = new Set();

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const key = getKey(item, i);
    usedKeys.add(key);

    if (instances.has(key)) {
      // reuse existing element
      const inst = instances.get(key);
      container.appendChild(inst.el);
      newInstances.set(key, inst);
      log.trace("List", `Reused key: ${key}`);
    } else {
      // create new element
      const inst = createInstance(parentInstance, renderFn, item, i, container);
      newInstances.set(key, inst);
      log.trace("List", `Created key: ${key}`);
    }
  }

  // remove missing
  for (const [key, inst] of instances) {
    if (!usedKeys.has(key)) {
      destroyInstance(inst);
      log.trace("List", `Removed key: ${key}`);
    }
  }

  setInstances(newInstances);
  log.trace("List", "Current keys:", [...newInstances.keys()]);
  log.groupEnd();
}

/* --------------------------------------------------------------------------
 *  Component: ListContainer
 * -------------------------------------------------------------------------- */

export function ListContainer({ listSignal, renderFn, getKey }) {
  const container = document.createElement("div");
  const self = currentComponent;

  let instances = new Map();
  const cleaned = { current: false };
  let unsub = null;

  const setInstances = (map) => {
    instances = map;
  };

  const masterCleanup = () => {
    if (cleaned.current) return;
    cleaned.current = true;
    unsub?.();
    for (const inst of instances.values()) destroyInstance(inst);
    instances.clear();
    container.innerHTML = "";
  };

  // subscribe to signal updates
  unsub = listSignal.subscribe((list) =>
    updateList({
      list,
      getKey,
      renderFn,
      container,
      instances,
      setInstances,
      parentInstance: self,
      cleaned,
    })
  );

  if (self) onDestroy(masterCleanup);

  return container;
}

/* --------------------------------------------------------------------------
 *  Public API
 * -------------------------------------------------------------------------- */

export function each(
  signalArray,
  container,
  renderFn,
  getKey = (item) => item.id
) {
  return mountChild(ListContainer, container, {
    listSignal: signalArray,
    renderFn,
    getKey,
  });
}
